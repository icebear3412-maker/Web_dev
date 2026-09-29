import type { ICardWithLink } from '@/types';
import { Box, Divider, Stack } from '@mui/material';
import type React from 'react';
import { useNavigate } from 'react-router-dom';

const navItems: ICardWithLink[] = [
  { image: '/icons/cinemas.png', linkTo: '/cinemas' },
  { image: '/icons/now-showing.png', linkTo: '/now-showing' },
  { image: '/icons/special.png', linkTo: '/special' },
  { image: '/icons/hall-rental.png', linkTo: '/hall-rental' },
  { image: '/icons/contact.png', linkTo: '/contact' },
  { image: '/icons/news-offers.png', linkTo: '/news-offers' },
  { image: '/icons/register.png', linkTo: '/register' },
];

const NavigationBar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        borderTop: '1px solid',
        borderBottom: '1px solid',
        borderColor: 'divider',
        py: 2,
        overflowX: { xs: 'auto', md: 'visible' },
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
              width: { xs: 100, md: 130 },
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
    </Box>
  );
};

export default NavigationBar;
