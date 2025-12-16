#!/usr/bin/env node

/**
 * Orbilius Supabase Setup Script
 *
 * This script automates the setup of a new Supabase project for Orbilius.
 * It will guide you through each step and can run all setup tasks.
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${prompt}${colors.reset}`, (answer) => {
      resolve(answer);
    });
  });
}

function execCommand(command, options = {}) {
  try {
    return execSync(command, {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options,
    });
  } catch (error) {
    if (!options.ignoreError) {
      throw error;
    }
    return null;
  }
}

async function checkSupabaseCLI() {
  log('\n📦 Checking for Supabase CLI...', 'blue');

  try {
    execCommand('supabase --version', { silent: true });
    log('✓ Supabase CLI is installed', 'green');
    return true;
  } catch {
    log('✗ Supabase CLI not found', 'yellow');

    const install = await question('Would you like to install Supabase CLI? (y/n): ');
    if (install.toLowerCase() === 'y') {
      log('\nInstalling Supabase CLI...', 'blue');

      if (process.platform === 'darwin') {
        execCommand('brew install supabase/tap/supabase');
      } else if (process.platform === 'linux') {
        execCommand('curl -fsSL https://cli.supabase.com/install.sh | sh');
      } else {
        log('Please install Supabase CLI manually: https://supabase.com/docs/guides/cli', 'yellow');
        return false;
      }

      log('✓ Supabase CLI installed', 'green');
      return true;
    }
    return false;
  }
}

async function createEnvFile() {
  log('\n📝 Setting up environment variables...', 'blue');

  const envPath = path.join(process.cwd(), '.env');

  if (fs.existsSync(envPath)) {
    log('⚠️  .env file already exists', 'yellow');
    const overwrite = await question('Overwrite existing .env file? (y/n): ');
    if (overwrite.toLowerCase() !== 'y') {
      log('Skipping .env creation', 'yellow');
      return;
    }
  }

  log('\nYou can find these values in your Supabase Dashboard:', 'cyan');
  log('Project Settings → API\n', 'cyan');

  const url = await question('Enter your Supabase URL (https://xxxxx.supabase.co): ');
  const key = await question('Enter your Supabase anon key (eyJ...): ');

  const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=${url}
VITE_SUPABASE_ANON_KEY=${key}
`;

  fs.writeFileSync(envPath, envContent);
  log('✓ .env file created successfully', 'green');
}

async function setupDatabase() {
  log('\n🗄️  Setting up database schema...', 'blue');

  const schemaPath = path.join(process.cwd(), 'sql', 'complete_schema.sql');

  if (!fs.existsSync(schemaPath)) {
    log('✗ Schema file not found: sql/complete_schema.sql', 'red');
    return;
  }

  log('\nOptions for running database setup:', 'cyan');
  log('1. Manual - Copy SQL and paste in Supabase Dashboard', 'cyan');
  log('2. Automated - Use Supabase CLI (requires login)', 'cyan');

  const choice = await question('\nChoose option (1 or 2): ');

  if (choice === '1') {
    log('\n📋 Manual Setup Instructions:', 'yellow');
    log('1. Go to your Supabase Dashboard', 'yellow');
    log('2. Navigate to SQL Editor', 'yellow');
    log('3. Click "New query"', 'yellow');
    log(`4. Copy the contents of: ${schemaPath}`, 'yellow');
    log('5. Paste into the SQL editor', 'yellow');
    log('6. Click "Run"\n', 'yellow');

    await question('Press Enter when done...');
    log('✓ Database setup completed manually', 'green');
  } else if (choice === '2') {
    const hasCLI = await checkSupabaseCLI();
    if (!hasCLI) {
      log('Cannot proceed without Supabase CLI. Use manual option instead.', 'red');
      return;
    }

    log('\nYou need to link to your Supabase project first.', 'cyan');
    log('Run: supabase link --project-ref your-project-ref', 'cyan');

    const projectRef = await question('Enter your project ref: ');

    try {
      execCommand(`supabase link --project-ref ${projectRef}`);
      execCommand(`supabase db push`);
      log('✓ Database schema applied successfully', 'green');
    } catch (error) {
      log('✗ Failed to apply schema. Try manual option.', 'red');
    }
  }
}

async function setupStorage() {
  log('\n🗂️  Setting up storage buckets...', 'blue');

  log('\nManual Setup Instructions:', 'yellow');
  log('1. Go to your Supabase Dashboard → Storage', 'yellow');
  log('2. Click "Create bucket"', 'yellow');
  log('3. Create bucket: "student-submissions" (Private)', 'yellow');
  log('4. Create bucket: "resources" (Public)', 'yellow');
  log('5. Go to SQL Editor and run: sql/fix_storage_policies.sql\n', 'yellow');

  await question('Press Enter when done...');
  log('✓ Storage buckets setup completed', 'green');
}

async function setupAdmin() {
  log('\n👤 Setting up admin user...', 'blue');

  log('\nManual Setup Instructions:', 'yellow');
  log('1. Go to Supabase Dashboard → Authentication → Users', 'yellow');
  log('2. Click "Add user" → "Create new user"', 'yellow');
  log('3. Enter email and password', 'yellow');
  log('4. Check "Auto Confirm User"', 'yellow');
  log('5. Click "Create user"', 'yellow');
  log('6. Copy the user ID', 'yellow');
  log('7. Go to SQL Editor and run:', 'yellow');
  log('\n   INSERT INTO users (id, email, first_name, last_name, user_type)', 'cyan');
  log("   VALUES ('USER_ID', 'email@example.com', 'Admin', 'User', 'admin');\n", 'cyan');

  await question('Press Enter when done...');
  log('✓ Admin user setup completed', 'green');
}

async function verifySetup() {
  log('\n✅ Verifying setup...', 'blue');

  // Check .env file
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    log('✓ .env file exists', 'green');
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('VITE_SUPABASE_URL') && envContent.includes('VITE_SUPABASE_ANON_KEY')) {
      log('✓ Environment variables configured', 'green');
    } else {
      log('✗ .env file incomplete', 'red');
    }
  } else {
    log('✗ .env file missing', 'red');
  }

  // Check SQL files
  const sqlFiles = ['complete_schema.sql', 'fix_storage_policies.sql'];
  for (const file of sqlFiles) {
    const filePath = path.join(process.cwd(), 'sql', file);
    if (fs.existsSync(filePath)) {
      log(`✓ ${file} exists`, 'green');
    } else {
      log(`✗ ${file} missing`, 'red');
    }
  }

  log('\n✨ Setup verification complete!', 'bright');
  log('\nNext steps:', 'cyan');
  log('1. Make sure all database tables are created', 'cyan');
  log('2. Verify storage buckets exist', 'cyan');
  log('3. Confirm admin user is set up', 'cyan');
  log('4. Run: npm run dev', 'cyan');
}

async function main() {
  log('\n' + '='.repeat(60), 'bright');
  log('🚀 Orbilius Supabase Setup Wizard', 'bright');
  log('='.repeat(60) + '\n', 'bright');

  log('This wizard will help you set up a new Supabase project for Orbilius.', 'cyan');
  log('You can run all steps or select individual steps.\n', 'cyan');

  const steps = [
    { name: 'Create .env file', fn: createEnvFile },
    { name: 'Set up database schema', fn: setupDatabase },
    { name: 'Set up storage buckets', fn: setupStorage },
    { name: 'Set up admin user', fn: setupAdmin },
    { name: 'Verify setup', fn: verifySetup },
  ];

  log('Available steps:', 'cyan');
  steps.forEach((step, i) => {
    log(`${i + 1}. ${step.name}`, 'cyan');
  });
  log('0. Run all steps\n', 'cyan');

  const choice = await question('Choose a step (0-5): ');
  const stepNum = parseInt(choice);

  if (stepNum === 0) {
    for (const step of steps) {
      await step.fn();
    }
  } else if (stepNum >= 1 && stepNum <= steps.length) {
    await steps[stepNum - 1].fn();
  } else {
    log('Invalid choice. Please run the script again.', 'red');
  }

  log('\n' + '='.repeat(60), 'bright');
  log('✨ Setup wizard complete!', 'green');
  log('='.repeat(60) + '\n', 'bright');

  rl.close();
}

// Handle cleanup
rl.on('close', () => {
  process.exit(0);
});

// Run the script
main().catch((error) => {
  log(`\n✗ Error: ${error.message}`, 'red');
  rl.close();
  process.exit(1);
});
