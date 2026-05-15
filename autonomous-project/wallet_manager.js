const { ethers } = require('ethers');
const fs = require('fs');

const DB_FILE = './autonomous_wallets.json';

class WalletManager {
    static initDB() {
        if (!fs.existsSync(DB_FILE)) {
            fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
            console.log("🔒 Bóveda de Agentes Inicializada.");
        }
    }

    static loadWallets() {
        this.initDB();
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }

    static spawnNewAgentWallet() {
        const wallet = ethers.Wallet.createRandom();
        console.log(`\n🤖 Mente maestra: Dando a luz a una nueva entidad operativa.`);
        console.log(`➡️  Identidad (Address): ${wallet.address}`);
        
        const wallets = this.loadWallets();
        wallets.push({
            address: wallet.address,
            privateKey: wallet.privateKey,
            createdAt: new Date().toISOString(),
            status: "ACTIVA",
            balance: 0,
            airdrops_collected: 0
        });

        fs.writeFileSync(DB_FILE, JSON.stringify(wallets, null, 2));
        console.log("✅ Identidad guardada y asegurada en la bóveda local.");
        
        return wallet;
    }
}

module.exports = WalletManager;
