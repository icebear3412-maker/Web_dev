import { Box, Button, Container, Typography } from '@mui/material';

function CinemaRoomBanner() {
  return (
    <section className="room-section">
      <Container maxWidth="lg">
        <Box className="room-banner">
          <Box>
            <Typography className="room-kicker">SPECIAL EXPERIENCE</Typography>
            <Typography className="room-title">ĐẶT TRỌN PHÒNG CHIẾU</Typography>
            <Typography className="room-text">
              Không gian riêng tư cho sinh nhật, sự kiện và những buổi gặp gỡ đặc biệt.
            </Typography>
            <Button className="room-button">KHÁM PHÁ NGAY</Button>
          </Box>
          <Box className="room-price">
            TỪ
            <br />
            <strong>36.000.000đ</strong>
          </Box>
        </Box>
      </Container>
    </section>
  );
}

export default CinemaRoomBanner;
