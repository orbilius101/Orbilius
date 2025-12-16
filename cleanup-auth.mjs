// Cleanup script to remove orphaned auth.users records
// Run this with: node cleanup-auth.mjs
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function cleanupAuthUsers() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase environment variables');
    console.error(
      '   Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env'
    );
    process.exit(1);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🔍 Fetching all auth.users...');
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error('❌ Error fetching auth.users:', authError);
    process.exit(1);
  }

  console.log(`📊 Found ${authUsers.users.length} users in auth.users`);

  console.log('🔍 Fetching all users from users table...');
  const { data: dbUsers, error: dbError } = await supabase.from('users').select('id');

  if (dbError) {
    console.error('❌ Error fetching users table:', dbError);
    process.exit(1);
  }

  console.log(`📊 Found ${dbUsers.length} users in users table`);

  // Find orphaned auth users (exist in auth.users but not in users table)
  const dbUserIds = new Set(dbUsers.map((u) => u.id));
  const orphanedUsers = authUsers.users.filter((authUser) => !dbUserIds.has(authUser.id));

  if (orphanedUsers.length === 0) {
    console.log('✅ No orphaned auth users found. Database is clean!');
    process.exit(0);
  }

  console.log(`\n⚠️  Found ${orphanedUsers.length} orphaned auth users:\n`);
  orphanedUsers.forEach((user) => {
    console.log(`   - ${user.email || 'No email'} (ID: ${user.id})`);
  });

  console.log('\n🗑️  Deleting orphaned auth users...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const user of orphanedUsers) {
    try {
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) {
        console.log(`   ❌ Failed to delete ${user.email || user.id}: ${error.message}`);
        errorCount++;
      } else {
        console.log(`   ✓ Deleted ${user.email || user.id}`);
        successCount++;
      }
    } catch (err) {
      console.log(`   ❌ Failed to delete ${user.email || user.id}: ${err.message}`);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Cleanup complete!`);
  console.log(`   Successfully deleted: ${successCount}`);
  if (errorCount > 0) {
    console.log(`   Failed: ${errorCount}`);
  }
  console.log('='.repeat(50));
}

cleanupAuthUsers().catch(console.error);
