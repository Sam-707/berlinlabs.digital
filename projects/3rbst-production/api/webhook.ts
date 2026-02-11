import type { VercelRequest, VercelResponse } from '@vercel/node';
import { analyzeGermanDocument } from '../services/geminiService.js';
import { checkUserBalance, deductCredit } from '../services/supabase.js';
import { sendToWhatsApp } from '../services/whatsappService.js';

// --- EVOLUTION API + SUPABASE CONFIG ---
// 1. Deploy to Vercel.
// 2. Add these Env Vars in Vercel:
//    - GEMINI_API_KEY
//    - EVOLUTION_API_URL (e.g., https://wa.your-vps.com)
//    - EVOLUTION_API_TOKEN (Global API Key)
//    - EVOLUTION_INSTANCE (Instance Name)
//    - SUPABASE_URL
//    - SUPABASE_KEY
// 3. In Evolution API -> Webhooks: Enable "MESSAGES_UPSERT" and "INCLUDE_BASE64".

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Evolution sends POST requests
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const body = req.body;

    // 1. Filter: Only accept incoming messages (ignore status updates)
    if (body.event !== 'messages.upsert') {
      return res.status(200).send('Event ignored');
    }

    const messageData = body.data;
    const key = messageData.key;
    const remoteJid = key.remoteJid; 
    
    // Ignore my own messages (infinite loop prevention)
    if (key.fromMe) {
      return res.status(200).send('Ignored self');
    }

    // Extract simple phone number for Database (remove @s.whatsapp.net)
    const phoneNumber = remoteJid.split('@')[0];

    // 2. Extract Message Content
    let userText = "";
    let base64Image = null;
    let mimeType = null;
    const messageContent = messageData.message;

    if (!messageContent) return res.status(200).send('No content');

    // Handle Text
    if (messageContent.conversation) userText = messageContent.conversation;
    else if (messageContent.extendedTextMessage) userText = messageContent.extendedTextMessage.text;
    else if (messageContent.imageMessage) userText = messageContent.imageMessage.caption || "";

    // Handle Image
    if (messageContent.imageMessage) {
       mimeType = messageContent.imageMessage.mimetype || "image/jpeg";
       // Evolution V2: Base64 is often in the root data object if enabled in global webhook settings
       if (body.data.base64) {
         base64Image = body.data.base64;
       } else if (messageContent.imageMessage.jpegThumbnail) {
         // Fallback to thumbnail if full image missing
         base64Image = messageContent.imageMessage.jpegThumbnail;
         userText += " [Note: using thumbnail]"; 
       }
    }

    // 3. LOGIC CONTROLLER
    
    // CASE A: User sent just text (e.g., "Hello")
    if (!base64Image) {
       // We do NOT deduct credits for chatting.
       const balance = await checkUserBalance(phoneNumber);
       await sendToWhatsApp(remoteJid, `👋 *مرحباً بك في 3rbst*\n\nأنا جاهز لمساعدتك في فهم الوثائق الألمانية.\n\n📸 *أرسل صورة الوثيقة الآن* (رسالة، فاتورة، عقد) وسأشرحها لك فوراً.\n\n💰 *رصيدك الحالي:* ${balance} وثائق.`);
       return res.status(200).send('Greeting sent');
    }

    // CASE B: User sent an Image -> CHECK CREDITS
    const balance = await checkUserBalance(phoneNumber);

    if (balance <= 0) {
      // 🛑 BLOCK: No credits left
      await sendToWhatsApp(remoteJid, "🛑 *عذراً، لقد انتهى رصيدك المجاني.*\n\nللاستمرار في تحليل الوثائق بدقة وضمان حقوقك، يرجى شحن رصيدك عبر الرابط أدناه:\n\n👉 https://3rbst.com/#pricing");
      return res.status(200).send('Insufficient credits');
    }

    // ✅ PROCEED: Has credits
    // Send "Thinking..." indicator
    await sendToWhatsApp(remoteJid, "⏳ *جاري تحليل الوثيقة...* \nلحظات وسيكون الشرح جاهزاً.");

    // Note: Image anonymization temporarily disabled for Vercel serverless compatibility
    // TODO: Re-enable with vercel-friendly image processing

    // Call Gemini
    const aiResponse = await analyzeGermanDocument(base64Image, mimeType, userText);

    // Deduct Credit
    await deductCredit(phoneNumber);
    const newBalance = balance - 1;

    // Send Result
    const footer = `\n\n──────────\n✅ *تم التحليل* | المتبقي: ${newBalance}`;
    await sendToWhatsApp(remoteJid, aiResponse + footer);

    return res.status(200).json({ status: 'success' });

  } catch (error) {
    console.error('Webhook Error:', error);
    return res.status(500).send('Internal Server Error');
  }
}