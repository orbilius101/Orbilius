# Supabase Setup Checklist

Use this checklist to ensure your Supabase project is fully configured for Orbilius.

## ☑️ Pre-Setup

- [ ] Supabase account created at [supabase.com](https://supabase.com)
- [ ] Node.js 16+ installed
- [ ] Project cloned and `npm install` completed

## ☑️ Supabase Project Creation

- [ ] New Supabase project created
- [ ] Project name: `orbilius` (or your choice)
- [ ] Strong database password set and saved securely
- [ ] Region selected
- [ ] Project provisioning complete (wait ~2 minutes)

## ☑️ API Credentials

- [ ] Opened: Project Settings → API
- [ ] Copied Project URL (https://xxxxx.supabase.co)
- [ ] Copied anon public key (starts with eyJ...)
- [ ] Created `.env` file in project root
- [ ] Pasted credentials into `.env` file
- [ ] No extra spaces or quotes in `.env` file

## ☑️ Database Setup

- [ ] Opened SQL Editor in Supabase Dashboard
- [ ] Created new query
- [ ] Copied full contents of `sql/complete_schema.sql`
- [ ] Pasted into SQL Editor
- [ ] Clicked "Run"
- [ ] Saw "Success" message (no errors)
- [ ] Verified tables created: Database → Tables
  - [ ] users
  - [ ] projects
  - [ ] project_steps
  - [ ] submissions
  - [ ] step_comments
  - [ ] admin_code

## ☑️ Storage Buckets

- [ ] Opened Storage in Supabase Dashboard
- [ ] Created bucket: `student-submissions`
  - [ ] Set to Private (not public)
  - [ ] Clicked "Create bucket"
- [ ] Created bucket: `resources`
  - [ ] Set to Public
  - [ ] Clicked "Create bucket"
- [ ] Ran `sql/fix_storage_policies.sql` in SQL Editor
- [ ] Saw success message

## ☑️ Row Level Security

- [ ] Opened Database → Tables
- [ ] Clicked each table and verified "RLS enabled" badge shows
- [ ] Clicked "Policies" for each table
- [ ] Verified multiple policies exist for each table
  - [ ] users (3+ policies)
  - [ ] projects (6+ policies)
  - [ ] project_steps (6+ policies)
  - [ ] submissions (4+ policies)
  - [ ] step_comments (3+ policies)
  - [ ] admin_code (2+ policies)

## ☑️ Admin User Creation

- [ ] Opened Authentication → Users
- [ ] Clicked "Add user" → "Create new user"
- [ ] Entered email address
- [ ] Set strong password
- [ ] Checked "Auto Confirm User"
- [ ] Clicked "Create user"
- [ ] Copied the User ID (UUID format)
- [ ] Opened SQL Editor
- [ ] Ran this query with your details:
  ```sql
  INSERT INTO users (id, email, first_name, last_name, user_type)
  VALUES (
    'YOUR_USER_ID',
    'your-email@example.com',
    'Admin',
    'User',
    'admin'
  );
  ```
- [ ] Saw success message

## ☑️ Admin Code Setup

- [ ] Opened SQL Editor
- [ ] Verified admin_code table has entry:
  ```sql
  SELECT * FROM admin_code;
  ```
- [ ] (Optional) Updated admin code:
  ```sql
  UPDATE admin_code SET code = 'YOUR_CODE' WHERE id = 1;
  ```
- [ ] Made note of admin code for teacher registration

## ☑️ Local Verification

- [ ] Ran: `npm run verify:setup`
- [ ] All checks passed ✓
- [ ] .env file configured
- [ ] SQL files present
- [ ] Dependencies installed

## ☑️ Testing

- [ ] Ran: `npm run dev`
- [ ] App started without errors
- [ ] Navigated to http://localhost:5173
- [ ] Saw landing page
- [ ] Clicked "Login"
- [ ] Logged in with admin credentials
- [ ] Redirected to admin dashboard
- [ ] Saw admin code displayed
- [ ] No console errors

## ☑️ Optional: Resource Files

If you have step resource PDFs:

- [ ] Opened Storage → resources bucket
- [ ] Uploaded step1_resource.pdf
- [ ] Uploaded step2_resource.pdf
- [ ] (Add more as needed)
- [ ] Set files to public
- [ ] Tested download from student view

## ☑️ Post-Setup Tasks

- [ ] Admin code shared with teachers
- [ ] Teachers registered using admin code
- [ ] Teachers received their Teacher ID
- [ ] Teacher IDs shared with students
- [ ] Tested student registration with Teacher ID
- [ ] Tested creating a project
- [ ] Tested uploading a submission
- [ ] Tested teacher approval workflow

## ☑️ Production Readiness (When Ready)

- [ ] Updated admin code to production-secure code
- [ ] Reviewed all RLS policies
- [ ] Set up database backups
- [ ] Configured email templates (Auth → Email Templates)
- [ ] Set up custom SMTP (optional)
- [ ] Tested password reset flow
- [ ] Tested all user roles (student, teacher, admin)
- [ ] Reviewed and set storage limits
- [ ] Set up monitoring/alerts

---

## 🎉 Setup Complete!

When all items are checked:

- ✅ Your Supabase project is fully configured
- ✅ Ready for development
- ✅ Ready for testing
- ✅ Ready for deployment (when production tasks complete)

## 📚 Quick Reference

### Key Files

- `.env` - Environment variables (DO NOT COMMIT)
- `sql/complete_schema.sql` - Full database schema
- `sql/fix_storage_policies.sql` - Storage security
- `QUICK_SETUP.md` - Quick start guide
- `SUPABASE_SETUP.md` - Detailed setup guide

### Key Commands

```bash
npm run verify:setup  # Check setup status
npm run dev          # Start development
npm run build        # Build for production
```

### Key URLs

- Supabase Dashboard: https://app.supabase.com
- Local App: http://localhost:5173
- Supabase Docs: https://supabase.com/docs

---

**Having issues?** Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) troubleshooting section.
