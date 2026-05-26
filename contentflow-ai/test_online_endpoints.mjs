
const BASE_URL = "https://contentflow-ai-ex6w.onrender.com";

async function safeJson(res) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try { return await res.json(); } catch { return null; }
  }
  return null;
}

async function runTest(name, fn) {
  try {
    await fn();
  } catch (err) {
    console.error(`❌ [${name}] Error inesperado: ${err.message}`);
  }
}

async function main() {
  console.log("🚀 ContentFlow AI — Verificación Online");
  console.log(`🌐 Target: ${BASE_URL}`);
  console.log("=".repeat(55));

  // 1. Landing Page
  await runTest("Landing Page", async () => {
    console.log("\n📊 1. Landing Page principal...");
    const res = await fetch(`${BASE_URL}/`, { signal: AbortSignal.timeout(15000) });
    console.log(`   Status: ${res.status} ${res.statusText}`);
    if (res.status === 200) {
      const html = await res.text();
      const hasTitle = html.includes("ContentFlow") || html.includes("content");
      console.log(`   ✅ Landing Page online y respondiendo (HTML: ${html.length} bytes, title match: ${hasTitle})`);
    } else {
      console.error(`   ❌ Status inesperado: ${res.status}`);
    }
  });

  // 2. NOWPayments Checkout — sin parámetros (400 esperado)
  await runTest("NOWPayments Checkout (sin params)", async () => {
    console.log("\n💳 2. Checkout NOWPayments — sin parámetros (esperado: 400)...");
    const res = await fetch(`${BASE_URL}/api/checkout/nowpayments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(15000),
    });
    const data = await safeJson(res);
    console.log(`   Status: ${res.status} ${res.statusText}`);
    console.log(`   Respuesta: ${JSON.stringify(data)}`);
    if (res.status === 400 && data?.error === "Missing required fields") {
      console.log("   ✅ Endpoint activo y valida campos requeridos correctamente.");
    } else if (res.status === 404) {
      const text = await res.text().catch(() => "");
      console.error(`   ❌ 404 - Render aún no desplegó los cambios. HTML recibido: ${text.substring(0, 120)}...`);
    } else {
      console.error(`   ⚠️  Respuesta inesperada (${res.status}): ${JSON.stringify(data)}`);
    }
  });

  // 3. NOWPayments Checkout — con parámetros válidos (debería redirigir o responder con URL)
  await runTest("NOWPayments Checkout (con params)", async () => {
    console.log("\n💳 3. Checkout NOWPayments — con parámetros válidos...");
    const res = await fetch(`${BASE_URL}/api/checkout/nowpayments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: "starter", userId: "test-user-123" }),
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
    });
    const data = await safeJson(res);
    console.log(`   Status: ${res.status} ${res.statusText}`);
    const location = res.headers.get("location");
    if (location) console.log(`   Redirect → ${location}`);
    if (data) console.log(`   Respuesta: ${JSON.stringify(data)}`);

    if (res.status === 302 || res.status === 307 || res.status === 308 || location) {
      console.log("   ✅ Redirige correctamente (checkout flow activo).");
    } else if (data?.url) {
      console.log(`   ✅ Retornó URL de pago: ${data.url}`);
    } else if (res.status === 400) {
      console.log(`   ⚠️  400 con params — puede necesitar userId autenticado.`);
    } else {
      console.log(`   ℹ️  Respuesta recibida: ${res.status}`);
    }
  });

  // 4. Generate Content — sin token (401 esperado)
  await runTest("Generate API (sin token)", async () => {
    console.log("\n✍️  4. Generate API — sin token (esperado: 401)...");
    const res = await fetch(`${BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Test", type: "Post" }),
      signal: AbortSignal.timeout(15000),
    });
    const data = await safeJson(res);
    console.log(`   Status: ${res.status} ${res.statusText}`);
    console.log(`   Respuesta: ${JSON.stringify(data)}`);
    if (res.status === 401) {
      console.log("   ✅ Endpoint seguro — bloquea accesos no autenticados (401).");
    } else {
      console.error(`   ⚠️  Respuesta inesperada: ${res.status}`);
    }
  });

  // 5. NOWPayments Webhook — sin firma (401 esperado)
  await runTest("NOWPayments Webhook (sin firma)", async () => {
    console.log("\n🔔 5. Webhook NOWPayments — sin firma HMAC (esperado: 401)...");
    const res = await fetch(`${BASE_URL}/api/webhooks/nowpayments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_status: "finished" }),
      signal: AbortSignal.timeout(15000),
    });
    const data = await safeJson(res);
    console.log(`   Status: ${res.status} ${res.statusText}`);
    console.log(`   Respuesta: ${JSON.stringify(data)}`);
    if (res.status === 401 || res.status === 400) {
      console.log("   ✅ Webhook seguro — rechaza solicitudes sin firma válida.");
    } else if (res.status === 404) {
      console.error("   ❌ 404 — Render aún no desplegó los cambios.");
    } else {
      console.log(`   ℹ️  Respuesta: ${res.status}`);
    }
  });

  console.log("\n" + "=".repeat(55));
  console.log("🏁 Verificación online completada.\n");
}

main();
