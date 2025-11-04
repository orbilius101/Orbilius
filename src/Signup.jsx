import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [teacherId, setTeacherId] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const signUp = async () => {
    setLoading(true);

    if (!role) {
      alert('Please choose a role before creating your account.');
      setLoading(false);
      return;
    }

    // Validate admin code for teachers by fetching from database
    if (role === 'teacher') {
      try {
        const { data: adminCodeData, error: adminCodeError } = await supabase
          .from('admin_code')
          .select('code')
          .eq('id', 1)
          .single();

        if (adminCodeError) {
          alert('Error validating admin code. Please try again.');
          setLoading(false);
          return;
        }

        if (!adminCodeData || adminCode !== adminCodeData.code) {
          alert(
            'Invalid Orbilius Admin Code. Please contact your administrator for the correct code.'
          );
          setLoading(false);
          return;
        }
      } catch {
        alert('Error validating admin code. Please try again.');
        setLoading(false);
        return;
      }
    }

    // Determine redirect URL based on environment
    const redirectTo = window.location.origin;

    // Sign up with Supabase Auth, storing profile fields in user_metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          role,
          teacher_id: role === 'student' && teacherId ? teacherId : null,
          first_name,
          last_name,
        },
      },
    });

    if (error) {
      alert(error.message);
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
          first_name,
          last_name,
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
    if (!data.user) {
      alert('Sign-up successful. Check your email to confirm your account.');
      setLoading(false);
      navigate('/login');
      return;
    }

    alert('Sign-up successful. Check your email to confirm.');

    // Optional: navigate to login page or auto-login
    navigate('/login');
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Sign Up</h2>
        <input
          type="text"
          placeholder="First Name"
          value={first_name}
          onChange={(e) => setFirstName(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={last_name}
          onChange={(e) => setLastName(e.target.value)}
          style={styles.input}
        />
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

        <div style={styles.roleContainer}>
          <label style={styles.label}>Role: </label>
          <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.select}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>

        {role === 'student' && (
          <input
            type="text"
            placeholder="Teacher ID (optional)"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            style={styles.input}
          />
        )}

        {role === 'teacher' && (
          <input
            type="text"
            placeholder="Orbilius Admin Code *"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
            style={styles.input}
            required
          />
        )}

        <button
          onClick={signUp}
          disabled={loading}
          style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
        <p style={styles.text}>
          Already have an account?{' '}
          <a href="/login" style={styles.link}>
            Log In
          </a>
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
  roleContainer: {
    marginBottom: '1rem',
    textAlign: 'left',
  },
  label: {
    display: 'inline-block',
    marginBottom: '0.5rem',
    color: '#333',
    fontSize: '1rem',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    backgroundColor: 'white',
    color: '#333',
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
  text: {
    margin: 0,
    color: '#666',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
  },
};
