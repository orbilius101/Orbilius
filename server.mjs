// Local Express server for API route testing (mimics Vercel serverless function)
// Usage: node server.mjs
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

console.log('Resend API Key loaded:', process.env.RESEND_API_KEY ? 'Yes' : 'No');
const resend = new Resend(process.env.RESEND_API_KEY);

app.post('/api/checkUserEmail', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  console.log('SUPABASE URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log(
    'SUPABASE SERVICE ROLE KEY:',
    process.env.SUPABASE_SERVICE_ROLE_KEY ? '***set***' : '***missing***'
  );
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Supabase env vars missing' });
  }
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  // Check users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (userError) return res.status(500).json({ error: 'Error checking users table' });
  console.log('userData:', userData);
  if (userData) return res.status(200).json({ exists: true });
  // Check auth.users
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  console.log('authData:', authData);
  if (authError) return res.status(500).json({ error: 'Error checking auth.users' });
  const foundUser =
    authData && authData.users
      ? authData.users.find((u) => u.email && u.email.toLowerCase() === email.toLowerCase())
      : null;
  if (foundUser) return res.status(200).json({ exists: true });
  return res.status(200).json({ exists: false });
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

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Supabase env vars missing' });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // First, get all student IDs associated with this teacher
    const { data: students } = await supabase
      .from('users')
      .select('id')
      .eq('teacher_id', teacherId)
      .eq('user_type', 'student');

    // Call the database function to delete teacher and students from users table
    const { data: dbResult, error: dbError } = await supabase.rpc('delete_teacher', {
      p_teacher_id: teacherId,
    });

    if (dbError) {
      console.error('Error deleting from database:', dbError);
      return res
        .status(500)
        .json({ error: 'Failed to delete teacher from database', details: dbError });
    }

    // Delete from auth.users (requires service role key)
    const authResults = { students: [], teacher: null };

    // Delete student auth accounts
    if (students && students.length > 0) {
      for (const student of students) {
        try {
          const { error: authError } = await supabase.auth.admin.deleteUser(student.id);
          authResults.students.push({ id: student.id, success: !authError, error: authError });
        } catch (err) {
          authResults.students.push({ id: student.id, success: false, error: err.message });
        }
      }
    }

    // Delete teacher auth account
    try {
      const { error: authError } = await supabase.auth.admin.deleteUser(teacherId);
      authResults.teacher = { success: !authError, error: authError };
    } catch (err) {
      authResults.teacher = { success: false, error: err.message };
    }

    return res.status(200).json({
      success: true,
      message: 'Teacher and students deleted',
      dbResult,
      authResults,
    });
  } catch (error) {
    console.error('Error in deleteTeacher:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Cleanup endpoint to remove orphaned auth users
app.get('/api/cleanup-auth', async (req, res) => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Supabase env vars missing' });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Get all auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      return res.status(500).json({ error: 'Failed to fetch auth users', details: authError });
    }

    // Get all users from users table
    const { data: dbUsers, error: dbError } = await supabase.from('users').select('id');
    if (dbError) {
      return res.status(500).json({ error: 'Failed to fetch users table', details: dbError });
    }

    // Find orphaned users
    const dbUserIds = new Set(dbUsers.map((u) => u.id));
    const orphanedUsers = authUsers.users.filter((authUser) => !dbUserIds.has(authUser.id));

    // Delete orphaned users
    const results = [];
    for (const user of orphanedUsers) {
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      results.push({
        email: user.email,
        id: user.id,
        success: !error,
        error: error?.message,
      });
    }

    return res.status(200).json({
      total_auth_users: authUsers.users.length,
      total_db_users: dbUsers.length,
      orphaned_count: orphanedUsers.length,
      results,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API server running on port ${PORT}`));
