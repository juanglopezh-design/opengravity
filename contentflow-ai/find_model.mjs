import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyACZ_QGAYPvQAmg0fOf18jOapy-H1DbMnI";

async function run() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    const validModels = data.models.filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent"));
    
    console.log("Valid Models supporting generateContent:");
    validModels.forEach(m => console.log(m.name));
  } catch (e) {
    console.error("Error:", e.message);
  }
}

run();
