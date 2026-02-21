// src/admin/components/AdminHeader.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Paper, Box, Button, Chip, useTheme } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { auth } from '../../firebaseConfig';
import { getDocument } from '../../utils/firebaseHelpers';
import orbiliusLogoYellow from '../../assets/merle-386x386-yellow.svg';
import orbiliusLogoDark from '../../assets/merle-386x386.svg';
import { signOut } from 'firebase/auth';

export default function AdminHeader() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [userName, setUserName] = useState('');

  const orbiliusLogo = theme.palette.mode === 'dark' ? orbiliusLogoYellow : orbiliusLogoDark;

  useEffect(() => {
    const fetchUserName = async () => {
      const user = auth.currentUser;
      if (user) {
        const { data: profile } = await getDocument('users', user.uid);

        if (profile) {
          setUserName(`${(profile as any).first_name} ${(profile as any).last_name}`);
        } else {
          setUserName(user.email || 'Admin');
        }
      }
    };
    fetchUserName();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <Paper
      sx={{
        p: 2,
        mb: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        <img src={orbiliusLogo} alt="Orbilius" style={{ height: '40px' }} />
        <Typography variant="h6" component="h1" sx={{ fontWeight: 500 }}>
          Orbilius
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {userName}
        </Typography>
        <Chip label="Admin" color="error" sx={{ fontWeight: 600 }} />
        <Button
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={handleSignOut}
          sx={{ textTransform: 'none' }}
        >
          Logout
        </Button>
      </Box>
    </Paper>
  );
}
