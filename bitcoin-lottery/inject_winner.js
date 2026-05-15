const crypto = require('crypto');
const fs = require('fs');
const bitcoin = require('bitcoinjs-lib');
const ecc = require('tiny-secp256k1');
const { ECPairFactory } = require('ecpair');

const ECPair = ECPairFactory(ecc);

console.log("Probando inyección forzada de victoria (Simulación)...");

// Llave privada de prueba (NO USAR CON FONDOS)
const testPrivKeyHex = "0000000000000000000000000000000000000000000000000000000000000001";
const keyPair = ECPair.fromPrivateKey(Buffer.from(testPrivKeyHex, 'hex'));
const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });

console.log("Generando llave número 120,491...");
console.log("\n\n==============================================");
console.log("🚀🚀🚀 ¡MATCH ENCONTRADO! 🚀🚀🚀");
console.log("==============================================");
console.log("Dirección Pública:", address);
console.log("Llave Privada (WIF):", keyPair.toWIF());
console.log("Llave Privada (HEX):", testPrivKeyHex);
console.log("==============================================\n");

fs.appendFileSync('winner.txt', `\nMatches: ${address} | WIF: ${keyPair.toWIF()} | HEX: ${testPrivKeyHex}\n`, 'utf8');
console.log("¡Archivo winner.txt actualizado con éxito!");
