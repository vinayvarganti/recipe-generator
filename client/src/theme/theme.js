import { createTheme, alpha } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF5722', // Deep Vibrance Orange
      light: '#FF8A65',
      dark: '#E64A19',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00C853', // Vivid Emerald
      light: '#69F0AE',
      dark: '#009624',
      contrastText: '#ffffff',
    },
    accent: {
      main: '#FFD600', // Sharp Yellow
      light: '#FFFF52',
      dark: '#C7A500',
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
      gradient: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)', // Example nice gradient
    },
    text: {
      primary: '#1A2027',
      secondary: '#5E6C84',
    },
    success: {
      main: '#00E676',
    },
    warning: {
      main: '#FFAB00',
    },
    error: {
      main: '#FF1744',
    },
    info: {
      main: '#00B0FF',
    },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '4rem',
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '3rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 700,
      fontSize: '2.25rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.6,
    },
    body1: {
      fontSize: '1.05rem',
      lineHeight: 1.7,
      color: '#2C3E50',
    },
    body2: {
      fontSize: '0.9rem',
      lineHeight: 1.6,
      color: '#5E6C84',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      fontSize: '0.95rem',
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0,0,0,0.02)',
    '0px 4px 8px rgba(0,0,0,0.04)',
    '0px 8px 16px rgba(0,0,0,0.06)',
    '0px 12px 24px rgba(0,0,0,0.08)',
    '0px 16px 32px rgba(0,0,0,0.1)',
    '0px 20px 40px rgba(0,0,0,0.12)',
    '0px 24px 48px rgba(0,0,0,0.14)',
    '0px 32px 64px rgba(0,0,0,0.16)',
    '0px 40px 80px rgba(0,0,0,0.18)', // soft deep shadow
    // Rest can be standard or extended similarly
    ...Array(15).fill('none'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 26px',
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 20px -4px rgba(0,0,0,0.2)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #FF6B35 0%, #F57C00 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #F57C00 0%, #E65100 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #43a047 0%, #2e7d32 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          backgroundImage: 'none',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: alpha('#FFF', 0.6),
            transition: 'all 0.2s ease-in-out',
            '& fieldset': {
              borderColor: alpha('#000', 0.1),
            },
            '&:hover fieldset': {
              borderColor: alpha('#000', 0.2),
            },
            '&.Mui-focused': {
              backgroundColor: '#FFF',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              '& fieldset': {
                borderWidth: 2,
              },
            },
          },
        },
      },
    },
  },
});

export default theme;