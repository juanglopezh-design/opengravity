
async function testOnlineAPI() {
  console.log("🚀 Iniciando prueba online para ContentFlow AI...");
  const baseUrl = "https://contentflow-ai-ex6w.onrender.com";

  try {
    // 1. Test home page
    console.log("\n📊 1. Probando Landing Page principal...");
    const homeRes = await fetch(`${baseUrl}/`);
    console.log(`Landing Page Status: ${homeRes.status} ${homeRes.statusText}`);
    if (homeRes.ok) {
      console.log("✅ Landing Page en línea y respondiendo.");
    } else {
      console.error("❌ Error al obtener la Landing Page.");
    }

    // 2. Test NOWPayments checkout API endpoint with missing parameters (expecting 400)
    console.log("\n💳 2. Probando endpoint de Checkout NOWPayments con parámetros faltantes (Esperado: 400)...");
    const checkoutRes = await fetch(`${baseUrl}/api/checkout/nowpayments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}) // Empty body
    });
    
    console.log(`Checkout API Status: ${checkoutRes.status} ${checkoutRes.statusText}`);
    const checkoutData = await checkoutRes.json();
    console.log("Respuesta recibida:", checkoutData);
    
    if (checkoutRes.status === 400 && checkoutData.error === "Missing required fields") {
      console.log("✅ El endpoint de checkout está en línea, activo y valida los parámetros de forma correcta (400 Bad Request)!");
    } else {
      console.error("❌ Respuesta inesperada en el checkout:", checkoutData);
    }

    // 3. Test Generate Content API endpoint with no token (expecting 401)
    console.log("\n✍️ 3. Probando endpoint de Generación de Contenido con IA sin token (Esperado: 401)...");
    const generateRes = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Test", type: "Post" })
    });
    
    console.log(`Generate API Status: ${generateRes.status} ${generateRes.statusText}`);
    const generateData = await generateRes.json();
    console.log("Respuesta recibida:", generateData);
    
    if (generateRes.status === 401 && generateData.error === "No autorizado") {
      console.log("✅ El endpoint de generación con IA está en línea, activo y bloquea accesos no autorizados correctamente (401 Unauthorized)!");
    } else {
      console.error("❌ Respuesta inesperada en la generación:", generateData);
    }

  } catch (error) {
    console.error("❌ Ocurrió un error de red durante la prueba:", error.message);
  }
}

testOnlineAPI();
