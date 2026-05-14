import { NextResponse } from "next/dist/server/web/spec-extension/response";
import { generateContent } from "@/lib/gemini";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import * as admin from "firebase-admin";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    // We try to initialize with default credentials, which works on GCP/Vercel
    // For local dev, we'll bypass auth validation in a simple way for now
    admin.initializeApp();
  } catch (e) {
    console.error("Firebase admin init error:", e);
  }
}

export async function POST(req: Request) {
  try {
    const { prompt, type, tone, language, userId } = await req.json();

    if (!prompt || !type || !userId) {
      return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 });
    }

    // Generate content using Gemini
    const generatedText = await generateContent(prompt, type, tone || "Profesional", language || "Español");

    return NextResponse.json({ content: generatedText });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
