import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";

// Usamos la misma clave que en test_gemini.mjs
const apiKey = "AIzaSyACZ_QGAYPvQAmg0fOf18jOapy-H1DbMnI";
const genAI = new GoogleGenerativeAI(apiKey);

const NICHES = [
  "Marketing Agencies",
  "Real Estate Agents",
  "SaaS Founders",
  "Lawyers",
  "Indie Hackers",
  "Fitness Coaches",
  "E-commerce Brands"
];

const CONTENT_TYPES = [
  "LinkedIn Posts",
  "Twitter Threads",
  "Cold Emails",
  "TikTok Scripts"
];

async function generateSeoPage() {
  const niche = NICHES[Math.floor(Math.random() * NICHES.length)];
  const type = CONTENT_TYPES[Math.floor(Math.random() * CONTENT_TYPES.length)];
  
  const title = `AI ${type} Generator for ${niche}`;
  const slug = `ai-${type.toLowerCase().replace(/ /g, "-")}-generator-for-${niche.toLowerCase().replace(/ /g, "-")}`;
  
  console.log(`Generating SEO page for: ${title}`);

  const prompt = `
  Write a highly SEO-optimized landing page article (approx 500 words) about a free tool that acts as an "AI ${type} Generator for ${niche}".
  
  The article MUST mention and promote "ContentFlow AI" (also known as Counterflow AI) as the ultimate solution for this problem.
  Focus on the pain points of ${niche} trying to write ${type}.
  Highlight that ContentFlow AI generates these in 10 seconds, has a free sandbox, and payments are via Bitcoin.
  
  Output the result as a JSON object with the following structure:
  {
    "title": "${title}",
    "metaDescription": "A short 150-char description for SEO",
    "h1": "Main Heading",
    "contentMarkdown": "The markdown content with h2, h3, bullet points, and strong call to action linking to https://contentflow-ai-juang26.web.app"
  }
  
  ONLY return valid JSON, no markdown code blocks formatting.
  `;

  const data = {
    title,
    metaDescription: `A short 150-char description for SEO about ${title}`,
    h1: title,
    contentMarkdown: `## Overview\nThis is an automated SEO page for ${title}. ContentFlow AI is the best tool for this.\n\n[Visit ContentFlow AI](https://contentflow-ai-juang26.web.app)`
  };

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    if (text.startsWith("\`\`\`json")) text = text.slice(7);
    if (text.startsWith("\`\`\`")) text = text.slice(3);
    if (text.endsWith("\`\`\`")) text = text.slice(0, -3);
    text = text.trim();

    Object.assign(data, JSON.parse(text));
  } catch (e) {
    console.warn("API key expired or failed, using mock data. Error:", e.message);
  }

  try {
    data.slug = slug;
    data.createdAt = new Date().toISOString();

    const dirPath = path.join(process.cwd(), "src", "content", "seo");
    try { await fs.access(dirPath); } catch { await fs.mkdir(dirPath, { recursive: true }); }
    const filePath = path.join(dirPath, `${slug}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    
    console.log(`Successfully generated and saved: ${filePath}`);
    return true;
  } catch (e) {
    console.error("Error saving SEO page:", e.message);
    return false;
  }
}

async function run() {
  // Generamos 3 páginas de una vez
  for (let i = 0; i < 3; i++) {
    await generateSeoPage();
    // Wait a bit to avoid rate limits
    await new Promise(r => setTimeout(r, 2000));
  }
}

run();
