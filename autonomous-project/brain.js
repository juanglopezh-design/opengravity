const VaultManager = require('./secure_vault');
const DefiRadar = require('./defi_radar');

console.log("\n==========================================");
console.log("🧠 CEREBRO V2: MODO [PROFESIONAL / ANTI-SYBIL] 🧠");
console.log("==========================================\n");

// Limitar a máximo 2 billeteras altamente cuidadas
const MAX_ELITE_WALLETS = 2; 

VaultManager.initDB();

/**
 * Función que genera un número o tiempo aleatorio para evitar detección algorítmica on-chain.
 */
function randomSleep(minSeg, maxSeg) {
    const ms = Math.floor(Math.random() * (maxSeg - minSeg + 1) + minSeg) * 1000;
    return new Promise(r => setTimeout(r, ms));
}

async function autonomousCycle() {
    console.log(`\n[${new Date().toLocaleTimeString()}] El cerebro financiero abre el mercado...`);
    
    let wallets = VaultManager.loadWallets();
    
    if (wallets.length < MAX_ELITE_WALLETS) {
        console.log(`Generando fuerza élite. Solo usaremos ${MAX_ELITE_WALLETS} identidades para evadir filtros de bots...`);
        while(wallets.length < MAX_ELITE_WALLETS) {
            VaultManager.spawnNewAgentWallet();
            wallets = VaultManager.loadWallets();
        }
    }

    const mission = await DefiRadar.getDailyMission();

    // Mezclar el orden de las billeteras (A veces opera primero la A, a veces la B).
    const shuffledWallets = wallets.sort(() => 0.5 - Math.random());
    
    for (const w of shuffledWallets) {
        if (!DefiRadar.shouldAgentWorkToday()) {
             console.log(`🛌 [Anti-Sybil] El agente [${w.address.substring(0,6)}...] "se tomó el día libre". Esperando...`);
             continue;
        }

        // Variabilidad de montos fraccionados (Irracionales)
        const fakeAmount = (Math.random() * 0.05 + 0.001).toFixed(5);
        
        console.log(`⚡ Ejecutando: Agente [${w.address.substring(0, 6)}...] inicia ${mission.type} en ${mission.protocol} con ${fakeAmount} ETH`);
        
        // Simulación: Delay totalmente aleatorio como un humano tipeando e interactuando
        await randomSleep(3, 8); 
        console.log(`✓ Misión on-chain archivada. Hash simulado.`);
        
        // El humano revisa Twitter un rato antes de cambiar a su segunda billetera...
        console.log("⏳ Interludio: Simulando distracción humana...");
        await randomSleep(5, 12);
    }

    console.log("\n🔄 Ciclo completado.");
}

async function start() {
    while(true) {
        await autonomousCycle();
        // Dormir horas/minutos aleatorios entre bloques grandes (20s a 60s en simulación)
        const longSleep = Math.floor(Math.random() * 40 + 20);
        console.log(`\n💤 Cerebro Entrando en REM sleep Anti-Bot por ${longSleep} segundos...`);
        await randomSleep(longSleep, longSleep);
    }
}

start();
