import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  role: 'teacher' | 'student';
  adminCode?: string;
  teacherId?: string;
  showAlert: (msg: string, title?: string) => void;
}

export default function InviteModal({
  open,
  onClose,
  role,
  adminCode,
  teacherId,
  showAlert,
}: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if user exists using secure API route
  const handleSend = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Use local Express server in development, Vercel serverless in production
      const apiUrl =
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:4000/api/checkUserEmail'
          : '/api/checkUserEmail';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok) {
        setLoading(false);
        setError(result.error || 'Error checking email. Please try again.');
        return;
      }
      if (result.exists) {
        setLoading(false);
        setError('A user with this email already exists.');
        return;
      }

      // Generate signup URL with role and metadata
      const signupUrl = `${window.location.origin}/signup?role=${role}${role === 'student' && teacherId ? `&teacher=${teacherId}` : ''}${role === 'teacher' && adminCode ? `&code=${adminCode}` : ''}`;

      // Send invitation email via API
      const inviteApiUrl =
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:4000/api/sendInvite'
          : '/api/sendInvite';

      const inviteResponse = await fetch(inviteApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          role,
          signupUrl,
        }),
      });

      const inviteResult = await inviteResponse.json();

      if (!inviteResponse.ok) {
        setLoading(false);
        setError(inviteResult.error || 'Failed to send invitation. Please try again.');
        return;
      }

      setLoading(false);
      setSuccess('Invitation sent successfully!');
      showAlert('Invitation sent successfully!', 'Success');
      setEmail('');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setLoading(false);
      setError('Error sending invitation. Please try again.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <EmailIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Send{' '}
        {role === 'teacher' ? 'Teacher' : 'Student'} Invitation
      </DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          Enter the email address of the {role === 'teacher' ? 'teacher' : 'student'} you want to
          invite.
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          label="Email Address"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSend}
          variant="contained"
          color="primary"
          startIcon={<EmailIcon />}
          disabled={loading || !email}
        >
          {loading ? <CircularProgress size={20} /> : 'Send Invitation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
