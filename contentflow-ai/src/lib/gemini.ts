import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateContent(prompt: string, type: string, tone: string, language: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("API key no configurada");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const systemPrompt = `Eres un experto copywriter y creador de contenido de clase mundial.
Tu objetivo es generar contenido de alta conversión y máximo engagement.
Tipo de contenido solicitado: ${type}
Tono deseado: ${tone}
Idioma: ${language}

Reglas:
1. Responde ÚNICAMENTE con el contenido final, sin introducciones ni despedidas.
2. Usa emojis estratégicamente si el tono lo permite.
3. El contenido debe estar listo para copiar y pegar.
4. Asegúrate de que el formato sea perfecto para la plataforma de destino.`;

  const finalPrompt = `${systemPrompt}\n\nRequerimiento del usuario:\n${prompt}`;

  try {
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error("No se pudo generar el contenido. Inténtalo de nuevo.");
  }
}
