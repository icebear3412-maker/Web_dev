import { Box, Container } from '@mui/material';
import type { ICardWithLink } from '@/types';
import { useNavigate } from 'react-router-dom';
import { clickableSx } from '@/theme';

import usthTheater from '@/assets/quickLinkImages/01_usth_theater.png';
import nowShowing from '@/assets/quickLinkImages/02_phim_dang_chieu.png';
import usthSpecial from '@/assets/quickLinkImages/03_usth_special.png';
import usthMember from '@/assets/quickLinkImages/04_usth_member_labelled.png';
import lienHeUsth from '@/assets/quickLinkImages/05_lien_he_usth.png';
import newsOffers from '@/assets/quickLinkImages/06_news_offers.png';
import registerNow from '@/assets/quickLinkImages/07_register_now.png';

interface QuickLinkCard extends Omit<ICardWithLink, 'linkTo'> {
  label: string;
  linkTo?: string;
}

const cards: QuickLinkCard[] = [
  { label: 'Rạp chiếu', image: usthTheater, linkTo: '/cinemas' },
  { label: 'Phim đang chiếu', image: nowShowing, linkTo: '/booking' },
  { label: 'USTH Special', image: usthSpecial, linkTo: '/event' },
  { label: 'Thuê phòng', image: usthMember, linkTo: '/cinemas' },
  { label: 'Liên hệ USTH', image: lienHeUsth },
  { label: 'Tin mới và ưu đãi', image: newsOffers, linkTo: '/event' },
  { label: 'Đăng ký thành viên', image: registerNow, linkTo: '/signup' },
];

const QuickLinks: React.FC = () => {
  const navigate = useNavigate();
  return (
    <section className="quick-links">
      <Container maxWidth="lg" className="quick-links-inner">
        {cards.map((card) => (
          <Box
            className="quick-link-card"
            sx={card.linkTo ? clickableSx : { cursor: 'default' }}
            key={card.label}
            onClick={() => card.linkTo && navigate(card.linkTo)}
            role={card.linkTo ? 'link' : undefined}
            tabIndex={card.linkTo ? 0 : -1}
            aria-label={card.label}
          >
            <Box
              component="img"
              src={card.image}
              alt={card.label}
              sx={{
                display: 'block',
                width: 'auto',
                height: 100,
                maxWidth: '100%',
                objectFit: 'contain',
              }}
            />
          </Box>
        ))}
      </Container>
    </section>
  );
};

export default QuickLinks;
