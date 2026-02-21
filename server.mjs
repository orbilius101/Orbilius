// Local Express server for API route testing (mimics Vercel serverless function)
// Usage: node server.mjs
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { Resend } from 'resend';
import admin from 'firebase-admin';

// Load environment variables
dotenv.config();

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

const app = express();
app.use(cors());
app.use(express.json());

console.log('Resend API Key loaded:', process.env.RESEND_API_KEY ? 'Yes' : 'No');
const resend = new Resend(process.env.RESEND_API_KEY);

app.post('/api/checkUserEmail', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

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
});

app.post('/api/sendInvite', async (req, res) => {
  const { email, role, signupUrl } = req.body;

  if (!email || !role) {
    return res.status(400).json({ error: 'Email and role are required' });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Orbilius <onboarding@resend.dev>',
      to: email,
      subject: `You're invited to join Orbilius as a ${role}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1976d2;">Welcome to Orbilius!</h2>
          <p>You've been invited to join Orbilius as a <strong>${role}</strong>.</p>
          <p>Click the button below to create your account:</p>
          <a href="${signupUrl}" 
             style="display: inline-block; background-color: #1976d2; color: white; 
                    padding: 12px 24px; text-decoration: none; border-radius: 4px; 
                    margin: 16px 0;">
            Create Account
          </a>
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link into your browser:<br/>
            <a href="${signupUrl}">${signupUrl}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 12px;">
            If you didn't expect this invitation, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Send invite error:', error);
    return res.status(500).json({ error: 'Failed to send invitation email' });
  }
});

app.post('/api/deleteTeacher', async (req, res) => {
  const { teacherId } = req.body;
  if (!teacherId) return res.status(400).json({ error: 'Teacher ID is required' });

  try {
    // Get all students associated with this teacher from Firestore
    const studentsSnapshot = await db
      .collection('users')
      .where('teacher_id', '==', teacherId)
      .where('user_type', '==', 'student')
      .get();

    const studentIds = studentsSnapshot.docs.map((doc) => doc.id);

    // Delete students from Firestore
    const batch = db.batch();
    studentsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete teacher from Firestore
    batch.delete(db.collection('users').doc(teacherId));
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
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.post('/api/deleteStudent', async (req, res) => {
  const { studentId } = req.body;
  if (!studentId) return res.status(400).json({ error: 'Student ID is required' });

  try {
    // Delete from Firestore
    await db.collection('users').doc(studentId).delete();

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
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Cleanup endpoint to remove orphaned auth users
app.get('/api/cleanup-auth', async (req, res) => {
  try {
    // Get all Firebase Auth users
    const listUsersResult = await auth.listUsers();
    const authUsers = listUsersResult.users;

    // Get all users from Firestore
    const usersSnapshot = await db.collection('users').get();
    const dbUserIds = new Set(usersSnapshot.docs.map((doc) => doc.id));

    // Find orphaned users
    const orphanedUsers = authUsers.filter((authUser) => !dbUserIds.has(authUser.uid));

    // Delete orphaned users
    const results = [];
    for (const user of orphanedUsers) {
      try {
        await auth.deleteUser(user.uid);
        results.push({
          email: user.email,
          id: user.uid,
          success: true,
        });
      } catch (error) {
        results.push({
          email: user.email,
          id: user.uid,
          success: false,
          error: error.message,
        });
      }
    }

    return res.status(200).json({
      total_auth_users: authUsers.length,
      total_db_users: usersSnapshot.size,
      orphaned_count: orphanedUsers.length,
      results,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API server running on port ${PORT}`));
