import { supabase } from '../../../supabaseClient';
import { LoginData, LoginHandlers } from '../../../types';

export function useLoginHandlers(data: LoginData): LoginHandlers {
  const { email, password, setLoading, setResetLoading, navigate, showAlert } = data;

  const signIn = async () => {
    setLoading(true);
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      showAlert(error.message, 'Login Error');
      setLoading(false);
      return;
    }

    // Get role from user_metadata (set during sign-up)
    const role = authData.user?.user_metadata?.role;

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
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('project_id')
        .eq('student_id', authData.user.id)
        .limit(1);

      if (projectError) {
        showAlert('Error checking projects: ' + projectError.message, 'Error');
        setLoading(false);
        return;
      }

      // If no projects found, redirect to create project screen
      if (!projectData || projectData.length === 0) {
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

    setLoading(false);
  };

  const resetPassword = async () => {
    if (!email) {
      showAlert('Please enter your email address first.', 'Email Required');
      return;
    }

    setResetLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      showAlert('Error sending reset email: ' + error.message, 'Error');
    } else {
      showAlert('Password reset email sent! Check your inbox for instructions.', 'Success');
    }

    setResetLoading(false);
  };

  return {
    signIn,
    handleLogin: signIn,
    resetPassword,
  };
}
