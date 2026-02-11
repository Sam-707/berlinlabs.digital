#!/usr/bin/env node

/**
 * MenuFlows Deployment Health Check
 * Run this script to verify your deployment is working correctly
 */

import https from 'https';
import fs from 'fs';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkUrl(url) {
  return new Promise((resolve) => {
    const request = https.get(url, (response) => {
      resolve({
        status: response.statusCode,
        headers: response.headers,
        success: response.statusCode >= 200 && response.statusCode < 300
      });
    });
    
    request.on('error', (error) => {
      resolve({
        status: 0,
        error: error.message,
        success: false
      });
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      resolve({
        status: 0,
        error: 'Timeout',
        success: false
      });
    });
  });
}

async function checkDeployment() {
  log(`${colors.bold}🚀 MenuFlows Deployment Health Check${colors.reset}\n`);
  
  // Check if build files exist
  log('📦 Checking build files...');
  const buildExists = fs.existsSync('./dist/index.html');
  if (buildExists) {
    log('✅ Build files found', colors.green);
  } else {
    log('❌ Build files missing - run "npm run build"', colors.red);
    return;
  }
  
  // Check environment variables
  log('\n🔧 Checking environment configuration...');
  const envExists = fs.existsSync('./.env.local');
  if (envExists) {
    const envContent = fs.readFileSync('./.env.local', 'utf8');
    const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL=');
    const hasSupabaseKey = envContent.includes('VITE_SUPABASE_ANON_KEY=');
    
    if (hasSupabaseUrl && hasSupabaseKey) {
      log('✅ Environment variables configured', colors.green);
    } else {
      log('⚠️  Environment variables incomplete', colors.yellow);
    }
  } else {
    log('⚠️  .env.local file not found', colors.yellow);
  }
  
  // Check package.json
  log('\n📋 Checking package configuration...');
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const hasReactDeps = packageJson.dependencies.react && packageJson.dependencies['@supabase/supabase-js'];
  if (hasReactDeps) {
    log('✅ Dependencies look good', colors.green);
  } else {
    log('❌ Missing required dependencies', colors.red);
  }
  
  // Check Vercel configuration
  log('\n⚡ Checking Vercel configuration...');
  const vercelConfigExists = fs.existsSync('./vercel.json');
  if (vercelConfigExists) {
    const vercelConfig = JSON.parse(fs.readFileSync('./vercel.json', 'utf8'));
    if (vercelConfig.rewrites && vercelConfig.buildCommand) {
      log('✅ Vercel configuration looks good', colors.green);
    } else {
      log('⚠️  Vercel configuration incomplete', colors.yellow);
    }
  } else {
    log('❌ vercel.json not found', colors.red);
  }
  
  log(`\n${colors.bold}📋 Deployment Checklist:${colors.reset}`);
  log('1. ✅ Code pushed to GitHub');
  log('2. ⚡ Connect repository to Vercel');
  log('3. 🔧 Set environment variables in Vercel dashboard:');
  log('   - VITE_SUPABASE_URL');
  log('   - VITE_SUPABASE_ANON_KEY');
  log('4. 🚀 Deploy!');
  
  log(`\n${colors.bold}🔗 Useful Links:${colors.reset}`);
  log(`${colors.blue}• Vercel Dashboard: https://vercel.com/dashboard${colors.reset}`);
  log(`${colors.blue}• GitHub Repository: https://github.com/Sam-707/menuflows${colors.reset}`);
  log(`${colors.blue}• Supabase Dashboard: https://supabase.com/dashboard${colors.reset}`);
  
  log(`\n${colors.bold}🆘 Need Help?${colors.reset}`);
  log('Check the DEPLOYMENT-GUIDE.md for detailed instructions');
  log('Or review the troubleshooting section in DOCS/TROUBLESHOOTING.md');
}

checkDeployment().catch(console.error);