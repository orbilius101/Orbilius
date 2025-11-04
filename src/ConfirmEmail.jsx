import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from './supabaseClient';

export default function ConfirmEmail() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the tokens from URL parameters
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        if (type === 'signup' && token) {
          // This is an email confirmation
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup',
          });

          if (error) {
            setError('Invalid or expired confirmation link.');
            setLoading(false);
            return;
          }

          if (data.user) {
            setSuccess(true);
            setLoading(false);

            // Redirect to appropriate dashboard based on user role
            const role = data.user.user_metadata?.role;

            setTimeout(() => {
              if (role === 'teacher') {
                navigate('/teacher/dashboard');
              } else if (role === 'student') {
                navigate('/student/dashboard');
              } else {
                navigate('/login');
              }
            }, 2000);
          }
        } else {
          // Handle other auth events
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user) {
            const role = session.user.user_metadata?.role;
            if (role === 'teacher') {
              navigate('/teacher/dashboard');
            } else if (role === 'student') {
              navigate('/student/dashboard');
            } else {
              navigate('/login');
            }
          } else {
            navigate('/login');
          }
        }
      } catch (err) {
        console.error('Email confirmation error:', err);
        setError('An error occurred during email confirmation.');
        setLoading(false);
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Confirming Email...</h2>
          <p>Please wait while we confirm your email address.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Confirmation Failed</h2>
          <p style={styles.error}>{error}</p>
          <button onClick={() => navigate('/login')} style={styles.button}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Email Confirmed!</h2>
          <p style={styles.success}>
            Your email has been successfully confirmed. You will be redirected to your dashboard
            shortly.
          </p>
        </div>
      </div>
    );
  }

  return null;
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
  button: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '1rem',
  },
  error: {
    color: '#dc3545',
    marginBottom: '1rem',
  },
  success: {
    color: '#28a745',
    marginBottom: '1rem',
  },
};
