import { useEffect } from 'react';
import { supabase } from '../../../supabaseClient';

export function useLandingPageHandlers(data: any) {
  const { searchParams, navigate, showAlert } = data;

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      // Check if this is an email confirmation callback
      const token = searchParams.get('token');
      const type = searchParams.get('type');

      if (token && type === 'signup') {
        try {
          // Handle the email confirmation
          const { data: authData, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup',
          });

          if (error) {
            console.error('Email confirmation error:', error);
            showAlert('Email confirmation failed. Please try again or contact support.', 'Error');
            return;
          }

          if (authData.user) {
            // User successfully confirmed, redirect to appropriate dashboard
            const role = authData.user.user_metadata?.role;

            if (role === 'teacher') {
              navigate('/teacher/dashboard');
            } else if (role === 'student') {
              navigate('/student/dashboard');
            } else {
              navigate('/login');
            }
            return;
          }
        } catch (err) {
          console.error('Confirmation error:', err);
          showAlert('An error occurred during email confirmation.', 'Error');
        }
      }

      // If not a confirmation, check current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // User is already authenticated
        const role = session.user.user_metadata?.role;

        if (role === 'teacher') {
          navigate('/teacher/dashboard');
        } else if (role === 'student') {
          navigate('/student/dashboard');
        }
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate]);

  return {};
}
