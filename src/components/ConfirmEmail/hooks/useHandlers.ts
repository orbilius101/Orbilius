import { useEffect } from 'react';
import { supabase } from '../../../supabaseClient';

export function useConfirmEmailHandlers(data: any) {
  const { searchParams, navigate, setLoading, setError, setSuccess } = data;

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the tokens from URL parameters
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        if (type === 'signup' && token) {
          // This is an email confirmation
          const { data: authData, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup',
          });

          if (error) {
            setError('Invalid or expired confirmation link.');
            setLoading(false);
            return;
          }

          if (authData.user) {
            setSuccess(true);
            setLoading(false);

            // Force reload to refresh session after confirmation
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        } else {
          // Handle other auth events
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user) {
            const role = session.user.user_metadata?.role;
            if (role === 'teacher') {
              navigate('/teacher/dashboard');
            } else if (role === 'student') {
              navigate('/student/dashboard');
            } else {
              navigate('/login');
            }
          } else {
            navigate('/login');
          }
        }
      } catch (err) {
        console.error('Email confirmation error:', err);
        setError('An error occurred during email confirmation.');
        setLoading(false);
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate, setLoading, setError, setSuccess]);

  return {};
}
