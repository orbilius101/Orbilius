// src/admin/components/AdminCodeManager.jsx
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Stack } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

export default function AdminCodeManager({
  adminCode,
  newAdminCode,
  setNewAdminCode,
  isEditing,
  setIsEditing,
  onSave,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(adminCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Admin Code Management
      </Typography>
      {isEditing ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            value={newAdminCode}
            onChange={(e) => setNewAdminCode(e.target.value)}
            size="small"
            sx={{
              width: '200px',
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
                fontSize: '1.1rem',
                fontWeight: 600,
              },
              '& .MuiOutlinedInput-input': {
                padding: '12px',
              },
            }}
          />
          <Button variant="contained" color="success" onClick={onSave}>
            Save
          </Button>
          <Button variant="outlined" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </Stack>
      ) : (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography
            component="code"
            sx={{
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#061b42' : '#FFFFFF'),
              color: 'text.primary',
              p: 1.5,
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '1.1rem',
              border: 1,
              borderColor: 'divider',
              fontWeight: 600,
              minWidth: '200px',
            }}
          >
            {adminCode}
          </Typography>
          <Button
            variant="outlined"
            startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
            onClick={handleCopy}
            color={copied ? 'success' : 'primary'}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button variant="contained" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        </Box>
      )}
    </Paper>
  );
}
