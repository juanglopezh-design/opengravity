import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";

// Usamos la API key del entorno o el fallback para pruebas locales
const apiKey = process.env.GEMINI_API_KEY || "AIzaSyACZ_QGAYPvQAmg0fOf18jOapy-H1DbMnI";
const genAI = new GoogleGenerativeAI(apiKey);

const LOG_FILE = path.join(process.cwd(), "marketing_output", "social_media_log.jsonl");

async function initLogDir() {
  const dir = path.join(process.cwd(), "marketing_output");
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function generateViralThread() {
  const prompt = `
  Write a viral Twitter thread (3-4 tweets) promoting "ContentFlow AI".
  ContentFlow AI is a SaaS that generates viral content, LinkedIn posts, and emails in 10 seconds using Gemini AI.
  It also features private Bitcoin checkout.
  
  The tone must be highly aggressive, controversial, bold, and unapologetic. Call out people who are still wasting hours writing content manually.
  Use strong hooks. Make them feel they are falling behind if they don't use ContentFlow AI.
  Include a strong, urgent call to action to visit: https://contentflow-ai-juang26.web.app
  
  Output the result as a JSON array of strings, where each string is a tweet.
  Keep each tweet under 280 characters.
  
  Example JSON output:
  [
    "Tweet 1 text here...",
    "Tweet 2 text here...",
    "Tweet 3 text here..."
  ]
  `;

  let thread = [
    "I was tired of spending hours writing social media posts... so I built ContentFlow AI. 🚀 Generates viral posts in 10 seconds. Check it out: https://contentflow-ai-juang26.web.app",
    "It uses Gemini AI under the hood to ensure top-tier quality for LinkedIn, Twitter, and TikTok scripts.",
    "Plus, I added native Bitcoin checkout for total privacy. No credit cards needed. Try the free sandbox on the home page!"
  ];

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    if (text.startsWith("\`\`\`json")) text = text.slice(7);
    if (text.startsWith("\`\`\`")) text = text.slice(3);
    if (text.endsWith("\`\`\`")) text = text.slice(0, -3);
    
    thread = JSON.parse(text);
  } catch (e) {
    console.warn("[SocialBot] API fallback o error. Usando hilo por defecto.", e.message);
  }

  return thread;
}

async function logThread(thread) {
  const logEntry = JSON.stringify({
    timestamp: new Date().toISOString(),
    platform: "Twitter/X",
    thread,
    status: "SIMULATED_POST"
  }) + "\n";
  await fs.appendFile(LOG_FILE, logEntry, "utf-8");
}

async function runSocialMediaBot() {
  console.log("🚀 Iniciando Motor de Redes Sociales...");
  await initLogDir();

  console.log("Generando hilo viral con IA...");
  const thread = await generateViralThread();
  
  console.log("=========================================");
  console.log("HILO GENERADO:");
  thread.forEach((tweet, index) => {
    console.log(`[Tweet ${index + 1}]: ${tweet}`);
  });
  console.log("=========================================");

  // Aquí se integraría la API de Twitter/X v2
  // if (process.env.TWITTER_API_KEY) { ... }

  await logThread(thread);
  console.log("✅ Hilo guardado en los registros (Simulado).");
}

runSocialMediaBot();
