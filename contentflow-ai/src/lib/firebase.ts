import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDummyKeyForSafeInitializationRender",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "contentflow-ai-juang26.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "contentflow-ai-juang26",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "contentflow-ai-juang26.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1029384756",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1029384756:web:abcd1234efgh5678",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

