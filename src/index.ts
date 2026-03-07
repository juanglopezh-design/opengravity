import { initializeApp } from 'firebase-admin/app';
import { startBot } from './bot/index.js';

// Initialize the Firebase Admin SDK to connect to Firestore
initializeApp();

console.log('Starting OpenGravity...');

startBot();

process.on('SIGINT', () => {
  console.log('Shutting down...');
  process.exit(0);
});
