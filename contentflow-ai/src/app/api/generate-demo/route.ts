import { NextResponse } from "next/server";
import { generateContent } from "@/lib/gemini";
import { checkIpRateLimit } from "@/lib/rate-limit";

const MAX_DEMO_PROMPT_LENGTH = 150; // Keep demo prompts short

const TYPE_MAP: Record<string, string> = {
  linkedin: "Post de LinkedIn (Profesional)",
  twitter: "Hilo de Twitter/X (Enganchador)",
  instagram: "Caption de Instagram (Lifestyle)",
  email: "Email de Ventas (Conversión)",
  newsletter: "Newsletter (Informativo)",
  youtube: "Idea para Video de YouTube/TikTok",
};

const TONE_MAP: Record<string, string> = {
  professional: "Profesional",
  inspiring: "Inspirador",
  humorous: "Humorístico",
  direct: "Directo",
  conversational: "Conversacional",
};

const LANG_MAP: Record<string, string> = {
  es: "Español",
  en: "Inglés",
  pt: "Portugués",
  fr: "Francés",
};

export async function POST(req: Request) {
  try {
    // Get client IP
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    // Check rate limit
    const limitResult = checkIpRateLimit(ip);
    if (!limitResult.allowed) {
      const retryAfterSec = Math.ceil(limitResult.retryAfterMs / 1000);
      return NextResponse.json(
        { error: "demo_limit_reached", retryAfter: retryAfterSec },
        { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
      );
    }

    const { prompt, type, tone, language } = await req.json();

    if (!prompt?.trim() || !type) {
      return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 });
    }

    if (prompt.trim().length > MAX_DEMO_PROMPT_LENGTH) {
      return NextResponse.json(
        { error: `El prompt es demasiado largo. Máximo ${MAX_DEMO_PROMPT_LENGTH} caracteres.` },
        { status: 400 }
      );
    }

    // Resolve human-readable values for the internal generator
    const safeType = TYPE_MAP[type] || type;
    const safeTone = TONE_MAP[tone] || "Profesional";
    const safeLanguage = LANG_MAP[language] || "Español";

    // Generate via Gemini
    const text = await generateContent(prompt, safeType, safeTone, safeLanguage);

    return NextResponse.json({
      content: text,
      remaining: limitResult.remaining,
    });
  } catch (error: any) {
    console.error("Demo generation error:", error);
    const message = error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
