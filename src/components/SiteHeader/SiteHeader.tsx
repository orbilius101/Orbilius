import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Box, Typography, Button, Avatar } from '@mui/material';
import { supabase } from '../../supabaseClient';
import logo from '../../assets/merle-386x386-yellow.svg';

interface UserProfile {
  first_name: string;
  last_name: string;
}

export default function SiteHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Don't show header on public pages
  const publicPaths = ['/', '/login', '/signup', '/reset-password', '/confirm-email'];
  const isPublicPage = publicPaths.includes(location.pathname);

  useEffect(() => {
    if (isPublicPage) return;

    const fetchUserProfile = async (userId: string) => {
      const { data: profile, error } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
      } else if (profile) {
        setUserProfile(profile);
      }
    };

    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        fetchUserProfile(user.id);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setUserProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isPublicPage, location.pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (isPublicPage) return null;

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img src={logo} alt="Orbilius" style={{ height: 40 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Orbilius
          </Typography>
        </Box>

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {userProfile ? (
              <>
                <Avatar
                  sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}
                >
                  {userProfile.first_name?.[0]?.toUpperCase()}
                  {userProfile.last_name?.[0]?.toUpperCase()}
                </Avatar>
                <Typography variant="body2">
                  {userProfile.first_name} {userProfile.last_name}
                </Typography>
              </>
            ) : (
              <Typography variant="body2">{user.email}</Typography>
            )}
            <Button variant="outlined" size="small" onClick={handleSignOut}>
              Sign Out
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
