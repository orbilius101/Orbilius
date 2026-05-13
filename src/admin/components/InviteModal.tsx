import React, { useState, useEffect } from 'react';
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
import { CLOUD_FUNCTIONS } from '../../config/functions';
import { db } from '../../firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { getDocuments, buildConstraints, updateDocument } from '../../utils/firebaseHelpers';

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  role: 'teacher' | 'student';
  teacherId?: string;
  showAlert: (msg: string, title?: string) => void;
  initialEmail?: string;
}

export default function InviteModal({
  open,
  onClose,
  role,
  teacherId,
  showAlert,
  initialEmail,
}: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [touched, setTouched] = useState(false);

  // Reset form state when modal opens
  useEffect(() => {
    if (open) {
      setEmail(initialEmail || '');
      setError('');
      setSuccess('');
      setTouched(false);
    }
  }, [open, initialEmail]);

  // Email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isEmailValid = email.trim() !== '' && isValidEmail(email);
  const showError = touched && email.trim() !== '' && !isEmailValid;

  // Check if user exists using secure API route
  const handleSend = async () => {
    setTouched(true);
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(CLOUD_FUNCTIONS.checkUserEmail, {
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

      // Check if there's already a pending invitation for this email
      const { data: existingPendingInvites } = await getDocuments(
        'pending_invitations',
        buildConstraints({
          eq: { email, status: 'pending' },
        })
      );

      if (existingPendingInvites && existingPendingInvites.length > 0) {
        // Check if the pending invitation is for the same role
        const existingInvite = existingPendingInvites[0];
        if ((existingInvite as any).role === role) {
          setLoading(false);
          setError(`A pending ${role} invitation already exists for this email.`);
          return;
        }
      }

      // For teachers, create or update pending invitation record in Firestore
      if (role === 'teacher') {
        try {
          const { data: existingInvitations } = await getDocuments(
            'pending_invitations',
            buildConstraints({
              eq: { email, role: 'teacher' },
            })
          );

          // Generate a unique invitation code (timestamp + random string)
          const invitationCode = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

          if (existingInvitations && existingInvitations.length > 0) {
            const existingInvite = existingInvitations[0];
            await updateDocument('pending_invitations', existingInvite.id, {
              status: 'pending',
              invited_at: Timestamp.now(),
              invitation_code: invitationCode,
            });
          } else {
            await addDoc(collection(db, 'pending_invitations'), {
              email,
              role: 'teacher',
              status: 'pending',
              invited_at: Timestamp.now(),
              invitation_code: invitationCode,
            });
          }

          const signupUrl = `${window.location.origin}/signup?invite=${invitationCode}`;

          const inviteResponse = await fetch(CLOUD_FUNCTIONS.sendInvite, {
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
            const errorMessage = inviteResult.details
              ? `${inviteResult.error}: ${inviteResult.details}`
              : inviteResult.error || 'Failed to send invitation. Please try again.';
            console.error('Invitation failed:', errorMessage);
            setError(errorMessage);
            return;
          }
        } catch (firestoreError) {
          console.error('Error creating/updating pending teacher record:', firestoreError);
          setLoading(false);
          setError('Error creating invitation. Please try again.');
          return;
        }
      } else if (role === 'student') {
        // For students, create/update pending invitation record
        try {
          // Check if invitation already exists
          const { data: existingInvitations } = await getDocuments(
            'pending_invitations',
            buildConstraints({
              eq: { email, role: 'student', teacher_id: teacherId || null },
            })
          );

          // Generate a unique invitation code (timestamp + random string)
          const invitationCode = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

          if (existingInvitations && existingInvitations.length > 0) {
            const existingInvite = existingInvitations[0];
            await updateDocument('pending_invitations', existingInvite.id, {
              status: 'pending',
              invited_at: Timestamp.now(),
              teacher_id: teacherId || null,
              invitation_code: invitationCode,
            });
          } else {
            await addDoc(collection(db, 'pending_invitations'), {
              email,
              role: 'student',
              status: 'pending',
              invited_at: Timestamp.now(),
              teacher_id: teacherId || null,
              invitation_code: invitationCode,
            });
          }

          const signupUrl = `${window.location.origin}/signup?invite=${invitationCode}`;

          const inviteResponse = await fetch(CLOUD_FUNCTIONS.sendInvite, {
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
            const errorMessage = inviteResult.details
              ? `${inviteResult.error}: ${inviteResult.details}`
              : inviteResult.error || 'Failed to send invitation. Please try again.';
            setError(errorMessage);
            return;
          }
        } catch (firestoreError) {
          console.error('Error creating/updating pending student record:', firestoreError);
          setLoading(false);
          setError('Error creating invitation. Please try again.');
          return;
        }
      } else {
        // Fallback for other roles (if any)
        // Generate signup URL with role and metadata
        const signupUrl = `${window.location.origin}/signup?role=${role}${role === 'student' && teacherId ? `&teacher=${teacherId}` : ''}`;

        const inviteResponse = await fetch(CLOUD_FUNCTIONS.sendInvite, {
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
          const errorMessage = inviteResult.details
            ? `${inviteResult.error}: ${inviteResult.details}`
            : inviteResult.error || 'Failed to send invitation. Please try again.';
          console.error('Invitation failed:', errorMessage);
          setError(errorMessage);
          return;
        }
      }

      setLoading(false);

      // For students, just close immediately without showing success message
      if (role === 'student') {
        setEmail('');
        setTouched(false);
        onClose();
      } else {
        // For teachers, show success message
        setSuccess('Invitation sent successfully!');
        showAlert('Invitation sent successfully!', 'Success');
        setEmail('');
        setTouched(false);
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error('Exception in handleSend:', err);
      setLoading(false);

      let errorMessage = 'Error sending invitation. Please try again.';

      if (err instanceof TypeError && err.message.includes('fetch')) {
        errorMessage =
          'Cannot connect to server. Make sure Firebase emulators are running (pnpm firebase:emulators)';
      } else if (err instanceof Error) {
        errorMessage = `Error: ${err.message}`;
      }

      setError(errorMessage);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && isEmailValid && !loading) {
      event.preventDefault();
      handleSend();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth onKeyDown={handleKeyDown}>
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
          onBlur={() => setTouched(true)}
          disabled={loading}
          error={showError}
          helperText={showError ? 'Please enter a valid email address' : ''}
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
          disabled={loading || !isEmailValid}
        >
          {loading ? (
            <CircularProgress size={20} />
          ) : (
            `Invite ${role === 'teacher' ? 'Teacher' : 'Student'}`
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
