import admin from "firebase-admin";

/**
 * Formatea y re-empaqueta de forma garantizada una clave privada RSA/PEM
 * para solucionar el error de OpenSSL: "Too few bytes to read ASN.1 value" en Render.
 */
function formatPrivateKey(rawKey: string): string {
  if (!rawKey || typeof rawKey !== "string") return "";
  
  // 1. Reemplazar \n literales escapados
  const key = rawKey.replace(/\\n/g, "\n").trim();


  // 2. Extraer el cuerpo Base64 limpio de la clave eliminando headers y espacios corruptos
  const cleanBody = key
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/-----BEGIN RSA PRIVATE KEY-----/g, "")
    .replace(/-----END RSA PRIVATE KEY-----/g, "")
    .replace(/[\r\n\s]/g, "");

  if (!cleanBody || cleanBody.length < 50) {
    return key; // Devolver clave procesada original si el cuerpo extraído es muy corto
  }

  // 3. Re-construir la clave PEM exacta requerida por el parser ASN.1 de OpenSSL
  return `-----BEGIN PRIVATE KEY-----\n${cleanBody}\n-----END PRIVATE KEY-----\n`;
}

/**
 * Parsea de forma ultra-robusta la variable de entorno FIREBASE_SERVICE_ACCOUNT.
 */
function safeParseServiceAccount(rawInput: string): Record<string, any> | null {
  if (!rawInput) return null;
  let str = rawInput.trim();

  // 1. Eliminar comillas envolventes exteriores
  if ((str.startsWith("'") && str.endsWith("'")) || (str.startsWith('"') && str.endsWith('"'))) {
    str = str.slice(1, -1).trim();
  }

  // 2. Corregir comillas dobles doblemente escapadas
  if (str.includes('\\"') && !str.includes('"{')) {
    str = str.replace(/\\"/g, '"');
  }

  // Intento 1: Parseo directo de JSON
  try {
    const parsed = JSON.parse(str);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {}

  // Intento 2: Decodificación Base64
  try {
    const decoded = Buffer.from(str, "base64").toString("utf-8").trim();
    if (decoded.startsWith("{") && decoded.endsWith("}")) {
      const parsed = JSON.parse(decoded);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch {}

  // Intento 3: Reemplazo de saltos de línea en el string JSON
  try {
    const fixedNewlines = str.replace(/\r?\n/g, "\\n");
    const parsed = JSON.parse(fixedNewlines);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {}

  console.error("[Firebase Admin] No se pudo parsear FIREBASE_SERVICE_ACCOUNT JSON.");
  return null;
}

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) return;

  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "contentflow-ai-juang26";

  if (serviceAccountRaw) {
    const parsedAccount = safeParseServiceAccount(serviceAccountRaw);
    if (parsedAccount && (parsedAccount.private_key || parsedAccount.client_email)) {
      try {
        if (parsedAccount.private_key) {
          parsedAccount.private_key = formatPrivateKey(parsedAccount.private_key);
        }
        admin.initializeApp({
          credential: admin.credential.cert(parsedAccount as admin.ServiceAccount),
          projectId: parsedAccount.project_id || projectId,
        });
        console.log("[Firebase Admin] Inicializado con éxito mediante Service Account y PEM formateado.");
        return;
      } catch (certError) {
        console.error("[Firebase Admin] Advertencia al validar cert PEM:", certError);
      }
    }
  }

  // Fallback seguro en producción o desarrollo
  try {
    admin.initializeApp({ projectId });
    console.log(`[Firebase Admin] Inicializado en modo fallback con projectId: ${projectId}`);
  } catch (fallbackError) {
    console.error("[Firebase Admin] Error en fallback initialization:", fallbackError);
  }
}

initializeFirebaseAdmin();

const defaultApp = admin.apps.length > 0 
  ? admin.app() 
  : admin.initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "contentflow-ai-juang26" });

export const adminDb = admin.firestore(defaultApp);
export const adminAuth = admin.auth(defaultApp);


