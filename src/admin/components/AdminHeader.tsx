// src/admin/components/AdminHeader.jsx
import React from 'react';
import { Typography, Paper } from '@mui/material';

export default function AdminHeader() {
  return (
    <Paper
      sx={{
        p: 3,
        mb: 3,
      }}
    >
      <Typography variant="h3" component="h1">
        Orbilius Admin Dashboard
      </Typography>
    </Paper>
  );
}
