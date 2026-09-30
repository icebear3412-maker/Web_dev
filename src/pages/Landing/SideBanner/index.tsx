import { Box, ButtonBase, ThemeProvider, Typography } from '@mui/material';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { CONTENT_MAX_WIDTH, landingPageTheme } from '@/theme';

interface SideBanner {
  label: string;
  image: string;
  linkTo: string;
}

const sideBanners: SideBanner[] = [
  { label: 'Promotion A', image: '', linkTo: '/promo-a' },
  { label: 'Promotion B', image: '', linkTo: '/promo-b' },
];

const BANNER_WIDTH = 120;
const BANNER_OFFSET = 16;

const MIN_VIEWPORT = CONTENT_MAX_WIDTH + 2 * (BANNER_WIDTH + BANNER_OFFSET);

const SideBanners: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={landingPageTheme}>
      {sideBanners.map((banner, index) => (
        <ButtonBase
          key={banner.linkTo}
          aria-label={banner.label}
          onClick={() => navigate(banner.linkTo)}
          sx={{
            position: 'fixed',
            top: '50%',
            transform: 'translateY(-50%)',
            [index === 0 ? 'left' : 'right']: BANNER_OFFSET,
            width: BANNER_WIDTH,
            zIndex: 999,
            display: 'none',
            [`@media (min-width: ${MIN_VIEWPORT}px)`]: { display: 'block' },
            borderRadius: 2,
            '&:hover': { opacity: 0.9 },
          }}
        >
          {banner.image ? (
            <Box
              component="img"
              src={banner.image}
              alt=""
              sx={{ display: 'block', width: '100%', borderRadius: 2, boxShadow: 3 }}
            />
          ) : (
            // fallback until the real image is added
            <Box
              sx={{
                display: 'grid',
                placeItems: 'center',
                height: 400,
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: 3,
              }}
            >
              <Typography variant="caption">{banner.label}</Typography>
            </Box>
          )}
        </ButtonBase>
      ))}
    </ThemeProvider>
  );
};

export default SideBanners;
