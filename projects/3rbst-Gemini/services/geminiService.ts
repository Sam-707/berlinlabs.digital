import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * The Brain of 3rbst.
 * Handles both Image Analysis (Documents) and Text Chat (Greetings/Questions).
 */
export const analyzeGermanDocument = async (
  base64Image: string | null,
  mimeType: string | null,
  textInput: string = ""
): Promise<string> => {

  // Initialize Gemini client at runtime (not module load time)
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("Gemini API Key missing");
    return "عذراً، حدث خطأ في الاتصال بالخادم. (Missing API Key)";
  }

  const ai = new GoogleGenerativeAI(apiKey);

  // Using 2.5 Flash (supports vision/images, available with current API key)
  const modelId = "gemini-2.5-flash";

  const systemInstruction = `
    You are '3rbst', a smart and friendly AI assistant on WhatsApp for Arabic speakers in Germany.
    
    YOUR ROLES:
    1. If the user says "Hello" or asks a general question: Be a friendly customer support agent. Explain that you can analyze German documents if they send a picture.
    2. If the user sends an IMAGE: You are an Expert Document Analyst. Explain the document.

    GUIDELINES:
    - Response MUST be in Arabic.
    - Format for WhatsApp: Use *Bold*, _Italics_, and Emojis.
    - Be concise. WhatsApp users do not like long essays.
    
    DOCUMENT ANALYSIS STRUCTURE (Only if image is provided):
    - 📄 Summary: One line summary.
    - ⚠️ Action: What do they need to do?
    - 📅 Date/Deadlines: When?
    - 💶 Money: How much?
  `;

  // Determine the user's intent based on input
  let userPrompt = textInput;
  if (base64Image) {
      userPrompt = `Analyze this German document image. Context: ${textInput || "Please explain this document."}`;
  } else if (!userPrompt) {
      userPrompt = "Hello"; // Default greeting if empty
  }

  const parts: any[] = [];
  
  // Add Image Part if exists
  if (base64Image && mimeType) {
    parts.push({
        inlineData: {
            mimeType: mimeType,
            data: base64Image,
        },
    });
  }

  // Add Text Part
  parts.push({ text: userPrompt });

  try {
    const model = ai.getGenerativeModel({
      model: modelId,
      systemInstruction: systemInstruction
    });

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: parts
      }]
    });

    const response = await result.response;
    const text = response.text();
    if (!text) throw new Error("No response from AI");

    return text;

  } catch (error) {
    console.error("Gemini Error", error);
    return "عذراً، حدث خطأ تقني بسيط. هل يمكنك المحاولة مرة أخرى؟ 🙏";
  }
};