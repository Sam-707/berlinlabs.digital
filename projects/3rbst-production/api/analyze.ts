import type { VercelRequest, VercelResponse } from '@vercel/node';
import { analyzeGermanDocument } from '../services/geminiService.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { image, mimeType, phoneNumber } = req.body;

    if (!image || !mimeType) {
      return res.status(400).json({ error: "Missing image or mimeType" });
    }

    // Check credits if phone number provided (web users)
    if (phoneNumber) {
      if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: "Database configuration missing" });
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      // Get user credits
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('credits')
        .eq('phone_number', phoneNumber)
        .single();

      if (fetchError) {
        console.error('Failed to fetch user:', fetchError);
        return res.status(500).json({ error: "Failed to check credits" });
      }

      if (!user || user.credits < 1) {
        return res.status(402).json({ error: "لا يوجد لديك رصيد كافٍ. يرجى شراء المزيد من التحليلات." });
      }

      // Process document with AI
      const text = await analyzeGermanDocument(image, mimeType, "Analyze this document.");

      // Deduct credit after successful analysis
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          credits: user.credits - 1,
          updated_at: new Date().toISOString()
        })
        .eq('phone_number', phoneNumber)
        .select('credits')
        .single();

      if (updateError) {
        console.error('Failed to deduct credit:', updateError);
        // Still return the analysis, but log the error
      }

      return res.status(200).json({
        text,
        creditsRemaining: updatedUser?.credits ?? (user.credits - 1)
      });
    }

    // No phone number - WhatsApp or other usage (credits handled elsewhere)
    const text = await analyzeGermanDocument(image, mimeType, "Analyze this document.");
    return res.status(200).json({ text });

  } catch (error) {
    console.error("API Analyze Error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : 'Unknown'
    });
  }
}