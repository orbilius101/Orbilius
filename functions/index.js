/**
 * Firebase Cloud Functions for Orbilius
 * Migrated from Vercel serverless functions
 */

const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

/**
 * Check if an email exists in Firebase Auth or Firestore
 */
exports.checkUserEmail = onRequest({ cors: true, invoker: 'public' }, async (req, res) => {
  console.log('checkUserEmail called', { method: req.method });
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  console.log('Request body:', { email });
  
  if (!email) {
    console.error('No email provided in request');
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Check Firestore users collection
    console.log('Checking Firestore for email:', email);
    const usersSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();

    if (!usersSnapshot.empty) {
      console.log('Email found in Firestore');
      return res.status(200).json({ exists: true });
    }

    // Check Firebase Auth
    console.log('Checking Firebase Auth for email:', email);
    try {
      await auth.getUserByEmail(email);
      console.log('Email found in Firebase Auth');
      return res.status(200).json({ exists: true });
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('Email not found in Auth or Firestore');
        return res.status(200).json({ exists: false });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error checking user email:', error);
    console.error('Error details:', { code: error.code, message: error.message, stack: error.stack });
    return res.status(500).json({ error: 'Error checking email' });
  }
});

/**
 * Delete a student and all related data
 */
exports.deleteStudent = onRequest({ cors: true, invoker: 'public' }, async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  try {
    const batch = db.batch();

    // Delete user document
    const userRef = db.collection('users').doc(studentId);
    batch.delete(userRef);

    // Delete all student's projects
    const projectsSnapshot = await db.collection('projects').where('student_id', '==', studentId).get();

    projectsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete all project-related data
    for (const projectDoc of projectsSnapshot.docs) {
      const stepsSnapshot = await db.collection('project_steps').where('project_id', '==', projectDoc.id).get();
      stepsSnapshot.forEach((stepDoc) => {
        batch.delete(stepDoc.ref);
      });

      const commentsSnapshot = await db.collection('step_comments').where('project_id', '==', projectDoc.id).get();
      commentsSnapshot.forEach((commentDoc) => {
        batch.delete(commentDoc.ref);
      });

      const submissionsSnapshot = await db.collection('submissions').where('project_id', '==', projectDoc.id).get();
      submissionsSnapshot.forEach((submissionDoc) => {
        batch.delete(submissionDoc.ref);
      });
    }

    // Commit the batch
    await batch.commit();

    // Delete from Firebase Auth
    try {
      await auth.deleteUser(studentId);
      console.log('Successfully deleted student from Auth:', studentId);
    } catch (authError) {
      if (authError.code !== 'auth/user-not-found') {
        console.error('Error deleting user from Auth:', authError);
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Student deleted successfully',
      data: { studentId } 
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    return res.status(500).json({ error: 'Failed to delete student' });
  }
});

/**
 * Delete a teacher and all their students
 */
exports.deleteTeacher = onRequest({ cors: true, invoker: 'public' }, async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { teacherId } = req.body;

  if (!teacherId) {
    return res.status(400).json({ error: 'Teacher ID is required' });
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
      const projectsSnapshot = await db.collection('projects').where('student_id', '==', studentId).get();

      projectsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Delete all project-related data
      for (const projectDoc of projectsSnapshot.docs) {
        const stepsSnapshot = await db.collection('project_steps').where('project_id', '==', projectDoc.id).get();
        stepsSnapshot.forEach((stepDoc) => {
          batch.delete(stepDoc.ref);
        });

        const commentsSnapshot = await db.collection('step_comments').where('project_id', '==', projectDoc.id).get();
        commentsSnapshot.forEach((commentDoc) => {
          batch.delete(commentDoc.ref);
        });

        const submissionsSnapshot = await db.collection('submissions').where('project_id', '==', projectDoc.id).get();
        submissionsSnapshot.forEach((submissionDoc) => {
          batch.delete(submissionDoc.ref);
        });
      }
    }

    // Delete teacher's user document
    const teacherRef = db.collection('users').doc(teacherId);
    batch.delete(teacherRef);

    // Delete teacher's projects (if any)
    const teacherProjectsSnapshot = await db.collection('projects').where('teacher_id', '==', teacherId).get();

    teacherProjectsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Commit the batch
    await batch.commit();

    // Delete teacher from Firebase Auth
    try {
      await auth.deleteUser(teacherId);
      console.log('Successfully deleted teacher from Auth:', teacherId);
    } catch (authError) {
      if (authError.code !== 'auth/user-not-found') {
        console.error('Error deleting teacher from Auth:', authError);
      }
    }

    // Delete all students from Firebase Auth
    for (const studentId of studentIds) {
      try {
        await auth.deleteUser(studentId);
        console.log('Successfully deleted student from Auth:', studentId);
      } catch (authError) {
        if (authError.code !== 'auth/user-not-found') {
          console.error('Error deleting student from Auth:', authError);
        }
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Teacher and all students deleted successfully',
      data: { 
        teacherId,
        deletedStudents: studentIds.length 
      } 
    });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return res.status(500).json({ error: 'Failed to delete teacher' });
  }
});

/**
 * Send invitation email to new user
 */
exports.sendInvite = onRequest({ cors: true, invoker: 'public' }, async (req, res) => {
  console.log('sendInvite called', { method: req.method });
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, role, signupUrl } = req.body;

  if (!email || !role) {
    console.error('Missing required fields:', { email: !!email, role: !!role });
    return res.status(400).json({ error: 'Email and role are required' });
  }

  try {
    // Create Gmail transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    console.log('Gmail credentials available:', {
      user: !!process.env.GMAIL_USER,
      password: !!process.env.GMAIL_APP_PASSWORD
    });
    
    console.log('Attempting to send email via Gmail SMTP...');
    const mailOptions = {
      from: `Orbilius <${process.env.GMAIL_USER}>`,
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
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    return res.status(200).json({ 
      success: true, 
      messageId: info.messageId 
    });
  } catch (error) {
    console.error('Send invite error:', error);
    console.error('Error details:', { 
      message: error.message, 
      code: error.code, 
      stack: error.stack,
      name: error.name 
    });
    return res.status(500).json({ 
      error: 'Failed to send invitation email',
      details: error.message 
    });
  }
});
