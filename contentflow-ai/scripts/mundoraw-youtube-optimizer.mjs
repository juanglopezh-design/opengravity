/**
 * MundoRaw YouTube Growth System
 * ================================
 * Analiza el canal @mundoraw, detecta patrones de videos virales
 * y genera títulos, descripciones y hashtags optimizados con Gemini AI.
 *
 * Uso:
 *   node scripts/mundoraw-youtube-optimizer.mjs
 *   node scripts/mundoraw-youtube-optimizer.mjs --titles
 *   node scripts/mundoraw-youtube-optimizer.mjs --ideas
 *   node scripts/mundoraw-youtube-optimizer.mjs --strategy
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";

// Fix SSL certificate verification on some Windows setups
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "AIzaSyCQGIg3to6hT1611AMg3LtOYsExYA8DGXA";
const GEMINI_API_KEY  = process.env.GEMINI_API_KEY  || "";
const CHANNEL_ID      = "UCsjCN2ZNwlbFIUWw8omIeiQ";
const CHANNEL_HANDLE  = "@mundoraw";
const CHANNEL_NICHE   = "viajes, vida cotidiana en España, gastronomía y experiencias reales siendo latino en España";
const TARGET_AUDIENCE = "latinos en España, turistas hispanohablantes, curiosos sobre la vida en España";

// ─── YOUTUBE API ─────────────────────────────────────────────────────────────
async function ytFetch(endpoint, params) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  url.searchParams.set("key", YOUTUBE_API_KEY);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const resp = await fetch(url.toString());
  if (!resp.ok) throw new Error(`YouTube API ${resp.status}: ${await resp.text()}`);
  return resp.json();
}

async function getAllVideos() {
  console.log("📥 Obteniendo todos los videos del canal...");
  let videos = [];
  let pageToken = "";
  do {
    const params = { part: "snippet", channelId: CHANNEL_ID, order: "date", maxResults: "50", type: "video" };
    if (pageToken) params.pageToken = pageToken;
    const data = await ytFetch("search", params);
    videos = videos.concat(data.items);
    pageToken = data.nextPageToken || "";
  } while (pageToken);

  const allStats = [];
  for (let i = 0; i < videos.length; i += 50) {
    const ids = videos.slice(i, i + 50).map(v => v.id.videoId).filter(Boolean).join(",");
    if (!ids) continue;
    const d = await ytFetch("videos", { part: "statistics,contentDetails,snippet", id: ids });
    allStats.push(...d.items);
  }
  return allStats.sort((a, b) =>
    parseInt(b.statistics.viewCount || 0) - parseInt(a.statistics.viewCount || 0)
  );
}

async function getTrendingInNiche() {
  console.log("🔥 Buscando trending en tu nicho...");
  const queries = ["vlog españa shorts", "canarias shorts viaje", "zaragoza españa", "comida española shorts", "latino en españa shorts"];
  const results = [];
  for (const q of queries) {
    try {
      const data = await ytFetch("search", {
        part: "snippet", q, type: "video", videoDuration: "short",
        order: "viewCount", maxResults: "3", regionCode: "ES", relevanceLanguage: "es",
      });
      for (const item of data.items) {
        results.push({ query: q, title: item.snippet.title, channel: item.snippet.channelTitle });
      }
    } catch {}
  }
  return results;
}

function analyzePatterns(videos) {
  const parseDuration = (d) => {
    const m = d.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
    return (parseInt(m?.[1] || 0) * 60) + parseInt(m?.[2] || 0);
  };
  const top = videos.slice(0, 10);
  const bottom = videos.slice(-10);
  return {
    totalVideos: videos.length,
    totalViews: videos.reduce((s, v) => s + parseInt(v.statistics.viewCount || 0), 0),
    avgTopViews: Math.round(top.reduce((s, v) => s + parseInt(v.statistics.viewCount || 0), 0) / top.length),
    avgBottomViews: Math.round(bottom.reduce((s, v) => s + parseInt(v.statistics.viewCount || 0), 0) / bottom.length),
    avgTopDuration: Math.round(top.map(v => parseDuration(v.contentDetails.duration)).reduce((a, b) => a + b, 0) / top.length),
    topVideos: top.map(v => ({
      title: v.snippet.title,
      views: parseInt(v.statistics.viewCount || 0),
      likes: parseInt(v.statistics.likeCount || 0),
      duration: v.contentDetails.duration,
      date: v.snippet.publishedAt.substring(0, 10),
      videoId: v.id,
      url: `https://youtube.com/shorts/${v.id}`,
    })),
    allVideos: videos.map(v => ({
      title: v.snippet.title,
      views: parseInt(v.statistics.viewCount || 0),
      likes: parseInt(v.statistics.likeCount || 0),
      duration: v.contentDetails.duration,
      date: v.snippet.publishedAt.substring(0, 10),
      videoId: v.id,
    })),
  };
}

// ─── GEMINI ───────────────────────────────────────────────────────────────────
async function callGemini(prompt) {
  if (!GEMINI_API_KEY) return "⚠️  Añade GEMINI_API_KEY al ejecutar el script.";
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  // Try models in order until one works
  const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName, generationConfig: { temperature: 0.9, maxOutputTokens: 4096 } });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (e) {
      if (e.message?.includes("429") || e.message?.includes("quota")) {
        console.log(`   ⚠️  ${modelName} cuota agotada, probando siguiente...`);
        continue;
      }
      if (e.message?.includes("404") || e.message?.includes("not found")) {
        continue;
      }
      throw e;
    }
  }
  return "⚠️  Todos los modelos de Gemini tienen cuota agotada. Intenta mañana o usa una API key diferente.";
}

async function generateOptimizedTitles(videos, trending) {
  console.log("🤖 Generando títulos optimizados...");
  const topVideos = videos.slice(0, 8).map(v => `- "${v.snippet.title}" → ${v.statistics.viewCount} vistas`).join("\n");
  const trendingTitles = trending.slice(0, 8).map(t => `- "${t.title}"`).join("\n");

  return callGemini(`Eres un experto en YouTube Shorts hispanohablante.

CANAL: ${CHANNEL_HANDLE} | NICHO: ${CHANNEL_NICHE}
AUDIENCIA: ${TARGET_AUDIENCE}

TOP VIDEOS DEL CANAL (los que más vistas tienen):
${topVideos}

TRENDING EN EL NICHO AHORA:
${trendingTitles}

PATRÓN DE ÉXITO DETECTADO: Los videos con lugares específicos (Zaragoza, Medellín, Canarias) 
y emojis consiguen más vistas. Los títulos con experiencias reales ("Bufet Zaragoza", "Calles de Medellín") 
funcionan mejor que títulos genéricos.

GENERA 20 títulos de Shorts VIRALES para el canal. Para cada uno:

TÍTULO: [máx 60 caracteres, emoji incluido]
TIPO: [comida/viaje/experiencia/lifestyle]
GANCHO: [por qué alguien va a parar el scroll]
HASHTAGS: #tag1 #tag2 #tag3 #tag4 #tag5
---`);
}

async function generateVideoIdeas(analysis, trending) {
  console.log("💡 Generando ideas de videos...");
  return callGemini(`Eres estratega de contenido para YouTube Shorts.

CANAL: ${CHANNEL_HANDLE} | Ubicación: Zaragoza, España
NICHO: ${CHANNEL_NICHE}
STATS: ${analysis.totalVideos} videos | ${analysis.totalViews.toLocaleString()} vistas | 438 subs
DURACIÓN ÓPTIMA DETECTADA: ${analysis.avgTopDuration} segundos

CONTENIDO QUE MÁS FUNCIONA EN ESTE CANAL:
${analysis.topVideos.slice(0, 5).map(v => `- ${v.views}v: "${v.title}"`).join("\n")}

TRENDING EN EL NICHO:
${trending.slice(0, 6).map(t => `- ${t.title}`).join("\n")}

GENERA 20 ideas concretas de Shorts para grabar en Zaragoza/España:

Para cada idea:
IDEA: [descripción de qué grabar exactamente]
TÍTULO: [título viral optimizado]
PRIMEROS 3 SEGUNDOS: [el gancho inicial]
DURACIÓN: [segundos recomendados]
POR QUÉ VA A VIRAL: [razón específica]
---`);
}

async function generateStrategy(analysis) {
  console.log("📈 Generando estrategia 30 días...");
  return callGemini(`Eres consultor experto en crecimiento de YouTube Shorts.

CANAL: ${CHANNEL_HANDLE} - Southwest-tours
DATOS REALES HOY:
- 438 suscriptores
- ${analysis.totalVideos} videos publicados  
- ${analysis.totalViews.toLocaleString()} vistas totales
- Top video: ${analysis.topVideos[0]?.views} vistas ("${analysis.topVideos[0]?.title}")
- Duración óptima: ${analysis.avgTopDuration}s
- País: España | Ciudad: Zaragoza

PROBLEMAS DETECTADOS:
1. Casi 0 comentarios → señal débil para el algoritmo
2. Sin CTA en videos (nadie pide comentar/suscribirse)
3. Nicho mezclado: comida + viajes + moda + música
4. 438 subs con 68K vistas = conversión baja (debería ser 2-3K subs)

CREA UN PLAN DE ACCIÓN 30 DÍAS concreto:

SEMANA 1 - QUICK WINS (esta semana):
[acciones específicas]

SEMANA 2 - OPTIMIZACIÓN:
[acciones específicas]

SEMANA 3-4 - ESCALAR:
[acciones específicas]

TÁCTICAS ANTI-SILENCIO (conseguir comentarios):
[técnicas específicas para activar el engagement]

NICHO DEFINITIVO RECOMENDADO:
[propuesta concreta]

META REALISTA 30 DÍAS: [número de subs]
META REALISTA 90 DÍAS: [número de subs]`);
}

async function generateDescriptionForVideo(videoTitle, videoUrl) {
  console.log(`📝 Generando descripción para: "${videoTitle}"...`);
  return callGemini(`Genera una descripción optimizada para YouTube Shorts para este video del canal ${CHANNEL_HANDLE}.

TÍTULO DEL VIDEO: "${videoTitle}"
NICHO: ${CHANNEL_NICHE}
URL: ${videoUrl}

La descripción debe tener:
1. Primera línea: gancho de 1 frase (aparece en la preview)
2. 2-3 líneas de contexto natural
3. CTA suave para suscribirse y comentar
4. 10-15 hashtags relevantes (mix de grandes y de nicho)
5. Máximo 500 caracteres total

Formato:
DESCRIPCIÓN:
[el texto completo listo para copiar y pegar]`);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const timestamp = new Date().toISOString().substring(0, 10);
  const outDir = __dirname;

  console.log("🚀 MundoRaw YouTube Growth System");
  console.log("=".repeat(50));

  const videos = await getAllVideos();
  const analysis = analyzePatterns(videos);

  // ── Print analysis ──
  console.log(`\n📊 CANAL: ${CHANNEL_HANDLE}`);
  console.log(`   Suscriptores: 438`);
  console.log(`   Videos: ${analysis.totalVideos}`);
  console.log(`   Vistas totales: ${analysis.totalViews.toLocaleString()}`);
  console.log(`   Promedio top 10: ${analysis.avgTopViews} vistas`);
  console.log(`   Duración óptima: ${analysis.avgTopDuration}s`);

  console.log(`\n🏆 TOP 10 VIDEOS:`);
  analysis.topVideos.forEach((v, i) => {
    console.log(`   ${String(i+1).padStart(2)}. ${String(v.views).padStart(5)}v | ${String(v.likes).padStart(3)}l | ${v.duration.padEnd(6)} | "${v.title}"`);
  });

  const trending = await getTrendingInNiche();

  // Save raw analysis
  const analysisFile = path.join(outDir, `mundoraw-analysis-${timestamp}.json`);
  fs.writeFileSync(analysisFile, JSON.stringify({ channel: CHANNEL_HANDLE, generatedAt: new Date().toISOString(), analysis, trending }, null, 2));
  console.log(`\n💾 Análisis guardado: mundoraw-analysis-${timestamp}.json`);

  const runAll = args.length === 0;

  if (runAll || args.includes("--titles")) {
    const titles = await generateOptimizedTitles(videos, trending);
    const file = path.join(outDir, `mundoraw-titles-${timestamp}.txt`);
    fs.writeFileSync(file, `TÍTULOS OPTIMIZADOS @mundoraw\nGenerado: ${new Date().toISOString()}\n${"=".repeat(60)}\n\n${titles}`);
    console.log(`\n🎯 TÍTULOS OPTIMIZADOS:\n\n${titles}`);
    console.log(`\n💾 Guardado: mundoraw-titles-${timestamp}.txt`);
  }

  if (runAll || args.includes("--ideas")) {
    const ideas = await generateVideoIdeas(analysis, trending);
    const file = path.join(outDir, `mundoraw-ideas-${timestamp}.txt`);
    fs.writeFileSync(file, `IDEAS DE VIDEOS @mundoraw\nGenerado: ${new Date().toISOString()}\n${"=".repeat(60)}\n\n${ideas}`);
    console.log(`\n💡 IDEAS DE VIDEOS:\n\n${ideas}`);
    console.log(`\n💾 Guardado: mundoraw-ideas-${timestamp}.txt`);
  }

  if (runAll || args.includes("--strategy")) {
    const strategy = await generateStrategy(analysis);
    const file = path.join(outDir, `mundoraw-strategy-${timestamp}.txt`);
    fs.writeFileSync(file, `ESTRATEGIA 30 DÍAS @mundoraw\nGenerado: ${new Date().toISOString()}\n${"=".repeat(60)}\n\n${strategy}`);
    console.log(`\n📈 ESTRATEGIA 30 DÍAS:\n\n${strategy}`);
    console.log(`\n💾 Guardado: mundoraw-strategy-${timestamp}.txt`);
  }

  if (args.includes("--describe") && args[args.indexOf("--describe") + 1]) {
    const videoTitle = args[args.indexOf("--describe") + 1];
    const desc = await generateDescriptionForVideo(videoTitle, "");
    console.log(`\n📝 DESCRIPCIÓN:\n\n${desc}`);
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ Listo. Archivos en scripts/");
  console.log("\nComandos disponibles:");
  console.log("  node scripts/mundoraw-youtube-optimizer.mjs              → todo");
  console.log("  node scripts/mundoraw-youtube-optimizer.mjs --titles     → solo títulos");
  console.log("  node scripts/mundoraw-youtube-optimizer.mjs --ideas      → solo ideas");
  console.log("  node scripts/mundoraw-youtube-optimizer.mjs --strategy   → solo estrategia");
  console.log('  node scripts/mundoraw-youtube-optimizer.mjs --describe "Mi Video" → descripción');
}

main().catch(e => { console.error("❌", e.message); process.exit(1); });
