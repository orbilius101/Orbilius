import { useEffect } from 'react';
import { supabase } from '../../../supabaseClient';

export function useResetPasswordHandlers(data: any) {
  const { password, confirmPassword, setLoading, setError, navigate, showAlert } = data;

  useEffect(() => {
    // Listen for auth state changes to handle the password reset
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User has clicked the reset link and is authenticated
        console.log('Password recovery mode activated');
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const updatePassword = async () => {
    setError('');

    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError('Error updating password: ' + error.message);
      setLoading(false);
    } else {
      showAlert(
        'Password updated successfully! You can now log in with your new password.',
        'Success'
      );
      navigate('/login');
    }
  };

  return {
    updatePassword,
  };
}
