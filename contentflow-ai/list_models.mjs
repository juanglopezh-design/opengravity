import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyACZ_QGAYPvQAmg0fOf18jOapy-H1DbMnI";
const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
  try {
    // We fetch using plain fetch to bypass SDK model restrictions
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log("Models:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error:", e.message);
  }
}

run();
