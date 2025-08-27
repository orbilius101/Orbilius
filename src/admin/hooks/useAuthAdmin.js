// src/admin/hooks/useAuthAdmin.js
import { useEffect, useState } from 'react';
import { getCurrentUser } from '../api/adminApi';
import { useNavigate } from 'react-router-dom';

export function useAuthAdmin() {
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
      // Read role from user_metadata instead of public.users table
      const role = u?.user_metadata?.role;
      if (role !== 'admin') {
        alert('Access denied. Admin privileges required.');
        navigate('/login');
        return;
      }
      setUser(u);
      setLoadingAuth(false);
    })();
  }, [navigate]);

  return { user, loadingAuth };
}
