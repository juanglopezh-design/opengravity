import { initializeApp, cert } from 'firebase-admin/app';
import { dbGetPendingCommands, dbUpdateCommandResult } from './src/memory/database.js';
import { config } from './src/config.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

// Local Bridge Setup
if (!config.FIREBASE_SERVICE_ACCOUNT && !config.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('❌ Error: Credenciales de Firebase no encontradas. Asegúrate de tener el archivo service-account.json localmente.');
  process.exit(1);
}

// Prefer local file for bridge if available
if (fs.existsSync('./service-account.json')) {
  const sa = JSON.parse(fs.readFileSync('./service-account.json', 'utf8'));
  initializeApp({ credential: cert(sa) });
} else {
  initializeApp(); // Use GOOGLE_APPLICATION_CREDENTIALS or default
}

console.log('🚀 OpenGravity Local Bridge Iniciado...');
console.log('📡 Escuchando comandos desde la nube...');

async function pollCommands() {
  try {
    const pending = await dbGetPendingCommands();
    for (const cmd of pending) {
      console.log(`📥 Ejecutando comando [${cmd.command}]:`, cmd.args);
      
      let result = '';
      let status: 'completed' | 'failed' = 'completed';

      try {
        if (cmd.command === 'execute_terminal') {
          const { stdout, stderr } = await execAsync(cmd.args.command);
          result = stdout || stderr || 'Comando ejecutado sin salida.';
        } else if (cmd.command === 'open_url') {
          // Cross-platform open (primarily Windows for the user)
          const start = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
          await execAsync(`${start} ${cmd.args.url}`);
          result = `URL abierta: ${cmd.args.url}`;
        } else {
          result = `Error: Comando desconocido ${cmd.command}`;
          status = 'failed';
        }
      } catch (e: any) {
        result = `Error de ejecución: ${e.message}`;
        status = 'failed';
      }

      await dbUpdateCommandResult(cmd.id!, status, result);
      console.log(`✅ Resultado enviado para ID ${cmd.id}`);
    }
  } catch (error) {
    console.error('❌ Error en el loop de polling:', error);
  }

  setTimeout(pollCommands, 3000); // Check every 3 seconds
}

pollCommands();
