import type { ReactNode } from 'react';
import {
  IconButton,
  Tooltip,
  Box,
  Button,
  Container,
  CssBaseline,
  Typography,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { Link } from 'react-router-dom';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import './styles.css';

const themes = {
  dark: createTheme({
    palette: {
      mode: 'dark',
      primary: { main: '#4388e7' },
      background: { default: '#0a1426', paper: '#14223a' },
    },
    typography: {
      fontFamily: 'Be Vietnam Pro, Arial, sans-serif',
      button: { textTransform: 'none', fontWeight: 700 },
    },
    shape: { borderRadius: 2 },
  }),
  light: createTheme({
    palette: { primary: { main: '#b92b30' }, background: { default: '#fbf9ef', paper: '#fffdf6' } },
    typography: {
      fontFamily: 'Be Vietnam Pro, Arial, sans-serif',
      button: { textTransform: 'none', fontWeight: 700 },
    },
    shape: { borderRadius: 2 },
  }),
};
export default function CinemaLayout({
  children,
  light = false,
  onLocate,
  locating = false,
}: {
  children: ReactNode;
  light?: boolean;
  onLocate?: () => void;
  locating?: boolean;
}) {
  return (
    <ThemeProvider theme={light ? themes.light : themes.dark}>
      <CssBaseline />
      <Box className={light ? 'cinema-app rental-app' : 'cinema-app film-app'}>
        <Box component="header" className="cinema-header">
          <Container maxWidth="lg" className="header-inner">
            <Link to="/" className="brand" aria-label="USTH Cinema — Trang chủ">
              USTH<span>CINEMA</span>
              <i>THE BIG SCREEN EXPERIENCE</i>
            </Link>
            <Box component="nav" aria-label="Điều hướng chính" className="main-nav">
              <Link to="/" className={!light ? 'active' : ''}>
                Phim đang chiếu
              </Link>
              <Link to="/book-cinema-room" className={light ? 'active' : ''}>
                Thuê rạp & sự kiện
              </Link>
            </Box>
            <Box className="account-actions">
              {/* Authentication routes belong to the account feature; connect when available. */}
              <Button className="account-placeholder" disabled>
                Sign in
              </Button>
              <Button className="account-placeholder" disabled>
                Sign up
              </Button>
              {onLocate && (
                <Tooltip title="Tìm rạp gần bạn">
                  <span>
                    <IconButton
                      color="inherit"
                      aria-label="Tìm rạp gần bạn"
                      disabled={locating}
                      onClick={onLocate}
                    >
                      <PlaceOutlinedIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            </Box>
          </Container>
        </Box>
        <main>{children}</main>
        <Box component="footer" className="cinema-footer">
          <Container maxWidth="lg" className="footer-inner">
            <div>
              <span className="footer-brand">USTH CINEMA</span>
              <Typography variant="body2">
                Những câu chuyện lớn. Những trải nghiệm đáng nhớ.
              </Typography>
            </div>
            <Button
              component={Link}
              to={light ? '/' : '/book-cinema-room'}
              endIcon={<ArrowForwardIcon />}
            >
              {light ? 'Khám phá phim' : 'Tổ chức sự kiện tại rạp'}
            </Button>
          </Container>
          <Container maxWidth="lg">
            <div className="footer-note">© {new Date().getFullYear()} USTH Cinema.</div>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
