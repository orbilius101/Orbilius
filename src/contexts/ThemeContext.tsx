import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { themes, ThemeName } from '../theme';
import { getDocument, updateDocument } from '../utils/firebaseHelpers';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

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
    // Subscribe to theme changes using Firestore real-time listener
    const adminCodeRef = doc(db, 'admin_code', '1');

    const unsubscribe = onSnapshot(
      adminCodeRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          if (data.theme) {
            setCurrentTheme(data.theme as ThemeName);
          }
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching theme:', error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const setTheme = async (theme: ThemeName) => {
    try {
      const { error } = await updateDocument('admin_code', '1', { theme });

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
