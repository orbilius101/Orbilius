// src/admin/api/adminApi.ts
import { auth, db, storage } from '../../firebaseConfig';
import {
  getDocument,
  getDocuments,
  updateDocument,
  buildConstraints,
} from '../../utils/firebaseHelpers';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { CLOUD_FUNCTIONS } from '../../config/functions';

// AUTH / ROLE
export async function getCurrentUser() {
  return auth.currentUser;
}
export async function getUserRole(userId: string) {
  return getDocument('users', userId);
}

// ADMIN CODE
export async function fetchAdminCodeRows() {
  // In Firebase, admin_code is a single document with ID '1'
  const { data, error } = await getDocument('admin_code', '1');
  if (error) return { data: null, error };
  // Add id field to match expected structure
  return { data: data ? [{ ...data, id: 1 }] : [], error: null };
}
export async function updateAdminCodeById(id: string, code: string) {
  // Update the admin_code document
  return updateDocument('admin_code', '1', { code });
}

// PROJECTS
export async function fetchPendingProjects() {
  try {
    // Query projects where submitted_to_orbilius=true and approved_by_orbilius=false
    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef,
      where('submitted_to_orbilius', '==', true),
      where('approved_by_orbilius', '==', false)
    );

    const snapshot = await getDocs(q);
    const projects = [];

    for (const doc of snapshot.docs) {
      const projectData = { ...doc.data(), project_id: doc.id };

      // Get user data
      const { data: userData } = await getDocument('users', (projectData as any).student_id);

      // Get step 5 data
      const { data: step5Array } = await getDocuments(
        'project_steps',
        buildConstraints({
          eq: { project_id: doc.id, step_number: 5, status: 'Approved' },
        })
      );

      if (step5Array && (step5Array as any[]).length > 0) {
        projects.push({
          ...projectData,
          users: userData,
          project_steps: step5Array,
        });
      }
    }

    return { data: projects, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}
export async function fetchStep5Submission(projectId: string) {
  const { data, error } = await getDocuments(
    'project_steps',
    buildConstraints({
      eq: { project_id: projectId, step_number: 5 },
      limit: 1,
    })
  );

  if (error) return { data: null, error };
  return { data: (data as any[])?.[0] || null, error: null };
}
export async function setProjectApproval(projectId: string, approved: boolean, comments: string) {
  return updateDocument('projects', projectId, {
    approved_by_orbilius: approved,
    orbilius_comments: comments || null,
  });
}
export async function revertStep5(projectId: string, comments: string) {
  const { data: stepsArray } = await getDocuments(
    'project_steps',
    buildConstraints({
      eq: { project_id: projectId, step_number: 5 },
    })
  );

  if (!stepsArray || !(stepsArray as any[]).length) {
    return { data: null, error: new Error('Step 5 not found') };
  }

  const stepId = (stepsArray as any[])[0].id;
  return updateDocument('project_steps', stepId, {
    status: 'In Progress',
    teacher_comments: comments || 'Project needs revision before Orbilius certification.',
  });
}

// STORAGE
export async function downloadProjectFile(filePath: string) {
  try {
    const storageRef = ref(storage, `project-files/${filePath}`);
    const url = await getDownloadURL(storageRef);

    // Download the file
    const response = await fetch(url);
    const blob = await response.blob();

    return { data: blob, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

// TEACHERS
export async function fetchTeachers() {
  try {
    // Fetch all users and filter client-side to avoid index requirement
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const teachers = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((user: any) => user.user_type === 'teacher')
      .sort((a: any, b: any) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime; // Descending order
      });
    
    return { data: teachers, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

export async function deleteTeacher(teacherId: string) {
  // Call Firebase Cloud Function to delete teacher and students
  try {
    const response = await fetch(CLOUD_FUNCTIONS.deleteTeacher, {
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
  } catch (error: any) {
    console.error('Error calling deleteTeacher API:', error);
    return { data: null, error: error.message || 'Failed to delete teacher' };
  }
}

export async function deleteStudent(studentId: string) {
  // Call Firebase Cloud Function to delete student
  try {
    const response = await fetch(CLOUD_FUNCTIONS.deleteStudent, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ studentId }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { data: null, error: result.error || 'Failed to delete student' };
    }

    return { data: result, error: null };
  } catch (error: any) {
    console.error('Error calling deleteStudent API:', error);
    return { data: null, error: error.message || 'Failed to delete student' };
  }
}

// AUTH SIGN-OUT
export async function signOut() {
  await firebaseSignOut(auth);
}
