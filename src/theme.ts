import { createTheme } from '@mui/material/styles';

// Dark theme based on #061b42 (deep navy blue from logo)
// Primary: Navy/Dark Blue (from logo)
// Accent: Golden Yellow (used sparingly)
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4A90E2', // Medium blue from owl logo (less saturated)
      light: '#6BA3E8', // Lighter blue
      dark: '#2E6BB8', // Darker blue
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FFC107', // Golden yellow from logo (sparingly used)
      light: '#FFD54F',
      dark: '#FFA000',
      contrastText: '#000000', // Dark text on yellow
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    warning: {
      main: '#FFC107', // Use yellow for warnings
      light: '#FFD54F',
      dark: '#FFA000',
      contrastText: '#000000', // Dark text on yellow
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
      default: '#061b42', // Deep navy blue base color
      paper: '#0a2550', // Slightly lighter navy for cards
    },
    text: {
      primary: '#F1F5F9', // Light text
      secondary: '#94A3B8', // Muted text
      disabled: '#64748B',
    },
    divider: '#334155', // Subtle divider
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
