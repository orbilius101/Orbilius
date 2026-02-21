// Vercel serverless function for checking if an email exists in Firebase Auth or Firestore
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();
const auth = admin.auth();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Check Firestore users collection
    const usersSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();

    if (!usersSnapshot.empty) {
      return res.status(200).json({ exists: true });
    }

    // Check Firebase Auth
    try {
      await auth.getUserByEmail(email);
      return res.status(200).json({ exists: true });
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return res.status(200).json({ exists: false });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error checking user email:', error);
    return res.status(500).json({ error: 'Error checking email' });
  }
}
