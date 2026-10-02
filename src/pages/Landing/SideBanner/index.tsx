import { Box } from '@mui/material';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import bannerImage from '@/assets/120wx600h_5_.jpg';
import { clickableSx } from '@/theme';

interface SideBanner {
  image: string;
  linkTo: string;
}

const sideBanners: SideBanner[] = [
  { image: bannerImage, linkTo: '/new_and_sale' },
  { image: bannerImage, linkTo: '/new_and_sale' },
];

const SideBanners: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      {sideBanners.map((banner, index) => (
        <Box
          key={index}
          className="side-banner-ad"
          onClick={() => navigate(banner.linkTo)}
          sx={[
            clickableSx,
            {
              position: 'fixed',
              top: 24,
              [index === 0 ? 'left' : 'right']: 16,
              width: { lg: 0, xl: 120 },
              zIndex: 8,
              cursor: 'pointer',
              display: { xs: 'none', lg: 'none', xl: 'block' },
              '&:hover': { opacity: 0.9 },
            },
          ]}
        >
          <Box
            component="img"
            src={banner.image}
            alt=""
            sx={{
              display: 'block',
              width: '100%',
              height: 'auto',
              maxHeight: 'min(82vh, 750px)',
              objectFit: 'contain',
            }}
          />
        </Box>
      ))}
    </>
  );
};

export default SideBanners;
