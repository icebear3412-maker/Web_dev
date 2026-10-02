import { Alert, Box, Button, Container, TextField, Typography } from '@mui/material';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchPublicBooking, type PublicBooking } from '@/services/movies';

const TicketCheck: React.FC = () => {
  const [searchParams] = useSearchParams();
  const referenceFromUrl = searchParams.get('reference')?.trim() || '';
  const [reference, setReference] = useState('');
  const [booking, setBooking] = useState<PublicBooking | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const lookup = useCallback(async (bookingReference: string) => {
    setBooking(null);
    setError('');
    setLoading(true);
    try {
      setBooking(await fetchPublicBooking(bookingReference));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không tra cứu được vé.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!referenceFromUrl) return;
    setReference(referenceFromUrl);
    void lookup(referenceFromUrl);
  }, [lookup, referenceFromUrl]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void lookup(reference.trim());
  };

  const dateLabel = booking?.show_date
    ? booking.show_date.slice(0, 10).split('-').reverse().join('/')
    : '';

  return (
    <main className="ticket-check-page">
      <Container maxWidth="sm">
        <Typography className="section-title">VÉ CỦA TÔI</Typography>
        <Typography className="ticket-check-hint">
          Nhập mã booking reference trong email hoặc tin nhắn xác nhận để tra cứu vé.
        </Typography>
        <Box component="form" className="ticket-check-form" onSubmit={submit}>
          <TextField
            fullWidth
            required
            label="Mã vé / Booking reference"
            value={reference}
            onChange={(event) => setReference(event.target.value)}
          />
          <Button type="submit" className="buy-ticket-button" disabled={loading}>
            {loading ? 'ĐANG KIỂM TRA…' : 'KIỂM TRA VÉ'}
          </Button>
        </Box>
        {error && <Alert severity="warning">{error}</Alert>}
        {booking && (
          <Box className="ticket-result">
            <Typography className="ticket-result-status">
              {booking.status.replaceAll('_', ' ').toUpperCase()}
            </Typography>
            <Typography component="h2" className="ticket-result-title">
              {booking.title_vn || booking.movie_title}
            </Typography>
            <Typography>Mã vé: {booking.booking_ref}</Typography>
            <Typography>Ngày giờ chiếu: {dateLabel} · {booking.show_time.slice(0, 5)}</Typography>
            <Typography>
              Rạp / Phòng: {booking.cinema_name || 'CGV'} · {booking.room_name || `Phòng ${booking.room_number ?? ''}`}
            </Typography>
            {booking.format && <Typography>Định dạng: {booking.format}</Typography>}
            <Typography>
              Ghế:{' '}
              {booking.seats.map((seat) => seat.seat_code).join(', ') || 'Chưa có thông tin ghế'}
            </Typography>
            <Typography>Tổng tiền: {Number(booking.total_amount).toLocaleString('vi-VN')} VNĐ</Typography>
          </Box>
        )}
      </Container>
    </main>
  );
};

export default TicketCheck;
