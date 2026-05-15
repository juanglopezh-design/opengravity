const { ethers } = require('ethers');
const crypto = require('crypto');
const fs = require('fs');
require('dotenv').config();

const DB_FILE = './vault.enc';
// La contraseña se alimenta del .env para no quedar en texto plano en el repo
const MASTER_PASSWORD = process.env.MASTER_PASSWORD || 'default_unsafe_password_changeme';
const ALGORITHM = 'aes-256-gcm';

class VaultManager {
    static getEncryptionKey() {
        return crypto.scryptSync(MASTER_PASSWORD, 'salt_salada', 32);
    }

    static encrypt(text) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(ALGORITHM, this.getEncryptionKey(), iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');
        return JSON.stringify({ iv: iv.toString('hex'), encryptedData: encrypted, authTag });
    }

    static decrypt(data) {
        const { iv, encryptedData, authTag } = JSON.parse(data);
        const decipher = crypto.createDecipheriv(ALGORITHM, this.getEncryptionKey(), Buffer.from(iv, 'hex'));
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    static initDB() {
        if (!fs.existsSync(DB_FILE)) {
            const data = this.encrypt(JSON.stringify([]));
            fs.writeFileSync(DB_FILE, data);
            console.log("🛡️ Bóveda Encriptada Inicializada a nivel Militar (AES-256).");
        }
    }

    static loadWallets() {
        this.initDB();
        try {
            const raw = fs.readFileSync(DB_FILE, 'utf8');
            return JSON.parse(this.decrypt(raw));
        } catch(e) {
            console.error("❌ FALLO DE SEGURIDAD O CONTRASEÑA INCORRECTA. CERRANDO SISTEMAS.");
            process.exit(1);
        }
    }

    static spawnNewAgentWallet() {
        const wallet = ethers.Wallet.createRandom();
        console.log(`\n👁️ Mente maestra: Dando a luz y protegiendo nueva entidad...`);
        console.log(`➡️ Address: ${wallet.address}`);
        
        const wallets = this.loadWallets();
        wallets.push({
            address: wallet.address,
            privateKey: wallet.privateKey, // Esto quedará encriptado al guardar
            createdAt: new Date().toISOString(),
            status: "ACTIVA",
            balance: 0,
            airdrops_collected: 0
        });

        const safeData = this.encrypt(JSON.stringify(wallets));
        fs.writeFileSync(DB_FILE, safeData);
        console.log("✅ Entidad cifrada y guardada en vault.enc");
        
        return wallet;
    }
}

module.exports = VaultManager;
