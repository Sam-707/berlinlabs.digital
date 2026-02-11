import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY not found in .env.local");
  process.exit(1);
}

console.log("✅ API Key loaded");

const ai = new GoogleGenerativeAI(apiKey);

// Try different model names
const modelNames = ["gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];

for (const modelName of modelNames) {
  console.log(`\n🧪 Testing model: ${modelName}...`);
  try {
    const model = ai.getGenerativeModel({
      model: modelName,
      systemInstruction: "You are a helpful assistant that responds in Arabic."
    });

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: "Say hello in Arabic" }]
      }]
    });

    const response = await result.response;
    const text = response.text();
    console.log(`✅ SUCCESS with ${modelName}!`);
    console.log("Response:", text);
    break;
  } catch (error) {
    console.error(`❌ Failed with ${modelName}:`, error.message);
  }
}
