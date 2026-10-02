import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/500.css';
import '@fontsource/be-vietnam-pro/700.css';
import '@fontsource/be-vietnam-pro/800.css';

import { createTheme } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';

export const CONTENT_MAX_WIDTH = 980;

export const landingPageTheme = createTheme({
  palette: { primary: { main: '#e71a0f' } },
  typography: {
    fontFamily: '"Be Vietnam Pro", "Roboto", "Helvetica", "Arial", sans-serif',
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiContainer: {
      defaultProps: { maxWidth: false, disableGutters: true },
      styleOverrides: { root: { maxWidth: CONTENT_MAX_WIDTH } },
    },
  },
});

export const theme = createTheme({
  palette: {
    primary: { main: '#e71a0f' },
  },
  typography: {
    fontFamily: '"Be Vietnam Pro", Montserrat, Arial, sans-serif',
    button: { textTransform: 'none', fontWeight: 700 },
  },
});

export const sectionSx = {
  py: { xs: 3, md: 5 },
} satisfies SxProps<Theme>;

export const sectionTitleSx = {
  fontSize: { xs: 20, md: 24 },
  fontWeight: 800,
  letterSpacing: 1,
  color: 'text.primary',
} satisfies SxProps<Theme>;

export const sectionHeadingSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  mb: 2,
} satisfies SxProps<Theme>;

export const clickableSx = {
  cursor: 'pointer',
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'primary.main',
    outlineOffset: 2,
  },
} satisfies SxProps<Theme>;
