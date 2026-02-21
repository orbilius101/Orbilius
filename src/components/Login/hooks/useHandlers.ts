import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../../firebaseConfig';
import { getDocument, getDocuments, buildConstraints } from '../../../utils/firebaseHelpers';
import { LoginData, LoginHandlers } from '../../../types';

export function useLoginHandlers(data: LoginData): LoginHandlers {
  const { email, password, setLoading, setResetLoading, navigate, showAlert } = data;

  const signIn = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user data from Firestore to determine role
      const { data: userData, error: userError } = await getDocument('users', user.uid);

      if (userError || !userData) {
        showAlert(
          'Login succeeded, but user profile was not found. Please contact your administrator.',
          'Profile Not Found'
        );
        setLoading(false);
        return;
      }

      const role = (userData as any).user_type;

      // Check if email is verified (skip for admin users)
      if (!user.emailVerified && role !== 'admin') {
        showAlert(
          'Your email address has to be confirmed before using Orbilius. Check your inbox for a confirmation email and verify your email before logging in to Orbilius',
          'Email Not Confirmed'
        );
        setLoading(false);
        return;
      }

      if (!role) {
        showAlert(
          'Login succeeded, but role was not found on the account. Please contact your teacher/admin to set your role.',
          'Role Not Found'
        );
        setLoading(false);
        return;
      }

      console.log('User role:', role); // Debug log

      if (role === 'student') {
        // Check if student has any projects
        const { data: projectData, error: projectError } = await getDocuments(
          'projects',
          buildConstraints({
            eq: { student_id: user.uid },
            limit: 1,
          })
        );

        if (projectError) {
          showAlert('Error checking projects: ' + projectError.message, 'Error');
          setLoading(false);
          return;
        }

        // If no projects found, redirect to create project screen
        if (!projectData || (projectData as any[]).length === 0) {
          navigate('/createProject');
        } else {
          navigate('/student/dashboard');
        }
      } else if (role === 'teacher') {
        navigate('/teacher/dashboard');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        showAlert('Unknown role', 'Error');
      }
    } catch (error: any) {
      // Handle Firebase auth errors
      let errorMessage = error.message;
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      }
      showAlert(errorMessage, 'Login Error');
    }

    setLoading(false);
  };

  const resetPassword = async () => {
    if (!email) {
      showAlert('Please enter your email address first.', 'Email Required');
      return;
    }

    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/reset-password`,
      });
      showAlert('Password reset email sent! Check your inbox for instructions.', 'Success');
    } catch (error: any) {
      showAlert('Error sending reset email: ' + error.message, 'Error');
    }

    setResetLoading(false);
  };

  return {
    signIn,
    handleLogin: signIn,
    resetPassword,
  };
}
