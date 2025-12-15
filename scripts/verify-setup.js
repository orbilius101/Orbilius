#!/usr/bin/env node

/**
 * Supabase Setup Verification Script
 * Checks if all required components are properly configured
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile() {
  log('\n📝 Checking environment configuration...', 'cyan');

  const envPath = path.join(process.cwd(), '.env');

  if (!fs.existsSync(envPath)) {
    log('✗ .env file not found', 'red');
    log('  Run: npm run setup:env', 'yellow');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasUrl =
    envContent.includes('VITE_SUPABASE_URL=') && !envContent.includes('VITE_SUPABASE_URL=your-');
  const hasKey =
    envContent.includes('VITE_SUPABASE_ANON_KEY=') &&
    !envContent.includes('VITE_SUPABASE_ANON_KEY=your-');

  if (hasUrl && hasKey) {
    log('✓ .env file configured correctly', 'green');
    return true;
  } else {
    log('✗ .env file exists but incomplete', 'red');
    if (!hasUrl) log('  Missing: VITE_SUPABASE_URL', 'yellow');
    if (!hasKey) log('  Missing: VITE_SUPABASE_ANON_KEY', 'yellow');
    return false;
  }
}

function checkSQLFiles() {
  log('\n🗄️  Checking SQL setup files...', 'cyan');

  const requiredFiles = [
    'sql/complete_schema.sql',
    'sql/fix_storage_policies.sql',
    'sql/setup_step_comments.sql',
    'sql/add_teacher_comments.sql',
  ];

  let allExist = true;

  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      log(`✓ ${file}`, 'green');
    } else {
      log(`✗ ${file} not found`, 'red');
      allExist = false;
    }
  }

  return allExist;
}

function checkDependencies() {
  log('\n📦 Checking dependencies...', 'cyan');

  const packagePath = path.join(process.cwd(), 'package.json');

  if (!fs.existsSync(packagePath)) {
    log('✗ package.json not found', 'red');
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  const required = ['@supabase/supabase-js', 'react', 'react-dom', 'react-router-dom'];

  let allInstalled = true;

  for (const dep of required) {
    if (deps[dep]) {
      log(`✓ ${dep}`, 'green');
    } else {
      log(`✗ ${dep} not found`, 'red');
      allInstalled = false;
    }
  }

  // Check if node_modules exists
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    log('\n✗ node_modules not found', 'red');
    log('  Run: npm install', 'yellow');
    allInstalled = false;
  } else {
    log('✓ node_modules exists', 'green');
  }

  return allInstalled;
}

function printSetupChecklist() {
  log('\n' + '='.repeat(60), 'bright');
  log('📋 Supabase Setup Checklist', 'bright');
  log('='.repeat(60), 'bright');

  log('\nIn your Supabase Dashboard, verify:', 'cyan');

  log('\n1️⃣  Database Tables (SQL Editor):', 'yellow');
  log('   □ users', 'cyan');
  log('   □ projects', 'cyan');
  log('   □ project_steps', 'cyan');
  log('   □ submissions', 'cyan');
  log('   □ step_comments', 'cyan');
  log('   □ admin_code', 'cyan');

  log('\n2️⃣  Storage Buckets (Storage):', 'yellow');
  log('   □ student-submissions (Private)', 'cyan');
  log('   □ resources (Public)', 'cyan');

  log('\n3️⃣  Authentication (Authentication → Users):', 'yellow');
  log('   □ At least one admin user created', 'cyan');
  log("   □ Admin user added to users table with user_type='admin'", 'cyan');

  log('\n4️⃣  Row Level Security (Database → Policies):', 'yellow');
  log('   □ RLS enabled on all tables', 'cyan');
  log('   □ Policies created for each table', 'cyan');

  log('\n5️⃣  Admin Code (SQL Editor):', 'yellow');
  log('   □ Initial admin code inserted in admin_code table', 'cyan');

  log('\n' + '='.repeat(60), 'bright');
}

function printNextSteps() {
  log('\n' + '='.repeat(60), 'bright');
  log('🚀 Next Steps', 'bright');
  log('='.repeat(60), 'bright');

  log('\n1. If environment not configured:', 'yellow');
  log('   npm run setup:env', 'cyan');

  log('\n2. If database not set up:', 'yellow');
  log('   - Open Supabase Dashboard → SQL Editor', 'cyan');
  log('   - Copy contents of sql/complete_schema.sql', 'cyan');
  log('   - Paste and run in SQL Editor', 'cyan');

  log('\n3. Set up storage buckets:', 'yellow');
  log('   - Go to Storage in Dashboard', 'cyan');
  log('   - Create "student-submissions" (Private)', 'cyan');
  log('   - Create "resources" (Public)', 'cyan');
  log('   - Run sql/fix_storage_policies.sql', 'cyan');

  log('\n4. Create admin user:', 'yellow');
  log('   - Go to Authentication → Users', 'cyan');
  log('   - Create new user with email/password', 'cyan');
  log("   - Add to users table with user_type='admin'", 'cyan');

  log('\n5. Start development:', 'yellow');
  log('   npm run dev', 'cyan');

  log('\n' + '='.repeat(60), 'bright');
}

function main() {
  log('\n' + '='.repeat(60), 'bright');
  log('🔍 Orbilius Supabase Setup Verification', 'bright');
  log('='.repeat(60) + '\n', 'bright');

  const checks = [checkEnvFile(), checkSQLFiles(), checkDependencies()];

  const allPassed = checks.every((check) => check === true);

  printSetupChecklist();

  if (allPassed) {
    log('\n✨ Local setup looks good!', 'green');
    log('Make sure to complete the Supabase Dashboard checklist above.', 'cyan');
  } else {
    log('\n⚠️  Some issues found. Please fix them and run verification again.', 'yellow');
    printNextSteps();
  }

  log('\n' + '='.repeat(60), 'bright');
}

main();
