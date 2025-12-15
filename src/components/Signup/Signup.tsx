import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useSignupData } from './hooks/useData';
import { useSignupHandlers } from './hooks/useHandlers';
import AlertDialog from '../AlertDialog/AlertDialog';

export default function Signup() {
  const data = useSignupData();
  const handlers = useSignupHandlers(data);

  const {
    email,
    setEmail,
    password,
    setPassword,
    role,
    setRole,
    teacherId,
    setTeacherId,
    adminCode,
    setAdminCode,
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
          <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 3 }}>
            Sign Up
          </Typography>

          <Stack spacing={2}>
            <TextField
              type="text"
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              fullWidth
              variant="outlined"
            />

            <TextField
              type="text"
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              fullWidth
              variant="outlined"
            />

            <TextField
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              variant="outlined"
            />

            <TextField
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              variant="outlined"
            />

            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select value={role} onChange={(e) => setRole(e.target.value)} label="Role">
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="teacher">Teacher</MenuItem>
              </Select>
            </FormControl>

            {role === 'student' && (
              <TextField
                type="text"
                label="Teacher ID (optional)"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                fullWidth
                variant="outlined"
              />
            )}

            {role === 'teacher' && (
              <TextField
                type="text"
                label="Orbilius Admin Code"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                fullWidth
                variant="outlined"
                required
              />
            )}

            <Button
              onClick={handleSignUp}
              disabled={loading}
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
    </Box>
  );
}
