#!/usr/bin/env node

/**
 * Supabase Database Introspection Script
 *
 * Prints:
 * - table/column types for menu + items tables
 * - the exact type of the allergens column
 * - 3 sample rows (redacted text fields)
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Use the anon key for customer queries, service role for admin
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ANSI colors
const cyan = (x) => `\x1b[36m${x}\x1b[0m`;
const green = (x) => `\x1b[32m${x}\x1b[0m`;
const yellow = (x) => `\x1b[33m${x}\x1b[0m`;
const gray = (x) => `\x1b[90m${x}\x1b[0m`;
const red = (x) => `\x1b[31m${x}\x1b[0m`;

/**
 * Redact text values for display
 */
function redactValue(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') {
    if (value.length <= 10) return `'***'`;
    return `'*** (${value.length} chars)'`;
  }
  if (Array.isArray(value)) return `[array, ${value.length} items]`;
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) return `{json}`;
  return value;
}

/**
 * Get sample rows from a table
 */
async function getSampleRows(tableName, limit = 3) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(limit);

  if (error) {
    return { error: error.message };
  }

  // Redact sensitive text fields
  const redacted = data?.map(row => {
    const r = {};
    for (const [key, value] of Object.entries(row)) {
      r[key] = redactValue(value);
    }
    return r;
  });

  return { data: redacted };
}

/**
 * Main function
 */
async function main() {
  console.log(cyan('═══════════════════════════════════════════════════════════════'));
  console.log(cyan('  Supabase Database Introspection'));
  console.log(cyan('═══════════════════════════════════════════════════════════════'));
  console.log();
  console.log(gray(`URL: ${supabaseUrl}`));
  console.log();

  // Tables to inspect
  const tableNames = ['restaurants', 'menu_items'];

  for (const tableName of tableNames) {
    console.log(yellow(`\n📋 Table: ${tableName}`));
    console.log(gray('─'.repeat(60)));

    const result = await getSampleRows(tableName, 3);

    if (result.error) {
      console.log(red(`❌ Error:`), result.error);
      continue;
    }

    if (result.data && result.data.length > 0) {
      console.log(green(`\n📄 Sample rows (${result.data.length}):`));
      console.table(result.data);

      // Show column types from first row
      console.log(green(`\n🔍 Column info:`));
      const rawSample = await getSampleRows(tableName, 1);
      if (rawSample.data && rawSample.data[0]) {
        for (const [key, redactedValue] of Object.entries(rawSample.data[0])) {
          const isAllergens = key === 'allergens';
          const marker = isAllergens ? '🔍 ' : '   ';
          console.log(`${marker}${key.padEnd(20)} ${String(redactedValue).padEnd(30)}`);
        }
      }
    } else {
      console.log(gray(`\n📄 Table is empty or no accessible rows`));
    }
  }

  // Check for the RPC function
  console.log(yellow(`\n🔧 RPC Function: upsert_menu_items`));
  console.log(gray('─'.repeat(60)));

  // Try to call the function (will fail if doesn't exist)
  const { data: rpcData, error: rpcError } = await supabase.rpc('upsert_menu_items', {
    p_items: [],
    p_restaurant_id: '00000000-0000-0000-0000-000000000000'
  });

  if (rpcError) {
    if (rpcError.message.includes('No items provided')) {
      console.log(green('✅ Function EXISTS and is accessible!'));
      console.log(gray('   (Got expected validation error)'));
    } else if (rpcError.message.includes('function') && rpcError.message.includes('does not exist')) {
      console.log(red('❌ Function does not exist in database'));
      console.log(gray(`   Error: ${rpcError.message}`));
    } else {
      console.log(gray(`⚠️  Function test returned error:`), rpcError.message);
    }
  } else {
    console.log(green('✅ Function exists and executed!'));
    console.log(gray(`   Result:`), rpcData);
  }

  console.log(cyan('\n═══════════════════════════════════════════════════════════════\n'));
}

main().catch(console.error);
