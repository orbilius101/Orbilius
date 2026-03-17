import admin from 'firebase-admin';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);
console.log('Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('Private Key (first 50 chars):', process.env.FIREBASE_PRIVATE_KEY?.substring(0, 50));
console.log('Has \\n sequences:', process.env.FIREBASE_PRIVATE_KEY?.includes('\\n'));

// Initialize Firebase Admin
const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
console.log('After replacement (first 50 chars):', privateKey.substring(0, 50));
console.log('Starts with BEGIN:', privateKey.startsWith('-----BEGIN PRIVATE KEY-----'));

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  }),
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
});

const bucket = admin.storage().bucket();

// Set CORS configuration
const corsConfiguration = [
  {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'https://orbilius-81978.web.app',
      'https://orbilius-81978.firebaseapp.com',
    ],
    method: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE'],
    responseHeader: [
      'Content-Type',
      'Authorization',
      'Content-Length',
      'Access-Control-Allow-Origin',
    ],
    maxAgeSeconds: 3600,
  },
];

try {
  await bucket.setCorsConfiguration(corsConfiguration);
  console.log('✅ CORS configuration updated successfully!');
  console.log('Allowed origins:', corsConfiguration[0].origin);
  process.exit(0);
} catch (error) {
  console.error('❌ Error setting CORS configuration:', error);
  process.exit(1);
}
