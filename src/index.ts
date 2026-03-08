import { initializeApp } from 'firebase-admin/app';
import { startBot } from './bot/index.js';
import http from 'http';

// Initialize the Firebase Admin SDK to connect to Firestore
initializeApp();

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
