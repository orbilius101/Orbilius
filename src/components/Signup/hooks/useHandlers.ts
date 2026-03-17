import {
  createUserWithEmailAndPassword,
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

      // Update profile with display name
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });

      // Check if this is an invitation signup
      const isInvitationSignup = invitationData !== null && invitationData !== undefined;

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
          verified_via_invitation: isInvitationSignup ? true : false,
        },
        user.uid
      );

      // Only send email verification if this is NOT an invitation signup
      // (invitation signups already confirmed email by clicking the link)
      if (!isInvitationSignup) {
        await sendEmailVerification(user);
      }

      // Delete the pending invitation after successful signup
      if (isInvitationSignup) {
        try {
          // If we have invitation data, delete it directly
          if (invitationData && invitationData.id) {
            await deleteDocument('pending_invitations', invitationData.id);
            console.log('Deleted pending invitation:', invitationData.id);
          } else {
            // Fallback: search for pending invitation by email
            const { data: pendingInvites } = await getDocuments(
              'pending_invitations',
              buildConstraints({
                eq: { email: user.email, role, status: 'pending' },
              })
            );

            if (pendingInvites && pendingInvites.length > 0) {
              await deleteDocument('pending_invitations', pendingInvites[0].id);
              console.log('Deleted pending invitation for', user.email);
            }
          }
        } catch (error) {
          // Don't fail signup if we can't delete the pending invitation
          console.error('Error deleting pending invitation:', error);
        }
      }

      setLoading(false);

      // Different messaging based on whether email verification was sent
      if (isInvitationSignup) {
        // For invitation signups, user is already verified - redirect to dashboard
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
            showAlert('Account created! Redirecting to dashboard...', 'Success');
            navigate('/student/dashboard');
          } else if (!projectData || (projectData as any[]).length === 0) {
            // No projects found, redirect to create project screen
            navigate('/createProject');
          } else {
            navigate('/student/dashboard');
          }
        } else if (role === 'teacher') {
          navigate('/teacher/dashboard');
        } else {
          // Fallback
          navigate('/login');
        }
      } else {
        // For non-invitation signups, require email verification
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
