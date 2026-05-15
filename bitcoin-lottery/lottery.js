const crypto = require('crypto');
const fs = require('fs');
const bitcoin = require('bitcoinjs-lib');
const ecc = require('tiny-secp256k1');
const { ECPairFactory } = require('ecpair');

const ECPair = ECPairFactory(ecc);

console.log("Cargando la base de datos de direcciones objetivo en memoria...");

const targetsFile = './target_addresses.txt';
if (!fs.existsSync(targetsFile)) {
    console.error("No se encontró target_addresses.txt, cerrando.");
    process.exit(1);
}

const lines = fs.readFileSync(targetsFile, 'utf8').split('\n').filter(l => l.trim().length > 0);
const targetSet = new Set(lines.map(l => l.trim()));
console.log(`¡Cargadas ${targetSet.size} direcciones exitosamente!\n`);

let generatedCount = 0;
let totalGenerated = 0;
let matchesFound = 0;
let lastReportTime = Date.now();
const reportIntervalMs = 1500; // Refrescar consola cada 1.5s

console.log("=========================================");
console.log("🎰 LOTERÍA BITCOIN STARTING 🎰");
console.log("Probabilidad de Match: ~1 en 2^160");
console.log("=========================================\n");

function generateAndCheck() {
    // 1. Aleatoriedad pura super rápida
    const privateKey = crypto.randomBytes(32);
    let keyPair;
    try {
        keyPair = ECPair.fromPrivateKey(privateKey);
    } catch {
         // Ocasionalmente algunas secuencias 32bytes no son válidas en la curva SECP256k1
        return;
    }
    
    // 2. Derivar P2PKH Pública (Legacy Address - el formato de las ballenas antiguas de Bitcoin)
    const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
    
    // 3. Contabilizar
    generatedCount++;
    totalGenerated++;

    // 4. Chequear
    if (targetSet.has(address)) {
        matchesFound++;
        console.log("\n\n==============================================");
        console.log("🚀🚀🚀 ¡MATCH ENCONTRADO! 🚀🚀🚀");
        console.log("==============================================");
        console.log("Dirección Pública:", address);
        console.log("Llave Privada (WIF):", keyPair.toWIF());
        console.log("Llave Privada (HEX):", privateKey.toString('hex'));
        console.log("==============================================\n");
        
        fs.appendFileSync('winner.txt', `\nMatches: ${address} | WIF: ${keyPair.toWIF()} | HEX: ${privateKey.toString('hex')}\n`, 'utf8');
    }

    // Reportar progreso
    const now = Date.now();
    if (now - lastReportTime >= reportIntervalMs) {
        const timeDiffSecs = (now - lastReportTime) / 1000;
        const rate = (generatedCount / timeDiffSecs).toFixed(0);
        
        process.stdout.write(`\r⚡ Ratio: ${rate.padStart(5, ' ')} llaves/segundo | Total Generado (Esta sesión): ${totalGenerated} | Billeteras Comprobadas: ${targetSet.size} | Matches: ${matchesFound} `);
        
        generatedCount = 0;
        lastReportTime = now;
    }
}

// Bucle en lote para balancear CPU y Event Loop de Node (Evitar bloqueo max call stack)
function loop() {
    for(let i = 0; i < 1000; i++) {
        generateAndCheck();
    }
    setImmediate(loop);
}

// Inicializar el bucle
loop();
