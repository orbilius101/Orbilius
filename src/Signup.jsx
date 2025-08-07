import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [teacherId, setTeacherId] = useState('');
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const signUp = async () => {
    setLoading(true);

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user.id;

    // Add user to users table
    const { error: insertError } = await supabase.from('users').insert([
      {
        id: userId,
        role,
        teacher_id: role === 'student' && teacherId ? teacherId : null,
        email: email,
        first_name: first_name,
        last_name: last_name,
      },
    ]);

    if (insertError) {
      alert('Auth succeeded, but DB insert failed: ' + insertError.message);
      setLoading(false);
      return;
    }

    alert('Sign-up successful. Check your email to confirm.');

    // Optional: navigate to login page or auto-login
    navigate('/');
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
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            style={styles.select}
          >
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

        <button 
          onClick={signUp} 
          disabled={loading}
          style={{...styles.button, ...(loading ? styles.buttonDisabled : {})}}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
        <p style={styles.text}>
          Already have an account? <a href="/" style={styles.link}>Log In</a>
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
    backgroundColor: '#f5f5f5'
  },
  card: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center'
  },
  title: {
    marginBottom: '1.5rem',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box'
  },
  roleContainer: {
    marginBottom: '1rem',
    textAlign: 'left'
  },
  label: {
    display: 'inline-block',
    marginBottom: '0.5rem',
    color: '#333',
    fontSize: '1rem'
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    backgroundColor: 'white',
    color: '#333'
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
    marginBottom: '1rem'
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed'
  },
  text: {
    margin: 0,
    color: '#666'
  },
  link: {
    color: '#007bff',
    textDecoration: 'none'
  }
};
