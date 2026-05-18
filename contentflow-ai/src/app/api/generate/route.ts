import { NextResponse } from "next/server";
import { generateContent } from "@/lib/gemini";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const token = authHeader.split("Bearer ")[1];
    
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (e) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
    const userId = decodedToken.uid;

    const { prompt, type, tone, language } = await req.json();

    if (!prompt || !type) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos" },
        { status: 400 }
      );
    }

    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    if (!userData) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    if (userData.plan !== "pro" && userData.generationsUsed >= userData.generationsLimit) {
      return NextResponse.json({ error: "Has alcanzado tu límite de generaciones. Mejora tu plan para continuar." }, { status: 403 });
    }

    // Generate content using Gemini
    const generatedText = await generateContent(
      prompt,
      type,
      tone || "Profesional",
      language || "Español"
    );

    // Save to history and increment usage concurrently
    await Promise.all([
      userRef.collection("history").add({
        prompt,
        type,
        content: generatedText,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }),
      userRef.update({
        generationsUsed: admin.firestore.FieldValue.increment(1)
      })
    ]);

    return NextResponse.json({ content: generatedText });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";
    console.error("API Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
