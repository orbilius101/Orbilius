import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../../../firebaseConfig';
import { getDocument, createDocument } from '../../../utils/firebaseHelpers';
import { SignupData, SignupHandlers } from '../../../types';

export function useSignupHandlers(
  data: SignupData & { setShowEmailModal?: (show: boolean) => void }
): SignupHandlers {
  const {
    email,
    password,
    role,
    teacherId,
    adminCode,
    firstName,
    lastName,
    setLoading,
    navigate,
    showAlert,
    setShowEmailModal,
  } = data;

  async function handleSignUp() {
    setLoading(true);

    if (!role) {
      showAlert('Please choose a role before creating your account.', 'Role Required');
      setLoading(false);
      return;
    }

    // Validate admin code for teachers by fetching from database
    if (role === 'teacher') {
      try {
        const { data: adminCodeData, error: adminCodeError } = await getDocument('admin_code', '1');

        if (adminCodeError) {
          showAlert('Error validating admin code. Please try again.', 'Error');
          setLoading(false);
          return;
        }

        if (!adminCodeData || adminCode !== (adminCodeData as any).code) {
          showAlert(
            'Invalid Orbilius Admin Code. Please contact your administrator for the correct code.',
            'Invalid Code'
          );
          setLoading(false);
          return;
        }
      } catch {
        showAlert('Error validating admin code. Please try again.', 'Error');
        setLoading(false);
        return;
      }
    }

    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });

      // Create user profile in Firestore
      await createDocument(
        'users',
        {
          id: user.uid,
          email: user.email,
          user_type: role,
          teacher_id: role === 'student' && teacherId ? teacherId : null,
          first_name: firstName,
          last_name: lastName,
          created_at: new Date().toISOString(),
        },
        user.uid
      );

      // Send email verification
      await sendEmailVerification(user);

      setLoading(false);
      if (setShowEmailModal) {
        setShowEmailModal(true);
      } else {
        showAlert('Sign-up successful. Check your email to confirm your account.', 'Success');
        navigate('/login');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      showAlert(error.message || 'An error occurred during signup', 'Signup Error');
      setLoading(false);
    }
  }

  return {
    handleSignUp,
    handleSignup: handleSignUp,
  };
}
