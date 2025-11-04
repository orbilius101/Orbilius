import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../supabaseClient';
import { useAlert } from '../../../../hooks/useAlert';

export function useDashboardData() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const { alertState, showAlert, closeAlert } = useAlert();

  useEffect(() => {
    const fetchUserAndProjects = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        navigate('/login');
        return;
      }

      const user = session.user;
      setUser(user);

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError.message);
      } else {
        setUserProfile(profile);
      }

      // Fetch all projects assigned to this teacher with student email
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (projectsError) {
        console.error('Error fetching projects:', projectsError.message);
        setProjects([]);
      } else {
        // Fetch student details for each project
        const projectsWithStudents = await Promise.all(
          (projectsData || []).map(async (project) => {
            const { data: studentData } = await supabase
              .from('users')
              .select('email, first_name, last_name')
              .eq('id', project.student_id)
              .single();

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
