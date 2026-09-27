import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',

    primary: {
      main: '#e71a1a',
    },

    background: {
      default: '#111111',
      paper: '#1a1a1a',
    },

    text: {
      primary: '#ffffff',
      secondary: '#bdbdbd',
    },
  },

  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  },

  shape: {
    borderRadius: 2,
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
        },
      },
    },
  },
});
