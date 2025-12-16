import { createTheme } from '@mui/material/styles';

// Midnight Theme - Dark theme based on #061b42 (deep navy blue from logo)
export const midnightTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4A90E2',
      light: '#6BA3E8',
      dark: '#2E6BB8',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FFC107',
      light: '#FFD54F',
      dark: '#FFA000',
      contrastText: '#000000',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    warning: {
      main: '#FFC107',
      light: '#FFD54F',
      dark: '#FFA000',
      contrastText: '#000000',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
    },
    info: {
      main: '#4A90E2',
      light: '#6BA3E8',
      dark: '#2E6BB8',
    },
    background: {
      default: '#061b42',
      paper: '#0a2550',
    },
    text: {
      primary: '#F1F5F9',
      secondary: '#94A3B8',
      disabled: '#64748B',
    },
    divider: '#334155',
  },
  typography: {
    fontFamily: [
      '"Open Sans"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#F1F5F9',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#F1F5F9',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#F1F5F9',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#F1F5F9',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#F1F5F9',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#F1F5F9',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  components: {
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#FFC107', // Yellow for links
          textDecoration: 'none',
          '&:hover': {
            color: '#FFD54F',
            textDecoration: 'underline',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          fontWeight: 500,
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #4A90E2 0%, #2E6BB8 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #6BA3E8 0%, #4A90E2 100%)',
          },
        },
        outlined: {
          borderColor: '#FFFFFF',
          color: '#FFFFFF',
          '&:hover': {
            borderColor: '#FFFFFF',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
          backgroundImage: 'linear-gradient(135deg, #0a2550 0%, #061b42 100%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#0a2550', // Match paper background
            borderRadius: 8,
            '& fieldset': {
              borderColor: '#1a3a6b',
            },
            '&:hover fieldset': {
              borderColor: '#4A90E2',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#6BA3E8',
            },
            '& input': {
              color: '#F1F5F9', // Light text for input
              '&:-webkit-autofill': {
                WebkitBoxShadow: '0 0 0 100px #0a2550 inset !important',
                WebkitTextFillColor: '#F1F5F9 !important',
                caretColor: '#F1F5F9',
                borderRadius: 'inherit',
              },
              '&:-webkit-autofill:hover': {
                WebkitBoxShadow: '0 0 0 100px #0a2550 inset !important',
                WebkitTextFillColor: '#F1F5F9 !important',
              },
              '&:-webkit-autofill:focus': {
                WebkitBoxShadow: '0 0 0 100px #0a2550 inset !important',
                WebkitTextFillColor: '#F1F5F9 !important',
              },
              '&:-webkit-autofill:active': {
                WebkitBoxShadow: '0 0 0 100px #0a2550 inset !important',
                WebkitTextFillColor: '#F1F5F9 !important',
              },
            },
            '& input[type="date"]::-webkit-calendar-picker-indicator': {
              filter: 'invert(1)', // Invert the calendar icon to make it white
              cursor: 'pointer',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#94A3B8', // Muted but readable label color
            '&.Mui-focused': {
              color: '#6BA3E8', // Brighter when focused
            },
          },
          '& .MuiSvgIcon-root': {
            color: '#FFFFFF !important', // White icons (including calendar)
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(135deg, #0a2550 0%, #061b42 100%)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          '&.MuiChip-filled': {
            backgroundColor: '#1a3a6b',
            color: '#F1F5F9',
          },
        },
        colorPrimary: {
          backgroundColor: '#2E6BB8',
          color: '#FFFFFF',
        },
        colorSecondary: {
          backgroundColor: '#FDB813',
          color: '#000000',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: '#0a2550',
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#1a3a6b',
        },
        head: {
          backgroundColor: '#061b42',
          color: '#F1F5F9',
          fontWeight: 600,
        },
      },
    },
  },
});
// Light Theme - Clean light theme
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563EB',
      light: '#3B82F6',
      dark: '#1D4ED8',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F59E0B',
      light: '#FBB928',
      dark: '#D97706',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBB928',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
    },
    info: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      disabled: '#94A3B8',
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: [
      '"Open Sans"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#0F172A',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#0F172A',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#0F172A',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#0F172A',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#0F172A',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#0F172A',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  components: {
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#2563EB',
          textDecoration: 'none',
          '&:hover': {
            color: '#1D4ED8',
            textDecoration: 'underline',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          fontWeight: 500,
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
          },
        },
        outlined: {
          borderColor: '#2563EB',
          color: '#2563EB',
          '&:hover': {
            borderColor: '#1D4ED8',
            backgroundColor: 'rgba(37, 99, 235, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            borderRadius: 8,
            '& fieldset': {
              borderColor: '#CBD5E1',
            },
            '&:hover fieldset': {
              borderColor: '#3B82F6',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2563EB',
            },
            '& input': {
              color: '#0F172A',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#64748B',
            '&.Mui-focused': {
              color: '#2563EB',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          backgroundImage: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
        colorPrimary: {
          backgroundColor: '#2563EB',
          color: '#FFFFFF',
        },
        colorSecondary: {
          backgroundColor: '#F59E0B',
          color: '#FFFFFF',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#E2E8F0',
        },
        head: {
          backgroundColor: '#F1F5F9',
          color: '#0F172A',
          fontWeight: 600,
        },
      },
    },
  },
});

export const themes = {
  midnight: midnightTheme,
  light: lightTheme,
};

export type ThemeName = keyof typeof themes;

// Default export for backwards compatibility
export const theme = midnightTheme;
