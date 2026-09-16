import { Box, Container, Divider, Grid, Typography } from '@mui/material';

function Footer() {
  return (
    <footer className="footer">
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography className="footer-brand">CINEMA</Typography>
            <Typography className="footer-text">Hệ thống bán vé xem phim trực tuyến.</Typography>
          </Grid>
          <Grid item xs={6} md={2}>
            <Typography className="footer-heading">VỀ CHÚNG TÔI</Typography>
            <Typography>Giới thiệu</Typography>
            <Typography>Liên hệ</Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography className="footer-heading">ĐIỀU KHOẢN</Typography>
            <Typography>Điều khoản sử dụng</Typography>
            <Typography>Chính sách bảo mật</Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography className="footer-heading">LIÊN HỆ</Typography>
            <Typography>Hotline: 1900 0000</Typography>
            <Typography>Email: support@cinema.vn</Typography>
          </Grid>
        </Grid>
        <Divider className="footer-divider" />
        <Typography className="copyright">
          © 2026 Cinema Ticket Seller. All rights reserved.
        </Typography>
      </Container>
    </footer>
  );
}

export default Footer;
