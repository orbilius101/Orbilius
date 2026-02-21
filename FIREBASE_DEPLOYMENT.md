# Firebase Deployment Guide

## 🎉 Migration Complete!

Your app is now fully on Firebase! No more Vercel needed.

## 📦 Prerequisites

1. Firebase CLI installed globally:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

## 🚀 Deployment Steps

### 1. Install Dependencies

**Root project:**
```bash
pnpm install
```

**Functions:**
```bash
cd functions
npm install
cd ..
```

### 2. Set Environment Variables

Set your Resend API key in Firebase:
```bash
firebase functions:config:set resend.api_key="re_FMzm7GHB_3der3thimTirPbj2ttDWj5du"
```

### 3. Build and Deploy Everything

```bash
npm run firebase:deploy
```

Or deploy individually:
- **Hosting only:** `npm run firebase:deploy:hosting`
- **Functions only:** `npm run firebase:deploy:functions`
- **Rules only:** `npm run firebase:deploy:rules`

### 4. Upload Resource Files

In Firebase Console → Storage:
- Create `resources/step1/` folder
- Upload PDFs as mentioned in the previous guide

## 🧪 Local Testing

### Test Functions Locally (Emulator)
```bash
firebase emulators:start
```

Then update `src/config/functions.ts` to use local URLs.

### Test Frontend Locally
```bash
pnpm dev
```

## 🌐 Your URLs After Deployment

- **Frontend:** `https://orbilius-81978.web.app`
- **Functions:** `https://us-central1-orbilius-81978.cloudfunctions.net/[function-name]`

## 📝 Environment Variables

The functions will automatically have access to Firebase Admin SDK. You only need to set:
- `VITE_RESEND_API_KEY` - For sending emails

## 🔥 Firebase Console Access

- **Hosting:** https://console.firebase.google.com/project/orbilius-81978/hosting
- **Functions:** https://console.firebase.google.com/project/orbilius-81978/functions
- **Firestore:** https://console.firebase.google.com/project/orbilius-81978/firestore
- **Storage:** https://console.firebase.google.com/project/orbilius-81978/storage

## ⚙️ Configuring Function Environment Variables

If you need to update environment variables:

```bash
# Set a config
firebase functions:config:set resend.api_key="your_new_key"

# View all configs
firebase functions:config:get

# Delete a config
firebase functions:config:unset resend.api_key
```

After changing config, redeploy functions:
```bash
npm run firebase:deploy:functions
```

## 🔍 Viewing Logs

```bash
# View all logs
firebase functions:log

# Stream logs in real-time
firebase functions:log --only functions

# View specific function logs
firebase functions:log --only checkUserEmail
```

## 🐛 Troubleshooting

### Functions not working?
1. Check environment variables: `firebase functions:config:get`
2. Check logs: `firebase functions:log`
3. Verify CORS is enabled (already done in code)

### Hosting shows old version?
1. Clear browser cache
2. Wait a few minutes for CDN propagation
3. Check deployment: `firebase hosting:channel:list`

### Need to rollback?
```bash
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID TARGET_SITE_ID:live
```

## 💰 Costs

Firebase free tier (Spark plan) includes:
- Firestore: 1GB storage, 50K reads/day, 20K writes/day
- Storage: 5GB, 1GB/day downloads
- Hosting: 10GB/month
- Functions: 2M invocations/month

If you need more, upgrade to Blaze (pay-as-you-go).

## ✅ Post-Deployment Checklist

- [ ] Test signup/login
- [ ] Test student project creation
- [ ] Test file upload
- [ ] Test teacher review
- [ ] Test admin invitations
- [ ] Verify all functions work
- [ ] Check Firebase logs for errors
- [ ] Set up budget alerts in Firebase Console

## 🔒 Security

All security is handled by:
- Firebase Auth (authentication)
- Firestore Rules (database access)
- Storage Rules (file access)
- Cloud Functions run with admin privileges but validate requests

No additional security configuration needed!
