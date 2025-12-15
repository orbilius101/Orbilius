import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import { useAlert } from '../../../hooks/useAlert';

export function useCreateProjectData() {
  const [projectTitle, setProjectTitle] = useState('');
  const [grade, setGrade] = useState('');
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const { alertState, showAlert, closeAlert } = useAlert();

  useEffect(() => {
    const fetchUserAndInfo = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        navigate('/login');
        return;
      }

      const user = session.user;

      setUserData({
        id: user.id,
        email: user.email,
        first_name: user.user_metadata.first_name,
        last_name: user.user_metadata.last_name,
        teacher_id: user.user_metadata.teacher_id,
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
