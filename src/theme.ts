import { createTheme } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#e71a0f' },
  },
  typography: {
    button: { textTransform: 'none', fontWeight: 700 },
  },
});

// Shared sx presets. `satisfies` keeps them as plain objects so they can be
// spread or used in sx arrays: sx={[sectionSx, { py: 2 }]}

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
