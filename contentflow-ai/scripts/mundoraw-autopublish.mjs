/**
 * MundoRaw AutoPublish Bot
 * =========================
 * Monitorea @mundoraw en YouTube y cuando detecta un video nuevo,
 * genera contenido viral con IA y autopublica en Twitter/X e Instagram.
 *
 * SETUP (una sola vez):
 *   1. Twitter/X API v2:
 *      - Ve a https://developer.twitter.com/en/portal/dashboard
 *      - Crea una app → genera Access Token con permisos de escritura
 *      - Añade al .env.local:
 *        TWITTER_API_KEY=...
 *        TWITTER_API_SECRET=...
 *        TWITTER_ACCESS_TOKEN=...
 *        TWITTER_ACCESS_SECRET=...
 *
 *   2. Instagram (via Facebook Graph API):
 *      - Ve a https://developers.facebook.com
 *      - Crea app → Instagram Basic Display → obtén access token
 *      - Añade: INSTAGRAM_ACCESS_TOKEN=...
 *        INSTAGRAM_BUSINESS_ID=...
 *
 * USO:
 *   node scripts/mundoraw-autopublish.mjs              → ejecutar una vez
 *   node scripts/mundoraw-autopublish.mjs --watch       → monitoreo continuo (cada 30 min)
 *   node scripts/mundoraw-autopublish.mjs --dry-run     → simular sin publicar
 *   node scripts/mundoraw-autopublish.mjs --force       → forzar publicación del último video
 *
 * AUTOMATIZACIÓN (ejecutar desde cron o Render Cron Job):
 *   Cada 30 minutos: usar schedule "30min" en Render Cron Jobs
 *   O desde crontab: usar intervalo de 30 minutos
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const CONFIG = {
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY || "AIzaSyCQGIg3to6hT1611AMg3LtOYsExYA8DGXA",
    channelId: "UCsjCN2ZNwlbFIUWw8omIeiQ",
    handle: "@mundoraw",
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
    models: ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"],
  },
  twitter: {
    apiKey:        process.env.TWITTER_API_KEY || "",
    apiSecret:     process.env.TWITTER_API_SECRET || "",
    accessToken:   process.env.TWITTER_ACCESS_TOKEN || "",
    accessSecret:  process.env.TWITTER_ACCESS_SECRET || "",
  },
  instagram: {
    accessToken:  process.env.INSTAGRAM_ACCESS_TOKEN || "",
    businessId:   process.env.INSTAGRAM_BUSINESS_ID || "",
  },
  stateFile: path.join(__dirname, "mundoraw-autopublish-state.json"),
};

const IS_DRY_RUN = process.argv.includes("--dry-run");
const IS_WATCH   = process.argv.includes("--watch");
const IS_FORCE   = process.argv.includes("--force");
const WATCH_INTERVAL_MS = 30 * 60 * 1000; // 30 minutos

// ─── STATE (track published videos) ─────────────────────────────────────────
function loadState() {
  try {
    if (fs.existsSync(CONFIG.stateFile)) {
      return JSON.parse(fs.readFileSync(CONFIG.stateFile, "utf-8"));
    }
  } catch {}
  return { publishedVideoIds: [], lastCheck: null };
}

function saveState(state) {
  fs.writeFileSync(CONFIG.stateFile, JSON.stringify(state, null, 2));
}

// ─── YOUTUBE ─────────────────────────────────────────────────────────────────
async function getLatestVideos(maxResults = 5) {
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("key", CONFIG.youtube.apiKey);
  url.searchParams.set("channelId", CONFIG.youtube.channelId);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("order", "date");
  url.searchParams.set("maxResults", maxResults);
  url.searchParams.set("type", "video");

  const resp = await fetch(url.toString());
  if (!resp.ok) throw new Error(`YouTube API error: ${resp.status}`);
  const data = await resp.json();

  // Get stats
  const ids = data.items.map(i => i.id.videoId).join(",");
  const statsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
  statsUrl.searchParams.set("key", CONFIG.youtube.apiKey);
  statsUrl.searchParams.set("part", "statistics,contentDetails,snippet");
  statsUrl.searchParams.set("id", ids);

  const statsResp = await fetch(statsUrl.toString());
  const statsData = await statsResp.json();

  return statsData.items.map(v => ({
    id: v.id,
    title: v.snippet.title,
    description: v.snippet.description,
    publishedAt: v.snippet.publishedAt,
    duration: v.contentDetails.duration,
    views: parseInt(v.statistics.viewCount || 0),
    likes: parseInt(v.statistics.likeCount || 0),
    url: `https://youtube.com/shorts/${v.id}`,
    thumbnail: v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.default?.url,
    tags: v.snippet.tags || [],
    isShort: parseDurationSeconds(v.contentDetails.duration) <= 60,
  }));
}

function parseDurationSeconds(d) {
  const m = d.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
  return (parseInt(m?.[1] || 0) * 60) + parseInt(m?.[2] || 0);
}

// ─── GEMINI ───────────────────────────────────────────────────────────────────
async function generateWithGemini(prompt) {
  if (!CONFIG.gemini.apiKey) return null;
  const genAI = new GoogleGenerativeAI(CONFIG.gemini.apiKey);
  for (const modelName of CONFIG.gemini.models) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.85, maxOutputTokens: 1024 },
      });
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (e) {
      if (e.message?.includes("429") || e.message?.includes("quota") || e.message?.includes("404")) continue;
      throw e;
    }
  }
  return null;
}

// ─── CONTENT GENERATION ──────────────────────────────────────────────────────
async function generateSocialContent(video) {
  const isShort = video.isShort;
  const videoType = isShort ? "YouTube Short" : "Video de YouTube";

  const prompt = `Eres el manager de redes sociales del canal ${CONFIG.youtube.handle}.
Acaban de subir un nuevo ${videoType}: "${video.title}"
URL: ${video.url}
Duración: ${parseDurationSeconds(video.duration)}s
${video.description ? `Descripción: ${video.description.substring(0, 200)}` : ""}

Genera el contenido de autopublicación en JSON exacto:
{
  "twitter_tweet": "tweet de máximo 250 chars con gancho, emoji y URL al final. Que genere curiosidad para ver el video.",
  "twitter_thread": ["tweet1 (hook viral)", "tweet2 (contexto/detalle)", "tweet3 (CTA para suscribirse)"],
  "instagram_caption": "caption de 150 chars con emojis y hashtags para Stories/Reels",
  "hashtags_twitter": ["#tag1","#tag2","#tag3","#tag4","#tag5"],
  "hashtags_instagram": ["#tag1","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7","#tag8","#tag9","#tag10"],
  "story_text": "texto corto para Instagram Story (máx 80 chars)"
}

IMPORTANTE: El canal es de un latino (colombiano) viviendo en España (Zaragoza).
Contenido: viajes, comida, vida cotidiana real. Audiencia: hispanohablantes.
Solo devuelve el JSON, sin markdown ni explicaciones.`;

  const aiText = await generateWithGemini(prompt);

  // Parse AI response or use fallback
  if (aiText) {
    try {
      const clean = aiText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(clean);
    } catch {}
  }

  // Fallback content if AI unavailable
  return generateFallbackContent(video);
}

function generateFallbackContent(video) {
  const title = video.title;
  const url = video.url;
  const shortTitle = title.length > 40 ? title.substring(0, 40) + "..." : title;

  return {
    twitter_tweet: `🎬 Nuevo video: "${shortTitle}" ¿Lo has visto? 👀 ${url} #mundoraw #shorts #españa`,
    twitter_thread: [
      `🎬 Acabo de subir: "${title}" ${url}`,
      `📍 Contenido desde España — vida real, sin filtros 🇪🇸`,
      `👇 Sígueme en YouTube para más: ${CONFIG.youtube.handle} 🔔`,
    ],
    instagram_caption: `✨ ${shortTitle} 🎬 Link en bio!`,
    hashtags_twitter: ["#mundoraw", "#shorts", "#españa", "#zaragoza", "#vlog"],
    hashtags_instagram: ["#mundoraw", "#españavlog", "#zaragoza", "#latinosenespana", "#shorts", "#reels", "#vlog", "#españa", "#viajes", "#colombianos"],
    story_text: `¡Nuevo video! 🎬 ${shortTitle}`,
  };
}

// ─── TWITTER/X POSTING ───────────────────────────────────────────────────────
// OAuth 1.0a signature for Twitter API v2
function generateOAuthSignature(method, url, params, consumerKey, consumerSecret, tokenSecret) {
  const sortedParams = Object.keys(params).sort().map(k =>
    `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`
  ).join("&");

  const baseString = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sortedParams),
  ].join("&");

  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  return crypto.createHmac("sha1", signingKey).update(baseString).digest("base64");
}

function buildOAuthHeader(method, url, bodyParams = {}) {
  const { apiKey, apiSecret, accessToken, accessSecret } = CONFIG.twitter;
  const oauthParams = {
    oauth_consumer_key: apiKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: "1.0",
  };

  const allParams = { ...oauthParams, ...bodyParams };
  oauthParams.oauth_signature = generateOAuthSignature(
    method, url, allParams, apiKey, apiSecret, accessSecret
  );

  const headerValue = "OAuth " + Object.keys(oauthParams)
    .sort()
    .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
    .join(", ");

  return headerValue;
}

async function postTweet(text) {
  if (!CONFIG.twitter.apiKey) {
    console.log("   ⚠️  Twitter: no configurado (añade TWITTER_API_KEY al .env.local)");
    return { simulated: true, text };
  }

  const url = "https://api.twitter.com/2/tweets";
  const body = JSON.stringify({ text: text.substring(0, 280) });
  const oauthHeader = buildOAuthHeader("POST", url);

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": oauthHeader,
      "Content-Type": "application/json",
    },
    body,
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Twitter API error ${resp.status}: ${err}`);
  }
  return resp.json();
}

async function postTwitterThread(tweets) {
  if (!CONFIG.twitter.apiKey) {
    console.log("   ⚠️  Twitter thread: no configurado");
    return tweets.map(t => ({ simulated: true, text: t }));
  }

  const results = [];
  let replyToId = null;

  for (const text of tweets) {
    const url = "https://api.twitter.com/2/tweets";
    const bodyObj = { text: text.substring(0, 280) };
    if (replyToId) bodyObj.reply = { in_reply_to_tweet_id: replyToId };

    const body = JSON.stringify(bodyObj);
    const oauthHeader = buildOAuthHeader("POST", url);

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Authorization": oauthHeader, "Content-Type": "application/json" },
      body,
    });

    if (!resp.ok) {
      const err = await resp.text();
      console.warn(`   ⚠️  Tweet ${results.length + 1} falló: ${err}`);
      break;
    }

    const data = await resp.json();
    results.push(data);
    replyToId = data.data?.id;
    // Rate limit: wait 1s between tweets
    await new Promise(r => setTimeout(r, 1000));
  }
  return results;
}

// ─── INSTAGRAM POSTING ────────────────────────────────────────────────────────
async function postInstagramStory(video, content) {
  if (!CONFIG.instagram.accessToken || !CONFIG.instagram.businessId) {
    console.log("   ⚠️  Instagram: no configurado (añade INSTAGRAM_ACCESS_TOKEN e INSTAGRAM_BUSINESS_ID)");
    return { simulated: true };
  }

  // Step 1: Create media container
  const caption = `${content.instagram_caption}\n\n${content.hashtags_instagram.join(" ")}`;
  const createUrl = `https://graph.facebook.com/v18.0/${CONFIG.instagram.businessId}/media`;

  const createResp = await fetch(createUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      video_url: video.url,
      caption,
      media_type: "REELS",
      access_token: CONFIG.instagram.accessToken,
    }),
  });

  if (!createResp.ok) {
    const err = await createResp.text();
    throw new Error(`Instagram create media error: ${err}`);
  }

  const { id: mediaId } = await createResp.json();

  // Step 2: Publish
  const publishUrl = `https://graph.facebook.com/v18.0/${CONFIG.instagram.businessId}/media_publish`;
  const publishResp = await fetch(publishUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creation_id: mediaId, access_token: CONFIG.instagram.accessToken }),
  });

  if (!publishResp.ok) {
    const err = await publishResp.text();
    throw new Error(`Instagram publish error: ${err}`);
  }

  return publishResp.json();
}

// ─── LOG ──────────────────────────────────────────────────────────────────────
function logPublish(video, content, results) {
  const logFile = path.join(__dirname, "mundoraw-autopublish-log.jsonl");
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    videoId: video.id,
    videoTitle: video.title,
    videoUrl: video.url,
    dryRun: IS_DRY_RUN,
    content,
    results,
  }) + "\n";
  fs.appendFileSync(logFile, entry);
}

// ─── MAIN PUBLISH FLOW ───────────────────────────────────────────────────────
async function publishVideo(video) {
  console.log(`\n📤 Publicando: "${video.title}"`);
  console.log(`   URL: ${video.url}`);
  console.log(`   Vistas actuales: ${video.views}`);

  // Generate content with AI
  console.log("   🤖 Generando contenido con IA...");
  const content = await generateSocialContent(video);

  console.log(`\n   📝 CONTENIDO GENERADO:`);
  console.log(`   Tweet: ${content.twitter_tweet}`);
  console.log(`   Instagram: ${content.instagram_caption}`);
  console.log(`   Hashtags IG: ${content.hashtags_instagram.join(" ")}`);

  if (IS_DRY_RUN) {
    console.log("\n   🔵 DRY RUN — no se publicó nada. Usa sin --dry-run para publicar.");
    logPublish(video, content, { dryRun: true });
    return;
  }

  const results = {};

  // Post to Twitter/X
  try {
    console.log("\n   🐦 Publicando en Twitter/X...");
    if (process.argv.includes("--thread")) {
      const twitterResult = await postTwitterThread(content.twitter_thread);
      results.twitter = { type: "thread", result: twitterResult };
      console.log("   ✅ Hilo de Twitter publicado");
    } else {
      const tweetText = `${content.twitter_tweet} ${content.hashtags_twitter.slice(0, 3).join(" ")}`;
      const twitterResult = await postTweet(tweetText);
      results.twitter = { type: "tweet", result: twitterResult };
      console.log(`   ✅ Tweet publicado${twitterResult.simulated ? " (simulado)" : ""}`);
    }
  } catch (e) {
    console.log(`   ❌ Twitter falló: ${e.message}`);
    results.twitter = { error: e.message };
  }

  // Post to Instagram
  try {
    console.log("   📸 Publicando en Instagram...");
    const igResult = await postInstagramStory(video, content);
    results.instagram = igResult;
    console.log(`   ✅ Instagram publicado${igResult.simulated ? " (simulado)" : ""}`);
  } catch (e) {
    console.log(`   ❌ Instagram falló: ${e.message}`);
    results.instagram = { error: e.message };
  }

  logPublish(video, content, results);
  console.log("\n   ✅ Publicación completada");
}

// ─── CHECK & RUN ─────────────────────────────────────────────────────────────
async function checkAndPublish() {
  const state = loadState();
  state.lastCheck = new Date().toISOString();

  console.log(`\n🔍 Comprobando nuevos videos en ${CONFIG.youtube.handle}...`);
  console.log(`   Último check: ${state.lastCheck}`);
  console.log(`   Videos ya publicados: ${state.publishedVideoIds.length}`);

  const videos = await getLatestVideos(IS_FORCE ? 1 : 5);

  if (IS_FORCE) {
    const latest = videos[0];
    console.log(`\n⚡ FORCE MODE: publicando último video: "${latest.title}"`);
    await publishVideo(latest);
    if (!IS_DRY_RUN && !state.publishedVideoIds.includes(latest.id)) {
      state.publishedVideoIds.push(latest.id);
    }
    saveState(state);
    return;
  }

  // Find new videos not yet published
  const newVideos = videos.filter(v => !state.publishedVideoIds.includes(v.id));

  if (newVideos.length === 0) {
    console.log("   ✅ No hay videos nuevos. Todo al día.");
    saveState(state);
    return;
  }

  console.log(`   🆕 ${newVideos.length} video(s) nuevo(s) encontrado(s)`);

  // Publish newest first (reverse to publish oldest first)
  for (const video of newVideos.reverse()) {
    await publishVideo(video);
    if (!IS_DRY_RUN) {
      state.publishedVideoIds.push(video.id);
      saveState(state); // Save after each video in case of interruption
    }
    // Wait between posts to avoid rate limits
    if (newVideos.length > 1) await new Promise(r => setTimeout(r, 3000));
  }

  saveState(state);
}

// ─── ENTRY POINT ─────────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 MundoRaw AutoPublish Bot");
  console.log("=".repeat(50));
  if (IS_DRY_RUN) console.log("🔵 MODO DRY RUN — no se publicará nada");
  if (IS_FORCE)   console.log("⚡ MODO FORCE — publicando último video");
  if (IS_WATCH)   console.log(`👁️  MODO WATCH — comprobando cada ${WATCH_INTERVAL_MS / 60000} minutos`);

  try {
    await checkAndPublish();

    if (IS_WATCH) {
      console.log(`\n⏱️  Próxima comprobación en ${WATCH_INTERVAL_MS / 60000} minutos...`);
      setInterval(async () => {
        try {
          await checkAndPublish();
          console.log(`⏱️  Próxima comprobación en ${WATCH_INTERVAL_MS / 60000} minutos...`);
        } catch (e) {
          console.error("❌ Error en watch cycle:", e.message);
        }
      }, WATCH_INTERVAL_MS);
    }
  } catch (e) {
    console.error("\n❌ Error:", e.message);
    process.exit(1);
  }
}

main();
