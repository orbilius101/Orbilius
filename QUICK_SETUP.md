# 🚀 Quick Supabase Setup Guide

**New to Supabase?** Follow this streamlined guide to get started in minutes!

## ⚡ Quick Start (5 Steps)

### Step 1: Create Supabase Project (2 min)

1. Go to [supabase.com](https://supabase.com)
2. Sign in → "New Project"
3. Name: `orbilius`, Password: (create strong one), Region: (closest to you)
4. Wait for provisioning (~2 min)

### Step 2: Get Credentials (30 sec)

1. Project Settings (gear icon) → API
2. Copy **Project URL** and **anon public** key

### Step 3: Configure App (30 sec)

```bash
# Copy example file
cp .env.example .env

# Edit .env and paste your credentials
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Step 4: Set Up Database (2 min)

1. Open Supabase Dashboard → **SQL Editor**
2. Click "New query"
3. Copy entire contents of `sql/complete_schema.sql`
4. Paste and click **"Run"**
5. Wait for "Success" message

### Step 5: Create Storage Buckets (1 min)

1. Go to **Storage** in Dashboard
2. Click "Create bucket"
   - Name: `student-submissions`, Public: OFF
   - Click Create
3. Repeat:
   - Name: `resources`, Public: ON
   - Click Create
4. Go back to **SQL Editor**
5. Copy contents of `sql/fix_storage_policies.sql`
6. Paste and **Run**

## 🎉 Done! Start Developing

```bash
# Verify everything is set up
npm run verify:setup

# Start the app
npm run dev
```

Visit `http://localhost:5173`

---

## 📋 Initial Setup After Starting

### Create Your First Admin User

1. **Go to:** Authentication → Users in Supabase Dashboard
2. **Click:** "Add user" → "Create new user"
3. **Fill in:**
   - Email: your-email@example.com
   - Password: (create password)
   - ✓ Auto Confirm User
4. **Click:** "Create user"
5. **Copy the User ID** (looks like: `12345678-1234-...`)

6. **Go to:** SQL Editor
7. **Run this query** (replace with your details):
   ```sql
   INSERT INTO users (id, email, first_name, last_name, user_type)
   VALUES (
     'PASTE_USER_ID_HERE',
     'your-email@example.com',
     'Admin',
     'User',
     'admin'
   );
   ```

### Update Admin Code (for Teacher Registration)

1. **Go to:** SQL Editor
2. **Run:**
   ```sql
   UPDATE admin_code SET code = 'YOUR_SECRET_CODE' WHERE id = 1;
   ```
   Replace `YOUR_SECRET_CODE` with your desired admin code.

---

## 🔍 Verify Your Setup

```bash
npm run verify:setup
```

This checks:

- ✓ .env file configured
- ✓ SQL files present
- ✓ Dependencies installed
- ✓ Provides dashboard checklist

---

## 🎯 What You Should See in Supabase Dashboard

### Database → Tables

- `users`
- `projects`
- `project_steps`
- `submissions`
- `step_comments`
- `admin_code`

### Storage → Buckets

- `student-submissions` (Private)
- `resources` (Public)

### Database → Policies

Each table should have multiple RLS policies enabled.

---

## 🐛 Troubleshooting

**"RLS policy violation"**

- Make sure you ran `sql/complete_schema.sql` completely
- Check policies exist in Database → Policies

**"Storage upload fails"**

- Verify buckets exist
- Run `sql/fix_storage_policies.sql` again

**"Can't connect to Supabase"**

- Check .env file has correct URL and key
- No extra spaces or quotes
- Restart dev server: `npm run dev`

**"Table doesn't exist"**

- Re-run `sql/complete_schema.sql` in SQL Editor
- Check for error messages in SQL Editor output

---

## 📚 Need Full Details?

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for the complete guide.

---

## 🎓 First Time User Flow

After setup is complete:

1. **Login as admin** → `/login`
2. **Update admin code** → Admin Dashboard
3. **Share admin code** with teachers
4. **Teachers register** → `/signup` with admin code
5. **Teachers get Teacher ID** → Share with students
6. **Students register** → `/signup` with Teacher ID
7. **Students create projects** → Start working through 5 steps!

---

## ⚙️ Helpful Commands

```bash
# Interactive setup wizard
npm run setup

# Verify setup
npm run verify:setup

# Start development
npm run dev

# Build for production
npm run build
```

---

**Need help?** Check the full [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) guide or Supabase documentation.
