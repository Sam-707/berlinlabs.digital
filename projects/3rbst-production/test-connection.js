// Quick test script to verify your credentials work
// Run with: node test-connection.js

import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
const envPath = join(__dirname, '.env.local');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
} catch (err) {
  console.error('⚠️  Could not load .env.local file');
}

console.log('🧪 Testing 3rbst Credentials...\n');

// Test 1: Gemini API
console.log('1️⃣  Testing Gemini API...');
try {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    console.log('   ❌ GEMINI_API_KEY not found in .env.local\n');
  } else {
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: { parts: [{ text: 'Say "OK" if you can read this' }] }
    });
    const text = response.text;
    console.log(`   ✅ Gemini API working! Response: "${text.substring(0, 50)}..."\n`);
  }
} catch (error) {
  console.log(`   ❌ Gemini API failed: ${error.message}\n`);
}

// Test 2: Supabase Connection
console.log('2️⃣  Testing Supabase Connection...');
try {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('   ❌ Supabase credentials not found in .env.local\n');
  } else {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try to fetch from users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      if (error.message.includes('relation "public.users" does not exist')) {
        console.log('   ⚠️  Supabase connected, but "users" table not found');
        console.log('   📝 Action: Run setup-supabase.sql in Supabase SQL Editor\n');
      } else {
        console.log(`   ❌ Supabase error: ${error.message}\n`);
      }
    } else {
      console.log('   ✅ Supabase connected and users table exists!');
      console.log(`   📊 Found ${data ? data.length : 0} user(s) in database\n`);
    }
  }
} catch (error) {
  console.log(`   ❌ Supabase failed: ${error.message}\n`);
}

// Test 3: Check if Evolution API vars are set (optional)
console.log('3️⃣  Checking Evolution API config (optional)...');
const evolutionUrl = process.env.EVOLUTION_API_URL;
const evolutionToken = process.env.EVOLUTION_API_TOKEN;
const evolutionInstance = process.env.EVOLUTION_INSTANCE;

if (!evolutionUrl || !evolutionToken || !evolutionInstance) {
  console.log('   ⏭️  Evolution API not configured (optional for frontend-only testing)');
  console.log('   💡 Add these later for WhatsApp integration\n');
} else {
  console.log(`   ✅ Evolution API configured:`);
  console.log(`      URL: ${evolutionUrl}`);
  console.log(`      Instance: ${evolutionInstance}\n`);
}

console.log('─────────────────────────────────────');
console.log('📋 Summary:');
console.log('To deploy, you need:');
console.log('1. ✅ Gemini API working');
console.log('2. ✅ Supabase connected with users table');
console.log('3. ⏭️  Evolution API (optional, add later)');
console.log('\n🚀 Next steps: See QUICKSTART.md');
