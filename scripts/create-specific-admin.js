#!/usr/bin/env node

/**
 * Create Admin User Script
 * Usage: node scripts/create-specific-admin.js
 * 
 * Creates admin user with:
 * - Email: admin@ncit.edu.np
 * - Password: mypassword
 * - Role: admin
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

// User details
const ADMIN_EMAIL = 'admin@ncit.edu.np';
const ADMIN_PASSWORD = 'mypassword';
const ADMIN_NAME = 'Admin User';

console.log('🚀 Creating admin user...');
console.log('Email:', ADMIN_EMAIL);
console.log('Password:', ADMIN_PASSWORD);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Error: Missing Supabase environment variables');
  console.error('Please check your .env.local file');
  process.exit(1);
}

// Helper function to make HTTPS requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(options.url);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = https.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${parsed.message || body}`));
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function createAdmin() {
  try {
    // Step 1: Sign up the user using anon key
    console.log('\n📝 Step 1: Creating auth user...');
    
    const signUpResponse = await makeRequest({
      url: `${SUPABASE_URL}/auth/v1/signup`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    }, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      options: {
        data: {
          full_name: ADMIN_NAME
        }
      }
    });

    const userId = signUpResponse.user?.id;
    
    if (!userId) {
      throw new Error('Failed to create user - no user ID returned');
    }

    console.log('✅ Auth user created with ID:', userId);

    // Step 2: Update the profile to admin role using service role key
    console.log('\n🔧 Step 2: Updating profile to admin role...');
    
    if (SUPABASE_SERVICE_ROLE_KEY) {
      await makeRequest({
        url: `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Prefer': 'return=representation'
        }
      }, {
        role: 'admin',
        department: 'Administration',
        full_name: ADMIN_NAME
      });

      console.log('✅ Profile updated to admin role');
    } else {
      console.log('⚠️  No service role key found');
      console.log('📋 Please run this SQL in Supabase Dashboard > SQL Editor:');
      console.log(`\nUPDATE public.profiles SET role = 'admin', department = 'Administration' WHERE id = '${userId}';\n`);
    }

    console.log('\n🎉 Admin user created successfully!');
    console.log('\n📧 Login credentials:');
    console.log('   Email:', ADMIN_EMAIL);
    console.log('   Password:', ADMIN_PASSWORD);
    console.log('\n🔗 Login at: http://localhost:3001/login\n');

  } catch (error) {
    if (error.message.includes('User already registered')) {
      console.log('\n⚠️  User already exists!');
      console.log('\n📋 To make this user an admin, run this SQL in Supabase Dashboard:');
      console.log(`\nUPDATE public.profiles SET role = 'admin', department = 'Administration' WHERE email = '${ADMIN_EMAIL}';\n`);
    } else {
      console.error('\n❌ Error:', error.message);
    }
    process.exit(1);
  }
}

createAdmin();
