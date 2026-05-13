import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators in development
// Temporarily disabled - uncomment to use emulators
// if (import.meta.env.DEV) {
//   try {
//     // Use production Auth, but local Firestore and Storage
//     connectFirestoreEmulator(db, '127.0.0.1', 8080);
//     connectStorageEmulator(storage, '127.0.0.1', 9199);
//     console.log('🔧 Connected to Firebase Emulators (Firestore & Storage) - using production Auth');
//   } catch (error) {
//     console.warn('Failed to connect to emulators (may already be connected):', error);
//   }
// }

export default app;
