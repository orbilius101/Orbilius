require('dotenv').config();
const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

const app = initializeApp({
  credential: cert({
    projectId: 'orbilius-81978',
    clientEmail: 'firebase-adminsdk-fbsvc@orbilius-81978.iam.gserviceaccount.com',
    privateKey,
  }),
  storageBucket: 'orbilius-81978.firebasestorage.app',
});

const bucket = getStorage(app).bucket();

bucket
  .setCorsConfiguration([
    {
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'https://orbilius-81978.web.app',
        'https://orbilius-81978.firebaseapp.com',
      ],
      method: ['GET', 'HEAD'],
      maxAgeSeconds: 3600,
      responseHeader: ['Content-Type', 'Content-Disposition', 'Content-Length'],
    },
  ])
  .then(() => {
    console.log('CORS configuration applied successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed:', err.message);
    process.exit(1);
  });
