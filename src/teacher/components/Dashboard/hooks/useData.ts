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

  useEffect(() => {
    const fetchUserAndProjects = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        navigate('/login');
        return;
      }

      setUser(currentUser as any);

      // Fetch user profile
      const { data: profile, error: profileError } = await getDocument('users', currentUser.uid);

      console.log('Teacher Dashboard - Fetching profile for user ID:', currentUser.uid);
      console.log('Teacher Dashboard - Profile data:', profile);
      console.log('Teacher Dashboard - Profile error:', profileError);

      if (profileError) {
        console.error('Error fetching user profile:', profileError.message);
      } else {
        setUserProfile(profile);
      }

      // Fetch all projects assigned to this teacher with student email
      const { data: projectsData, error: projectsError } = await getDocuments(
        'projects',
        buildConstraints({
          eq: { teacher_id: currentUser.uid },
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
              student: studentData,
            };
          })
        );

        setProjects(projectsWithStudents);
      }
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
  };
}
