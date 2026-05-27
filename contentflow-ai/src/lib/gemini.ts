import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const ALLOWED_TONES = ["Profesional", "Inspirador", "Humorístico", "Directo", "Conversacional"];
const ALLOWED_LANGUAGES = ["Español", "Inglés", "Portugués", "Francés"];

export async function generateContent(
  prompt: string,
  type: string,
  tone: string,
  language: string
) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("API key no configurada");
  }

  // Validate tone and language against allowed values to prevent prompt injection
  const safeTone = ALLOWED_TONES.includes(tone) ? tone : "Profesional";
  const safeLanguage = ALLOWED_LANGUAGES.includes(language) ? language : "Español";

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.8,
    },
  });

  const systemPrompt = `Eres un experto copywriter y creador de contenido de clase mundial.
Tu objetivo es generar contenido de alta conversión y máximo engagement.
Tipo de contenido solicitado: ${type}
Tono deseado: ${safeTone}
Idioma: ${safeLanguage}

Reglas:
1. Responde ÚNICAMENTE con el contenido final, sin introducciones ni despedidas.
2. Usa emojis estratégicamente si el tono lo permite.
3. El contenido debe estar listo para copiar y pegar.
4. Asegúrate de que el formato sea perfecto para la plataforma de destino.`;

  const finalPrompt = `${systemPrompt}\n\nRequerimiento del usuario:\n${prompt}`;

  try {
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();

    if (!text?.trim()) {
      throw new Error("La IA no generó contenido. Inténtalo de nuevo.");
    }

    return text;
  } catch (error) {
    console.error("Error generating content:", error);
    // Re-throw with a user-friendly message, but preserve the original for logging
    throw new Error("No se pudo generar el contenido. Inténtalo de nuevo.");
  }
}
