import fs from "fs/promises";
import path from "path";

// A free and open way to find public leads without CAPTCHAs is the GitHub API.
// We search for users who have "founder", "ceo", or "marketing" in their bio.
const SEARCH_TERMS = ["founder", "marketing agency", "ceo saas"];
const LEADS_FILE = path.join(process.cwd(), "marketing_output", "leads.json");

async function initLeadsFile() {
  const dir = path.join(process.cwd(), "marketing_output");
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }

  try {
    await fs.access(LEADS_FILE);
  } catch {
    await fs.writeFile(LEADS_FILE, JSON.stringify([]), "utf-8");
  }
}

async function fetchGithubLeads(query) {
  console.log(`Buscando leads para: "${query}"...`);
  // Buscamos usuarios en Github
  const url = `https://api.github.com/search/users?q=${encodeURIComponent(query)}&per_page=10`;
  
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "ContentFlow-Marketing-Bot"
      }
    });

    if (!res.ok) {
      console.error("Rate limit o error de Github API:", res.status);
      return [];
    }

    const data = await res.json();
    const items = data.items || [];
    const leads = [];

    // Por cada usuario, obtenemos su perfil para ver si tiene el email público
    for (const item of items) {
      try {
        const userRes = await fetch(item.url, {
          headers: { "User-Agent": "ContentFlow-Marketing-Bot" }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.email) {
            leads.push({
              name: userData.name || userData.login,
              company: userData.company || "Indie Hacker / Startup",
              email: userData.email,
              niche: query,
              source: "GitHub Public Profiles"
            });
            console.log(`✅ Encontrado: ${userData.email}`);
          }
        }
        // Esperamos un poco para no saturar la API
        await new Promise(r => setTimeout(r, 500));
      } catch (e) {
        // Ignorar errores individuales
      }
    }
    return leads;
  } catch (error) {
    console.error("Error al buscar en Github:", error.message);
    return [];
  }
}

async function runScraper() {
  console.log("🚀 Iniciando Motor de Scrapeo de Leads (B2B)...");
  await initLeadsFile();

  const existingLeadsStr = await fs.readFile(LEADS_FILE, "utf-8");
  let allLeads = [];
  try {
    allLeads = JSON.parse(existingLeadsStr);
  } catch {
    allLeads = [];
  }

  const existingEmails = new Set(allLeads.map(l => l.email));
  let newLeadsCount = 0;

  for (const term of SEARCH_TERMS) {
    const leads = await fetchGithubLeads(term);
    for (const lead of leads) {
      if (!existingEmails.has(lead.email)) {
        allLeads.push(lead);
        existingEmails.add(lead.email);
        newLeadsCount++;
      }
    }
  }

  // Guardar en la base de datos
  await fs.writeFile(LEADS_FILE, JSON.stringify(allLeads, null, 2), "utf-8");
  console.log(`✅ Scrapeo completado. Se han añadido ${newLeadsCount} nuevos leads a la base de datos.`);
  console.log(`Total de leads disponibles: ${allLeads.length}`);
}

runScraper();
