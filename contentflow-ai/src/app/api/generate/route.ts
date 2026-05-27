import { NextResponse } from "next/server";
import { generateContent } from "@/lib/gemini";
import { requireAuth } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";
import { isUnlimitedPlan } from "@/lib/config";
import * as admin from "firebase-admin";

// In-memory rate limiter: max 10 requests per minute per user
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(uid: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(uid);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(uid, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;

  entry.count += 1;
  return true;
}

// Clean up stale entries every 5 minutes to avoid memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [uid, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) rateLimitMap.delete(uid);
  }
}, 5 * 60_000);

export async function POST(req: Request) {
  try {
    const authResult = await requireAuth(req);
    if (!authResult.ok) return authResult.response;
    const userId = authResult.uid;

    // Rate limiting
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Espera un minuto antes de volver a intentar." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { prompt, type, tone, language } = body;

    if (!prompt?.trim() || !type) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos" },
        { status: 400 }
      );
    }

    // Sanitize inputs — truncate to reasonable limits
    const sanitizedPrompt = String(prompt).trim().slice(0, 2000);
    const sanitizedType = String(type).trim().slice(0, 100);
    const sanitizedTone = String(tone || "Profesional").trim().slice(0, 50);
    const sanitizedLanguage = String(language || "Español").trim().slice(0, 50);

    const userRef = adminDb.collection("users").doc(userId);
    let userData: Record<string, unknown> | undefined;

    try {
      const userDoc = await userRef.get();
      userData = userDoc.data();
    } catch (dbError) {
      console.error("Firestore Admin error in generate route:", dbError);
      if (process.env.NODE_ENV === "development") {
        userData = {
          plan: "free",
          generationsLimit: 10,
          generationsUsed: 0,
        };
      } else {
        return NextResponse.json({ error: "Error de base de datos" }, { status: 500 });
      }
    }

    if (!userData) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const plan = typeof userData.plan === "string" ? userData.plan : "free";
    const generationsUsed = Number(userData.generationsUsed ?? 0);
    const generationsLimit = Number(userData.generationsLimit ?? 10);

    if (!isUnlimitedPlan(plan) && generationsUsed >= generationsLimit) {
      return NextResponse.json(
        { error: "Has alcanzado tu límite de generaciones. Mejora tu plan para continuar." },
        { status: 403 }
      );
    }

    const generatedText = await generateContent(
      sanitizedPrompt,
      sanitizedType,
      sanitizedTone,
      sanitizedLanguage
    );

    const newGenerationsUsed = generationsUsed + 1;

    try {
      await Promise.all([
        userRef.collection("history").add({
          prompt: sanitizedPrompt,
          type: sanitizedType,
          content: generatedText,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        }),
        userRef.update({
          generationsUsed: admin.firestore.FieldValue.increment(1),
        }),
      ]);
    } catch (saveError) {
      console.error("Failed to save history/increment usage:", saveError);
      if (process.env.NODE_ENV !== "development") {
        return NextResponse.json({ error: "Error al guardar el historial" }, { status: 500 });
      }
    }

    return NextResponse.json({
      content: generatedText,
      generationsUsed: newGenerationsUsed,
      generationsLimit,
      plan,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";
    console.error("API Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
