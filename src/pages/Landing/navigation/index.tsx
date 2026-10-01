import { landingPageTheme } from '@/theme';
import type { ICardWithLink } from '@/types';
import { Box, Container, Divider, Stack, ThemeProvider } from '@mui/material';
import type React from 'react';
import { useNavigate } from 'react-router-dom';

const navItems: ICardWithLink[] = [
  { image: '/icons/cinemas.png', linkTo: '/cinemas' },
  { image: '/icons/now-showing.png', linkTo: '/now-showing' },
  { image: '/icons/special.png', linkTo: '/special' },
  { image: '/icons/hall-rental.png', linkTo: '/rent' },
  { image: '/icons/contact.png', linkTo: '/contact' },
  { image: '/icons/news-offers.png', linkTo: '/new_and_sale' },
  { image: '/icons/register.png', linkTo: '/register' },
];

const NavigationBar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={landingPageTheme}>
      <Container
        sx={{
          borderTop: '1px solid',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2,
          overflowX: 'auto',
        }}
      >
        <Stack
          direction="row"
          divider={<Divider orientation="vertical" flexItem sx={{ mx: { xs: 1, md: 2 } }} />}
          sx={{ alignItems: 'center', justifyContent: 'center', minWidth: 'fit-content', px: 2 }}
        >
          {navItems.map((item) => (
            <Box
              key={item.linkTo}
              onClick={() => navigate(item.linkTo)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flexShrink: 0,
                // 7 items + 6 dividers fit inside the 980px column without scrolling at md+
                width: 96,
                cursor: 'pointer',
              }}
            >
              <Box
                component="img"
                src={item.image}
                alt={item.linkTo}
                sx={{
                  width: 56,
                  height: 56,
                  objectFit: 'contain',
                  transition: 'transform 0.2s ease-out',
                }}
              />
            </Box>
          ))}
        </Stack>
      </Container>
    </ThemeProvider>
  );
};

export default NavigationBar;
