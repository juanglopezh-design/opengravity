/** URLs y constantes compartidas (cliente + servidor). */
const DEFAULT_RENDER_URL = "https://contentflow-ai-9wy7.onrender.com";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || DEFAULT_RENDER_URL;

/** Backend API (Render). En Firebase Hosting debe apuntar a Render. */
export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || siteUrl;

export const btcWalletAddress =
  process.env.NEXT_PUBLIC_BTC_WALLET_ADDRESS ||
  process.env.BTC_WALLET_ADDRESS ||
  "bc1qazfthj3utl4m6hc536p0s32q2qteq9aueflj32";

export const planPricesUsd: Record<string, number> = {
  basic: 1.99,
  starter: 9,
  pro: 29,
  business: 79,
};

export const planGenerationLimits: Record<string, number> = {
  basic: 10,
  starter: 100,
  pro: 999999,
  business: 999999,
};

export function getAllowedOrigins(): string[] {
  const defaults = [
    siteUrl,
    apiBaseUrl,
    "http://localhost:3000",
    "https://contentflow-ai-juang26.web.app",
    "https://contentflow-ai-juang26.firebaseapp.com",
    "https://contentflow-ai-ex6w.onrender.com",
    "https://contentflow-ai.onrender.com",
  ];
  const fromEnv = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  return [...new Set([...defaults, ...fromEnv])];
}

export function isUnlimitedPlan(plan?: string) {
  return plan === "pro" || plan === "business";
}
