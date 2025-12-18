// Vercel serverless function to delete student
// This requires service role key to delete from auth.users
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Supabase environment variables not configured' });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Call the database function to delete student from users table
    const { data: dbResult, error: dbError } = await supabase.rpc('delete_student', {
      p_student_id: studentId,
    });

    if (dbError) {
      console.error('Error deleting from database:', dbError);
      return res.status(500).json({
        error: 'Failed to delete student from database',
        details: dbError,
      });
    }

    // Delete from auth.users (requires service role key)
    let authResult = null;
    try {
      const { error: authError } = await supabase.auth.admin.deleteUser(studentId);
      authResult = { success: !authError, error: authError };
    } catch (err) {
      authResult = { success: false, error: err.message };
    }

    return res.status(200).json({
      success: true,
      message: 'Student deleted',
      dbResult,
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
