import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from './supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();

  const signIn = async () => {
    // eslint-disable-next-line no-debugger
    debugger;
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    // Get role from user_metadata (set during sign-up)
    const role = data.user?.user_metadata?.role;

    if (!role) {
      alert(
        'Login succeeded, but role was not found on the account. Please contact your teacher/admin to set your role.'
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
        .eq('student_id', data.user.id)
        .limit(1);

      if (projectError) {
        alert('Error checking projects: ' + projectError.message);
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
      alert('Unknown role');
    }

    setLoading(false);
  };

  const resetPassword = async () => {
    if (!email) {
      alert('Please enter your email address first.');
      return;
    }

    setResetLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      alert('Error sending reset email: ' + error.message);
    } else {
      alert('Password reset email sent! Check your inbox for instructions.');
    }

    setResetLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Log In</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <button
          onClick={signIn}
          disabled={loading}
          style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        <button
          onClick={resetPassword}
          disabled={resetLoading || !email}
          style={{
            ...styles.resetButton,
            ...(resetLoading || !email ? styles.resetButtonDisabled : {}),
          }}
        >
          {resetLoading ? 'Sending...' : 'Forgot Password?'}
        </button>

        <p style={styles.text}>
          Don't have an account?{' '}
          <Link to="/signup" style={styles.link}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  title: {
    marginBottom: '1.5rem',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginBottom: '1rem',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  resetButton: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: 'transparent',
    color: '#007bff',
    border: '1px solid #007bff',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginBottom: '1rem',
    transition: 'all 0.2s',
  },
  resetButtonDisabled: {
    backgroundColor: '#f8f9fa',
    color: '#ccc',
    borderColor: '#ccc',
    cursor: 'not-allowed',
  },
  text: {
    margin: 0,
    color: '#666',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
  },
};
