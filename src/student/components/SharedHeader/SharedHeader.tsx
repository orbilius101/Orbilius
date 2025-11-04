import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Box, Typography, Button, Chip } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { supabase } from '../../../supabaseClient';
import orbiliusLogo from '../../../assets/merle-386x386.svg';

export default function SharedHeader() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<{ first_name: string; last_name: string } | null>(
    null
  );

  useEffect(() => {
    const fetchUserProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUserProfile({
          first_name: session.user.user_metadata?.first_name || 'Unknown',
          last_name: session.user.user_metadata?.last_name || 'User',
        });
      }
    };
    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img src={orbiliusLogo} alt="Orbilius" style={{ height: '40px' }} />
          <Typography variant="h6" component="div">
            Orbilius
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {userProfile && (
            <Typography variant="body1">
              {userProfile.first_name} {userProfile.last_name}
            </Typography>
          )}
          {userProfile && <Chip label="Student" color="primary" size="small" sx={{ px: 0.5 }} />}
          <Button variant="outlined" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
