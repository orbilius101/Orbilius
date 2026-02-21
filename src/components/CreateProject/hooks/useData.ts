import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../firebaseConfig';
import { getDocument } from '../../../utils/firebaseHelpers';
import { useAlert } from '../../../hooks/useAlert';

export function useCreateProjectData() {
  const [projectTitle, setProjectTitle] = useState('');
  const [grade, setGrade] = useState('');
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const { alertState, showAlert, closeAlert } = useAlert();

  useEffect(() => {
    const fetchUserAndInfo = async () => {
      const user = auth.currentUser;

      if (!user) {
        navigate('/login');
        return;
      }

      // Get user profile from Firestore
      const { data: profile } = await getDocument('users', user.uid);
      const profileData = Array.isArray(profile) ? profile[0] : profile;

      setUserData({
        id: user.uid,
        email: user.email,
        first_name: profileData?.first_name,
        last_name: profileData?.last_name,
        teacher_id: profileData?.teacher_id,
      });
    };

    fetchUserAndInfo();
  }, [navigate]);

  return {
    projectTitle,
    setProjectTitle,
    grade,
    setGrade,
    userData,
    navigate,
    showAlert,
    alertState,
    closeAlert,
  };
}
