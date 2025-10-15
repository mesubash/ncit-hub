#!/usr/bin/env node

/**
 * Script to create an admin user in Supabase
 * Usage: node scripts/create-admin.js email@ncit.edu.np password "Full Name"
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin(email, password, fullName) {
  console.log('\n🚀 Creating admin user...\n');

  try {
    // Step 1: Create auth user
    console.log(`📧 Creating auth user: ${email}`);
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName
      }
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError.message);
      return;
    }

    console.log('✅ Auth user created:', authData.user.id);

    // Step 2: Create/Update profile with admin role
    console.log(`\n👤 Creating admin profile...`);
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: email,
        full_name: fullName,
        role: 'admin',
        department: 'Administration',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creating profile:', profileError.message);
      return;
    }

    console.log('✅ Admin profile created');

    // Step 3: Verify the admin user
    const { data: verifyData, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying admin:', verifyError.message);
      return;
    }

    console.log('\n✅ Admin user created successfully!\n');
    console.log('📋 Admin Details:');
    console.log(`   Email: ${verifyData.email}`);
    console.log(`   Name: ${verifyData.full_name}`);
    console.log(`   Role: ${verifyData.role}`);
    console.log(`   ID: ${verifyData.id}`);
    console.log(`\n🔐 You can now login with:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 3) {
  console.log('\n📝 Usage: node scripts/create-admin.js <email> <password> <full-name>');
  console.log('\n📝 Example:');
  console.log('   node scripts/create-admin.js admin@ncit.edu.np Admin@123 "Admin User"\n');
  process.exit(1);
}

const [email, password, fullName] = args;

// Validate email
if (!email.endsWith('@ncit.edu.np')) {
  console.error('❌ Error: Email must end with @ncit.edu.np');
  process.exit(1);
}

// Validate password
if (password.length < 6) {
  console.error('❌ Error: Password must be at least 6 characters');
  process.exit(1);
}

createAdmin(email, password, fullName);
