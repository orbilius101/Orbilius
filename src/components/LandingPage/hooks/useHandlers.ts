import { useEffect } from 'react';
import { auth } from '../../../firebaseConfig';
import { applyActionCode } from 'firebase/auth';

export function useLandingPageHandlers(data: any) {
  const { searchParams, navigate, showAlert } = data;

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      // Check if this is an email confirmation callback from Firebase
      const mode = searchParams.get('mode');
      const oobCode = searchParams.get('oobCode');

      if (mode === 'verifyEmail' && oobCode) {
        try {
          // Apply the email verification code
          await applyActionCode(auth, oobCode);
          
          showAlert('Email verified successfully! Please log in.', 'Success');
          navigate('/login');
          return;
        } catch (err) {
          console.error('Email confirmation error:', err);
          showAlert('Email confirmation failed. Please try again or contact support.', 'Error');
          return;
        }
      }

      // If not a confirmation, check current session
      const currentUser = auth.currentUser;

      if (currentUser) {
        // User is already authenticated - redirect to dashboard
        // Note: Firebase doesn't store role in user_metadata by default
        // You may need to fetch from Firestore or use custom claims
        navigate('/student/dashboard');
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate, showAlert]);

  return {};
}
