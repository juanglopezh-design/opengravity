import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60s timeout for AI generation

/**
 * MundoRaw AutoPublish endpoint
 * Detecta nuevos videos en @mundoraw y autopublica en Twitter/X e Instagram.
 *
 * Se llama automáticamente cada hora desde instrumentation.ts (keep-alive loop).
 * También puede llamarse manualmente:
 *   GET /api/cron/mundoraw              → check & publish new videos
 *   GET /api/cron/mundoraw?force=1      → force publish latest video
 *   GET /api/cron/mundoraw?dry=1        → dry run (no publish)
 */

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "AIzaSyCQGIg3to6hT1611AMg3LtOYsExYA8DGXA";
const CHANNEL_ID      = "UCsjCN2ZNwlbFIUWw8omIeiQ";
// In-memory state key (unused directly — kept for documentation)
// const STATE_KEY = "mundoraw_published_ids";

// In-memory state (persists across requests in same process)
const publishedIds = new Set<string>();
let lastCheck: string | null = null;

// ─── YOUTUBE ─────────────────────────────────────────────────────────────────
async function getLatestVideos(n = 5) {
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("key", YOUTUBE_API_KEY);
  url.searchParams.set("channelId", CHANNEL_ID);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("order", "date");
  url.searchParams.set("maxResults", String(n));
  url.searchParams.set("type", "video");

  const resp = await fetch(url.toString(), { cache: "no-store" });
  if (!resp.ok) throw new Error(`YouTube API ${resp.status}`);
  const data = await resp.json();
  if (!data.items?.length) return [];

  const ids = data.items.map((i: any) => i.id.videoId).join(",");
  const statsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
  statsUrl.searchParams.set("key", YOUTUBE_API_KEY);
  statsUrl.searchParams.set("part", "statistics,contentDetails,snippet");
  statsUrl.searchParams.set("id", ids);

  const statsResp = await fetch(statsUrl.toString(), { cache: "no-store" });
  const statsData = await statsResp.json();

  return (statsData.items || []).map((v: any) => ({
    id: v.id,
    title: v.snippet.title,
    description: v.snippet.description?.substring(0, 200) || "",
    publishedAt: v.snippet.publishedAt,
    duration: v.contentDetails.duration,
    views: parseInt(v.statistics.viewCount || "0"),
    url: `https://youtube.com/shorts/${v.id}`,
    isShort: parseDurationSec(v.contentDetails.duration) <= 60,
  }));
}

function parseDurationSec(d: string): number {
  const m = d.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
  return (parseInt(m?.[1] || "0") * 60) + parseInt(m?.[2] || "0");
}

// ─── GEMINI ───────────────────────────────────────────────────────────────────
async function generateContent(video: any) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return buildFallback(video);

  const prompt = `Eres el manager de redes sociales del canal @mundoraw (latino en España - Zaragoza).
Nuevo video: "${video.title}" | URL: ${video.url} | Duración: ${parseDurationSec(video.duration)}s

Genera JSON exacto:
{
  "tweet": "máx 250 chars con emoji, gancho viral y URL",
  "instagram_caption": "150 chars con emojis y gancho",
  "hashtags": "#mundoraw #españa #zaragoza #shorts #vlog #latinosenespana #reels #viajes"
}
Solo devuelve el JSON.`;

  const models = ["gemini-2.0-flash", "gemini-1.5-flash"];
  for (const model of models) {
    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
      if (!resp.ok) continue;
      const data = await resp.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(clean);
    } catch {}
  }
  return buildFallback(video);
}

function buildFallback(video: any) {
  const short = video.title.length > 45 ? video.title.substring(0, 45) + "..." : video.title;
  return {
    tweet: `🎬 Nuevo en @mundoraw: "${short}" 👀 ${video.url} #mundoraw #shorts #españa`,
    instagram_caption: `✨ ${short} 🎬 Link en bio! #mundoraw #shorts`,
    hashtags: "#mundoraw #españa #zaragoza #shorts #vlog #latinosenespana #reels",
  };
}

// ─── TWITTER ──────────────────────────────────────────────────────────────────
async function postToTwitter(content: any): Promise<any> {
  const { TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET } = process.env;
  if (!TWITTER_API_KEY) return { skipped: true, reason: "TWITTER_API_KEY not configured" };

  // OAuth 1.0a
  const { createHmac, randomBytes } = await import("crypto");
  const url = "https://api.twitter.com/2/tweets";
  const text = `${content.tweet}`.substring(0, 280);

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: TWITTER_API_KEY,
    oauth_nonce: randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: TWITTER_ACCESS_TOKEN!,
    oauth_version: "1.0",
  };

  const paramStr = Object.keys(oauthParams).sort()
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(oauthParams[k])}`)
    .join("&");

  const baseStr = ["POST", encodeURIComponent(url), encodeURIComponent(paramStr)].join("&");
  const sigKey = `${encodeURIComponent(TWITTER_API_SECRET as string)}&${encodeURIComponent(TWITTER_ACCESS_SECRET as string)}`;
  oauthParams.oauth_signature = createHmac("sha1", sigKey).update(baseStr).digest("base64");

  const authHeader = "OAuth " + Object.keys(oauthParams).sort()
    .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
    .join(", ");

  const resp = await fetch(url, {
    method: "POST",
    headers: { Authorization: authHeader, "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    return { error: `Twitter ${resp.status}: ${err.substring(0, 200)}` };
  }
  return resp.json();
}

// ─── INSTAGRAM ────────────────────────────────────────────────────────────────
async function postToInstagram(video: any, content: any): Promise<any> {
  const { INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_BUSINESS_ID } = process.env;
  if (!INSTAGRAM_ACCESS_TOKEN) return { skipped: true, reason: "INSTAGRAM_ACCESS_TOKEN not configured" };

  const caption = `${content.instagram_caption}\n\n${content.hashtags}`;

  // Create container
  const createResp = await fetch(
    `https://graph.facebook.com/v18.0/${INSTAGRAM_BUSINESS_ID}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        video_url: video.url,
        caption,
        media_type: "REELS",
        access_token: INSTAGRAM_ACCESS_TOKEN,
      }),
    }
  );
  if (!createResp.ok) {
    const err = await createResp.text();
    return { error: `Instagram create ${createResp.status}: ${err.substring(0, 200)}` };
  }
  const { id: mediaId } = await createResp.json();

  // Publish
  const pubResp = await fetch(
    `https://graph.facebook.com/v18.0/${INSTAGRAM_BUSINESS_ID}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creation_id: mediaId, access_token: INSTAGRAM_ACCESS_TOKEN }),
    }
  );
  if (!pubResp.ok) {
    const err = await pubResp.text();
    return { error: `Instagram publish ${pubResp.status}: ${err.substring(0, 200)}` };
  }
  return pubResp.json();
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  // Auth check
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const { searchParams } = new URL(request.url);
  const isDry   = searchParams.get("dry") === "1";
  const isForce = searchParams.get("force") === "1";

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    lastCheck = new Date().toISOString();
    const videos = await getLatestVideos(isForce ? 1 : 5);

    if (!videos.length) {
      return NextResponse.json({ status: "no_videos", lastCheck });
    }

    const newVideos = isForce
      ? [videos[0]]
      : videos.filter(v => !publishedIds.has(v.id));

    if (!newVideos.length) {
      return NextResponse.json({
        status: "up_to_date",
        lastCheck,
        latestVideo: videos[0].title,
        publishedCount: publishedIds.size,
      });
    }

    const results = [];

    for (const video of newVideos) {
      // Generate content
      const content = await generateContent(video);

      const publishResult: any = {
        videoId: video.id,
        title: video.title,
        url: video.url,
        publishedAt: video.publishedAt,
        content,
        dry: isDry,
      };

      if (!isDry) {
        // Post to Twitter
        publishResult.twitter = await postToTwitter(content);
        // Post to Instagram
        publishResult.instagram = await postToInstagram(video, content);
        // Mark as published
        publishedIds.add(video.id);
      }

      results.push(publishResult);
    }

    return NextResponse.json({
      status: "published",
      count: results.length,
      lastCheck,
      results,
    });

  } catch (err: any) {
    console.error("[MundoRaw Cron] Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
