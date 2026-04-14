import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../../../firebaseConfig';
import {
  getDocument,
  createDocument,
  getDocuments,
  buildConstraints,
  deleteDocument,
} from '../../../utils/firebaseHelpers';
import { SignupData, SignupHandlers } from '../../../types';

export function useSignupHandlers(
  data: SignupData & {
    setShowEmailModal?: (show: boolean) => void;
    invitationData?: any;
  }
): SignupHandlers {
  const {
    email,
    password,
    role,
    teacherId,
    firstName,
    lastName,
    setLoading,
    navigate,
    showAlert,
    setShowEmailModal,
    invitationData,
  } = data;

  async function handleSignUp() {
    setLoading(true);

    if (!role) {
      showAlert('Please choose a role before creating your account.', 'Role Required');
      setLoading(false);
      return;
    }

    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const isInvitationSignup = invitationData !== null && invitationData !== undefined;

      // Update profile — non-critical, don't rollback on failure
      try {
        await updateProfile(user, {
          displayName: `${firstName} ${lastName}`,
        });
      } catch (profileError) {
        console.error('Failed to update profile display name:', profileError);
      }

      // Create user profile in Firestore — critical step, rollback Auth user on failure
      try {
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
            verified_via_invitation: isInvitationSignup ? true : false,
          },
          user.uid
        );
      } catch (firestoreError) {
        // Firestore doc failed — delete the Auth user so they can retry
        console.error('Failed to create Firestore user doc, rolling back Auth user:', firestoreError);
        try {
          await deleteUser(user);
        } catch (deleteError) {
          console.error('Failed to rollback Auth user:', deleteError);
        }
        throw new Error('Account creation failed. Please try again.');
      }

      // Send email verification for non-invitation signups — non-critical
      if (!isInvitationSignup) {
        try {
          await sendEmailVerification(user);
        } catch (verifyError) {
          console.error('Failed to send verification email:', verifyError);
        }
      }

      // Delete the pending invitation after successful signup — non-critical
      if (isInvitationSignup) {
        try {
          if (invitationData && invitationData.id) {
            await deleteDocument('pending_invitations', invitationData.id);
          } else {
            const { data: pendingInvites } = await getDocuments(
              'pending_invitations',
              buildConstraints({
                eq: { email: user.email, role, status: 'pending' },
              })
            );

            if (pendingInvites && pendingInvites.length > 0) {
              await deleteDocument('pending_invitations', pendingInvites[0].id);
            }
          }
        } catch (error) {
          console.error('Error deleting pending invitation:', error);
        }
      }

      setLoading(false);

      // Redirect based on signup type
      if (isInvitationSignup) {
        if (role === 'student') {
          try {
            const { data: projectData } = await getDocuments(
              'projects',
              buildConstraints({
                eq: { student_id: user.uid },
                limit: 1,
              })
            );

            if (!projectData || (projectData as any[]).length === 0) {
              navigate('/createProject');
            } else {
              navigate('/student/dashboard');
            }
          } catch {
            // Project check failed — account is created, just go to dashboard
            navigate('/student/dashboard');
          }
        } else if (role === 'teacher') {
          navigate('/teacher/dashboard');
        } else {
          navigate('/login');
        }
      } else {
        if (setShowEmailModal) {
          setShowEmailModal(true);
        } else {
          showAlert('Sign-up successful. Check your email to confirm your account.', 'Success');
          navigate('/login');
        }
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
