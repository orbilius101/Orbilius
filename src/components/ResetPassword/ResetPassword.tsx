import { Link } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, Stack, Alert } from '@mui/material';
import { useResetPasswordData } from './hooks/useData';
import { useResetPasswordHandlers } from './hooks/useHandlers';
import AlertDialog from '../AlertDialog/AlertDialog';

export default function ResetPassword() {
  const data = useResetPasswordData();
  const handlers = useResetPasswordHandlers(data);

  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    alertState,
    closeAlert,
  } = data;

  const { updatePassword } = handlers;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'background.default',
        padding: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom align="center">
            Reset Password
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Enter your new password below
          </Typography>

          <Stack spacing={2}>
            <TextField
              type="password"
              label="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              variant="outlined"
            />

            <TextField
              type="password"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              variant="outlined"
            />

            {error && <Alert severity="error">{error}</Alert>}

            <Button
              onClick={updatePassword}
              disabled={loading}
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 2 }}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </Button>

            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Remember your password?{' '}
              <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>
                <Typography component="span" color="primary" sx={{ fontWeight: 600 }}>
                  Log In
                </Typography>
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
      <AlertDialog
        open={alertState.open}
        title={alertState.title}
        message={alertState.message}
        onClose={closeAlert}
      />
    </Box>
  );
}
