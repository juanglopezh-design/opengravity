import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const ALLOWED_TONES = ["Profesional", "Inspirador", "Humorístico", "Directo", "Conversacional"];
const ALLOWED_LANGUAGES = ["Español", "Inglés", "Portugués", "Francés"];
const ALLOWED_TYPES = [
  "Post de LinkedIn (Profesional)",
  "Hilo de Twitter/X (Enganchador)",
  "Caption de Instagram (Lifestyle)",
  "Email de Ventas (Conversión)",
  "Newsletter (Informativo)",
  "Idea para Video de YouTube/TikTok",
];

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
  const safeType = ALLOWED_TYPES.includes(type) ? type : "Contenido general";

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.8,
    },
  });

  const systemPrompt = `Eres un experto copywriter y creador de contenido de clase mundial.
Tu objetivo es generar contenido de alta conversión y máximo engagement.
Tipo de contenido solicitado: ${safeType}
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

export async function repurposeContent(prompt: string, language: string = "Español") {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("API key no configurada");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      maxOutputTokens: 3000,
      temperature: 0.7,
      responseMimeType: "application/json",
    },
  });

  const systemPrompt = `Eres un estratega de contenido omnichannel. Transforma la idea/texto del usuario en un paquete completo de 4 contenidos optimizados para diferentes plataformas.
Idioma: ${language}

Debes responder en formato JSON estricto con las siguientes claves:
{
  "linkedin": "Post profesional de LinkedIn con hooks, emojis y estructura clara.",
  "twitter": "Hilo de Twitter/X (3 a 5 tweets separados por 🧵).",
  "tiktok": "Guión de video corto (TikTok/Shorts) con [Hook], [Visual] y [Voz en off].",
  "email": "Asunto y cuerpo de email newsletter de alta conversión."
}`;

  try {
    const result = await model.generateContent(`${systemPrompt}\n\nIdea del usuario:\n${prompt}`);
    const response = await result.response;
    const jsonText = response.text();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error repurposing content:", error);
    throw new Error("No se pudo reprocesar el contenido.");
  }
}

