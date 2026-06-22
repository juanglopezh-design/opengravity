import fs from "fs";
import path from "path";

const directories = [
  { name: "Futurepedia", url: "https://www.futurepedia.io/submit-tool", price: "Free / Paid", domainRating: "72" },
  { name: "There's an AI for That", url: "https://theresanaiforthat.com/submit/", price: "Free / Paid", domainRating: "75" },
  { name: "FutureTools", url: "https://www.futuretools.io/submit-a-tool", price: "Free", domainRating: "55" },
  { name: "AlternativeTo", url: "https://alternativeto.net/software/new/", price: "Free", domainRating: "78" },
  { name: "TopAI.tools", url: "https://topai.tools/submit", price: "Free / Paid", domainRating: "48" },
  { name: "AI Finder", url: "https://aifinder.io/submit", price: "Free / Paid", domainRating: "42" },
  { name: "Easy With AI", url: "https://easywithai.com/submit-tool/", price: "Free / Paid", domainRating: "45" },
  { name: "AllThingsAI", url: "https://allthingsai.com/submit-a-tool", price: "Free", domainRating: "41" },
  { name: "Insidr AI", url: "https://www.insidr.ai/submit-tool/", price: "Free / Paid", domainRating: "44" },
  { name: "AI Library", url: "https://ailibrary.co/submit-a-tool/", price: "Free", domainRating: "38" },
  { name: "FindMyAITool", url: "https://findmyaitool.com/submit-tool", price: "Free / Paid", domainRating: "40" },
  { name: "Toolify AI", url: "https://www.toolify.ai/submit", price: "Free / Paid", domainRating: "51" },
  { name: "AI Valley", url: "https://www.aivalley.ai/submit-tool", price: "Free / Paid", domainRating: "39" },
  { name: "SaaSworthy", url: "https://www.saasworthy.com/add-product", price: "Free", domainRating: "68" },
  { name: "Crozdesk", url: "https://crozdesk.com/vendors/sign-up", price: "Free", domainRating: "64" },
  { name: "AppSumo", url: "https://appsumo.com/partners/", price: "Free (Revenue Split)", domainRating: "78" },
  { name: "BetaList", url: "https://betalist.com/submit", price: "Free / Paid", domainRating: "65" },
  { name: "StartupStash", url: "https://startupstash.com/submit-listing/", price: "Free / Paid", domainRating: "60" },
  { name: "Crunchbase", url: "https://www.crunchbase.com/", price: "Free", domainRating: "90" },
  { name: "Product Hunt", url: "https://www.producthunt.com/posts/new", price: "Free", domainRating: "91" },
  { name: "100bar", url: "https://100bar.com/submit", price: "Free", domainRating: "35" },
  { name: "AI Scout", url: "https://aiscout.net/submit-tool/", price: "Free / Paid", domainRating: "40" },
  { name: "Docus", url: "https://docus.ai/submit-tool", price: "Free", domainRating: "37" },
  { name: "Serchen", url: "https://www.serchen.com/add-program/", price: "Free", domainRating: "56" },
  { name: "Nextup.ai", url: "https://nextup.ai/submit", price: "Free / Paid", domainRating: "32" },
  { name: "WhatTheAI", url: "https://whattheai.tech/submit-a-tool/", price: "Free / Paid", domainRating: "34" },
  { name: "Opentools", url: "https://opentools.ai/submit-tool", price: "Free", domainRating: "42" },
  { name: "AIToolsDirectory", url: "https://aitoolsdirectory.com/submit", price: "Free", domainRating: "31" },
  { name: "Favird", url: "https://favird.com/submit", price: "Free", domainRating: "36" },
  { name: "Supertools", url: "https://supertools.therundown.ai/submit", price: "Free / Paid", domainRating: "46" }
];

const metadata = {
  name: "ContentFlow AI",
  url: "https://contentflow-ai-juang26.web.app",
  tagline: "Generate viral posts, emails & threads in 10 seconds | Powered by Gemini",
  shortDesc: "ContentFlow AI is a high-performance content engine built for founders, marketers, and creators who need to scale their output without compromising on quality. Powered by Google Gemini AI, it generates fully formatted LinkedIn posts, X threads, newsletters, and TikTok scripts in seconds, activated natively via Bitcoin Mainnet.",
  longDesc: "ContentFlow AI is a premium, privacy-focused SaaS built to eliminate writer's block and accelerate content production. Leveraging advanced Gemini AI models, the platform acts as an automated copywriting assistant tailored for high-engagement platforms like LinkedIn, Twitter/X, Instagram, and cold outreach email campaigns.\n\nKey features include:\n- Hook-heavy LinkedIn posts and viral Twitter/X threads\n- Conversion-optimized cold emails and content newsletters\n- Multi-language support across 12+ major languages\n- A live, zero-registration interactive sandbox playground on the homepage\n- Secure, direct on-chain Bitcoin checkout removing credit card locks.\n\nIdeal for indie hackers, social sellers, and digital agencies looking to multiply their organic traffic.",
  tags: "AI writing, copywriting, marketing automation, social media assistant, content generator, Bitcoin SaaS, Gemini AI",
  pricing: "Freemium ($1.99/mo to $79/mo, pay with Bitcoin)"
};

const run = () => {
  const outputPath = path.resolve(process.cwd(), "directory_submissions.md");
  
  let markdown = `# 🚀 Guía y Kit de Envío a Directorios de IA para ContentFlow AI\n\n`;
  markdown += `Este documento contiene los metadatos de tu herramienta y una lista de los **30 principales directorios de Inteligencia Artificial** ordenados para que los envíes de forma rápida y obtengas miles de visitas de usuarios en el mundo real.\n\n`;
  
  markdown += `## 📝 Metadatos del Producto (Listo para Copiar/Pegar)\n\n`;
  markdown += `* **Nombre de la Herramienta**: \`${metadata.name}\`\n`;
  markdown += `* **URL principal**: \`${metadata.url}\`\n`;
  markdown += `* **Eslogan (Tagline)**: \`${metadata.tagline}\`\n`;
  markdown += `* **Etiquetas / Keywords**: \`${metadata.tags}\`\n`;
  markdown += `* **Modelo de Precios**: \`${metadata.pricing}\`\n\n`;
  
  markdown += `### Descripción Corta (Short Description)\n\`\`\`text\n${metadata.shortDesc}\n\`\`\`\n\n`;
  markdown += `### Descripción Larga (Long Description)\n\`\`\`text\n${metadata.longDesc}\n\`\`\`\n\n`;
  
  markdown += `## 🌐 Directorios de IA para Registrarse (Ordenados por Autoridad de Dominio)\n\n`;
  markdown += `Marca las casillas conforme vayas enviando tu herramienta. Los enlaces te llevan directo al formulario de envío:\n\n`;
  markdown += `| Estado | Directorio | Enlace de Envío | Modelo de Precio | Autoridad de Dominio (DR) |\n`;
  markdown += `| :---: | :--- | :--- | :---: | :---: |\n`;
  
  directories.forEach((dir) => {
    markdown += `| [ ] | **${dir.name}** | [Enviar a ${dir.name}](${dir.url}) | ${dir.price} | DR ${dir.domainRating} |\n`;
  });
  
  markdown += `\n\n> [!TIP]\n`;
  markdown += `> **Estrategia de Listado:** Muchos directorios ofrecen listados gratuitos, pero tardan de 1 a 4 semanas en aprobarlos. Los listados de pago (normalmente de $5 a $49) son aprobados en 24 horas y te dan visibilidad en portada. Comienza enviando de forma gratuita a todos los que puedas y considera pagar en los top 3 (Futurepedia, There's an AI for That, y FutureTools) para conseguir picos de tráfico iniciales.\n`;

  fs.writeFileSync(outputPath, markdown, "utf8");
  console.log(`✅ Guía generada correctamente en: ${outputPath}`);
};

run();
