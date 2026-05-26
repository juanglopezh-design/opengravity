/**
 * Dispara un deploy en Render.
 * Uso: RENDER_API_KEY=tu_key node scripts/deploy-render.mjs
 * Service ID por defecto: srv-d83r0rbtqb8s73emre7g
 */
const SERVICE_ID = process.env.RENDER_SERVICE_ID || "srv-d83r0rbtqb8s73emre7g";
const API_KEY = process.env.RENDER_API_KEY;

if (!API_KEY) {
  console.error("❌ Falta RENDER_API_KEY.");
  console.error("   Obtén una en: https://dashboard.render.com/u/settings#api-keys");
  console.error("   Luego ejecuta:");
  console.error(`   $env:RENDER_API_KEY="tu_key"; node scripts/deploy-render.mjs`);
  process.exit(1);
}

async function main() {
  console.log(`🚀 Disparando deploy en Render (${SERVICE_ID})...`);

  const res = await fetch(`https://api.render.com/v1/services/${SERVICE_ID}/deploys`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ clearCache: "do_not_clear" }),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!res.ok) {
    console.error(`❌ Error ${res.status}:`, data);
    process.exit(1);
  }

  console.log("✅ Deploy iniciado:", data);
  console.log(`   Dashboard: https://dashboard.render.com/web/${SERVICE_ID}`);
}

main().catch((err) => {
  console.error("❌", err.message);
  process.exit(1);
});
