import { Box, Card, CardContent, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { useConfirmEmailData } from './hooks/useData';
import { useConfirmEmailHandlers } from './hooks/useHandlers';

export default function ConfirmEmail() {
  const data = useConfirmEmailData();
  useConfirmEmailHandlers(data);

  const { loading, error, success, navigate } = data;

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'background.default',
        }}
      >
        <Card sx={{ maxWidth: 400, width: '100%', m: 2 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Confirming Email...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we confirm your email address.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'background.default',
        }}
      >
        <Card sx={{ maxWidth: 400, width: '100%', m: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom align="center">
              Confirmation Failed
            </Typography>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Button onClick={() => navigate('/login')} variant="contained" fullWidth>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'background.default',
        }}
      >
        <Card sx={{ maxWidth: 400, width: '100%', m: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom align="center">
              Email Confirmed!
            </Typography>
            <Alert severity="success">
              Your email has been successfully confirmed. You will be redirected to your dashboard
              shortly.
            </Alert>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return null;
}
