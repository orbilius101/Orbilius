import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { CLOUD_FUNCTIONS } from '../../config/functions';

interface EditUserModalProps {
  open: boolean;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    userType: 'teacher' | 'student';
  } | null;
  onClose: () => void;
  onSaved: () => void;
  showAlert: (message: string, title: string) => void;
}

export default function EditUserModal({
  open,
  user,
  onClose,
  onSaved,
  showAlert,
}: EditUserModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  if (!user) return null;

  const emailChanged = email.trim() !== '' && email.trim() !== user.email;

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      showAlert('All fields are required.', 'Error');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(CLOUD_FUNCTIONS.updateUser, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        showAlert(result.error || 'Failed to update user.', 'Error');
        return;
      }

      if (result.emailVerificationSent) {
        showAlert(
          `Saved! A verification email has been sent to ${email.trim()}. The user must click the link to confirm the new address.`,
          'Success'
        );
      } else {
        showAlert('User updated successfully.', 'Success');
      }
      onSaved();
      onClose();
    } catch (err: any) {
      showAlert(err.message || 'Failed to update user.', 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit {user.userType === 'teacher' ? 'Teacher' : 'Student'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            fullWidth
            disabled={saving}
          />
          <TextField
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            fullWidth
            disabled={saving}
          />
          <TextField
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            type="email"
            disabled={saving}
          />
          {emailChanged && (
            <Alert severity="info">
              A confirmation link will be sent to <strong>{email.trim()}</strong>. The user's
              current email <strong>{user.email}</strong> will keep working until they click the
              link to confirm. The link expires in 24 hours.
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? <CircularProgress size={20} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
