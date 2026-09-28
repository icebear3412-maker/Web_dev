import React, { useState } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';

const seats = [
  'A1',
  'A2',
  'A3',
  'A4',
  'A5',
  'A6',
  'A7',
  'A8',
  'B1',
  'B2',
  'B3',
  'B4',
  'B5',
  'B6',
  'B7',
  'B8',
  'C1',
  'C2',
  'C3',
  'C4',
  'C5',
  'C6',
  'C7',
  'C8',
  'D1',
  'D2',
  'D3',
  'D4',
  'D5',
  'D6',
  'D7',
  'D8',
];

const bookedSeats = ['A3', 'A4', 'B6', 'C2'];

const seatPrice = 100000;

const BookingPage: React.FC = () => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const toggleSeat = (seat: string) => {
    if (bookedSeats.includes(seat)) {
      return;
    }

    setSelectedSeats((previous) =>
      previous.includes(seat)
        ? previous.filter((item) => item !== seat)
        : [...previous, seat],
    );
  };

  const totalPrice = selectedSeats.length * seatPrice;

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Đặt vé
      </Typography>

      <Typography variant="h6" sx={{ mt: 3 }}>
        Phim: Phim mẫu
      </Typography>

      <Typography sx={{ mb: 4 }}>
        Suất chiếu: 19:00 - 19 tháng 9 năm 2026
      </Typography>

      <Box
        sx={{
          width: '80%',
          height: '40px',
          margin: '0 auto 40px',
          backgroundColor: '#ddd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography>MÀN HÌNH</Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gap: 1,
          maxWidth: '500px',
          margin: '0 auto',
        }}
      >
        {seats.map((seat) => {
          const selected = selectedSeats.includes(seat);
          const booked = bookedSeats.includes(seat);

          return (
            <Button
              key={seat}
              variant={selected ? 'contained' : 'outlined'}
              disabled={booked}
              onClick={() => toggleSeat(seat)}
            >
              {seat}
            </Button>
          );
        })}
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography>
          Ghế có thể chọn: Bấm vào ghế để chọn
        </Typography>

        <Typography sx={{ mt: 1 }}>
          Ghế đã được đặt: A3, A4, B6, C2
        </Typography>
      </Box>

      <Box sx={{ mt: 5 }}>
        <Typography>
          Ghế đã chọn:{' '}
          {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Chưa chọn'}
        </Typography>

        <Typography variant="h6" sx={{ mt: 2 }}>
          Tổng tiền: {totalPrice.toLocaleString('vi-VN')} VNĐ
        </Typography>

        <Button
          variant="contained"
          size="large"
          sx={{ mt: 3 }}
          disabled={selectedSeats.length === 0}
        >
          Xác nhận đặt vé
        </Button>
      </Box>
    </Container>
  );
};

export default BookingPage;
