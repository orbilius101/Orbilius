# Supabase Setup Guide for Orbilius

This guide will walk you through setting up a new Supabase project for Orbilius with maximum automation.

## Prerequisites

- A Supabase account ([Sign up at supabase.com](https://supabase.com))
- Node.js 16+ installed
- Supabase CLI (optional but recommended for automation)

## Setup Steps

### Step 1: Create New Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name**: `orbilius` (or your preferred name)
   - **Database Password**: Create a strong password (save it securely!)
   - **Region**: Choose closest to your users
4. Click "Create new project" and wait for provisioning (~2 minutes)

### Step 2: Get Your Credentials

Once your project is ready:

1. Go to **Project Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### Step 3: Configure Environment Variables

1. Create a `.env` file in the project root:

   ```bash
   npm run setup:env
   ```

   Or manually create `.env`:

   ```env
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. Replace with your actual values from Step 2

### Step 4: Set Up Database Schema (AUTOMATED)

Run the automated setup script:

```bash
npm run setup:database
```

This will guide you through:

1. Installing Supabase CLI (if needed)
2. Logging into Supabase
3. Running all database migrations
4. Setting up tables and policies

**Alternative: Manual Setup**

If you prefer manual setup, go to your Supabase Dashboard:

1. **SQL Editor** → Click "New query"
2. Copy and paste the contents of `sql/complete_schema.sql`
3. Click "Run"

### Step 5: Set Up Storage Buckets (AUTOMATED)

Run:

```bash
npm run setup:storage
```

This creates:

- `student-submissions` bucket (private)
- `resources` bucket (public for PDFs)

**Manual Setup:**

1. Go to **Storage** in Supabase Dashboard
2. Click "Create bucket"
3. Create `student-submissions` (Private)
4. Create `resources` (Public)
5. Apply storage policies by running `sql/fix_storage_policies.sql` in SQL Editor

### Step 6: Create Initial Admin User

**Option A: Via Dashboard (Easiest)**

1. Go to **Authentication** → **Users**
2. Click "Add user" → "Create new user"
3. Fill in:
   - Email: your-admin@example.com
   - Password: (secure password)
   - Auto Confirm User: ✓ (checked)
4. Click "Create user"
5. Go to **SQL Editor** and run:
   ```sql
   -- Update the user's metadata to make them admin
   INSERT INTO users (id, email, first_name, last_name, user_type)
   VALUES (
     'paste-user-id-here',
     'your-admin@example.com',
     'Admin',
     'User',
     'admin'
   );
   ```

**Option B: Via Script**

```bash
npm run setup:admin
```

### Step 7: Set Initial Admin Code

1. Go to **SQL Editor** in Supabase Dashboard
2. Run:

   ```sql
   INSERT INTO admin_code (code) VALUES ('ADMIN2024');
   ```

   Or use your own custom code!

Teachers will need this code to register.

### Step 8: Upload Resource Files (Optional)

If you have step resource PDFs:

1. Go to **Storage** → `resources` bucket
2. Upload your PDF files:
   - `step1_resource.pdf`
   - `step2_resource.pdf`
   - etc.

Or use the CLI:

```bash
npm run upload:resources
```

### Step 9: Verify Setup

Run the verification script:

```bash
npm run verify:setup
```

This checks:

- ✓ Environment variables are set
- ✓ Database tables exist
- ✓ Storage buckets are created
- ✓ RLS policies are active
- ✓ Admin user exists

### Step 10: Start Development

```bash
npm run dev
```

Your app should now be running at `http://localhost:5173`

## Quick Reference

### Useful npm Scripts

```bash
npm run setup:env          # Create .env file
npm run setup:database     # Set up all database tables
npm run setup:storage      # Create storage buckets
npm run setup:admin        # Create admin user
npm run verify:setup       # Verify everything is configured
npm run dev               # Start development server
```

### Database Tables Created

- `users` - User profiles (students, teachers, admins)
- `projects` - Student project data
- `submissions` - File submissions (DEPRECATED - use project_steps)
- `project_steps` - New structure for step submissions
- `step_comments` - Teacher comments per step
- `admin_code` - Admin registration codes

### Storage Buckets

- `student-submissions` - Private bucket for uploaded PDFs
- `resources` - Public bucket for downloadable resources

## Troubleshooting

### "Failed to connect to Supabase"

- Check your `.env` file has correct URL and key
- Ensure there are no extra spaces or quotes
- Restart your dev server after changing .env

### "RLS policy violation" errors

- Run `sql/complete_schema.sql` to ensure all policies are set
- Check user is authenticated before accessing data

### Storage upload fails

- Verify buckets exist in Storage dashboard
- Check storage policies are applied (`sql/fix_storage_policies.sql`)
- Ensure file is a valid PDF under 50MB

### Can't create admin user

- Make sure user exists in Authentication → Users
- Run the INSERT query with the correct user ID
- Check `user_type` column exists in users table

## Need Help?

- Check [Supabase Documentation](https://supabase.com/docs)
- Review the `sql/` folder for schema details
- Check console for detailed error messages

## Next Steps

1. **Login as admin** at `/login` with your admin credentials
2. **Update the admin code** in the admin dashboard
3. **Share the admin code** with teachers so they can register
4. **Teachers register** at `/signup` using the admin code
5. **Students register** at `/signup` using their teacher's ID
6. Start managing projects!

---

🎉 **Setup Complete!** You're ready to use Orbilius.
