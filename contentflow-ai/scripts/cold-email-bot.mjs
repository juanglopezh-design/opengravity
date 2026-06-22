import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";

// Utilizamos la misma API key o fallback
const apiKey = "AIzaSyACZ_QGAYPvQAmg0fOf18jOapy-H1DbMnI";
const genAI = new GoogleGenerativeAI(apiKey);

const LEADS_FILE = path.join(process.cwd(), "marketing_output", "leads.json");
const LOG_FILE = path.join(process.cwd(), "marketing_output", "cold_emails_log.jsonl");

async function loadLeads() {
  try {
    const data = await fs.readFile(LEADS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    console.log("No leads found. Run lead-scraper.mjs first.");
    return [];
  }
}

async function initLogDir() {
  const dir = path.join(process.cwd(), "marketing_output");
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function logEmail(lead, subject, body) {
  const logEntry = JSON.stringify({
    timestamp: new Date().toISOString(),
    lead,
    subject,
    status: "SENT_SIMULATED"
  }) + "\n";
  await fs.appendFile(LOG_FILE, logEntry, "utf-8");
}

async function generatePersonalizedEmail(lead) {
  const prompt = `
  Write a highly aggressive, direct-response cold email to ${lead.name} at ${lead.company}.
  They are in the ${lead.niche} niche.
  Pitch "ContentFlow AI" (also known as Counterflow AI).
  Tone: Urgent, FOMO (Fear Of Missing Out), challenging their current slow processes. Use psychological triggers. "Your competitors are using AI to steal your audience."
  Offer them a free trial but make it sound exclusive and time-sensitive. Keep it under 100 words.
  
  Output JSON format:
  {
    "subject": "Email subject",
    "body": "Email body content"
  }
  `;

  let emailData = {
    subject: `Idea for ${lead.company} - Automated Content`,
    body: `Hi ${lead.name},\n\nI noticed ${lead.company} is doing great work in ${lead.niche}. I wanted to share ContentFlow AI, a tool that generates viral posts in 10 seconds.\n\nWant to try it free? https://contentflow-ai-juang26.web.app\n\nBest,\nJuan`
  };

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    if (text.startsWith("\`\`\`json")) text = text.slice(7);
    if (text.startsWith("\`\`\`")) text = text.slice(3);
    if (text.endsWith("\`\`\`")) text = text.slice(0, -3);
    
    Object.assign(emailData, JSON.parse(text));
  } catch (e) {
    console.warn(`[API Fallback] Using standard template for ${lead.email}`);
  }

  return emailData;
}

async function runOutreach() {
  console.log("🚀 Iniciando Motor de Cold Emailing...");
  await initLogDir();

  const leads = await loadLeads();
  if (leads.length === 0) {
    console.log("No hay leads para enviar correos.");
    return;
  }

  // Load sent logs to avoid sending twice
  let sentEmails = new Set();
  try {
    const logs = await fs.readFile(LOG_FILE, "utf-8");
    logs.split('\n').forEach(line => {
      if (line) {
        try {
          const entry = JSON.parse(line);
          sentEmails.add(entry.lead.email);
        } catch (e) {}
      }
    });
  } catch (e) {}

  for (const lead of leads) {
    if (sentEmails.has(lead.email)) {
      continue; // Skip already contacted
    }

    console.log(`Generando correo personalizado para: ${lead.email}`);
    const { subject, body } = await generatePersonalizedEmail(lead);
    
    // Aquí se integraría la API de Resend o SendGrid
    console.log(`[SIMULADO] Enviando a: ${lead.email} | Asunto: ${subject}`);
    
    await logEmail(lead, subject, body);
    sentEmails.add(lead.email); // Add to set to prevent duplicate in same run
    
    // Pausa para evitar rate limits o marcaje de spam
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log("✅ Lote de Cold Emails completado.");
}

runOutreach();
