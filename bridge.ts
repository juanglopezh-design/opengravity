import { initializeApp, cert } from 'firebase-admin/app';
import { dbGetPendingCommands, dbUpdateCommandResult } from './src/memory/database.js';
import { config } from './src/config.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
const execAsync = promisify(exec);

// Log bridge start for debugging
console.log('Bridge started');

// Local Bridge Setup
// If no Firebase credentials are provided via env vars AND no local service-account.json exists, abort.
if (!config.FIREBASE_SERVICE_ACCOUNT && !config.GOOGLE_APPLICATION_CREDENTIALS && !fs.existsSync('./service-account.json')) {
  console.error('❌ Error: Credenciales de Firebase no encontradas. Proporcione FIREBASE_SERVICE_ACCOUNT env var o coloque service-account.json en el directorio del proyecto.');
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
      console.log(`📥 Ejecutando comando [${cmd.command}]: ${JSON.stringify(cmd.args)}`);
      
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
        } else if (cmd.command === 'read_file') {
          const content = await fs.promises.readFile(cmd.args.path, 'utf8');
          // Truncate if too large to avoid Firestore limits
          result = content.length > 50000 ? content.substring(0, 50000) + '\n...[TRUNCATED]' : content;
        } else if (cmd.command === 'write_file') {
          await fs.promises.writeFile(cmd.args.path, cmd.args.content, 'utf8');
          result = `Archivo escrito exitosamente en: ${cmd.args.path}`;
        } else if (cmd.command === 'list_dir') {
          const files = await fs.promises.readdir(cmd.args.path, { withFileTypes: true });
          result = files.map((f: any) => `${f.isDirectory() ? '[DIR]' : '[FILE]'} ${f.name}`).join('\n');
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
  } catch (error: any) {
    console.error(`❌ Error en el loop de polling: ${error.message || error}`);
    if (error.stack) console.error(error.stack);
  }

  setTimeout(pollCommands, 3000); // Check every 3 seconds
}

pollCommands();
