/**
 * ContentFlow AI — Global Marketing Promoter Agent
 * ─────────────────────────────────────────────────
 * Automated 24/7 marketing engine that:
 *  1. Generates viral Reddit posts for target communities
 *  2. Produces Twitter/X thread content
 *  3. Crafts cold-outreach emails for affiliate recruitment
 *  4. Tracks directory submission progress
 *  5. Schedules & logs all promotions
 *
 * Usage:
 *   npx tsx src/agent/promoter.ts --once      (single run)
 *   npx tsx src/agent/promoter.ts --loop      (runs every 6h)
 *   npx tsx src/agent/promoter.ts --report    (show stats only)
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// ─── Config ─────────────────────────────────────────────────────────────────

const APP_URL = "https://contentflow-ai-juang26.web.app";
const APP_NAME = "ContentFlow AI";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TAGLINE = "Generate viral posts, emails & threads in 10 seconds | Powered by Gemini";

// ROOT must be defined before loading .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../");
const LOG_FILE = path.join(ROOT, "promoter_log.jsonl");
const PROGRESS_FILE = path.join(ROOT, "promoter_progress.json");

// Load .env.local if running outside Next.js
const envPath = path.join(ROOT, ".env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf-8")
    .split("\n")
    .forEach((line) => {
      const [key, ...rest] = line.split("=");
      if (key && rest.length && !process.env[key.trim()]) {
        process.env[key.trim()] = rest.join("=").trim();
      }
    });
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

// ─── Target Communities ─────────────────────────────────────────────────────

const REDDIT_TARGETS = [
  { subreddit: "r/SaaS", angle: "Bitcoin checkout + AI copywriting SaaS feedback request" },
  { subreddit: "r/sideproject", angle: "Just launched an AI content tool — seeking honest feedback" },
  { subreddit: "r/indiehackers", angle: "Built in public: AI SaaS with Bitcoin payments from scratch" },
  { subreddit: "r/entrepreneur", angle: "How I eliminated writer's block with AI — sharing my tool" },
  { subreddit: "r/artificial", angle: "Gemini-powered copywriting that generates LinkedIn posts in 10s" },
  { subreddit: "r/startups", angle: "Product feedback: AI content engine with private Bitcoin checkout" },
  { subreddit: "r/ChatGPT", angle: "Alternative to ChatGPT for content creators — free sandbox demo" },
  { subreddit: "r/marketing", angle: "Free AI copywriting tool for social media — no signup needed" },
  { subreddit: "r/socialmedia", angle: "How I generate a week of content in 5 minutes with AI" },
  { subreddit: "r/freelance", angle: "Tool that writes client copy 10x faster — just launched" },
];

const TWITTER_HOOKS = [
  "I built an AI that generates viral LinkedIn posts in 10 seconds.",
  "Writer's block is over. Here's the tool I built to kill it forever.",
  "How to generate a month of content in under an hour (with AI).",
  "Most people spend 3 hours writing one LinkedIn post. I spend 10 seconds.",
  "I built a Gemini-powered copywriting SaaS and launched it with Bitcoin.",
  "The secret to going viral on LinkedIn? It's not what you think.",
  "I replaced my entire content team with one AI tool. Here's how.",
  "Your audience is starving for content. You don't have time to write it. Fix →",
];

const AFFILIATE_NICHES = [
  { niche: "Marketing consultant", platform: "LinkedIn", followers: "5k-50k" },
  { niche: "SaaS founder", platform: "Twitter/X", followers: "1k-20k" },
  { niche: "Freelance copywriter", platform: "Twitter/X", followers: "500-10k" },
  { niche: "Content creator", platform: "Instagram/TikTok", followers: "10k-100k" },
  { niche: "Digital marketing agency", platform: "LinkedIn", followers: "company page" },
];

const AI_DIRECTORIES = [
  { name: "Futurepedia", url: "https://www.futurepedia.io/submit-tool", dr: 72 },
  { name: "There's an AI for That", url: "https://theresanaiforthat.com/submit/", dr: 75 },
  { name: "FutureTools", url: "https://www.futuretools.io/submit-a-tool", dr: 55 },
  { name: "AlternativeTo", url: "https://alternativeto.net/software/new/", dr: 78 },
  { name: "Product Hunt", url: "https://www.producthunt.com/posts/new", dr: 91 },
  { name: "Crunchbase", url: "https://www.crunchbase.com/", dr: 90 },
  { name: "AppSumo", url: "https://appsumo.com/partners/", dr: 78 },
  { name: "BetaList", url: "https://betalist.com/submit", dr: 65 },
  { name: "SaaSworthy", url: "https://www.saasworthy.com/add-product", dr: 68 },
  { name: "Crozdesk", url: "https://crozdesk.com/vendors/sign-up", dr: 64 },
  { name: "Toolify AI", url: "https://www.toolify.ai/submit", dr: 51 },
  { name: "Supertools", url: "https://supertools.therundown.ai/submit", dr: 46 },
  { name: "TopAI.tools", url: "https://topai.tools/submit", dr: 48 },
  { name: "Easy With AI", url: "https://easywithai.com/submit-tool/", dr: 45 },
  { name: "Insidr AI", url: "https://www.insidr.ai/submit-tool/", dr: 44 },
  { name: "Serchen", url: "https://www.serchen.com/add-program/", dr: 56 },
  { name: "StartupStash", url: "https://startupstash.com/submit-listing/", dr: 60 },
  { name: "AllThingsAI", url: "https://allthingsai.com/submit-a-tool", dr: 41 },
  { name: "AI Finder", url: "https://aifinder.io/submit", dr: 42 },
  { name: "AI Library", url: "https://ailibrary.co/submit-a-tool/", dr: 38 },
];

// ─── State ──────────────────────────────────────────────────────────────────

interface PromotionLog {
  timestamp: string;
  type: "reddit" | "twitter" | "affiliate" | "directory" | "hackernews";
  target: string;
  content: string;
  status: "generated" | "submitted" | "pending";
}

interface Progress {
  directoriesSubmitted: string[];
  redditPosted: string[];
  twitterThreadsGenerated: number;
  affiliateEmailsSent: number;
  lastRun: string;
  totalRuns: number;
}

function loadProgress(): Progress {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf-8"));
  }
  return {
    directoriesSubmitted: [],
    redditPosted: [],
    twitterThreadsGenerated: 0,
    affiliateEmailsSent: 0,
    lastRun: "",
    totalRuns: 0,
  };
}

function saveProgress(progress: Progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function appendLog(entry: PromotionLog) {
  fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + "\n");
}

// ─── Gemini Generator ────────────────────────────────────────────────────────

const FALLBACK_REDDIT: Record<string, string> = {
  "r/SaaS": `Title: I built a Gemini-powered AI that writes LinkedIn posts in 10 seconds — honest feedback welcome

Hey r/SaaS — I've been quietly working on ContentFlow AI for the past few months and just hit a milestone I'm happy with. Wanted to share it here for real feedback.

The core idea: founders and marketers spend way too much time writing content. I built an AI tool (powered by Google Gemini) that generates ready-to-publish LinkedIn posts, Twitter threads, newsletters and TikTok scripts in about 10 seconds.

What makes it different (at least I think so):
- There's a free interactive sandbox right on the homepage — no signup, no email, just try it
- Payments are done via Bitcoin Mainnet (verified on-chain). No Stripe, no credit card required
- 30% affiliate commission program if you refer paying users

I'm genuinely looking for feedback on the product, the pricing ($1.99/mo to $79/mo), and whether the Bitcoin checkout is a dealbreaker or a differentiator.

Live demo: https://contentflow-ai-juang26.web.app

What would make you actually pay for something like this?`,

  "r/sideproject": `Title: Side project update: AI copywriting SaaS with Bitcoin checkout — 3 months in

Built this solo over 3 months. ContentFlow AI generates viral social content using Google Gemini.

Key features:
- LinkedIn posts, X threads, cold emails in 10 seconds
- Free sandbox on homepage (no account needed)
- Bitcoin-only checkout (on-chain verification via mempool.space)
- 30% affiliate program

Still figuring out the right growth channels. Would love to hear what's working for you all.

→ https://contentflow-ai-juang26.web.app

What's the best way you've found to get first paying users?`,
};

const FALLBACK_TWITTER = `[1/7] Most people spend 3 hours writing one LinkedIn post. I spend 10 seconds.

[2/7] Writer's block costs founders and marketers thousands of hours a year. We stare at blank screens, rewrite the same sentence 12 times, and end up posting nothing. There had to be a better way.

[3/7] I built ContentFlow AI — a Gemini-powered tool that generates viral LinkedIn posts, X threads, cold emails, and TikTok scripts in under 10 seconds. No fluff. Just working copy.

[4/7] The checkout is Bitcoin Mainnet. No Stripe. No credit card. Your payment is verified on-chain via the mempool.space API. Full privacy. Zero middlemen. That was a deliberate design choice.

[5/7] No login required to try it. There's a live interactive sandbox right on the homepage. Type a topic, pick a platform, get real copy instantly. Try before you buy.

[6/7] If you refer someone who subscribes, you earn 30% recurring commission — credited automatically in your affiliate dashboard. It's how I plan to scale without an ad budget.

[7/7] If you create content, sell something, or help clients with marketing — this will save you hours every week. Try it free: https://contentflow-ai-juang26.web.app 🧵`;

const FALLBACK_AFFILIATE = `Subject: Free PRO account + 30% recurring commission — want in?

Hi,

I'm the founder of ContentFlow AI — a tool that generates viral LinkedIn posts, Twitter threads, and cold emails in under 10 seconds using Google Gemini.

I'm building my affiliate program and thought of you specifically.

Here's the deal:
• You get a free lifetime PRO account (worth $19/mo)
• You earn 30% recurring commission on every subscriber you refer
• Payouts are tracked automatically in your affiliate dashboard

Your audience trusts your recommendations. If even a fraction of them subscribe, that's real passive income every month.

Want me to send you your unique referral link?

Just reply "yes" and I'll set it up in minutes.

→ Preview the tool: https://contentflow-ai-juang26.web.app

Best,
Juan`;

const FALLBACK_HN = `Title: Show HN: ContentFlow AI – Gemini AI Copywriting SaaS with On-Chain Bitcoin Checkout

I built ContentFlow AI, a copywriting SaaS powered by Google Gemini that generates LinkedIn posts, X threads, and cold emails in ~10 seconds.

Stack:
- Next.js 15 App Router with React Server Components
- Firebase Firestore for user data and generation history
- Google Gemini API (gemini-2.0-flash) for content generation
- Bitcoin Mainnet for payments, verified on-chain via mempool.space API

The most interesting engineering challenge was the Bitcoin checkout. Instead of a payment processor, I poll mempool.space every 10 seconds to detect unconfirmed transactions to a generated address. Once detected, the subscription is activated immediately (before block confirmation), with a verification webhook that double-checks on confirmation.

There's also a zero-registration sandbox on the homepage — visitors generate real copy without an account, which drives the conversion flow.

Live: https://contentflow-ai-juang26.web.app

Happy to discuss the architecture or the Bitcoin verification logic.`;

async function generateContent(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not set");
  }
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// ─── Reddit Content Generator ────────────────────────────────────────────────

async function generateRedditPost(target: {
  subreddit: string;
  angle: string;
}): Promise<string> {
  // Use cached fallback if available (API key missing/expired)
  if (!GEMINI_API_KEY && FALLBACK_REDDIT[target.subreddit]) {
    return FALLBACK_REDDIT[target.subreddit];
  }
  if (!GEMINI_API_KEY) {
    return FALLBACK_REDDIT["r/SaaS"].replace("r/SaaS", target.subreddit);
  }

  const prompt = `You are a startup founder who built ${APP_NAME} (${APP_URL}).
Write an authentic, non-spammy Reddit post for ${target.subreddit} with the angle: "${target.angle}".

Requirements:
- Feels like a genuine community member sharing a real experience
- Includes a compelling title (max 120 chars) starting with "Title:"
- Body is 150-300 words, conversational, honest
- Mentions the free interactive sandbox (no signup) as the main value
- Drops the URL naturally at the end: ${APP_URL}
- Does NOT feel like an ad
- Ends with a genuine question to invite discussion

Format:
Title: <title here>

<body here>`;

  try {
    return await generateContent(prompt);
  } catch {
    console.warn(`  ⚠️  Gemini unavailable, using fallback content`);
    return FALLBACK_REDDIT[target.subreddit] || FALLBACK_REDDIT["r/SaaS"];
  }
}

// ─── Twitter Thread Generator ────────────────────────────────────────────────

async function generateTwitterThread(): Promise<string> {
  if (!GEMINI_API_KEY) return FALLBACK_TWITTER;

  const hook = TWITTER_HOOKS[Math.floor(Math.random() * TWITTER_HOOKS.length)];
  const prompt = `You are a SaaS indie hacker building ${APP_NAME}.
Write a viral 7-tweet thread for Twitter/X starting with this hook:
"${hook}"

Requirements:
- Tweet 1: The hook (max 280 chars)
- Tweet 2: Describe the painful problem (writer's block, time wasted)
- Tweet 3: Introduce the solution (${APP_NAME}) with a key feature
- Tweet 4: Show the Bitcoin checkout differentiator (privacy + no credit card)
- Tweet 5: Share the free sandbox demo — no signup needed
- Tweet 6: Introduce the 30% affiliate program (earn BTC)
- Tweet 7: Clear CTA with URL ${APP_URL}

Format each tweet as:
[1/7] <tweet text>
[2/7] <tweet text>
...etc

Keep each tweet under 280 characters. Make it personal, direct, punchy.`;

  try {
    return await generateContent(prompt);
  } catch {
    console.warn(`  ⚠️  Gemini unavailable, using fallback content`);
    return FALLBACK_TWITTER;
  }
}

// ─── Affiliate Email Generator ───────────────────────────────────────────────

async function generateAffiliateEmail(niche: {
  niche: string;
  platform: string;
  followers: string;
}): Promise<string> {
  if (!GEMINI_API_KEY) return FALLBACK_AFFILIATE;

  const prompt = `Write a cold outreach email to recruit a ${niche.niche} 
with ${niche.followers} followers on ${niche.platform} into the ${APP_NAME} affiliate program.

Key facts:
- They earn 30% recurring commission (paid in USD) on every subscription they refer
- They get a permanent free PRO account to test the product
- ${APP_NAME} generates LinkedIn posts, X threads, emails in 10 seconds with Gemini AI
- Private Bitcoin checkout — no credit card required
- URL: ${APP_URL}

Requirements:
- Subject line that grabs attention (prefix with "Subject:")
- Body: 120-180 words max
- Personalized to their niche/platform
- Focuses on their benefit (passive income) not ours
- One clear CTA: reply to this email or visit their unique affiliate link
- Sounds human, not corporate`;

  try {
    return await generateContent(prompt);
  } catch {
    console.warn(`  ⚠️  Gemini unavailable, using fallback content`);
    return FALLBACK_AFFILIATE;
  }
}

// ─── Hacker News Show HN ─────────────────────────────────────────────────────

async function generateHNPost(): Promise<string> {
  if (!GEMINI_API_KEY) return FALLBACK_HN;

  const prompt = `Write a Hacker News "Show HN" post for ${APP_NAME}.

Requirements:
- Title: max 80 chars, starts with "Show HN:"
- Body: 200-400 words, technical and authentic
- Explains the stack: Next.js 15 App Router, Firebase Firestore, Google Gemini AI
- Explains Bitcoin checkout: validates transactions via mempool.space API (no payment processor)
- Mentions the architectural challenge of on-chain verification
- Invites technical feedback
- URL at bottom: ${APP_URL}
- NO marketing fluff — HN audience hates it

Format:
Title: <title>

<body>`;

  try {
    return await generateContent(prompt);
  } catch {
    console.warn(`  ⚠️  Gemini unavailable, using fallback content`);
    return FALLBACK_HN;
  }
}

// ─── Directory Submission Tracker ────────────────────────────────────────────

function generateDirectoryReport(progress: Progress): string {
  const submitted = progress.directoriesSubmitted;
  const pending = AI_DIRECTORIES.filter((d) => !submitted.includes(d.name));
  const done = AI_DIRECTORIES.filter((d) => submitted.includes(d.name));

  const lines: string[] = [];
  lines.push(`\n${"═".repeat(60)}`);
  lines.push(`  📊 DIRECTORY SUBMISSION REPORT — ${APP_NAME}`);
  lines.push(`${"═".repeat(60)}`);
  lines.push(`  ✅ Submitted: ${done.length}/${AI_DIRECTORIES.length}`);
  lines.push(`  ⏳ Pending:   ${pending.length}/${AI_DIRECTORIES.length}`);
  lines.push(`  🎯 Coverage:  ${Math.round((done.length / AI_DIRECTORIES.length) * 100)}%`);
  lines.push(`${"─".repeat(60)}`);

  if (pending.length > 0) {
    lines.push(`\n  📋 NEXT 5 DIRECTORIES TO SUBMIT:`);
    pending
      .sort((a, b) => b.dr - a.dr)
      .slice(0, 5)
      .forEach((d, i) => {
        lines.push(`  ${i + 1}. ${d.name} (DR ${d.dr})`);
        lines.push(`     → ${d.url}`);
      });
  }

  return lines.join("\n");
}

// ─── Main Run ────────────────────────────────────────────────────────────────

async function run(mode: "once" | "loop" | "report") {
  const progress = loadProgress();

  console.log(`\n${"═".repeat(60)}`);
  console.log(`  🚀 ${APP_NAME} — Marketing Promoter Agent`);
  console.log(`  Run #${progress.totalRuns + 1} | ${new Date().toISOString()}`);
  console.log(`${"═".repeat(60)}\n`);

  if (mode === "report") {
    console.log(generateDirectoryReport(progress));
    console.log(`\n  📈 TOTAL STATS:`);
    console.log(`  • Twitter threads generated: ${progress.twitterThreadsGenerated}`);
    console.log(`  • Affiliate emails drafted:  ${progress.affiliateEmailsSent}`);
    console.log(`  • Reddit posts drafted:      ${progress.redditPosted.length}`);
    console.log(`  • Last run: ${progress.lastRun || "Never"}`);
    console.log(`\n${"═".repeat(60)}\n`);
    return;
  }

  const outputDir = path.join(ROOT, "marketing_output");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outputFile = path.join(outputDir, `campaign_${timestamp}.md`);
  const lines: string[] = [`# 🚀 ContentFlow AI — Marketing Campaign\n`, `**Generated**: ${new Date().toISOString()}\n`, `**App URL**: ${APP_URL}\n\n---\n`];

  // 1. Reddit post
  const unpostedReddit = REDDIT_TARGETS.filter(
    (t) => !progress.redditPosted.includes(t.subreddit)
  );
  const redditTarget = unpostedReddit.length > 0
    ? unpostedReddit[0]
    : REDDIT_TARGETS[Math.floor(Math.random() * REDDIT_TARGETS.length)];

  console.log(`  📝 Generating Reddit post for ${redditTarget.subreddit}...`);
  const redditPost = await generateRedditPost(redditTarget);
  lines.push(`## 🔴 Reddit — ${redditTarget.subreddit}\n`);
  lines.push("```\n" + redditPost + "\n```\n\n");
  appendLog({ timestamp: new Date().toISOString(), type: "reddit", target: redditTarget.subreddit, content: redditPost, status: "generated" });
  if (!progress.redditPosted.includes(redditTarget.subreddit)) {
    progress.redditPosted.push(redditTarget.subreddit);
  }
  console.log(`  ✅ Reddit post generated for ${redditTarget.subreddit}`);

  // 2. Twitter thread
  console.log(`  🐦 Generating Twitter/X thread...`);
  const twitterThread = await generateTwitterThread();
  lines.push(`## 🐦 Twitter/X Thread\n`);
  lines.push("```\n" + twitterThread + "\n```\n\n");
  appendLog({ timestamp: new Date().toISOString(), type: "twitter", target: "Twitter/X", content: twitterThread, status: "generated" });
  progress.twitterThreadsGenerated++;
  console.log(`  ✅ Twitter thread generated (#${progress.twitterThreadsGenerated})`);

  // 3. Affiliate email
  const affiliateTarget = AFFILIATE_NICHES[progress.affiliateEmailsSent % AFFILIATE_NICHES.length];
  console.log(`  📧 Generating affiliate email for ${affiliateTarget.niche}...`);
  const affiliateEmail = await generateAffiliateEmail(affiliateTarget);
  lines.push(`## 📧 Affiliate Outreach — ${affiliateTarget.niche} (${affiliateTarget.platform})\n`);
  lines.push("```\n" + affiliateEmail + "\n```\n\n");
  appendLog({ timestamp: new Date().toISOString(), type: "affiliate", target: affiliateTarget.niche, content: affiliateEmail, status: "generated" });
  progress.affiliateEmailsSent++;
  console.log(`  ✅ Affiliate email generated`);

  // 4. Hacker News post (every 3rd run)
  if (progress.totalRuns % 3 === 0) {
    console.log(`  🟠 Generating Hacker News Show HN post...`);
    const hnPost = await generateHNPost();
    lines.push(`## 🟠 Hacker News — Show HN\n`);
    lines.push("```\n" + hnPost + "\n```\n\n");
    appendLog({ timestamp: new Date().toISOString(), type: "hackernews", target: "Hacker News", content: hnPost, status: "generated" });
    console.log(`  ✅ HN post generated`);
  }

  // 5. Directory report
  lines.push(`---\n\n`);
  lines.push(`## 📊 Directory Submission Status\n`);
  lines.push(generateDirectoryReport(progress) + "\n");

  // Save output
  fs.writeFileSync(outputFile, lines.join("\n"));

  // Update progress
  progress.lastRun = new Date().toISOString();
  progress.totalRuns++;
  saveProgress(progress);

  console.log(`\n${"═".repeat(60)}`);
  console.log(`  ✅ Campaign generated successfully!`);
  console.log(`  📄 Output: marketing_output/campaign_${timestamp}.md`);
  console.log(`  📊 Total runs: ${progress.totalRuns}`);
  console.log(`  🐦 Twitter threads: ${progress.twitterThreadsGenerated}`);
  console.log(`  📧 Affiliate emails: ${progress.affiliateEmailsSent}`);
  console.log(generateDirectoryReport(progress));
  console.log(`${"═".repeat(60)}\n`);

  if (mode === "loop") {
    const INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
    console.log(`  ⏰ Next run in 6 hours. Press Ctrl+C to stop.\n`);
    setTimeout(() => run("loop"), INTERVAL_MS);
  }
}

// ─── Entry Point ─────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const mode = args.includes("--loop") ? "loop" : args.includes("--report") ? "report" : "once";

run(mode).catch((err) => {
  console.error("❌ Promoter error:", err);
  process.exit(1);
});
