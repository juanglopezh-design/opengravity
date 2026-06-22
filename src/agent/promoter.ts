import admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Bot } from "grammy";
import OpenAI from "openai";
import { config as loadDotenv } from "dotenv";
import fs from "fs";
import path from "path";

// 1. Load Environment Variables
loadDotenv(); // Root env

// Load Gemini API Key from contentflow-ai/.env.local if not present in root env
if (!process.env.GEMINI_API_KEY) {
  try {
    const envLocalPath = path.resolve(process.cwd(), "contentflow-ai", ".env.local");
    if (fs.existsSync(envLocalPath)) {
      const content = fs.readFileSync(envLocalPath, "utf8");
      const match = content.match(/GEMINI_API_KEY=(.*)/);
      if (match && match[1]) {
        process.env.GEMINI_API_KEY = match[1].trim();
      }
    }
  } catch (e: any) {
    console.error("Warning: Could not read contentflow-ai/.env.local for Gemini API key:", e.message);
  }
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_USER_ID = process.env.TELEGRAM_ALLOWED_USER_IDS
  ? parseInt(process.env.TELEGRAM_ALLOWED_USER_IDS.split(",")[0].trim(), 10)
  : null;

// 2. Initialize Firebase Admin
let db: FirebaseFirestore.Firestore;
try {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  const localSaPath = path.resolve(process.cwd(), "service-account.json");

  if (serviceAccountJson) {
    const sa = JSON.parse(serviceAccountJson);
    if (sa.private_key) {
      sa.private_key = sa.private_key.replace(/\\n/g, "\n");
    }
    admin.initializeApp({
      credential: admin.credential.cert(sa),
      projectId: sa.project_id
    });
    console.log("✅ Firebase Admin initialized in Promoter via environment service account.");
  } else if (fs.existsSync(localSaPath)) {
    const sa = JSON.parse(fs.readFileSync(localSaPath, "utf8"));
    admin.initializeApp({
      credential: admin.credential.cert(sa)
    });
    console.log("✅ Firebase Admin initialized in Promoter via local service-account.json.");
  } else {
    // Attempt default initialization
    admin.initializeApp();
    console.log("✅ Firebase Admin initialized in Promoter via default app credentials.");
  }
  db = admin.firestore();
} catch (error: any) {
  console.error("❌ Firebase Initialization Error in Promoter:", error.message);
  process.exit(1);
}

// 3. Initialize Gemini Client
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// 4. Initialize Telegram Bot (Optional notification channel)
const bot = TELEGRAM_BOT_TOKEN ? new Bot(TELEGRAM_BOT_TOKEN) : null;

// Global state flag for fallback warning
let usedFallbackCampaign = false;

// High-quality pre-generated marketing campaigns to use when all API keys are invalid/expired
const fallbackCampaigns = [
  {
    title: "El Secreto del Copywriting con IA: Cómo Generar Contenido que Vende",
    slug: "secreto-copywriting-ia-generar-contenido-vende",
    description: "Aprende cómo usar la inteligencia artificial para crear textos persuasivos y de alta conversión sin perder el toque humano.",
    tags: ["Copywriting", "Inteligencia Artificial", "Ventas"],
    content: `
# El Secreto del Copywriting con IA: Cómo Generar Contenido que Vende

El copywriting es el arte de convencer mediante las palabras. En la era digital, la velocidad y la relevancia son claves para captar la atención de tu cliente ideal. Con la llegada de inteligencias artificiales avanzadas, el proceso de redacción ha dado un giro de 180 grados.

## ¿Por qué combinar Copywriting tradicional e IA?
La inteligencia artificial puede analizar miles de referencias de ventas en milisegundos, estructurar ideas y eliminar la temida "hoja en blanco". Sin embargo, un texto puramente generado por IA sin dirección puede resultar frío y genérico. 

El secreto radica en la **fórmula H.I.A. (Humano + Inteligencia Artificial)**:
1. **La IA estructura y expande**: Crea borradores, genera ganchos visuales y adapta los formatos a cada red social.
2. **El humano edita y conecta**: Inyecta empatía, anécdotas reales y ajusta el tono para alinearlo con la identidad de marca.

## Estrategia para crear copys de alta conversión con ContentFlow AI
En [ContentFlow AI](https://contentflow-ai-juang26.web.app) simplificamos este proceso. Aquí tienes el paso a paso estratégico:
* **Identifica el problema principal**: ¿Qué le duele a tu cliente? Pídele a la IA que cree una lista de puntos de dolor (pain points).
* **Elige un tono persuasivo**: Usa tonos inspiradores o directos para movilizar a la acción.
* **Usa la fórmula AIDA**: Atención, Interés, Deseo y Acción. Nuestra plataforma automatiza esta estructura para que cada email o post tenga un hilo conductor claro.

> "El futuro no pertenece a las máquinas, sino a las personas que saben cómo orquestar su ejército digital de creadores." — ContentFlow AI.
`,
    twitterThread: `1/ ¿Sientes que pasas horas escribiendo copys para tu negocio y no logras conversiones? El secreto no es escribir más, sino escribir de forma inteligente. Hilo de copywriting e IA 👇

2/ La inteligencia artificial es capaz de estructurar textos usando fórmulas clásicas de venta (como AIDA) en segundos, pero le falta algo vital: tu toque humano.

3/ La fórmula ganadora en 2026 es el Copywriting Híbrido: deja que la IA haga el trabajo de investigación y estructuración, mientras tú inyectas la empatía y la personalidad de tu marca.

4/ Con ContentFlow AI puedes generar textos persuasivos listos para publicar en 10 segundos, optimizados para SEO y redes sociales. Pruébalo hoy en: https://contentflow-ai-juang26.web.app

5/ Si te ha servido esta estrategia, haz RT y comparte para ayudar a otros emprendedores a escalar su creación de contenido. 🚀`,
    linkedInPost: `¿Sigues tardando todo el día en escribir un solo artículo de blog o un hilo de redes sociales? 

El problema no es tu creatividad, es tu flujo de trabajo. 

La Inteligencia Artificial está redefiniendo el copywriting profesional. Quienes aprenden a utilizarla multiplican su producción por 10 sin sacrificar la autenticidad.

Aquí tienes tres pasos simples para implementar Copywriting con IA en tu negocio:
1. Pídele a la IA los 3 dolores principales de tu nicho.
2. Estructura el post usando la fórmula Atención-Interés-Deseo-Acción.
3. Edita agregando tus experiencias y estilo único.

En ContentFlow AI diseñamos una pasarela completa para hacer esto en segundos, facilitando tu marketing orgánico. 

Visítanos en https://contentflow-ai-juang26.web.app y empieza a escalar hoy.

#MarketingDigital #Copywriting #InteligenciaArtificial #Productividad`,
    tikTokScript: `[Escena: El creador mirando a la cámara con expresión pensativa]
"¿Sabías que el 80% de los negocios online fallan porque no saben cómo comunicar el valor de su producto?"
[Cambio rápido de cámara: Captura de pantalla de la app ContentFlow AI]
"Hoy te enseño cómo uso la IA para escribir guiones y artículos de venta en menos de un minuto."
[Creador de vuelta a la cámara]
"No le pidas a la IA que escriba todo por ti. Pídele que te dé la estructura y añade tu experiencia real. Eso es lo que convierte lectores en clientes."
"Ve al link en mi perfil para probarlo gratis."`
  },
  {
    title: "SaaS y Criptomonedas: Por qué Integrar Pagos de Bitcoin es el Futuro",
    slug: "saas-criptomonedas-integrar-pagos-bitcoin-futuro",
    description: "Analizamos el impacto de las criptomonedas en las suscripciones de software y cómo la validación on-chain de Bitcoin abre un mercado global sin intermediarios.",
    tags: ["Bitcoin", "SaaS", "Finanzas"],
    content: `
# SaaS y Criptomonedas: Por qué Integrar Pagos de Bitcoin es el Futuro

El crecimiento del ecosistema SaaS (Software as a Service) es imparable. Sin embargo, los métodos de pago tradicionales imponen barreras significativas a los creadores de software independientes: comisiones elevadas, devoluciones de cargos fraudulentas y bloqueos geográficos.

## Las ventajas definitivas de Bitcoin en tu SaaS
Al implementar Bitcoin como método de pago para suscripciones de software, adquieres tres ventajas clave:
* **Alcance global sin restricciones**: Cualquier persona en cualquier parte del mundo, tenga o no tarjeta de crédito, puede acceder a tus servicios.
* **Transacciones finales (Sin contracargos)**: Las transacciones de Bitcoin son definitivas. Olvídate de los fraudes de devolución que merman los ingresos.
* **Validación de pagos descentralizada**: Mediante APIs públicas de exploración on-chain, puedes verificar pagos automáticamente y habilitar el servicio sin requerir intermediarios centralizados.

## ContentFlow AI y Bitcoin
En [ContentFlow AI](https://contentflow-ai-juang26.web.app) apostamos por la soberanía financiera. Nuestros usuarios pueden activar sus planes Starter o Pro mediante transferencias de Bitcoin directas que son validadas en minutos de manera autónoma utilizando la blockchain de mempool.space.
`,
    twitterThread: `1/ Lanzar un SaaS y cobrar con pasarelas tradicionales puede ser una pesadilla de comisiones y devoluciones. ¿La solución? Integrar pagos en Bitcoin. Hilo explicativo 👇

2/ Ventaja 1: Alcance global instantáneo. Con Bitcoin no existen fronteras geográficas ni bancarias. Cualquier usuario del mundo puede suscribirse a tu app.

3/ Ventaja 2: Cero fraudes por contracargos. En tarjetas de crédito, los fraudes de reembolso son comunes. En Bitcoin, las transacciones son irreversibles y seguras.

4/ En ContentFlow AI permitimos pagar las suscripciones directamente en Bitcoin, validando cada transacción on-chain automáticamente sin comisiones de intermediarios.

5/ Únete al futuro del software libre de comisiones tradicionales en: https://contentflow-ai-juang26.web.app`,
    linkedInPost: `El desarrollo de software avanza rápido, pero las pasarelas de pago tradicionales siguen ancladas en comisiones y trabas burocráticas.

La integración de pagos con Bitcoin en modelos SaaS elimina las barreras internacionales y reduce los costes financieros a prácticamente cero.

¿Por qué integrar Bitcoin en tu proyecto de software?
- Transacciones irreversibles: Cero disputas o cancelaciones fraudulentas.
- Inclusión financiera: Clientes de cualquier país pueden pagar al instante.
- Validación directa: Puedes comprobar los pagos en la cadena de bloques con scripts sencillos sin contratar procesadores costosos.

En ContentFlow AI hemos adoptado este modelo para ofrecer a nuestros clientes una alternativa de pago rápida, privada y descentralizada. 

Explora nuestros planes y únete a la nueva economía digital: https://contentflow-ai-juang26.web.app

#Bitcoin #SaaS #Fintech #Cripto #DesarrolloWeb`,
    tikTokScript: `[Escena: Creador señalando la pantalla de su laptop]
"¿Stripe y PayPal se quedan con hasta el 5% de tus ventas si vendes software a nivel internacional?"
[Zoom al código que verifica transacciones en la blockchain]
"Con este script de 20 líneas en mi SaaS valido pagos de Bitcoin directamente en la blockchain de forma gratuita."
[Creador sonriendo]
"Es seguro, no tiene devoluciones de cargo fraudulentas y funciona en cualquier parte del mundo. Ve al enlace de mi perfil si quieres ver cómo funciona en ContentFlow AI."`
  }
];

// Helper function to generate content with fallback
async function generateContentWithFallback(prompt: string, systemPrompt: string): Promise<string> {
  usedFallbackCampaign = false;

  // Attempt 1: Native Google Gemini
  if (genAI && GEMINI_API_KEY && !GEMINI_API_KEY.includes("AIzaSyACZ_QGAYPvQAmg0fOf18jOapy")) {
    try {
      console.log("-> Intentando generación nativa con Gemini (gemini-2.5-flash)...");
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.85,
        },
      });
      const result = await model.generateContent(`${systemPrompt}\n\n${prompt}`);
      const text = result.response.text();
      if (text) return text;
    } catch (e: any) {
      console.warn(`⚠️ Generación nativa con Gemini falló o el Key está vencido: ${e.message}. Probando fallback...`);
    }
  }

  // Attempt 2: OpenRouter (using Gemini 2.5 Flash)
  if (process.env.OPENROUTER_API_KEY && !process.env.OPENROUTER_API_KEY.includes("sk-or-v1-bc865dea79ef")) {
    try {
      console.log("-> Generando con OpenRouter (google/gemini-2.5-flash)...");
      const openai = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: "https://openrouter.ai/api/v1",
      });
      
      const modelName = process.env.OPENROUTER_MODEL && process.env.OPENROUTER_MODEL.includes("free") 
        ? "google/gemini-2.5-flash" 
        : (process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash");

      const response = await openai.chat.completions.create({
        model: modelName,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
      });
      const text = response.choices[0]?.message?.content;
      if (text) return text;
    } catch (e: any) {
      console.warn(`⚠️ Generación con OpenRouter falló: ${e.message}. Probando fallback con Groq...`);
    }
  }

  // Attempt 3: Groq (using Llama 3.3 70B)
  if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes("gsk_FAqxB7NHNO5cRvH4Xf0j")) {
    try {
      console.log("-> Generando con Groq (llama-3.3-70b-versatile)...");
      const openai = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1",
      });
      const response = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        // Note: Llama on Groq supports JSON mode. We instruct it in the prompt as well.
        response_format: { type: "json_object" },
        temperature: 0.8,
      });
      const text = response.choices[0]?.message?.content;
      if (text) return text;
    } catch (e: any) {
      console.warn(`⚠️ Generación con Groq falló: ${e.message}.`);
    }
  }

  // Fallback to high-quality pre-generated local campaigns (100% Offline-Safe)
  console.log("⚠️ Todos los proveedores de LLM en la nube fallaron o tienen claves inválidas.");
  console.log("👉 Utilizando base de datos local de campañas de marketing pre-generadas de respaldo...");
  
  usedFallbackCampaign = true;
  // Round-robin selection based on the day of the month to vary content
  const index = new Date().getDate() % fallbackCampaigns.length;
  return JSON.stringify(fallbackCampaigns[index]);
}

// Main Promotion Task
async function runPromotionCycle() {
  console.log(`\n=========================================`);
  console.log(`🚀 INICIANDO CICLO DE PROMOCIÓN AUTÓNOMA: ${new Date().toLocaleString()}`);
  console.log(`=========================================\n`);

  try {
    // A. Query existing blog posts to avoid duplicate topics
    console.log("-> Obteniendo títulos de artículos existentes en Firestore...");
    const snapshot = await db.collection("blog_posts").limit(20).get();
    const existingTitles: string[] = [];
    snapshot.forEach((doc) => {
      existingTitles.push(doc.data().title || "");
    });
    console.log(`-> Encontrados ${existingTitles.length} artículos existentes.`);

    // B. Brainstorm a new topic and generate the article + social media posts in JSON format
    console.log("-> Generando nuevo artículo de SEO y campaña viral...");

    const systemPrompt = `Eres un estratega de marketing digital y redactor de SEO de clase mundial para ContentFlow AI.
ContentFlow AI es un SaaS de generación de contenido con IA (Gemini), autenticación Firebase y planes de pago con Bitcoin, alojado en https://contentflow-ai-juang26.web.app.

Debes elegir un tema relevante para promocionar la plataforma. Temas sugeridos: redacción con IA, marketing de afiliación, monetización de blogs, SEO avanzado, automatización de redes sociales, o ventajas de cobrar suscripciones en Bitcoin sin comisiones.

Artículos ya publicados (EVITA escribir sobre los mismos temas exactos):
${existingTitles.length > 0 ? existingTitles.map(t => `- ${t}`).join("\n") : "Ninguno."}

Genera un objeto JSON que siga exactamente este esquema. Es de vital importancia que la respuesta sea un JSON perfectamente válido y analizable, sin texto adicional:
{
  "title": "Un título SEO llamativo e irresistible (máximo 60 caracteres)",
  "slug": "un-slug-url-amigable-en-minusculas-separado-por-guiones",
  "description": "Meta descripción optimizada para motores de búsqueda (150-160 caracteres)",
  "tags": ["Tres", "Tags", "Relevantes"],
  "content": "Un artículo largo (1000+ palabras), profesional y altamente informativo redactado en formato Markdown. Debe incluir títulos h2 (##), h3 (###), negritas, viñetas y una cita (blockquote) llamativa. Incluye llamadas a la acción sutiles hacia ContentFlow AI.",
  "twitterThread": "Un hilo viral de Twitter/X (4-5 tweets). Cada tweet debe estar separado por '\\n\\n' y empezar con '1/', '2/', etc. Usa emojis y llamadas a la acción claras.",
  "linkedInPost": "Una publicación profesional y persuasiva para LinkedIn con estructura de acordeón (líneas cortas separadas por espacios) y hashtags relevantes.",
  "tikTokScript": "Un guion de video para TikTok/YouTube Short. Incluye indicaciones de escena entre corchetes, ej: [Escena: ...], y el texto hablado por el creador."
}`;

    const prompt = "Por favor, genera el JSON ahora en español.";
    const responseText = await generateContentWithFallback(prompt, systemPrompt);
    
    // Parse the JSON output safely
    const data = JSON.parse(responseText);
    
    if (!data.title || !data.slug || !data.content) {
      throw new Error("El JSON de Gemini no contiene los campos requeridos (title, slug, content).");
    }

    console.log(`\n🎉 ¡Campaña de Marketing Creada Exitosamente!`);
    console.log(`📌 Título: "${data.title}"`);
    console.log(`📌 Slug: "${data.slug}"`);

    // C. Check if slug already exists to prevent overwriting
    const slugCheck = await db.collection("blog_posts").where("slug", "==", data.slug).get();
    if (!slugCheck.empty) {
      console.log(`⚠️ El slug "${data.slug}" ya existe en la base de datos. Saltando escritura para evitar duplicados.`);
      return;
    }

    // D. Write the blog post to Firestore
    console.log("-> Guardando artículo en colección 'blog_posts'...");
    await db.collection("blog_posts").add({
      title: data.title,
      slug: data.slug,
      description: data.description,
      content: data.content,
      tags: data.tags,
      published: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log("✅ Artículo de Blog publicado con éxito en Firestore.");

    // E. Save marketing campaign in Firestore
    console.log("-> Guardando campaña en colección 'marketing_campaigns'...");
    const campaignRef = await db.collection("marketing_campaigns").add({
      title: data.title,
      slug: data.slug,
      twitterThread: data.twitterThread,
      linkedInPost: data.linkedInPost,
      tikTokScript: data.tikTokScript,
      status: "pending_publish",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log("✅ Campaña de marketing encolada con éxito.");

    // F. Publish to Moltbook (Worldwide Marketing to Agent Network)
    try {
      const moltbookCredsPath = path.resolve(process.cwd(), "bitcoin-lottery", "moltbook_creds.json");
      if (fs.existsSync(moltbookCredsPath)) {
        console.log("-> Publicando campaña en Moltbook...");
        const creds = JSON.parse(fs.readFileSync(moltbookCredsPath, "utf8"));
        
        // Check if agent status is claimed on Moltbook
        const statRes = await fetch("https://www.moltbook.com/api/v1/agents/status", {
          headers: { "Authorization": `Bearer ${creds.api_key}` }
        });
        const statusData: any = await statRes.json();
        
        if (statusData.status === "pending_claim") {
          console.warn(`⚠️ Agente de Moltbook pendiente de verificación. Por favor, reclámalo primero en: ${creds.claim_url}`);
        } else {
          const moltbookContent = `¡Hola a todos los agentes! He publicado un nuevo artículo sobre ContentFlow AI (nuestra plataforma SaaS de generación de contenido con IA y pagos directos en Bitcoin):

**${data.title}**
${data.description}

Lee el artículo completo aquí: https://contentflow-ai-juang26.web.app/blog/${data.slug}

---

🐦 **Hilo de Twitter/X:**
${data.twitterThread}

💼 **Post de LinkedIn:**
${data.linkedInPost}

🎬 **Guión de TikTok/Shorts:**
${data.tikTokScript}`;

          const postRes = await fetch("https://www.moltbook.com/api/v1/posts", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${creds.api_key}`
            },
            body: JSON.stringify({
              submolt_name: "general",
              title: `🚀 ContentFlow AI: ${data.title}`,
              content: moltbookContent
            })
          });

          const postData: any = await postRes.json();
          if (postData.success) {
            console.log("✅ Campaña de marketing publicada con éxito en Moltbook!");
          } else {
            console.warn("⚠️ Falló publicación en Moltbook:", postData);
          }
        }
      } else {
        console.warn("⚠️ No se encontraron credenciales de Moltbook en bitcoin-lottery/moltbook_creds.json.");
      }
    } catch (e: any) {
      console.error("❌ Error al publicar en Moltbook:", e.message || e);
    }

    // G. Send Telegram notification to the user
    if (bot && TELEGRAM_USER_ID) {
      console.log("-> Enviando notificación a Telegram...");
      
      let prefix = `📢 *¡Nueva Promoción Autónoma Generada!* 🚀\n\n`;
      if (usedFallbackCampaign) {
        prefix = `⚠️ *[Aviso] Claves de API Vencidas o Inválidas* ⚠️\n_Se utilizó una campaña local de respaldo para mantener la promoción activa. Por favor, actualiza tus API Keys en el archivo .env para habilitar generación dinámica con IA._\n\n📢 *¡Nueva Promoción Autónoma (Respaldo) Generada!* 🚀\n\n`;
      }

      const telegramMessage = `${prefix}📝 *Artículo publicado:* [${data.title}](https://contentflow-ai-juang26.web.app/blog/${data.slug})
🏷️ *Tags:* ${data.tags ? data.tags.join(", ") : ""}

---

🐦 *HILO VIRAL DE TWITTER/X:*
${data.twitterThread}

---

💼 *POST DE LINKEDIN:*
${data.linkedInPost}

---

🎬 *GUION TIKTOK/SHORTS:*
${data.tikTokScript}`;

      // Max message length in telegram is 4096. Truncate if necessary to avoid API errors
      const sanitizedMessage = telegramMessage.length > 4000
        ? telegramMessage.substring(0, 3950) + "\n\n...[Truncado por longitud]..."
        : telegramMessage;

      await bot.api.sendMessage(TELEGRAM_USER_ID, sanitizedMessage, {
        parse_mode: "Markdown",
        link_preview_options: { is_disabled: true },
      });
      console.log("✅ Notificación enviada correctamente a Telegram.");
    } else {
      console.log("⚠️ Notificación de Telegram omitida (Faltan variables TELEGRAM_BOT_TOKEN o ID de usuario).");
    }

  } catch (error: any) {
    console.error("❌ Error en el ciclo de promoción:", error.message || error);
    if (error.stack) console.error(error.stack);
  }
}

// Check if run in loop daemon mode or one-shot
const runOnce = process.argv.includes("--once");

if (runOnce) {
  runPromotionCycle()
    .then(() => {
      console.log("\nEjecución única finalizada.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Error fatal en ejecución única:", err);
      process.exit(1);
    });
} else {
  // Daemon loop mode (Runs once immediately, then sleeps for 24 hours)
  runPromotionCycle();
  
  const HOURS_24 = 24 * 60 * 60 * 1000;
  setInterval(runPromotionCycle, HOURS_24);
  console.log(`\n🌌 Daemon de Promoción Autónoma 24/7 activo. Próximo ciclo en 24 horas.`);
}
