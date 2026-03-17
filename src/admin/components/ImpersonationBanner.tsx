import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { ExitToApp as ExitIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function ImpersonationBanner() {
  const navigate = useNavigate();

  const isImpersonating = sessionStorage.getItem('impersonating_admin_uid') !== null;

  if (!isImpersonating) {
    return null;
  }

  const handleExitImpersonation = () => {
    sessionStorage.removeItem('impersonating_admin_uid');
    sessionStorage.removeItem('impersonating_teacher_uid');
    navigate('/admin/dashboard');
  };

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        bgcolor: 'warning.main',
        color: 'warning.contrastText',
        py: 1.5,
        px: 3,
        borderRadius: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          ⚠️ Admin Mode:
        </Typography>
        <Typography variant="body1">
          You are impersonating a teacher. Data shown is from the teacher's perspective.
        </Typography>
      </Box>
      <Button
        variant="contained"
        color="inherit"
        size="small"
        startIcon={<ExitIcon />}
        onClick={handleExitImpersonation}
        sx={{
          bgcolor: 'rgba(0, 0, 0, 0.2)',
          '&:hover': {
            bgcolor: 'rgba(0, 0, 0, 0.3)',
          },
        }}
      >
        Exit Impersonation
      </Button>
    </Paper>
  );
}
