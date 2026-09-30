import { Box, ButtonBase, Container, ThemeProvider, Typography } from '@mui/material';
import type { ICardWithLink } from '@/types';
import { useNavigate } from 'react-router-dom';
import { landingPageTheme } from '@/theme';

interface QuickLink extends ICardWithLink {
  label: string;
}

import cgvTheater from "@/assets/quickLinkImages/01_cgv_theater.png";
import nowShowing from "@/assets/quickLinkImages/02_phim_dang_chieu.png";
import cgvSpecial from "@/assets/quickLinkImages/03_cgv_special.png";
import cgvMember from "@/assets/quickLinkImages/04_cgv_member.png";
import lienHeCgv from "@/assets/quickLinkImages/05_lien_he_cgv.png";
import newsOffers from "@/assets/quickLinkImages/06_news_offers.png";
import registerNow from "@/assets/quickLinkImages/07_register_now.png";

const Cards: QuickLink[] = [
  { label: 'Cinemas', image: cgvTheater, linkTo: '/location' },
  { label: 'Now showing', image: nowShowing, linkTo: '/now_showing' },
  { label: 'Special rooms', image: cgvSpecial, linkTo: '/special_room' },
  { label: 'Hall rental', image: cgvMember, linkTo: '/rent' },
  { label: 'Contact', image: lienHeCgv, linkTo: '/contact' },
  { label: 'News & offers', image: newsOffers, linkTo: '/new_offer' },
  { label: 'Sign up', image: registerNow, linkTo: '/signup' },
];

const QuickLink: React.FC = () => {
  const navigate = useNavigate();
  return (
    <ThemeProvider theme={landingPageTheme}>
      <Box sx={{ py: { xs: 2, md: 3 } }}>
        <Container
          sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6}}
        >
          {Cards.map((card) => (
            <ButtonBase
              key={card.linkTo}
              aria-label={card.label}
              onClick={() => navigate(card.linkTo)}
              sx={{ overflow: 'hidden' }}
            >
              {card.image ? (
                <Box
                  component="img"
                  src={card.image}
                  alt=""
                  sx={{ display: 'block', height: { xs: 64, md: 88 }, width: 'auto' }}
                />
              ) : (
                // fallback until the real image is added
                <Box
                  sx={{
                    display: 'grid',
                    placeItems: 'center',
                    height: { xs: 64, md: 88 },
                    minWidth: { xs: 96, md: 128 },
                    px: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {card.label}
                  </Typography>
                </Box>
              )}
            </ButtonBase>
          ))}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default QuickLink;
