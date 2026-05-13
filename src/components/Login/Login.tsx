import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, Stack, InputAdornment, IconButton } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useLoginData } from './hooks/useData';
import { useLoginHandlers } from './hooks/useHandlers';
import { useTheme } from '../../contexts/ThemeContext';
import yellowLogo from '../../assets/merle-386x386-yellow.svg';
import regularLogo from '../../assets/merle-386x386.svg';
import AlertDialog from '../AlertDialog/AlertDialog';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { currentTheme } = useTheme();
  const merleLogo = currentTheme === 'light' ? regularLogo : yellowLogo;
  const data = useLoginData();
  const handlers = useLoginHandlers(data);

  // Email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const { email, setEmail, password, setPassword, loading, resetLoading, alertState, closeAlert } =
    data;

  const { signIn, resetPassword } = handlers;

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
          <Stack direction="row" justifyContent="space-between">
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <img src={merleLogo} alt="Orbilius Logo" style={{ width: 40, height: 40 }} />
            </Box>
            <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 3 }}>
              Log In
            </Typography>
          </Stack>
          <Stack spacing={2}>
            <TextField
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              variant="outlined"
              error={email.trim() !== '' && !isValidEmail(email)}
              helperText={email.trim() !== '' && !isValidEmail(email) ? 'Please enter a valid email address' : ''}
            />

            <TextField
              type={showPassword ? 'text' : 'password'}
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(p => !p)} edge="end" tabIndex={-1}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              onClick={signIn}
              disabled={loading}
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 2 }}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </Button>

            <Button
              onClick={resetPassword}
              disabled={resetLoading || !email}
              variant="text"
              fullWidth
            >
              {resetLoading ? 'Sending...' : 'Forgot Password?'}
            </Button>

            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: 'inherit', textDecoration: 'none' }}>
                <Typography component="span" color="primary" sx={{ fontWeight: 600 }}>
                  Sign Up
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
