import { useEffect } from 'react';
import { applyActionCode, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../firebaseConfig';
import { getDocument } from '../../../utils/firebaseHelpers';

export function useConfirmEmailHandlers(data: any) {
  const { searchParams, navigate, setLoading, setError, setSuccess } = data;

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the action code from URL parameters (Firebase uses 'oobCode')
        const oobCode = searchParams.get('oobCode');
        const mode = searchParams.get('mode');

        if (mode === 'verifyEmail' && oobCode) {
          // This is an email confirmation
          try {
            await applyActionCode(auth, oobCode);
            setSuccess(true);
            setLoading(false);

            // Wait for user to be loaded, then navigate based on role
            setTimeout(async () => {
              const user = auth.currentUser;
              if (user) {
                const { data: userData } = await getDocument('users', user.uid);
                const role = (userData as any)?.user_type;

                if (role === 'teacher') {
                  navigate('/teacher/dashboard');
                } else if (role === 'student') {
                  navigate('/student/dashboard');
                } else if (role === 'admin') {
                  navigate('/admin/dashboard');
                } else {
                  navigate('/login');
                }
              } else {
                navigate('/login');
              }
            }, 2000);
          } catch (error: any) {
            setError('Invalid or expired confirmation link.');
            setLoading(false);
          }
        } else {
          // Check if user is already logged in
          onAuthStateChanged(auth, async (user) => {
            if (user && user.emailVerified) {
              const { data: userData } = await getDocument('users', user.uid);
              const role = (userData as any)?.user_type;

              if (role === 'teacher') {
                navigate('/teacher/dashboard');
              } else if (role === 'student') {
                navigate('/student/dashboard');
              } else if (role === 'admin') {
                navigate('/admin/dashboard');
              } else {
                navigate('/login');
              }
            } else {
              navigate('/login');
            }
          });
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
