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
    const settingsRef = doc(db, 'settings', 'theme');

    const unsubscribe = onSnapshot(
      settingsRef,
      async (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          if (data.theme) {
            setCurrentTheme(data.theme as ThemeName);
          }
        } else {
          setCurrentTheme('midnight');
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching theme:', error);
        // If permissions error, just use default theme
        if (error.code === 'permission-denied') {
          setCurrentTheme('midnight');
        }
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const setTheme = async (theme: ThemeName) => {
    try {
      // Try to update existing document, or create if it doesn't exist
      const settingsRef = doc(db, 'settings', 'theme');
      const { error } = await updateDocument('settings', 'theme', { theme });

      if (error) {
        console.error('Error updating theme:', error);
        // If document doesn't exist, try to create it using setDoc
        if (error.message?.includes('No document')) {
          const { setDoc } = await import('firebase/firestore');
          await setDoc(settingsRef, { theme });
        } else {
          throw error;
        }
      }

      setCurrentTheme(theme);
    } catch (err) {
      console.error('Failed to update theme:', err);
      // Still update local state even if database update fails
      setCurrentTheme(theme);
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
