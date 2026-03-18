import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Button, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { CLOUD_FUNCTIONS } from '../../config/functions';

export default function VerifyEmailChange() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [newEmail, setNewEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');

    if (!token || !userId) {
      setStatus('error');
      setErrorMsg('Invalid confirmation link. Please contact your administrator.');
      return;
    }

    fetch(CLOUD_FUNCTIONS.confirmEmailChange, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setNewEmail(data.newEmail);
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMsg(data.error || 'Failed to confirm email change.');
        }
      })
      .catch(() => {
        setStatus('error');
        setErrorMsg('Network error. Please try again or contact your administrator.');
      });
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <Paper sx={{ p: 5, maxWidth: 480, width: '100%', textAlign: 'center' }}>
        {status === 'loading' && (
          <>
            <CircularProgress sx={{ mb: 3 }} />
            <Typography variant="h6">Confirming your new email address…</Typography>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom fontWeight={700}>
              Email confirmed!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your login email has been updated to <strong>{newEmail}</strong>. Please use this
              address to log in from now on.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </>
        )}
        {status === 'error' && (
          <>
            <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom fontWeight={700}>
              Confirmation failed
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {errorMsg}
            </Typography>
            <Button variant="outlined" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
}
