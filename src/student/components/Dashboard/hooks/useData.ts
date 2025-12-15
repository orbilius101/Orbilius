import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../supabaseClient';
import { useAlert } from '../../../../hooks/useAlert';

export function useDashboardData() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [project, setProject] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editingDueDate, setEditingDueDate] = useState(null);
  const [editedDueDate, setEditedDueDate] = useState('');
  const navigate = useNavigate();
  const { alertState, showAlert, closeAlert } = useAlert();

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
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

        // Get user profile from metadata instead of separate table
        const profile = {
          first_name: user.user_metadata?.first_name || 'Unknown',
          last_name: user.user_metadata?.last_name || 'User',
        };

        setUserProfile(profile);
        console.log('User loaded:', user.email, profile); // Debug log

        // Fetch project for the student
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('student_id', user.id)
          .single();

        if (projectError) {
          console.error('Error fetching project:', projectError.message);
        } else {
          setProject(projectData);
          setEditedTitle(projectData?.project_title || '');
        }
      } catch (err) {
        console.error('Error in fetchUserAndProfile:', err);
        // Still set basic user data even if there's an error
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          setUserProfile({
            first_name: session.user.user_metadata?.first_name || 'Unknown',
            last_name: session.user.user_metadata?.last_name || 'User',
          });
        }
      }
    };

    fetchUserAndProfile();
  }, [navigate]);

  return {
    user,
    userProfile,
    project,
    setProject,
    isEditingTitle,
    setIsEditingTitle,
    editedTitle,
    setEditedTitle,
    editingDueDate,
    setEditingDueDate,
    editedDueDate,
    setEditedDueDate,
    navigate,
    alertState,
    showAlert,
    closeAlert,
  };
}
