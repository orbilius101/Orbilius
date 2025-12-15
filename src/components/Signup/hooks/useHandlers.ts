import { supabase } from '../../../supabaseClient';
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
        const { data: adminCodeData, error: adminCodeError } = await supabase
          .from('admin_code')
          .select('code')
          .eq('id', 1);

        if (adminCodeError) {
          showAlert('Error validating admin code. Please try again.', 'Error');
          setLoading(false);
          return;
        }

        if (!adminCodeData || adminCodeData.length === 0 || adminCode !== adminCodeData[0].code) {
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

    // Determine redirect URL based on environment
    const redirectTo = window.location.origin;

    // Sign up with Supabase Auth, storing profile fields in user_metadata
    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          role,
          teacher_id: role === 'student' && teacherId ? teacherId : null,
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      showAlert(error.message, 'Signup Error');
      setLoading(false);
      return;
    }

    // Verify metadata exists on the created account (v2.53.0)
    try {
      const { data: getUserRes, error: getUserErr } = await supabase.auth.getUser();
      if (!getUserErr && getUserRes?.user) {
        const existingMeta = getUserRes.user.user_metadata || {};
        const desiredMeta = {
          role,
          teacher_id: role === 'student' && teacherId ? teacherId : null,
          first_name: firstName,
          last_name: lastName,
        };

        const needsUpdate =
          existingMeta.role !== desiredMeta.role ||
          existingMeta.teacher_id !== desiredMeta.teacher_id ||
          existingMeta.first_name !== desiredMeta.first_name ||
          existingMeta.last_name !== desiredMeta.last_name;

        if (needsUpdate) {
          const { error: updateErr } = await supabase.auth.updateUser({ data: desiredMeta });
          if (updateErr) {
            console.warn('Failed to backfill user_metadata:', updateErr);
          }
        }
      }
    } catch (e) {
      console.warn('Metadata verification failed:', e);
    }

    // Guard if user is null (e.g. email confirmation required)
    if (!signUpData.user) {
      setLoading(false);
      if (setShowEmailModal) {
        setShowEmailModal(true);
      } else {
        showAlert('Sign-up successful. Check your email to confirm your account.', 'Success');
        navigate('/login');
      }
      return;
    }

    // Show confirmation modal or alert
    setLoading(false);
    if (setShowEmailModal) {
      setShowEmailModal(true);
    } else {
      showAlert('Sign-up successful. Check your email to confirm.', 'Success');
      navigate('/login');
    }
  }

  return {
    handleSignUp,
    handleSignup: handleSignUp,
  };
}
