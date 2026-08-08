import { NextResponse } from "next/server";
import { repurposeContent } from "@/lib/gemini";
import { requireAuth } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";
import { isUnlimitedPlan } from "@/lib/config";
import { checkRateLimit } from "@/lib/rate-limit";
import * as admin from "firebase-admin";

export async function POST(req: Request) {
  try {
    const authResult = await requireAuth(req);
    if (!authResult.ok) return authResult.response;
    const userId = authResult.uid;

    const rateLimitResult = checkRateLimit(userId);
    if (!rateLimitResult.allowed) {
      const retryAfterSec = Math.ceil(rateLimitResult.retryAfterMs / 1000);
      return NextResponse.json(
        { error: `Demasiadas solicitudes. Espera ${retryAfterSec} segundos.` },
        { status: 429 }
      );
    }

    const { prompt, language } = await req.json();

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Proporciona un tema o texto para transformar." }, { status: 400 });
    }

    const userRef = adminDb.collection("users").doc(userId);
    let userData: Record<string, unknown> | undefined;

    try {
      const userDoc = await userRef.get();
      userData = userDoc.data();
    } catch {
      if (process.env.NODE_ENV === "development") {
        userData = { plan: "basic", generationsLimit: 25, generationsUsed: 0 };
      } else {
        return NextResponse.json({ error: "Error de base de datos" }, { status: 500 });
      }
    }

    if (!userData) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const plan = typeof userData.plan === "string" ? userData.plan : "pending";
    const generationsUsed = Number(userData.generationsUsed ?? 0);
    const generationsLimit = Number(userData.generationsLimit ?? 0);

    if (!plan || plan === "pending") {
      return NextResponse.json(
        { error: "Necesitas un plan activo para usar el generador multicanal." },
        { status: 403 }
      );
    }

    if (!isUnlimitedPlan(plan) && generationsUsed >= generationsLimit) {
      return NextResponse.json(
        { error: "Límite de generaciones alcanzado." },
        { status: 403 }
      );
    }

    const resultBundle = await repurposeContent(prompt.trim(), language || "Español");

    // Increment usage by 1 for the bundle
    try {
      await userRef.update({
        generationsUsed: admin.firestore.FieldValue.increment(1),
      });
    } catch (saveErr) {
      console.error("Failed to update usage:", saveErr);
    }

    return NextResponse.json({
      bundle: resultBundle,
      generationsUsed: generationsUsed + 1,
      generationsLimit,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
