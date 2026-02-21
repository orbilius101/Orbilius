# Firebase Migration Checklist

Use this checklist to track your Firebase migration progress.

## ☑️ Phase 1: Setup (Completed)

- [x] Install Firebase packages
- [x] Create Firebase configuration file
- [x] Create security rules (Firestore + Storage)
- [x] Update authentication code
- [x] Update Vercel API functions
- [x] Create migration documentation

## ⬜ Phase 2: Firebase Project Setup

- [ ] Create Firebase project at console.firebase.google.com
- [ ] Enable Email/Password authentication
- [ ] Create Firestore database (production mode)
- [ ] Enable Firebase Storage
- [ ] Deploy Firestore security rules from `firestore.rules`
- [ ] Deploy Storage security rules from `storage.rules`
- [ ] Copy Firebase config to `.env` file
- [ ] Download service account key for Vercel
- [ ] Add environment variables to Vercel dashboard

## ⬜ Phase 3: Database Query Migration

### Student Components

- [ ] `src/student/components/Dashboard/hooks/useData.ts`
- [ ] `src/student/components/Dashboard/hooks/useHandlers.ts`
- [ ] `src/student/components/Step1Upload/hooks/useData.ts`
- [ ] `src/student/components/Step1Upload/hooks/useHandlers.ts`
- [ ] `src/student/components/Step2Upload/hooks/useData.ts`
- [ ] `src/student/components/Step2Upload/hooks/useHandlers.ts`
- [ ] `src/student/components/Step3Upload/hooks/useData.ts`
- [ ] `src/student/components/Step3Upload/hooks/useHandlers.ts`
- [ ] `src/student/components/Step4Upload/hooks/useData.ts`
- [ ] `src/student/components/Step4Upload/hooks/useHandlers.ts`
- [ ] `src/student/components/Step5Upload/hooks/useData.ts`
- [ ] `src/student/components/Step5Upload/hooks/useHandlers.ts`
- [ ] `src/student/components/SubmitStep/hooks/useHandlers.ts`

### Teacher Components

- [ ] `src/teacher/components/Dashboard/hooks/useData.ts`
- [ ] `src/teacher/components/Dashboard/Dashboard.tsx`
- [ ] `src/teacher/components/StepApproval/hooks/useData.ts`
- [ ] `src/teacher/components/StepApproval/hooks/useHandlers.ts`
- [ ] `src/teacher/components/StepSubmissionModal/StepSubmissionModal.tsx`

### Admin Components

- [ ] `src/admin/api/adminApi.ts`
- [ ] `src/admin/hooks/useTeachers.ts`
- [ ] `src/admin/hooks/usePendingProjects.ts`
- [ ] `src/admin/hooks/useAdminCode.ts`
- [ ] `src/admin/components/AdminHeader.tsx`
- [ ] `src/admin/components/AdminCodeManager.tsx`

### Shared Components

- [ ] `src/components/CreateProject/hooks/useData.ts`
- [ ] `src/components/CreateProject/hooks/useHandlers.ts`
- [ ] `src/components/SiteHeader/SiteHeader.tsx`
- [ ] `src/components/LandingPage/hooks/useHandlers.ts`

## ⬜ Phase 4: Testing

### Authentication Tests

- [ ] Sign up new user
- [ ] Receive and click verification email
- [ ] Log in with verified account
- [ ] Test password reset flow
- [ ] Test invalid credentials
- [ ] Test role-based navigation (student/teacher/admin)

### Student Flow Tests

- [ ] Create new project
- [ ] Upload file for Step 1
- [ ] Submit Step 1 for review
- [ ] Edit Step 1 before submission
- [ ] View project status
- [ ] See teacher comments

### Teacher Flow Tests

- [ ] View dashboard with assigned projects
- [ ] Review submitted step
- [ ] Download student files
- [ ] Add comments to submission
- [ ] Approve step
- [ ] Request revision

### Admin Flow Tests

- [ ] View all users
- [ ] Invite new teacher
- [ ] Invite new student
- [ ] Delete student
- [ ] Delete teacher
- [ ] View/update admin code
- [ ] Review pending projects

### Vercel API Tests

- [ ] Email existence check works
- [ ] Student deletion works
- [ ] Teacher deletion works
- [ ] Email invitations send

## ⬜ Phase 5: Data Migration (if needed)

- [ ] Export users from Supabase
- [ ] Import users to Firestore
- [ ] Export projects from Supabase
- [ ] Import projects to Firestore
- [ ] Export project_steps from Supabase
- [ ] Import project_steps to Firestore
- [ ] Export step_comments from Supabase
- [ ] Import step_comments to Firestore
- [ ] Export admin_code from Supabase
- [ ] Import admin_code to Firestore
- [ ] Migrate files from Supabase Storage to Firebase Storage
- [ ] Verify all data migrated correctly

## ⬜ Phase 6: Production Deployment

- [ ] Test all features in staging environment
- [ ] Update Vercel environment variables
- [ ] Deploy to production
- [ ] Test authentication in production
- [ ] Test all features in production
- [ ] Monitor Firebase usage/quotas
- [ ] Set up Firebase budget alerts (optional)

## ⬜ Phase 7: Cleanup

- [ ] Remove old Supabase imports from codebase
- [ ] Delete `supabaseClient.ts` file
- [ ] Remove Supabase environment variables
- [ ] Update documentation
- [ ] Archive or delete Supabase project (after backup)

## 📝 Notes

Track any issues or questions here:

---

## 🆘 Need Help?

If you get stuck on any step:

1. Check `FIREBASE_CODE_EXAMPLES.md` for code patterns
2. Check `FIREBASE_SETUP.md` for setup instructions
3. Check `MIGRATION_STATUS.md` for detailed migration info
4. Ask for help!

---

**Current Status:** Phase 1 Complete ✅  
**Last Updated:** [Add date when you start]
