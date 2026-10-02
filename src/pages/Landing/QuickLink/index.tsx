import { Box, Container } from '@mui/material';
import type { ICardWithLink } from '@/types';
import { useNavigate } from 'react-router-dom';
import { clickableSx } from '@/theme';

import cgvTheater from '@/assets/quickLinkImages/01_cgv_theater.png';
import nowShowing from '@/assets/quickLinkImages/02_phim_dang_chieu.png';
import cgvSpecial from '@/assets/quickLinkImages/03_cgv_special.png';
import cgvMember from '@/assets/quickLinkImages/04_cgv_member.png';
import lienHeCgv from '@/assets/quickLinkImages/05_lien_he_cgv.png';
import newsOffers from '@/assets/quickLinkImages/06_news_offers.png';
import registerNow from '@/assets/quickLinkImages/07_register_now.png';

interface QuickLinkCard extends ICardWithLink {
  label: string;
}

const cards: QuickLinkCard[] = [
  { label: 'Rạp chiếu', image: cgvTheater, linkTo: '/rent' },
  { label: 'Phim đang chiếu', image: nowShowing, linkTo: '/now_showing' },
  { label: 'CGV Special', image: cgvSpecial, linkTo: '/special_room' },
  { label: 'Thuê phòng', image: cgvMember, linkTo: '/rent' },
  { label: 'Liên hệ CGV', image: lienHeCgv, linkTo: '/contact' },
  { label: 'Tin mới và ưu đãi', image: newsOffers, linkTo: '/new_and_sale' },
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
            sx={clickableSx}
            key={card.linkTo}
            onClick={() => navigate(card.linkTo)}
            role="link"
            tabIndex={0}
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
