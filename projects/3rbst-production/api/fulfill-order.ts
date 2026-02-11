import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { sendToWhatsApp } from '../services/whatsappService.js';

// Initialize Supabase (Admin access)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Credit Logic (Server-Side Authority)
const TIER_CREDITS: Record<string, number> = {
  'starter': 5,
  'value': 15,
  'unlimited': 100 // Cap for safety
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: "Database configuration missing" });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { phoneNumber, tierId, orderId, amount } = req.body;

  if (!phoneNumber || !tierId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Calculate credits securely on the server
  const creditsToAdd = TIER_CREDITS[tierId] || 0;

  if (creditsToAdd === 0) {
     return res.status(400).json({ error: "Invalid Tier ID" });
  }

  try {
    // 1. Check if user exists, if not create them
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('credits')
      .eq('phone_number', phoneNumber)
      .single();

    let currentCredits = 0;
    
    if (fetchError || !user) {
      // Create new user if they paid directly without messaging first
      await supabase.from('users').insert([{ 
        phone_number: phoneNumber, 
        credits: 0 
      }]);
    } else {
      currentCredits = user.credits;
    }

    // 2. Add Credits
    const { error: updateError } = await supabase
      .from('users')
      .update({ credits: currentCredits + creditsToAdd })
      .eq('phone_number', phoneNumber);

    if (updateError) throw updateError;

    // 3. Log (Console logs appear in Vercel Dashboard)
    console.log(`💰 Payment Success: ${phoneNumber} bought '${tierId}'. Added ${creditsToAdd} credits.`);

    // 4. Send Confirmation to User via WhatsApp
    const newCredits = currentCredits + creditsToAdd;
    const whatsappJid = `${phoneNumber}@s.whatsapp.net`;
    const confirmationMessage = `🎉 *تم شحن رصيدك بنجاح!*\n\n*رصيدك الجديد هو: ${newCredits} وثائق*\n\nشكراً لثقتك بخدمة 3rbst. يمكنك الآن إرسال المزيد من الوثائق لتحليلها.`;
    await sendToWhatsApp(whatsappJid, confirmationMessage);

    return res.status(200).json({ success: true, newCredits: newCredits });

  } catch (error) {
    console.error("Order fulfillment failed:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}