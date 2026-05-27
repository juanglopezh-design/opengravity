/**
 * POST /api/reset-generations
 *
 * Resets generationsUsed to 0 for all users whose plan was activated
 * more than 30 days ago. Call this from a monthly cron job (e.g. UptimeRobot
 * or an external scheduler hitting this endpoint with the CRON_SECRET header).
 *
 * For now, also resets on each new plan activation (handled in crypto-verify).
 * This endpoint handles the monthly reset for existing subscribers.
 */
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";

export async function POST(req: Request) {
  // Protect with a secret so only authorized callers can trigger resets
  const secret = req.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const now = Date.now();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    // Find users with an active paid plan whose updatedAt is older than 30 days
    const snapshot = await adminDb
      .collection("users")
      .where("plan", "not-in", ["pending", "free"])
      .where("updatedAt", "<=", admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ message: "No users to reset.", count: 0 });
    }

    const batch = adminDb.batch();
    let count = 0;

    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        generationsUsed: 0,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      count++;
    });

    await batch.commit();

    console.log(`[ResetGenerations] Reset ${count} users at ${new Date().toISOString()}`);

    return NextResponse.json({ message: `Reset ${count} users successfully.`, count });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno";
    console.error("[ResetGenerations] Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
