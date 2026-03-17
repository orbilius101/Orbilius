import { useEffect } from 'react';
import { auth } from '../../../firebaseConfig';
import { applyActionCode } from 'firebase/auth';
import { getDocument } from '../../../utils/firebaseHelpers';

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
        // Fetch user type from Firestore and redirect to appropriate dashboard
        const { data: userData } = await getDocument('users', currentUser.uid);
        const userType = (userData as any)?.user_type;

        if (userType === 'teacher') {
          navigate('/teacher/dashboard');
        } else if (userType === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate, showAlert]);

  return {};
}
