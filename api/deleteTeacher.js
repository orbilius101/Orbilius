// Vercel serverless function to delete teacher and students
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

  const { teacherId } = req.body;

  if (!teacherId) {
    return res.status(400).json({ error: 'Teacher ID is required' });
  }

  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY) {
    return res.status(500).json({ error: 'Firebase environment variables not configured' });
  }

  try {
    // First, get all student IDs associated with this teacher
    const studentsSnapshot = await db
      .collection('users')
      .where('teacher_id', '==', teacherId)
      .where('user_type', '==', 'student')
      .get();

    const studentIds = studentsSnapshot.docs.map((doc) => doc.id);
    const batch = db.batch();

    // Delete all students and their related data
    for (const studentId of studentIds) {
      // Delete student user document
      const studentRef = db.collection('users').doc(studentId);
      batch.delete(studentRef);

      // Delete student's projects
      const projectsSnapshot = await db
        .collection('projects')
        .where('student_id', '==', studentId)
        .get();

      projectsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Delete all project-related data
      for (const projectDoc of projectsSnapshot.docs) {
        const stepsSnapshot = await db
          .collection('project_steps')
          .where('project_id', '==', projectDoc.id)
          .get();

        stepsSnapshot.forEach((stepDoc) => {
          batch.delete(stepDoc.ref);
        });

        const commentsSnapshot = await db
          .collection('step_comments')
          .where('project_id', '==', projectDoc.id)
          .get();

        commentsSnapshot.forEach((commentDoc) => {
          batch.delete(commentDoc.ref);
        });

        const submissionsSnapshot = await db
          .collection('submissions')
          .where('project_id', '==', projectDoc.id)
          .get();

        submissionsSnapshot.forEach((submissionDoc) => {
          batch.delete(submissionDoc.ref);
        });
      }
    }

    // Delete teacher's user document
    const teacherRef = db.collection('users').doc(teacherId);
    batch.delete(teacherRef);

    // Delete teacher's projects (if any)
    const teacherProjectsSnapshot = await db
      .collection('projects')
      .where('teacher_id', '==', teacherId)
      .get();

    teacherProjectsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Commit all deletions
    await batch.commit();

    // Delete from Firebase Auth
    const authResults = { students: [], teacher: null };

    // Delete student auth accounts
    for (const studentId of studentIds) {
      try {
        await auth.deleteUser(studentId);
        authResults.students.push({ id: studentId, success: true });
      } catch (err) {
        authResults.students.push({ id: studentId, success: false, error: err.message });
      }
    }

    // Delete teacher auth account
    try {
      await auth.deleteUser(teacherId);
      authResults.teacher = { success: true };
    } catch (err) {
      authResults.teacher = { success: false, error: err.message };
    }

    return res.status(200).json({
      success: true,
      message: 'Teacher and students deleted',
      authResults,
    });
  } catch (error) {
    console.error('Error in deleteTeacher:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
}
