const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const os = require('os');
const crypto = require('crypto');
const fs = require('fs');

if (isMainThread) {
    // ----------------------------------------
    // HILO PRINCIPAL (CONTROLADOR DE LA RED DE AGENTES)
    // ----------------------------------------
    console.log("=========================================");
    console.log("🌐 INICIANDO ENJAMBRE DE AGENTES CLAW 🌐");
    console.log("=========================================\n");

    const targetsFile = './target_addresses.txt';
    if (!fs.existsSync(targetsFile)) {
        console.error("El archivo target_addresses.txt no existe. Cerrando.");
        process.exit(1);
    }
    
    // Contamos las líneas para reportar
    const lines = fs.readFileSync(targetsFile, 'utf8').split('\n').filter(l => l.trim().length > 0);
    console.log(`📡 Billeteras Objetivo en mira: ${lines.length}`);
    
    // Hilos dependiendo del procesador del usuario (MaxSubagents de Openclaw.json = 8)
    const numWorkers = Math.min(os.cpus().length, 8); 
    console.log(`🤖 Reclutando ${numWorkers} Subagentes IAs (Hilos Paralelos) locales...\n`);

    const workers = [];
    let globalRate = 0;
    let globalTotal = 0;

    for (let i = 0; i < numWorkers; i++) {
        const worker = new Worker(__filename, {
            workerData: { id: i + 1, targetsFile }
        });
        
        worker.on('message', (msg) => {
            if (msg.type === 'progress') {
                globalRate += msg.rate;
                globalTotal += msg.generated;
            } else if (msg.type === 'match') {
                console.log(`\n\n🚨🚨 [AGENTE ${msg.agentId}] ¡ENCONTRÓ UN MATCH! 🚨🚨`);
                console.log(`Dirección: ${msg.address}`);
                console.log(`WIF: ${msg.wif}`);
                fs.appendFileSync('winner.txt', `\n[Agente ${msg.agentId}] Matches: ${msg.address} | WIF: ${msg.wif}\n`, 'utf8');
            }
        });

        worker.on('error', (err) => console.error(`Error en Agente ${i+1}:`, err));
        workers.push(worker);
    }

    // Reporte Global Consolidado
    setInterval(() => {
        process.stdout.write(`\r🔥 PODER TOTAL DE RED: ${(globalRate / 2).toFixed(0)} llaves/seg | Búsquedas Realizadas: ${globalTotal} | Nodos: ${numWorkers} `);
        globalRate = 0; 
    }, 2000);

} else {
    // ----------------------------------------
    // SUBAGENTES (HILOS TRABAJADORES)
    // ----------------------------------------
    const bitcoin = require('bitcoinjs-lib');
    const ecc = require('tiny-secp256k1');
    const { ECPairFactory } = require('ecpair');
    const ECPair = ECPairFactory(ecc);

    const lines = fs.readFileSync(workerData.targetsFile, 'utf8').split('\n').filter(l => l.trim().length > 0);
    const targetSet = new Set(lines.map(l => l.trim()));

    let generatedCount = 0;
    let lastReportTime = Date.now();
    const ID = workerData.id;

    function hunt() {
        const privateKey = crypto.randomBytes(32);
        let keyPair;
        try { keyPair = ECPair.fromPrivateKey(privateKey); } catch { return; }
        
        const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
        generatedCount++;

        if (targetSet.has(address)) {
            parentPort.postMessage({ type: 'match', agentId: ID, address, wif: keyPair.toWIF() });
        }

        const now = Date.now();
        if (now - lastReportTime >= 2000) {
            const timeDiffSecs = (now - lastReportTime) / 1000;
            const rate = generatedCount / timeDiffSecs;
            parentPort.postMessage({ type: 'progress', rate, generated: generatedCount });
            
            generatedCount = 0;
            lastReportTime = now;
        }
    }

    function loop() {
        for(let i = 0; i < 500; i++) hunt();
        setImmediate(loop);
    }

    loop();
}
