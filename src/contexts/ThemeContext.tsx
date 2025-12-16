import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { themes, ThemeName } from '../theme';
import { supabase } from '../supabaseClient';

interface ThemeContextType {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  availableThemes: { name: ThemeName; label: string }[];
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('midnight');
  const [loading, setLoading] = useState(true);

  const availableThemes = [
    { name: 'midnight' as ThemeName, label: 'Midnight' },
    { name: 'light' as ThemeName, label: 'Light' },
  ];

  // Fetch theme from database on mount
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_code')
          .select('theme')
          .eq('id', 1)
          .single();

        if (error) {
          console.error('Error fetching theme:', error);
        } else if (data && data.theme) {
          setCurrentTheme(data.theme as ThemeName);
        }
      } catch (err) {
        console.error('Error loading theme:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTheme();

    // Subscribe to theme changes
    const channel = supabase
      .channel('theme-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'admin_code',
          filter: 'id=eq.1',
        },
        (payload) => {
          if (payload.new && payload.new.theme) {
            setCurrentTheme(payload.new.theme as ThemeName);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const setTheme = async (theme: ThemeName) => {
    try {
      const { error } = await supabase.from('admin_code').update({ theme }).eq('id', 1);

      if (error) {
        console.error('Error updating theme:', error);
        throw error;
      }

      setCurrentTheme(theme);
    } catch (err) {
      console.error('Failed to update theme:', err);
    }
  };

  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, availableThemes, loading }}>
      <MuiThemeProvider theme={themes[currentTheme]}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
