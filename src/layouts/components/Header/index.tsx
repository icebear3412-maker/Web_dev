import { Box, Button, Container, Link } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import PersonIcon from '@mui/icons-material/Person';
import type { IButtonWithIconAndDisplayText } from '@/types';
import logo from '@/assets/logo.png';

const utilityLinks: IButtonWithIconAndDisplayText[] = [
  { display: 'Tin mới & ưu đãi', link: '/new_and_sale', icon: ConfirmationNumberIcon },
  { display: 'Vé của tôi', link: '/check_ticket', icon: LoyaltyIcon },
  { display: 'Đăng nhập / Đăng ký', link: '/signin', icon: PersonIcon },
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
        <Button
          className="brand-logo-link"
          aria-label="Về trang chủ"
          onClick={() => navigate('/')}
        >
          <img src={logo} alt="CGV" />
        </Button>
        <nav className="main-menu">
          <Button onClick={() => navigate('/booking')}>PHIM</Button>
          <Button onClick={() => navigate('/booking')}>RẠP CHIẾU</Button>
          <Button onClick={() => navigate('/new_and_sale')}>THÀNH VIÊN</Button>
          <Button onClick={() => navigate('/new_and_sale')}>SỰ KIỆN</Button>
        </nav>
        <Button className="buy-ticket-button" onClick={() => navigate('/rent')}>
          MUA VÉ NGAY
        </Button>
      </Container>
      <div className="film-divider" />
    </header>
  );
};

export default HeaderComponent;
