import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client safely
// NOTE: You must add SUPABASE_URL and SUPABASE_KEY to your Vercel Environment Variables.

const getEnv = (key: string) => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseKey = getEnv('SUPABASE_KEY');

// Fail gracefully if env vars are missing (prevents build crashes, but logs error)
const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

/**
 * Checks if a user has enough credits.
 * If user does not exist, creates them and gives 1 FREE credit.
 * @returns The current number of credits.
 */
export async function checkUserBalance(phoneNumber: string): Promise<number> {
  if (!supabase) {
    console.error("Supabase not initialized");
    return 0; 
  }

  // 1. Try to fetch the user
  const { data, error } = await supabase
    .from('users')
    .select('credits')
    .eq('phone_number', phoneNumber)
    .single();

  if (error || !data) {
    // User not found? It's a NEW USER.
    console.log(`New user detected: ${phoneNumber}. Creating account with 1 free credit.`);
    
    const { error: insertError } = await supabase
      .from('users')
      .insert([{ phone_number: phoneNumber, credits: 1 }]);
    
    if (insertError) {
      console.error("Error creating new user:", insertError);
      return 0; // Fail safe
    }
    
    return 1; // They now have 1 credit
  }

  return data.credits;
}

/**
 * Deducts 1 credit from the user's balance.
 */
export async function deductCredit(phoneNumber: string): Promise<void> {
  if (!supabase) return;

  // We simply decrement by 1.
  // In a high-concurrency app we would use an RPC function, but for WhatsApp this is safe.
  const currentBalance = await checkUserBalance(phoneNumber);
  
  if (currentBalance > 0) {
    await supabase
      .from('users')
      .update({ credits: currentBalance - 1 })
      .eq('phone_number', phoneNumber);
  }
}