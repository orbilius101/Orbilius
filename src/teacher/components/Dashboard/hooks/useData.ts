import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../../firebaseConfig';
import { getDocument, getDocuments, buildConstraints } from '../../../../utils/firebaseHelpers';
import { useAlert } from '../../../../hooks/useAlert';

export function useDashboardData() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const { alertState, showAlert, closeAlert } = useAlert();

  const fetchProjects = async (teacherId: string) => {
    // Fetch all projects assigned to this teacher with student email
    const { data: projectsData, error: projectsError } = await getDocuments(
      'projects',
      buildConstraints({
        eq: { teacher_id: teacherId },
        orderBy: { field: 'created_at', direction: 'desc' },
      })
    );

    if (projectsError) {
      console.error('Error fetching projects:', projectsError.message);
      setProjects([]);
    } else {
      // Fetch student details for each project
      const projectsWithStudents = await Promise.all(
        ((projectsData as any[]) || []).map(async (project) => {
          const { data: studentData } = await getDocument('users', project.student_id);

          return {
            ...project,
            project_id: project.id, // Map Firestore document ID to project_id
            student: studentData,
          };
        })
      );

      setProjects(projectsWithStudents);
    }
  };

  useEffect(() => {
    const fetchUserAndProjects = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        navigate('/login');
        return;
      }

      setUser(currentUser as any);

      // Check if admin is impersonating a teacher
      const impersonatingTeacherId = sessionStorage.getItem('impersonating_teacher_uid');
      const effectiveUserId = impersonatingTeacherId || currentUser.uid;

      console.log('Impersonating teacher ID:', impersonatingTeacherId);
      console.log('Effective user ID for data fetch:', effectiveUserId);

      // Fetch user profile (use impersonated teacher's profile if applicable)
      const { data: profile, error: profileError } = await getDocument('users', effectiveUserId);

      console.log('Teacher Dashboard - Fetching profile for user ID:', effectiveUserId);
      console.log('Teacher Dashboard - Profile data:', profile);
      console.log('Teacher Dashboard - Profile error:', profileError);

      if (profileError) {
        console.error('Error fetching user profile:', profileError.message);
      } else {
        setUserProfile(profile);
      }

      await fetchProjects(effectiveUserId);
    };

    fetchUserAndProjects();
  }, [navigate]);

  return {
    user,
    userProfile,
    projects,
    navigate,
    alertState,
    showAlert,
    closeAlert,
    refreshProjects: fetchProjects,
  };
}
