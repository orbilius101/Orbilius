import { useEffect } from 'react';
import { onAuthStateChanged, confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../../../firebaseConfig';

export function useResetPasswordHandlers(data: any) {
  const { password, confirmPassword, setLoading, setError, navigate, showAlert } = data;

  useEffect(() => {
    // Check if user is in password reset mode by checking URL for oobCode
    const urlParams = new URLSearchParams(window.location.search);
    const oobCode = urlParams.get('oobCode');

    if (oobCode) {
      // Verify the reset code is valid
      verifyPasswordResetCode(auth, oobCode)
        .then(() => {
          console.log('Password reset code verified');
        })
        .catch((error) => {
          console.error('Invalid or expired reset code:', error);
          showAlert(
            'This password reset link is invalid or has expired. Please request a new one.',
            'Error'
          );
          navigate('/login');
        });
    } else {
      // No reset code in URL, redirect to login
      showAlert('No password reset code found. Please use the link from your email.', 'Error');
      navigate('/login');
    }
  }, [navigate, showAlert]);

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

    try {
      // Get the reset code from URL
      const urlParams = new URLSearchParams(window.location.search);
      const oobCode = urlParams.get('oobCode');

      if (!oobCode) {
        setError('No password reset code found. Please use the link from your email.');
        setLoading(false);
        return;
      }

      // Confirm the password reset
      await confirmPasswordReset(auth, oobCode, password);

      showAlert(
        'Password updated successfully! You can now log in with your new password.',
        'Success'
      );
      navigate('/login');
    } catch (error: any) {
      let errorMessage = 'Error updating password: ' + error.message;
      if (error.code === 'auth/expired-action-code') {
        errorMessage = 'This password reset link has expired. Please request a new one.';
      } else if (error.code === 'auth/invalid-action-code') {
        errorMessage = 'This password reset link is invalid. Please request a new one.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      }
      setError(errorMessage);
      setLoading(false);
    }
  };

  return {
    updatePassword,
  };
}
