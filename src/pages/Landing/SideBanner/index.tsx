import { Box } from '@mui/material';
import type React from 'react';
import { useNavigate } from 'react-router-dom';

interface SideBanner {
  image: string;
  linkTo: string;
}

const sideBanners: SideBanner[] = [
  { image: '', linkTo: '/promo-a' },
  { image: '', linkTo: '/promo-b' },
];

const SideBanners: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      {sideBanners.map((banner, index) => (
        <Box
          key={banner.linkTo}
          onClick={() => navigate(banner.linkTo)}
          sx={{
            position: 'fixed',
            top: '50%',
            transform: 'translateY(-50%)',
            [index === 0 ? 'left' : 'right']: 16,
            width: 120,
            zIndex: 999,
            cursor: 'pointer',
            display: { xs: 'none', lg: 'block' },
            '&:hover': { opacity: 0.9 },
          }}
        >
          <Box
            component="img"
            src={banner.image}
            alt=""
            sx={{ width: '100%', borderRadius: 2, boxShadow: 3 }}
          />
        </Box>
      ))}
    </>
  );
};

export default SideBanners;
