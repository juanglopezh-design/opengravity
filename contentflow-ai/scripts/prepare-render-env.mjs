/**
 * Lee el .env.local y genera las variables listas para pegar en Render.
 * Uso: node scripts/prepare-render-env.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "../.env.local");

if (!fs.existsSync(envPath)) {
  console.error("❌ No se encontró .env.local en:", envPath);
  process.exit(1);
}

const lines = fs.readFileSync(envPath, "utf-8").split(/\r?\n/);

console.log("\n🚀 VARIABLES DE ENTORNO PARA RENDER");
console.log("=".repeat(60));
console.log("Copia y pega estas en:\n");
console.log(
  "  https://dashboard.render.com/web/<tu-servicio>/env\n"
);
console.log("=".repeat(60) + "\n");

const required = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "GEMINI_API_KEY",
  "FIREBASE_SERVICE_ACCOUNT",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_API_URL",
];

const found = new Set();

for (const line of lines) {
  if (!line.trim() || line.startsWith("#")) continue;
  const [key] = line.split("=");
  if (required.includes(key?.trim())) {
    found.add(key.trim());
    console.log(line.trim());
  }
}

console.log("\n📌 VARIABLES ADICIONALES QUE DEBES CONFIGURAR MANUALMENTE:\n");
console.log(`NEXT_PUBLIC_SITE_URL=https://contentflow-ai-9wy7.onrender.com`);
console.log(`NEXT_PUBLIC_API_URL=https://contentflow-ai-9wy7.onrender.com`);
console.log(`NODE_ENV=production`);
console.log(`NODE_VERSION=20.18.0`);

const missing = required.filter((r) => !found.has(r) && r !== "NEXT_PUBLIC_SITE_URL" && r !== "NEXT_PUBLIC_API_URL");
if (missing.length > 0) {
  console.log("\n⚠️  FALTAN EN .env.local (configúralas directamente en Render):");
  missing.forEach((m) => console.log("  -", m));
}

console.log("\n" + "=".repeat(60));
console.log(
  "⚠️  IMPORTANTE: FIREBASE_SERVICE_ACCOUNT debe ser el JSON completo"
);
console.log("   del service account en UNA SOLA LÍNEA (sin saltos de línea).");
console.log(
  "   Puedes generarlo desde: Firebase Console > Configuración > Cuentas de servicio"
);
console.log("=".repeat(60) + "\n");
