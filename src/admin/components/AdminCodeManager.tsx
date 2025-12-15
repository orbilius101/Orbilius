// src/admin/components/AdminCodeManager.jsx
import React from 'react';
import { Box, Typography, TextField, Button, Paper, Stack } from '@mui/material';

export default function AdminCodeManager({
  adminCode,
  newAdminCode,
  setNewAdminCode,
  isEditing,
  setIsEditing,
  onSave,
}) {
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
              bgcolor: 'grey.100',
              p: 1.5,
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '1.1rem',
              border: 1,
              borderColor: 'grey.300',
              fontWeight: 600,
            }}
          >
            {adminCode}
          </Typography>
          <Button variant="contained" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        </Box>
      )}
    </Paper>
  );
}
