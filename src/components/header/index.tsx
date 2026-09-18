import {
  Box,
  Button,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';

function Header() {
  return (
    <header>
      <Box className="top-bar">
        <Container maxWidth="lg" className="top-bar-inner">
          <Stack direction="row" spacing={3} alignItems="center">
            <Button className="utility-link">TIN MỚI & ƯU ĐÃI</Button>
            <Button className="utility-link">VÉ CỦA TÔI</Button>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <Button className="utility-link">
              ĐĂNG NHẬP / ĐĂNG KÝ
            </Button>

            <Divider orientation="vertical" flexItem />

            <Button className="utility-link language-active">VN</Button>
            <Button className="utility-link">EN</Button>
          </Stack>
        </Container>
      </Box>

      <Box className="main-header">
        <Container maxWidth="lg" className="main-header-inner">
          <Box className="brand" aria-label="Cinema home">
            <span className="brand-mark">C</span>

            <Box>
              <Typography className="brand-name">CINEMA</Typography>
              <Typography className="brand-subtitle">
                MOVIE EXPERIENCE
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={3} className="main-menu">
            <Button>PHIM</Button>
            <Button>RẠP CINEMA</Button>
            <Button>THÀNH VIÊN</Button>
            <Button>CULTUREPLEX</Button>
          </Stack>

          <Button className="buy-ticket-button">MUA VÉ NGAY</Button>
        </Container>
      </Box>
    </header>
  );
}

export default Header;