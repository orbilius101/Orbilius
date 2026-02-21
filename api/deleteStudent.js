// Vercel serverless function to delete student
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
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY) {
    return res.status(500).json({ error: 'Firebase environment variables not configured' });
  }

  try {
    const batch = db.batch();

    // Delete user document
    const userRef = db.collection('users').doc(studentId);
    batch.delete(userRef);

    // Delete all student's projects
    const projectsSnapshot = await db
      .collection('projects')
      .where('student_id', '==', studentId)
      .get();

    projectsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete all project steps for this student's projects
    for (const projectDoc of projectsSnapshot.docs) {
      const stepsSnapshot = await db
        .collection('project_steps')
        .where('project_id', '==', projectDoc.id)
        .get();

      stepsSnapshot.forEach((stepDoc) => {
        batch.delete(stepDoc.ref);
      });

      // Delete step comments
      const commentsSnapshot = await db
        .collection('step_comments')
        .where('project_id', '==', projectDoc.id)
        .get();

      commentsSnapshot.forEach((commentDoc) => {
        batch.delete(commentDoc.ref);
      });

      // Delete submissions
      const submissionsSnapshot = await db
        .collection('submissions')
        .where('project_id', '==', projectDoc.id)
        .get();

      submissionsSnapshot.forEach((submissionDoc) => {
        batch.delete(submissionDoc.ref);
      });
    }

    // Commit all deletions
    await batch.commit();

    // Delete from Firebase Auth
    let authResult = null;
    try {
      await auth.deleteUser(studentId);
      authResult = { success: true };
    } catch (err) {
      authResult = { success: false, error: err.message };
    }

    return res.status(200).json({
      success: true,
      message: 'Student deleted',
      authResult,
    });
  } catch (error) {
    console.error('Error in deleteStudent:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
}
