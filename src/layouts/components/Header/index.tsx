import { Box, Button, Container, Link } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import PersonIcon from '@mui/icons-material/Person';
import type { IButtonWithIconAndDisplayText } from '@/types';

const utilityLinks: IButtonWithIconAndDisplayText[] = [
  { display: 'Tin mới & ưu đãi', link: '/new_and_sale', icon: ConfirmationNumberIcon },
  { display: 'Vé của tôi', link: '/check_ticket', icon: LoyaltyIcon },
  { display: 'Đăng nhập / Đăng ký', link: '/sign_in', icon: PersonIcon },
];

const HeaderComponent: React.FC = () => {
  const navigate = useNavigate();
  return (
    <header className="site-header">
      <Box className="top-bar">
        <Container maxWidth="lg" className="top-bar-inner">
          <Box className="utility-links">
            {utilityLinks.map(({ display, link, icon: Icon }) => (
              <Link key={link} onClick={() => navigate(link)}>
                <Icon /> {display}
              </Link>
            ))}
          </Box>
        </Container>
      </Box>
      <div className="film-divider" />
      <Container maxWidth="lg" className="main-header-inner">
        <nav className="main-menu">
          <Button onClick={() => navigate('/#now-showing')}>PHIM</Button>
          <Button onClick={() => navigate('/cinemas')}>RẠP CHIẾU</Button>
          <Button onClick={() => navigate('/#member-events')}>THÀNH VIÊN</Button>
          <Button onClick={() => navigate('/#member-events')}>SỰ KIỆN</Button>
        </nav>
        <Button className="buy-ticket-button" onClick={() => navigate('/#now-showing')}>
          MUA VÉ NGAY
        </Button>
      </Container>
      <div className="film-divider" />
    </header>
  );
};

export default HeaderComponent;
