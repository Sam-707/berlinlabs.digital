#!/usr/bin/env -S node --loader ts-node/esm

/**
 * Supabase Database Introspection Script
 *
 * Prints:
 * - table/column types for menu + items tables
 * - the exact type of the allergens column
 * - 3 sample rows (redacted text fields)
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' }
});

// ANSI colors
const cyan = (x: string) => `\x1b[36m${x}\x1b[0m`;
const green = (x: string) => `\x1b[32m${x}\x1b[0m`;
const yellow = (x: string) => `\x1b[33m${x}\x1b[0m`;
const gray = (x: string) => `\x1b[90m${x}\x1b[0m`;

/**
 * Redact text values for display
 */
function redactValue(value: any): any {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') {
    if (value.length <= 10) return `'***'`;
    return `'*** (${value.length} chars)'`;
  }
  if (Array.isArray(value)) return `[array, ${value.length} items]`;
  if (typeof value === 'object') return `{json}`;
  return value;
}

/**
 * Query table schema from information_schema
 */
async function getTableSchema(tableName: string) {
  const { data, error } = await supabase
    .rpc('get_table_schema', { table_name: tableName })
    .select('*')
    .order('ordinal_position');

  if (error) {
    // Fallback: query information_schema directly
    const { data: columns, error: err } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .order('ordinal_position');

    if (err) {
      console.error(gray(`Error querying schema for ${tableName}:`), err);
      return null;
    }
    return columns;
  }

  return data;
}

/**
 * Get sample rows from a table
 */
async function getSampleRows(tableName: string, limit = 3) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(limit);

  if (error) {
    console.error(gray(`Error querying ${tableName}:`), error.message);
    return null;
  }

  // Redact sensitive text fields
  return data?.map(row => {
    const redacted: any = {};
    for (const [key, value] of Object.entries(row)) {
      redacted[key] = redactValue(value);
    }
    return redacted;
  });
}

/**
 * Main function
 */
async function main() {
  console.log(cyan('═══════════════════════════════════════════════════════════════'));
  console.log(cyan('  Supabase Database Introspection'));
  console.log(cyan('═══════════════════════════════════════════════════════════════'));
  console.log();

  // Tables to inspect
  const tables = ['restaurants', 'menu_items'];

  for (const tableName of tables) {
    console.log(yellow(`\n📋 Table: ${tableName}`));
    console.log(gray('─'.repeat(60)));

    // Get schema
    const schema = await getTableSchema(tableName);
    if (schema) {
      console.log(green('\nColumns:'));
      console.table(schema.map((col: any) => ({
        column: col.column_name,
        type: col.data_type,
        nullable: col.is_nullable,
        default: col.column_default
      })));

      // Highlight allergens column
      const allergensCol = schema.find((c: any) => c.column_name === 'allergens');
      if (allergensCol) {
        console.log(green(`\n🔍 allergens column type:`));
        console.log(`   data_type: ${allergensCol.data_type}`);
        console.log(`   is_nullable: ${allergensCol.is_nullable}`);
      }
    }

    // Get sample rows
    const samples = await getSampleRows(tableName, 3);
    if (samples && samples.length > 0) {
      console.log(green(`\n📄 Sample rows (${samples.length}):`));
      console.table(samples);
    } else {
      console.log(gray(`\n📄 No sample rows available`));
    }
  }

  // Check for the RPC function
  console.log(yellow(`\n🔧 RPC Function: upsert_menu_items`));
  console.log(gray('─'.repeat(60)));

  const { data: functions } = await supabase
    .from('information_schema.routines')
    .select('routine_name, routine_type, data_type')
    .eq('routine_schema', 'public')
    .eq('routine_name', 'upsert_menu_items');

  if (functions && functions.length > 0) {
    console.log(green('✅ Function exists:'));
    console.table(functions);
  } else {
    console.log(gray('❌ Function not found'));
  }

  console.log(cyan('\n═══════════════════════════════════════════════════════════════\n'));
}

main().catch(console.error);
