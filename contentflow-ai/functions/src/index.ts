import { onSchedule } from "firebase-functions/v2/scheduler";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

/**
 * Se ejecuta el 1º de cada mes a las 00:00 UTC.
 * Resetea generationsUsed = 0 para todos los usuarios con plan de pago activo.
 * Los usuarios free no se resetean (su límite es permanente hasta que paguen).
 */
export const resetMonthlyGenerations = onSchedule(
  {
    schedule: "0 0 1 * *", // cron: el día 1 de cada mes a medianoche UTC
    timeZone: "UTC",
    region: "us-central1",
  },
  async () => {
    const snapshot = await db
      .collection("users")
      .where("plan", "in", ["starter", "pro", "business"])
      .get();

    if (snapshot.empty) {
      console.log("[resetMonthlyGenerations] No hay usuarios de pago que resetear.");
      return;
    }

    const BATCH_SIZE = 400; // Firestore permite máx 500 operaciones por batch
    const docs = snapshot.docs;

    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const chunk = docs.slice(i, i + BATCH_SIZE);

      for (const doc of chunk) {
        batch.update(doc.ref, {
          generationsUsed: 0,
          lastResetAt: FieldValue.serverTimestamp(),
        });
      }

      await batch.commit();
      console.log(
        `[resetMonthlyGenerations] Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${chunk.length} usuarios reseteados.`
      );
    }

    console.log(
      `[resetMonthlyGenerations] Completado. Total reseteados: ${docs.length} usuarios.`
    );
  }
);
