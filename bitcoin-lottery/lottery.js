/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║         🎰 LOTERÍA BITCOIN v2.0 — MOTOR OPTIMIZADO 🎰           ║
 * ║                                                                  ║
 * ║  Mejoras sobre v1.0:                                             ║
 * ║  • Sin ECPair ni bitcoinjs en el hot path                        ║
 * ║  • Point-addition traversal (~3x más rápido que random)          ║
 * ║  • Targets pre-hasheados a RIPEMD160 hex (sin base58 encode)    ║
 * ║  • Filtrado automático de entradas inválidas                     ║
 * ║  • Batch de 10,000 por tick                                      ║
 * ║  • Reset aleatorio cada 1M llaves (seguridad de rango)          ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

'use strict';

const crypto = require('crypto');
const fs     = require('fs');
const ecc    = require('tiny-secp256k1');
const bs58   = require('bs58');

// ─── Configuración ────────────────────────────────────────────────────────────
const TARGETS_FILE = './target_addresses.txt';
const WINNERS_FILE = './winner.txt';
const BATCH_SIZE   = 10_000;
const REPORT_MS    = 1_500;
const RESET_EVERY  = 1_000_000;

// ─── Cargar y filtrar direcciones objetivo ────────────────────────────────────
console.log('Cargando base de datos de direcciones objetivo...\n');

if (!fs.existsSync(TARGETS_FILE)) {
    console.error('✗ No se encontró target_addresses.txt, cerrando.');
    process.exit(1);
}

const raw = fs.readFileSync(TARGETS_FILE, 'utf8').split('\n');
const validAddresses = raw
    .map(l => l.trim())
    .filter(l => l.length >= 25 && l.length <= 34 && l.startsWith('1'));
const invalidCount = raw.filter(l => l.trim().length > 0).length - validAddresses.length;

// Pre-hashear targets a RIPEMD160 hex — evita base58-encode en el hot path
const targetHashes  = new Set();
const addressByHash = new Map();

for (const addr of validAddresses) {
    try {
        const decoded = bs58.default ? bs58.default.decode(addr) : bs58.decode(addr);
        if (decoded.length !== 25) continue;
        const hashHex = Buffer.from(decoded.slice(1, 21)).toString('hex');
        targetHashes.add(hashHex);
        addressByHash.set(hashHex, addr);
    } catch { /* dirección mal formada, ignorar */ }
}

console.log(`📋 Entradas en archivo     : ${raw.filter(l => l.trim()).length}`);
console.log(`✅ Direcciones P2PKH válidas: ${validAddresses.length}`);
console.log(`⚠️  Inválidas filtradas     : ${invalidCount}`);
console.log(`🎯 Targets en memoria      : ${targetHashes.size}\n`);

console.log('══════════════════════════════════════════════');
console.log('🎰  LOTERÍA BITCOIN v2.0  STARTING');
console.log('    Probabilidad de Match : ~1 en 2^160');
console.log('══════════════════════════════════════════════\n');

// ─── Estado del traversal ─────────────────────────────────────────────────────
let privateKeyBuf = crypto.randomBytes(32);
let pubkey = null;
let sinceLastReset = 0;

// Escalar +1 para point-addition
const SCALAR_ONE = Buffer.alloc(32);
SCALAR_ONE[31] = 1;

function resetKey() {
    while (true) {
        privateKeyBuf = crypto.randomBytes(32);
        try {
            const pk = ecc.pointFromScalar(privateKeyBuf, true);
            if (pk) { pubkey = pk; return; }
        } catch { /* reintentar */ }
    }
}
resetKey();

// ─── Contadores ───────────────────────────────────────────────────────────────
let generatedCount = 0;
let totalGenerated  = 0;
let matchesFound    = 0;
let lastReportTime  = Date.now();

// ─── Función core ─────────────────────────────────────────────────────────────
function generateAndCheck() {
    // Avanzar punto por la curva: P_next = P + G
    try {
        const nextPubkey = ecc.pointAddScalar(pubkey, SCALAR_ONE, true);
        if (!nextPubkey) { resetKey(); sinceLastReset = 0; return; }
        pubkey = nextPubkey;
    } catch {
        resetKey(); sinceLastReset = 0; return;
    }

    // Incrementar clave privada (big-endian +1) — necesario para WIF si hay match
    let carry = 1;
    for (let i = 31; i >= 0 && carry; i--) {
        const sum = privateKeyBuf[i] + carry;
        privateKeyBuf[i] = sum & 0xff;
        carry = sum >> 8;
    }

    // SHA256 → RIPEMD160 (sin base58 encode)
    const sha256    = crypto.createHash('sha256').update(pubkey).digest();
    const ripemd160 = crypto.createHash('ripemd160').update(sha256).digest();
    const hashHex   = ripemd160.toString('hex');

    generatedCount++;
    totalGenerated++;
    sinceLastReset++;

    // Lookup O(1)
    if (targetHashes.has(hashHex)) {
        matchesFound++;
        const originalAddress = addressByHash.get(hashHex);

        // Construir WIF
        const version     = Buffer.from([0x80]);
        const compression = Buffer.from([0x01]);
        const rawKey      = Buffer.concat([version, privateKeyBuf, compression]);
        const checksum    = crypto.createHash('sha256')
            .update(crypto.createHash('sha256').update(rawKey).digest())
            .digest().slice(0, 4);
        const wifBuffer   = Buffer.concat([rawKey, checksum]);
        const wif         = (bs58.default ? bs58.default.encode : bs58.encode)(wifBuffer);
        const hexKey      = privateKeyBuf.toString('hex');

        console.log('\n\n══════════════════════════════════════════════');
        console.log('🚀🚀🚀  ¡MATCH ENCONTRADO!  🚀🚀🚀');
        console.log('══════════════════════════════════════════════');
        console.log('Dirección Pública :', originalAddress);
        console.log('Llave Privada WIF :', wif);
        console.log('Llave Privada HEX :', hexKey);
        console.log('══════════════════════════════════════════════\n');

        fs.appendFileSync(WINNERS_FILE,
            `\n[${new Date().toISOString()}] Match: ${originalAddress} | WIF: ${wif} | HEX: ${hexKey}\n`,
            'utf8'
        );
    }

    // Reset periódico
    if (sinceLastReset >= RESET_EVERY) {
        resetKey();
        sinceLastReset = 0;
    }
}

// ─── Reporte de progreso ──────────────────────────────────────────────────────
function report() {
    const now      = Date.now();
    const diffSecs = (now - lastReportTime) / 1000;
    const rate     = (generatedCount / diffSecs).toFixed(0);
    const kRate    = (generatedCount / diffSecs / 1000).toFixed(1);

    process.stdout.write(
        `\r⚡ ${kRate.padStart(6)} k llaves/s ` +
        `│ Total: ${totalGenerated.toLocaleString('es-ES').padStart(14)} ` +
        `│ Targets: ${targetHashes.size} ` +
        `│ Matches: ${matchesFound}   `
    );

    generatedCount = 0;
    lastReportTime = now;
}

setInterval(report, REPORT_MS);

// ─── Bucle principal ──────────────────────────────────────────────────────────
function loop() {
    for (let i = 0; i < BATCH_SIZE; i++) generateAndCheck();
    setImmediate(loop);
}

loop();
