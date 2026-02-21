// src/admin/hooks/useAuthAdmin.js
import { useEffect, useState } from 'react';
import { getCurrentUser } from '../api/adminApi';
import { getDocument } from '../../utils/firebaseHelpers';
import { useNavigate } from 'react-router-dom';

export function useAuthAdmin(showAlert: (message: string, title?: string) => void) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      if (!u) {
        navigate('/login');
        return;
      }
      
      // Get user role from Firestore
      const { data: userData } = await getDocument('users', u.uid);
      const role = (userData as any)?.user_type;
      
      if (role !== 'admin') {
        showAlert('Access denied. Admin privileges required.', 'Error');
        navigate('/login');
        return;
      }
      setUser(u);
      setLoadingAuth(false);
    })();
  }, [navigate, showAlert]);

  return { user, loadingAuth };
}
