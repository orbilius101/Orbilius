import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Box, Typography, Button, Chip } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { supabase } from '../../../supabaseClient';
import { useTheme } from '../../../contexts/ThemeContext';
import yellowLogo from '../../../assets/merle-386x386-yellow.svg';
import regularLogo from '../../../assets/merle-386x386.svg';

export default function SharedHeader() {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const orbiliusLogo = currentTheme === 'light' ? regularLogo : yellowLogo;
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
    <AppBar
      position="static"
      elevation={1}
      sx={{
        bgcolor: currentTheme === 'light' ? '#FFFFFF' : 'background.paper',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <img src={orbiliusLogo} alt="Orbilius" style={{ height: '40px' }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
            Orbilius
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {userProfile && (
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {userProfile.first_name} {userProfile.last_name}
            </Typography>
          )}
          <Chip label="Student" color="primary" sx={{ fontWeight: 600 }} />
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ textTransform: 'none' }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
