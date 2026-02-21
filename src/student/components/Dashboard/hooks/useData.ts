import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../../firebaseConfig';
import { getDocuments, buildConstraints } from '../../../../utils/firebaseHelpers';
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
        const currentUser = auth.currentUser;

        if (!currentUser) {
          navigate('/login');
          return;
        }

        setUser(currentUser);

        // Get user profile from custom claims or display name
        const profile = {
          first_name: currentUser.displayName?.split(' ')[0] || 'Unknown',
          last_name: currentUser.displayName?.split(' ').slice(1).join(' ') || 'User',
        };

        setUserProfile(profile);
        console.log('User loaded:', currentUser.email, profile); // Debug log

        // Fetch project for the student
        const { data: projectData, error: projectError } = await getDocuments(
          'projects',
          buildConstraints({ eq: { student_id: currentUser.uid }, limit: 1 })
        );

        if (projectError) {
          console.error('Error fetching project:', projectError.message);
        } else if (projectData && projectData.length > 0) {
          setProject(projectData[0]);
          setEditedTitle(projectData[0]?.project_title || '');
        }
      } catch (err) {
        console.error('Error in fetchUserAndProfile:', err);
        // Still set basic user data even if there's an error
        const currentUser = auth.currentUser;

        if (currentUser) {
          setUser(currentUser);
          setUserProfile({
            first_name: currentUser.displayName?.split(' ')[0] || 'Unknown',
            last_name: currentUser.displayName?.split(' ').slice(1).join(' ') || 'User',
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
