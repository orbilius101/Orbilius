// src/admin/api/adminApi.js
import { supabase } from "../../supabaseClient";

// AUTH / ROLE
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
export async function getUserRole(userId) {
  return supabase.from("users").select("role").eq("id", userId).single();
}

// ADMIN CODE
export async function fetchAdminCodeRows() {
  return supabase.from("admin_code").select("*");
}
export async function updateAdminCodeById(id, code) {
  return supabase
    .from("admin_code")
    .update({ orbilius_admin_code: code })
    .eq("id", id)
    .select();
}

// PROJECTS
export async function fetchPendingProjects() {
  return supabase
    .from("projects")
    .select(
      `
      *,
      users!projects_student_id_fkey(email, first_name, last_name),
      project_steps!inner(step_number, status, file_path)
    `
    )
    .eq("submitted_to_orbilius", true)
    .eq("approved_by_orbilius", false)
    .eq("project_steps.step_number", 5)
    .eq("project_steps.status", "Approved");
}
export async function fetchStep5Submission(projectId) {
  return supabase
    .from("project_steps")
    .select("file_path, youtube_link, teacher_comments")
    .eq("project_id", projectId)
    .eq("step_number", 5)
    .single();
}
export async function setProjectApproval(projectId, approved, comments) {
  return supabase
    .from("projects")
    .update({
      approved_by_orbilius: approved,
      orbilius_comments: comments || null,
    })
    .eq("project_id", projectId);
}
export async function revertStep5(projectId, comments) {
  return supabase
    .from("project_steps")
    .update({
      status: "In Progress",
      teacher_comments:
        comments || "Project needs revision before Orbilius certification.",
    })
    .eq("project_id", projectId)
    .eq("step_number", 5);
}

// STORAGE
export async function downloadProjectFile(filePath) {
  return supabase.storage.from("project-files").download(filePath);
}

// AUTH SIGN-OUT
export async function signOut() {
  await supabase.auth.signOut();
}
