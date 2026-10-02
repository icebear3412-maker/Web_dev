import { Box, Button, Container, Link } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import PersonIcon from '@mui/icons-material/Person';
import type { IButtonWithIconAndDisplayText } from '@/types';
import logo from '@/assets/logo.png';

const utilityLinks: IButtonWithIconAndDisplayText[] = [
  { display: 'Tin mới & ưu đãi', link: '/event', icon: ConfirmationNumberIcon },
  { display: 'Vé của tôi', link: '/check_ticket', icon: LoyaltyIcon },
];

const HeaderComponent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => Boolean(localStorage.getItem('token') || localStorage.getItem('access_token')),
  );

  useEffect(() => {
    const syncAuthentication = () => {
      setIsLoggedIn(Boolean(localStorage.getItem('token') || localStorage.getItem('access_token')));
    };

    syncAuthentication();
    window.addEventListener('storage', syncAuthentication);
    return () => window.removeEventListener('storage', syncAuthentication);
  }, [location]);

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
            <Link
              aria-label={isLoggedIn ? 'Mở trang tài khoản' : 'Đăng nhập hoặc đăng ký'}
              title={isLoggedIn ? 'Tài khoản của tôi' : 'Đăng nhập / Đăng ký'}
              onClick={() => navigate(isLoggedIn ? '/profile' : '/signin')}
            >
              <PersonIcon />
              {!isLoggedIn && ' Đăng nhập / Đăng ký'}
            </Link>
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
          <img src={logo} alt="USTH" />
        </Button>
        <nav className="main-menu">
          <Button onClick={() => navigate('/booking')}>PHIM</Button>
          <Button onClick={() => navigate('/cinemas')}>RẠP CHIẾU</Button>
          <Button onClick={() => navigate('/event')}>SỰ KIỆN</Button>
        </nav>
        <Button className="buy-ticket-button" onClick={() => navigate('/booking')}>
          MUA VÉ NGAY
        </Button>
      </Container>
      <div className="film-divider" />
    </header>
  );
};

export default HeaderComponent;
