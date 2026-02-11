import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Test environment variables
    const envCheck = {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_KEY,
      geminiKeyPreview: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'MISSING',
    };

    return res.status(200).json({
      status: 'ok',
      message: 'API is working!',
      environment: envCheck,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Test API Error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
