// src/admin/api/adminApi.js
import { supabase } from '../../supabaseClient';

// AUTH / ROLE
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
export async function getUserRole(userId) {
  return supabase.from('users').select('role').eq('id', userId).single();
}

// ADMIN CODE
export async function fetchAdminCodeRows() {
  return supabase.from('admin_code').select('*');
}
export async function updateAdminCodeById(id, code) {
  // Use the database function to bypass RLS
  const { data, error } = await supabase.rpc('update_admin_code', { new_code: code });

  return { data, error };
}

// PROJECTS
export async function fetchPendingProjects() {
  return supabase
    .from('projects')
    .select(
      `
      *,
      users!projects_student_id_fkey(email, first_name, last_name),
      project_steps!inner(step_number, status, file_path)
    `
    )
    .eq('submitted_to_orbilius', true)
    .eq('approved_by_orbilius', false)
    .eq('project_steps.step_number', 5)
    .eq('project_steps.status', 'Approved');
}
export async function fetchStep5Submission(projectId) {
  return supabase
    .from('project_steps')
    .select('file_path, youtube_link, teacher_comments')
    .eq('project_id', projectId)
    .eq('step_number', 5)
    .single();
}
export async function setProjectApproval(projectId, approved, comments) {
  return supabase
    .from('projects')
    .update({
      approved_by_orbilius: approved,
      orbilius_comments: comments || null,
    })
    .eq('project_id', projectId);
}
export async function revertStep5(projectId, comments) {
  return supabase
    .from('project_steps')
    .update({
      status: 'In Progress',
      teacher_comments: comments || 'Project needs revision before Orbilius certification.',
    })
    .eq('project_id', projectId)
    .eq('step_number', 5);
}

// STORAGE
export async function downloadProjectFile(filePath) {
  return supabase.storage.from('project-files').download(filePath);
}

// TEACHERS
export async function fetchTeachers() {
  return supabase
    .from('users')
    .select('id, email, first_name, last_name, created_at')
    .eq('user_type', 'teacher')
    .order('created_at', { ascending: false });
}

export async function deleteTeacher(teacherId: string) {
  // Call the backend API endpoint to delete teacher and students
  // This endpoint has access to the service role key and can delete from auth.users
  const apiUrl = import.meta.env.DEV
    ? 'http://localhost:4000/api/deleteTeacher'
    : '/api/deleteTeacher';

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ teacherId }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { data: null, error: result.error || 'Failed to delete teacher' };
    }

    return { data: result, error: null };
  } catch (error) {
    console.error('Error calling deleteTeacher API:', error);
    return { data: null, error: error.message || 'Failed to delete teacher' };
  }
}

// AUTH SIGN-OUT
export async function signOut() {
  await supabase.auth.signOut();
}
