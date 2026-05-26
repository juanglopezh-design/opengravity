import admin from "firebase-admin";

function initializeFirebaseAdmin() {
  if (admin.apps.length) return;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  try {
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson) as admin.ServiceAccount;
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.projectId || projectId,
      });
      return;
    }

    if (process.env.NODE_ENV === "development" && projectId) {
      console.warn(
        "[Firebase Admin] Sin FIREBASE_SERVICE_ACCOUNT — modo desarrollo con projectId únicamente."
      );
      admin.initializeApp({ projectId });
      return;
    }

    // En producción sin credenciales: fallo explícito y ruidoso
    const msg =
      "[Firebase Admin] FIREBASE_SERVICE_ACCOUNT es OBLIGATORIO en producción. " +
      "Configura la variable de entorno en Render antes de arrancar.";
    console.error(msg);
    throw new Error(msg);
  } catch (error) {
    // Re-lanzar siempre para que el servidor no arranque mal configurado
    if (error instanceof Error && error.message.includes("FIREBASE_SERVICE_ACCOUNT")) {
      throw error;
    }
    console.error("Firebase Admin Initialization Error:", error);
    throw error;
  }
}

initializeFirebaseAdmin();

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
