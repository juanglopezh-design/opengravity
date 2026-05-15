import { NextResponse } from "next/server";
import { generateContent } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { prompt, type, tone, language, userId } = await req.json();

    if (!prompt || !type || !userId) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos" },
        { status: 400 }
      );
    }

    // Generate content using Gemini
    const generatedText = await generateContent(
      prompt,
      type,
      tone || "Profesional",
      language || "Español"
    );

    return NextResponse.json({ content: generatedText });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";
    console.error("API Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
