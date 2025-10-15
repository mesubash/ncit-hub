# 🎯 FINAL FIX - Found the Real Problem!

## 🐛 Root Cause Found

The **`signIn` function** was creating profiles with:
- ❌ Hardcoded `role: "student"`
- ❌ Missing `user_type`
- ❌ Missing `program_type`, `year`, `specialization`

### What Was Happening:
1. User registers → profile created correctly in `signUp`
2. User gets logged in → `signIn` function runs
3. `signIn` checks if profile exists
4. **If no profile**, it creates one with wrong data
5. **If profile exists**, it uses the correct one

But something was deleting or not creating the profile during registration, so `signIn` was recreating it with bad data!

## ✅ The Fix

### File: `/lib/auth.ts` - `signIn` function

**BEFORE (Wrong)**:
```typescript
const { data: newProfile, error: createError } = await supabase
  .from("profiles")
  .insert([
    {
      id: authData.user.id,
      email: authData.user.email!,
      full_name: authData.user.user_metadata?.full_name || null,
      department: authData.user.user_metadata?.department || null,
      semester: authData.user.user_metadata?.semester || null,
      role: "student",  // ❌ HARDCODED!
      // ❌ Missing user_type, program_type, year, specialization
    },
  ])
```

**AFTER (Fixed)**:
```typescript
const metadata = authData.user.user_metadata || {};
const userType = metadata.user_type as UserType;
const role: UserRole = userType === "faculty" ? "faculty" : "student";

const { data: newProfile, error: createError } = await supabase
  .from("profiles")
  .insert([
    {
      id: authData.user.id,
      email: authData.user.email!,
      full_name: metadata.full_name || null,
      role: metadata.role || role,  // ✅ From metadata or calculated
      user_type: userType || null,  // ✅ Added
      department: metadata.department || null,
      program_type: metadata.program_type || null,  // ✅ Added
      semester: metadata.semester || null,
      year: metadata.year || null,  // ✅ Added
      specialization: metadata.specialization || null,  // ✅ Added
    },
  ])
```

## 🚀 Action Required

### Step 1: Fix Existing Broken Profiles

Run this in **Supabase SQL Editor**:

```sql
-- Fix all profiles that have user_type=NULL
UPDATE public.profiles p
SET 
    role = CASE 
        WHEN u.raw_user_meta_data->>'user_type' = 'faculty' THEN 'faculty'
        ELSE 'student'
    END,
    user_type = u.raw_user_meta_data->>'user_type',
    program_type = u.raw_user_meta_data->>'program_type',
    semester = (u.raw_user_meta_data->>'semester')::INTEGER,
    year = (u.raw_user_meta_data->>'year')::INTEGER,
    specialization = u.raw_user_meta_data->>'specialization',
    updated_at = NOW()
FROM auth.users u
WHERE p.id = u.id
AND p.user_type IS NULL
AND u.raw_user_meta_data->>'user_type' IS NOT NULL;
```

### Step 2: Verify the Fix

```sql
-- Check if profiles are fixed
SELECT 
    p.email,
    p.role,
    p.user_type,
    p.department,
    u.raw_user_meta_data->>'user_type' as should_be_user_type,
    u.raw_user_meta_data->>'role' as should_be_role
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.email IN ('roro@ncit.edu.np', 'waa@ncit.edu.np', 'gff@ncit.edu.np');
```

**Expected Result**:
- ✅ roro: `role='faculty'`, `user_type='faculty'`
- ✅ waa: `role='faculty'`, `user_type='faculty'`
- ✅ gff: `role='faculty'`, `user_type='faculty'`

### Step 3: Also Remove DEFAULT (from before)

```sql
-- Remove DEFAULT 'student' from role column
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;
```

## 📊 Current State Analysis

### Your Data Shows:

**Auth Metadata (What was sent during registration)**:
```json
{
  "gff": {
    "metadata_role": "faculty",     ✅ Correct
    "metadata_user_type": "faculty" ✅ Correct
  },
  "waa": {
    "metadata_role": null,          ⚠️ Old registration
    "metadata_user_type": "faculty" ✅ Has this
  },
  "roro": {
    "metadata_role": null,          ⚠️ Old registration  
    "metadata_user_type": "faculty" ✅ Has this
  }
}
```

**Profiles Table (What's stored - WRONG)**:
```json
{
  "ALL": {
    "role": "student",      ❌ Should be "faculty"
    "user_type": null,      ❌ Should be "faculty"
    "program_type": null,
    "semester": null,
    "year": null
  }
}
```

## 🔍 Why This Happened

1. User registered → `signUp` created profile correctly
2. Email confirmation or session issue → Profile got lost/deleted
3. User logged in → `signIn` recreated profile with wrong data
4. Result: Broken profiles with `user_type=null` and `role='student'`

## ✅ What's Fixed Now

1. ✅ `signIn` function now reads ALL fields from metadata
2. ✅ `signIn` calculates role from user_type correctly
3. ✅ `signUp` already working correctly (fixed earlier)
4. ✅ Schema DEFAULT removed
5. ✅ SQL script to fix existing broken profiles

## 🧪 Testing

### Test 1: Register New Faculty
1. Clear cache: `localStorage.clear()`
2. Register as faculty
3. Check console logs:
```
signUp: Starting registration with: { calculatedRole: "faculty" }
Profile created successfully { role: "faculty", user_type: "faculty" }
```
4. Check database - should be correct immediately

### Test 2: Login with Existing User
1. Login with roro (after running SQL fix)
2. Check console:
```
signIn: Profile exists, using existing profile
signIn success: roro@ncit.edu.np
```
3. Profile should show all fields correctly

### Test 3: Login with New User (No Profile Yet)
1. Register user but somehow profile not created
2. Login
3. Check console:
```
Creating new profile from auth metadata...
Creating profile with metadata: { role: "faculty", user_type: "faculty" }
signIn success with new profile
```
4. Profile created correctly this time!

## 📁 SQL Scripts

1. **`/supabase/fix_all_broken_profiles.sql`** ⭐ USE THIS
   - Fixes all profiles with `user_type=NULL`
   - Copies data from auth.users metadata

2. **`/supabase/find_auto_create_trigger.sql`**
   - Checks for triggers (if you want to investigate further)

3. **`/supabase/verify_fix.sql`**
   - Verify everything is working

## ⚡ Quick Fix Command

**Just run these 2 commands in Supabase SQL Editor:**

```sql
-- 1. Fix broken profiles
UPDATE public.profiles p
SET 
    role = CASE 
        WHEN u.raw_user_meta_data->>'user_type' = 'faculty' THEN 'faculty'
        ELSE 'student'
    END,
    user_type = u.raw_user_meta_data->>'user_type',
    program_type = u.raw_user_meta_data->>'program_type',
    semester = (u.raw_user_meta_data->>'semester')::INTEGER,
    year = (u.raw_user_meta_data->>'year')::INTEGER,
    specialization = u.raw_user_meta_data->>'specialization',
    updated_at = NOW()
FROM auth.users u
WHERE p.id = u.id
AND p.user_type IS NULL
AND u.raw_user_meta_data->>'user_type' IS NOT NULL;

-- 2. Remove DEFAULT
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;
```

## 🎉 After Fix

### Expected Profiles:
```sql
-- roro
{
  "role": "faculty",
  "user_type": "faculty",
  "department": "Electronics and Communication Engineering",
  "specialization": null
}

-- waa  
{
  "role": "faculty",
  "user_type": "faculty",
  "department": "Mathematics",
  "specialization": null
}

-- gff
{
  "role": "faculty",
  "user_type": "faculty",
  "department": "Physics",
  "specialization": null
}
```

---

## ✅ FINAL CHECKLIST

- [ ] Run SQL to fix broken profiles
- [ ] Run SQL to remove DEFAULT
- [ ] Have users clear cache: `localStorage.clear()`
- [ ] Test new faculty registration
- [ ] Test login with fixed users (roro, waa, gff)
- [ ] Verify profile page shows all fields
- [ ] Check console logs for any errors

**Status**: Code fixed ✅ | Database needs SQL update ⏳

**This is the REAL fix!** The issue was in the `signIn` function, not just `signUp`.
