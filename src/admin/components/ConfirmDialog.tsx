import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import { useState, useEffect } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  requireTypedConfirmation?: string; // Word that must be typed to confirm
}

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  requireTypedConfirmation,
}: ConfirmDialogProps) {
  const [typedText, setTypedText] = useState('');
  const isConfirmEnabled = !requireTypedConfirmation || typedText === requireTypedConfirmation;

  // Reset typed text when dialog opens/closes
  useEffect(() => {
    if (open) {
      setTypedText('');
    }
  }, [open]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && isConfirmEnabled) {
      event.preventDefault();
      onConfirm();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onCancel();
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth onKeyDown={handleKeyDown}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ whiteSpace: 'pre-line' }}>{message}</DialogContentText>
        {requireTypedConfirmation && (
          <Box sx={{ mt: 3 }}>
            <DialogContentText sx={{ mb: 1, fontWeight: 600 }}>
              Type <strong>"{requireTypedConfirmation}"</strong> to confirm:
            </DialogContentText>
            <TextField
              autoFocus
              fullWidth
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder={requireTypedConfirmation}
              variant="outlined"
              size="small"
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="inherit">
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={!isConfirmEnabled}
          autoFocus={!requireTypedConfirmation}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
