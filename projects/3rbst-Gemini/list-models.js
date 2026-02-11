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
  console.error("❌ GEMINI_API_KEY not found");
  process.exit(1);
}

console.log("✅ API Key:", apiKey.substring(0, 10) + "...");

const ai = new GoogleGenerativeAI(apiKey);

console.log("\n🔍 Listing available models...\n");
try {
  const models = await ai.listModels();
  console.log("Available models:");
  for (const model of models) {
    console.log(`  - ${model.name} (${model.displayName})`);
    if (model.supportedGenerationMethods?.includes('generateContent')) {
      console.log(`    ✅ Supports generateContent`);
    }
  }
} catch (error) {
  console.error("❌ Error listing models:", error.message);
  console.error("Full error:", error);
}
