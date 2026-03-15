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
  adminCode?: string;
  teacherId?: string;
  showAlert: (msg: string, title?: string) => void;
  initialEmail?: string;
}

export default function InviteModal({
  open,
  onClose,
  role,
  adminCode,
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
    setTouched(true); // Mark field as touched when attempting to send
    console.log('Sending invitation to:', email, 'as role:', role);
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Use Firebase Cloud Function
      console.log('Checking if user exists...');
      const response = await fetch(CLOUD_FUNCTIONS.checkUserEmail, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      console.log('checkUserEmail response:', { status: response.status, result });
      
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

      // For teachers, create or update pending invitation record in Firestore
      if (role === 'teacher') {
        try {
          console.log('Checking for existing pending teacher invitation...');
          // Check if a pending invitation already exists for this email
          const { data: existingInvitations } = await getDocuments(
            'pending_invitations',
            buildConstraints({
              eq: { email, role: 'teacher' },
            })
          );
          
          // Generate a unique invitation code (timestamp + random string)
          const invitationCode = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
          
          if (existingInvitations && existingInvitations.length > 0) {
            // Update existing invitation
            const existingInvite = existingInvitations[0];
            console.log('Updating existing pending teacher invitation:', existingInvite.id);
            await updateDocument('pending_invitations', existingInvite.id, {
              status: 'pending',
              invited_at: Timestamp.now(),
              admin_code: adminCode || null,
              invitation_code: invitationCode,
            });
            console.log('Pending teacher record updated with code:', invitationCode);
          } else {
            // Create new invitation
            console.log('Creating new pending teacher record...');
            await addDoc(collection(db, 'pending_invitations'), {
              email,
              role: 'teacher',
              status: 'pending',
              invited_at: Timestamp.now(),
              admin_code: adminCode || null,
              invitation_code: invitationCode,
            });
            console.log('Pending teacher record created with code:', invitationCode);
          }
          
          // Generate signup URL with invitation code
          const signupUrl = `${window.location.origin}/signup?invite=${invitationCode}`;
          console.log('Generated signup URL:', signupUrl);
          
          // Send invitation email via Firebase Cloud Function
          console.log('Sending invitation email...');
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
          console.log('sendInvite response:', { status: inviteResponse.status, result: inviteResult });

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
            // Update existing invitation
            const existingInvite = existingInvitations[0];
            console.log('Updating existing pending student invitation:', existingInvite.id);
            await updateDocument('pending_invitations', existingInvite.id, {
              status: 'pending',
              invited_at: Timestamp.now(),
              teacher_id: teacherId || null,
              invitation_code: invitationCode,
            });
            console.log('Pending student record updated with code:', invitationCode);
          } else {
            // Create new invitation
            console.log('Creating new pending student record...');
            await addDoc(collection(db, 'pending_invitations'), {
              email,
              role: 'student',
              status: 'pending',
              invited_at: Timestamp.now(),
              teacher_id: teacherId || null,
              invitation_code: invitationCode,
            });
            console.log('Pending student record created with code:', invitationCode);
          }
          
          // Generate signup URL with invitation code
          const signupUrl = `${window.location.origin}/signup?invite=${invitationCode}`;
          console.log('Generated signup URL:', signupUrl);
          
          // Send invitation email via Firebase Cloud Function
          console.log('Sending invitation email...');
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
          console.log('sendInvite response:', { status: inviteResponse.status, result: inviteResult });

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
          console.error('Error creating/updating pending student record:', firestoreError);
          setLoading(false);
          setError('Error creating invitation. Please try again.');
          return;
        }
      } else {
        // Fallback for other roles (if any)
        // Generate signup URL with role and metadata
        const signupUrl = `${window.location.origin}/signup?role=${role}${role === 'student' && teacherId ? `&teacher=${teacherId}` : ''}`;
        console.log('Generated signup URL:', signupUrl);

        // Send invitation email via Firebase Cloud Function
        console.log('Sending invitation email...');
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
        console.log('sendInvite response:', { status: inviteResponse.status, result: inviteResult });

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
      setSuccess('Invitation sent successfully!');
      showAlert('Invitation sent successfully!', 'Success');
      setEmail('');
      setTouched(false); // Reset touched state for next use
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Exception in handleSend:', err);
      setLoading(false);
      const errorMessage = err instanceof Error 
        ? `Error: ${err.message}` 
        : 'Error sending invitation. Please try again.';
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
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth onKeyDown={handleKeyDown}>
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
          {loading ? <CircularProgress size={20} /> : 'Send Invitation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
