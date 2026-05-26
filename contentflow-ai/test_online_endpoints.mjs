const BASE_URL = process.env.RENDER_URL || "https://contentflow-ai-ex6w.onrender.com";
const TIMEOUT_MS = 45000;

async function safeJson(res) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }
  return null;
}

async function runTest(name, fn) {
  try {
    await fn();
  } catch (err) {
    console.error(`❌ [${name}] ${err.message}`);
  }
}

async function main() {
  console.log("🚀 ContentFlow AI — Verificación en Render");
  console.log(`🌐 Target: ${BASE_URL}`);
  console.log("=".repeat(55));

  await runTest("Health", async () => {
    const res = await fetch(`${BASE_URL}/api/health`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    const data = await safeJson(res);
    console.log(`\n💚 Health: ${res.status}`, data);
    if (res.status !== 200 || data?.status !== "ok") {
      console.error("   ❌ Health check falló");
    } else {
      console.log("   ✅ Servicio online");
    }
  });

  await runTest("Landing", async () => {
    const res = await fetch(`${BASE_URL}/`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    console.log(`\n📊 Landing: ${res.status}`);
    if (res.status === 200) console.log("   ✅ Página principal OK");
    else console.error("   ❌ Landing no responde 200");
  });

  await runTest("Generate sin token", async () => {
    const res = await fetch(`${BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Test", type: "Post" }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const data = await safeJson(res);
    console.log(`\n✍️  Generate (sin auth): ${res.status}`, data);
    if (res.status === 401) console.log("   ✅ API protegida");
    else console.error("   ⚠️  Se esperaba 401");
  });

  await runTest("Crypto verify sin token", async () => {
    const res = await fetch(`${BASE_URL}/api/webhooks/crypto-verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        txHash: "abc",
        orderId: "user___starter___1",
        planId: "starter",
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const data = await safeJson(res);
    console.log(`\n₿ Crypto verify (sin auth): ${res.status}`, data);
    if (res.status === 401) console.log("   ✅ Webhook BTC protegido");
    else if (res.status === 404)
      console.error("   ⚠️  404 — despliega el último código en Render (git push)");
    else console.error("   ⚠️  Se esperaba 401");
  });

  console.log("\n" + "=".repeat(55));
  console.log("🏁 Verificación completada.\n");
}

main();
