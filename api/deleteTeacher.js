// Vercel serverless function to delete teacher and students
// This requires service role key to delete from auth.users
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { teacherId } = req.body;

  if (!teacherId) {
    return res.status(400).json({ error: 'Teacher ID is required' });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Supabase environment variables not configured' });
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
      return res.status(500).json({
        error: 'Failed to delete teacher from database',
        details: dbError,
      });
    }

    // Delete from auth.users (requires service role key)
    const authResults = { students: [], teacher: null };

    // Delete student auth accounts
    if (students && students.length > 0) {
      for (const student of students) {
        try {
          const { error: authError } = await supabase.auth.admin.deleteUser(student.id);
          authResults.students.push({
            id: student.id,
            success: !authError,
            error: authError,
          });
        } catch (err) {
          authResults.students.push({
            id: student.id,
            success: false,
            error: err.message,
          });
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
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
}
