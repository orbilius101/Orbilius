# Firebase Migration Guide

## Prerequisites

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable the following services:
   - **Authentication** → Email/Password provider
   - **Firestore Database** → Start in production mode (we'll add rules)
   - **Storage** → Start in production mode (we'll add rules)

## Environment Variables

Update your `.env` file with Firebase credentials:

```env
# Remove old Supabase variables
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# Add Firebase variables (from Firebase Console → Project Settings)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Keep your existing Resend API key for emails
VITE_RESEND_API_KEY=your_resend_key
```

## Vercel API Functions - Service Account Setup

For the Vercel serverless functions to work with Firebase Admin SDK:

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file
4. In Vercel dashboard, add environment variable:
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: Paste the entire JSON content
   - Or use separate variables:
     - `FIREBASE_PROJECT_ID`
     - `FIREBASE_CLIENT_EMAIL`
     - `FIREBASE_PRIVATE_KEY`

## Deploy Security Rules

### Firestore Rules

1. Go to Firebase Console → Firestore Database → Rules
2. Copy contents from `firestore.rules` file
3. Click "Publish"

### Storage Rules

1. Go to Firebase Console → Storage → Rules
2. Copy contents from `storage.rules` file
3. Click "Publish"

## Create Firestore Indexes

Some queries require composite indexes. Firebase will tell you which ones when you first run the app:

1. Run your app locally
2. Watch the browser console for index errors
3. Click the provided link to auto-create the index
4. Or manually create in Firebase Console → Firestore → Indexes

Common indexes you'll need:

- Collection: `projects`, Fields: `student_id` (Ascending), `created_at` (Descending)
- Collection: `projects`, Fields: `teacher_id` (Ascending), `created_at` (Descending)
- Collection: `step_comments`, Fields: `project_id` (Ascending), `step_number` (Ascending), `created_at` (Ascending)

## Data Migration

Since Firestore structure is different from PostgreSQL, you'll need to migrate your data:

### Option 1: Manual Export/Import (Recommended for small datasets)

1. Export data from Supabase:
   - Go to Supabase SQL Editor
   - Run: `SELECT * FROM users;` → Export as CSV
   - Repeat for `projects`, `project_steps`, `step_comments`, `admin_code`

2. Import to Firestore:
   - Use Firebase Console → Firestore → Start collection
   - Add documents manually or use a script

### Option 2: Automated Script (for larger datasets)

Create a migration script that:

1. Connects to both Supabase and Firebase
2. Reads from Supabase tables
3. Writes to Firestore collections
4. Handles ID mapping (Supabase UUIDs → Firebase doc IDs)

## Important Differences

### Authentication

- **Supabase**: Returns user in `data.user`
- **Firebase**: Returns `UserCredential` with `.user` property

### Database Queries

- **Supabase**: SQL-like with `.from().select()`
- **Firebase**: NoSQL with `collection()`, `doc()`, `getDocs()`

### File Storage

- **Supabase**: `.storage.from('bucket').upload()`
- **Firebase**: `uploadBytes(ref(storage, path), file)`

## Testing Checklist

- [ ] Sign up new user
- [ ] Sign in existing user
- [ ] Password reset flow
- [ ] Email verification
- [ ] Create project (student)
- [ ] View projects (student/teacher/admin)
- [ ] Upload file (student)
- [ ] Download file (teacher)
- [ ] Add comment (teacher)
- [ ] Delete user (admin)
- [ ] Invite new user (admin)

## Cost Monitoring

Set up budget alerts in Firebase Console:

1. Go to Project Settings → Usage and billing
2. Set up budget alerts (optional but recommended)
3. Monitor daily quotas to stay within free tier

## Rollback Plan

If you need to rollback:

1. Keep Supabase project active during migration
2. Don't delete Supabase tables until Firebase is fully tested
3. Git branch for migration allows easy revert
