import { initializeApp, cert } from 'firebase-admin/app';
import { startBot } from './bot/index.js';
import http from 'http';
import { config } from './config.js';

// Initialize Firebase Admin
if (config.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(config.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log('✅ Firebase initialized via FIREBASE_SERVICE_ACCOUNT env var');
  } catch (error) {
    console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT:', error);
    process.exit(1);
  }
} else {
  // If not provided as string, hope GOOGLE_APPLICATION_CREDENTIALS points to a file (local dev)
  initializeApp();
  console.log('✅ Firebase initialized via default credentials');
}

console.log('Starting OpenGravity...');

// Dummy HTTP server to satisfy Render's health check
const port = process.env.PORT || 10000;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('OpenGravity is running!');
}).listen(port);

console.log(`Health check server listening on port ${port}`);

startBot();

process.on('SIGINT', () => {
  console.log('Shutting down...');
  process.exit(0);
});
