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
      console.log("[Firebase Admin] Inicializado con service account.");
      return;
    }

    if (projectId) {
      console.error(
        "[Firebase Admin] ADVERTENCIA: FIREBASE_SERVICE_ACCOUNT no configurada. " +
        "Las operaciones de Firestore Admin fallarán. Configura esta variable en Render."
      );
      admin.initializeApp({ projectId });
      return;
    }

    console.error("[Firebase Admin] Sin FIREBASE_SERVICE_ACCOUNT ni projectId. Admin no inicializado.");
    admin.initializeApp();
  } catch (error) {
    console.error("Firebase Admin Initialization Error:", error);
  }
}

initializeFirebaseAdmin();

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
