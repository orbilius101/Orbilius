import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useState } from 'react';
import { useSignupData } from './hooks/useData';
import { useSignupHandlers } from './hooks/useHandlers';
import { useTheme } from '../../contexts/ThemeContext';
import AlertDialog from '../AlertDialog/AlertDialog';
import yellowLogo from '../../assets/merle-386x386-yellow.svg';
import regularLogo from '../../assets/merle-386x386.svg';

export default function Signup() {
  const { currentTheme } = useTheme();
  const merleLogo = currentTheme === 'light' ? regularLogo : yellowLogo;
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [touchedFields, setTouchedFields] = useState({
    firstName: false,
    lastName: false,
    password: false,
    confirmPassword: false,
    email: false,
  });
  const data = useSignupData();
  const handlers = useSignupHandlers({ ...data, setShowEmailModal });

  // Check if this is an invitation signup (has invitation data from invite code)
  const isInvitation = data.invitationData !== null;

  // Check if teacher ID was pre-filled from URL parameter or invitation
  const params = new URLSearchParams(window.location.search);
  const hasTeacherIdParam = params.get('teacherId') !== null;
  const hasTeacherIdFromInvitation = isInvitation && data.invitationData?.teacher_id;
  const isTeacherIdPrefilled = hasTeacherIdParam || hasTeacherIdFromInvitation;

  // Email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation (minimum 6 characters as per Firebase requirement)
  const isValidPassword = (password: string): boolean => {
    return password.length >= 6;
  };

  // Field validation
  const isFirstNameValid = data.firstName.trim().length > 0;
  const isLastNameValid = data.lastName.trim().length > 0;
  const isPasswordValid = isValidPassword(data.password);
  const isPasswordMatch = data.password === data.confirmPassword && data.confirmPassword.length > 0;
  const isEmailValid = isValidEmail(data.email);

  // Check if form is valid for submission
  const isFormValid =
    isFirstNameValid && isLastNameValid && isPasswordValid && isPasswordMatch && isEmailValid;

  const handleBlur = (field: keyof typeof touchedFields) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    role,
    teacherId,
    setTeacherId,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    loading,
    alertState,
    closeAlert,
  } = data;

  const { handleSignUp } = handlers;

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
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <img src={merleLogo} alt="Orbilius Logo" style={{ width: 40, height: 40 }} />
            </Box>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              align="center"
              sx={{ flex: 1, m: 0 }}
            >
              Sign Up
            </Typography>
          </Stack>

          {isInvitation && (
            <Box
              sx={{
                mb: 3,
                p: 2.5,
                bgcolor: 'primary.main',
                borderRadius: 2,
                color: 'primary.contrastText',
                boxShadow: 2,
              }}
            >
              <Typography variant="h6" align="center" sx={{ fontWeight: 600, mb: 0.5 }}>
                Welcome to Orbilius!
              </Typography>
              <Typography variant="body1" align="center" sx={{ fontWeight: 500 }}>
                You've been invited as a {role === 'teacher' ? 'Teacher' : 'Student'}
              </Typography>
              <Typography variant="body2" align="center" sx={{ mt: 1.5, opacity: 0.95 }}>
                Complete and submit the form below to create your account
              </Typography>
            </Box>
          )}

          <Stack spacing={2}>
            <TextField
              type="text"
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onBlur={() => handleBlur('firstName')}
              fullWidth
              variant="outlined"
              required
              autoComplete="off"
              error={touchedFields.firstName && !isFirstNameValid}
              helperText={
                touchedFields.firstName && !isFirstNameValid ? 'First name is required' : ''
              }
            />

            <TextField
              type="text"
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onBlur={() => handleBlur('lastName')}
              fullWidth
              variant="outlined"
              required
              autoComplete="off"
              error={touchedFields.lastName && !isLastNameValid}
              helperText={touchedFields.lastName && !isLastNameValid ? 'Last name is required' : ''}
            />

            <TextField
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              fullWidth
              variant="outlined"
              required
              disabled={isInvitation}
              autoComplete="off"
              error={touchedFields.email && !isEmailValid}
              helperText={
                touchedFields.email && !isEmailValid ? 'Please enter a valid email address' : ''
              }
            />

            <TextField
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              fullWidth
              variant="outlined"
              required
              autoComplete="new-password"
              error={touchedFields.password && !isPasswordValid}
              helperText={
                touchedFields.password && !isPasswordValid
                  ? 'Password must be at least 6 characters'
                  : ''
              }
            />

            <TextField
              type="password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              fullWidth
              variant="outlined"
              required
              autoComplete="new-password"
              error={touchedFields.confirmPassword && !isPasswordMatch}
              helperText={
                touchedFields.confirmPassword && !isPasswordMatch ? 'Passwords must match' : ''
              }
            />

            <Button
              onClick={handleSignUp}
              disabled={loading || !isFormValid}
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 2 }}
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>

            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Already have an account?{' '}
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

      {/* Email Confirmation Modal */}
      <Dialog
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        maxWidth="sm"
        fullWidth
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Escape') {
            e.preventDefault();
            setShowEmailModal(false);
            data.navigate('/login');
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontSize: '1.75rem', pt: 4 }}>
          📧 Check Your Email!
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <Typography variant="body1" sx={{ mb: 2, fontSize: '1.1rem' }}>
            We've sent a confirmation email to <strong>{email}</strong>
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, fontSize: '1.1rem' }}>
            Please check your inbox and click the confirmation link to activate your account.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Don't see it? Check your spam folder.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              setShowEmailModal(false);
              data.navigate('/login');
            }}
          >
            Go to Login
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
