import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyACZ_QGAYPvQAmg0fOf18jOapy-H1DbMnI";
const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent("hello");
    console.log("Response:", result.response.text());
  } catch (e) {
    console.error("Error:", e.message);
  }
}

run();
