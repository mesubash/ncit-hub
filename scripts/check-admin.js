#!/usr/bin/env node

/**
 * Check Admin User Script
 * Verifies if the admin user exists and has the correct role in the database
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables
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

console.log('🔍 Checking admin user status...\n');

function makeRequest(options) {
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
          resolve({ status: res.statusCode, data: parsed });
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function checkAdmin() {
  try {
    // Check for admin user
    const response = await makeRequest({
      url: `${SUPABASE_URL}/rest/v1/profiles?email=eq.admin@ncit.edu.np&select=*`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const profile = response.data[0];
      console.log('✅ Admin user found in database!\n');
      console.log('📋 Profile Details:');
      console.log('   ID:', profile.id);
      console.log('   Email:', profile.email);
      console.log('   Name:', profile.full_name || '(not set)');
      console.log('   Role:', profile.role);
      console.log('   Department:', profile.department || '(not set)');
      console.log('   Created:', new Date(profile.created_at).toLocaleString());
      console.log('   Updated:', new Date(profile.updated_at).toLocaleString());
      
      if (profile.role === 'admin') {
        console.log('\n✅ User has ADMIN role - should have access!');
        console.log('\n💡 If you still can\'t access admin pages:');
        console.log('   1. Clear browser cache and localStorage');
        console.log('   2. Logout and login again');
        console.log('   3. Visit /debug-admin to check auth state');
      } else {
        console.log('\n❌ User role is NOT admin!');
        console.log('\n🔧 Run this SQL in Supabase Dashboard:');
        console.log(`\n   UPDATE public.profiles SET role = 'admin', department = 'Administration' WHERE email = 'admin@ncit.edu.np';\n`);
      }
    } else {
      console.log('❌ Admin user NOT found in database!');
      console.log('\n🔧 Run the create script again:');
      console.log('   node scripts/create-specific-admin.js\n');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAdmin();
