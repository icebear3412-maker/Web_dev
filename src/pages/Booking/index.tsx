import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

const API_URL = 'http://localhost:5000';

/* =========================
   TYPES
========================= */

interface Movie {
  id?: string;
  title?: string;
  title_vn?: string;
  director?: string;
  genre?: string;
  cast?: string;
  release_date?: string;
  duration?: number;
  rating?: number;
  synopsis?: string;
  poster?: string;
  base_price?: number;
}

interface Showtime {
  id: string;
  show_date: string;
  show_time: string;
  cinema_room_number: number;
  base_price?: number;
}

interface Seat {
  id: string;
  seat_code: string;
  row_label: string;
  booked: boolean;
}

/* =========================
   MOCK DATA
========================= */

const mockMovie: Movie = {
  id: '1',
  title_vn: 'Phim mẫu',
  director: 'Đạo diễn mẫu',
  genre: 'Action, Adventure',
  cast: 'Diễn viên mẫu',
  duration: 120,
  rating: 8.5,
  release_date: '2026-09-19',
  synopsis: 'Đây là mô tả mẫu của bộ phim.',
  base_price: 100000,
};

const mockShowtimes: Showtime[] = [
  {
    id: '1',
    show_date: '2026-09-19',
    show_time: '10:00',
    cinema_room_number: 1,
    base_price: 100000,
  },
  {
    id: '2',
    show_date: '2026-09-19',
    show_time: '13:00',
    cinema_room_number: 1,
    base_price: 100000,
  },
  {
    id: '3',
    show_date: '2026-09-19',
    show_time: '19:00',
    cinema_room_number: 1,
    base_price: 100000,
  },
];

const mockSeats: Seat[] = [
  { id: 'A1', seat_code: 'A1', row_label: 'A', booked: false },
  { id: 'A2', seat_code: 'A2', row_label: 'A', booked: false },
  { id: 'A3', seat_code: 'A3', row_label: 'A', booked: true },
  { id: 'A4', seat_code: 'A4', row_label: 'A', booked: true },
  { id: 'A5', seat_code: 'A5', row_label: 'A', booked: false },
  { id: 'A6', seat_code: 'A6', row_label: 'A', booked: false },

  { id: 'B1', seat_code: 'B1', row_label: 'B', booked: false },
  { id: 'B2', seat_code: 'B2', row_label: 'B', booked: false },
  { id: 'B3', seat_code: 'B3', row_label: 'B', booked: false },
  { id: 'B4', seat_code: 'B4', row_label: 'B', booked: false },
  { id: 'B5', seat_code: 'B5', row_label: 'B', booked: false },
  { id: 'B6', seat_code: 'B6', row_label: 'B', booked: true },

  { id: 'C1', seat_code: 'C1', row_label: 'C', booked: false },
  { id: 'C2', seat_code: 'C2', row_label: 'C', booked: true },
  { id: 'C3', seat_code: 'C3', row_label: 'C', booked: false },
  { id: 'C4', seat_code: 'C4', row_label: 'C', booked: false },
  { id: 'C5', seat_code: 'C5', row_label: 'C', booked: false },
  { id: 'C6', seat_code: 'C6', row_label: 'C', booked: false },
];

/* =========================
   BOOKING PAGE
========================= */

const BookingPage: React.FC = () => {
  /* Get movieId from URL */

  const movieId = new URLSearchParams(
    window.location.search,
  ).get('movieId');

  /* Movie */

  const [movie, setMovie] = useState<Movie>(mockMovie);

  /* Dialogs */

  const [movieOpen, setMovieOpen] = useState(true);
  const [dateOpen, setDateOpen] = useState(false);
  const [showtimeOpen, setShowtimeOpen] = useState(false);
  const [seatOpen, setSeatOpen] = useState(false);

  /* Booking data */

  const [showtimes, setShowtimes] =
    useState<Showtime[]>([]);

  const [selectedDate, setSelectedDate] =
    useState('');

  const [selectedShowtime, setSelectedShowtime] =
    useState<Showtime | null>(null);

  const [seats, setSeats] = useState<Seat[]>([]);

  const [selectedSeats, setSelectedSeats] =
    useState<string[]>([]);

  const [message, setMessage] = useState('');

  /* =========================
     GET MOVIE
  ========================= */

  useEffect(() => {
    const getMovie = async () => {
      if (!movieId) return;

      try {
        const response = await fetch(
          `${API_URL}/movies/${movieId}`,
        );

        if (!response.ok) {
          throw new Error();
        }

        const data = await response.json();

        setMovie(data.movie);
      } catch {
        setMovie(mockMovie);
      }
    };

    getMovie();
  }, [movieId]);

  /* =========================
     GET SHOW DAYS
  ========================= */

  const openDates = async () => {
    try {
      const response = await fetch(
        `${API_URL}/bookings/showtimes?movie_id=${movieId}`,
      );

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();

      setShowtimes(data.showtimes);
    } catch {
      setShowtimes(mockShowtimes);
    }

    setMovieOpen(false);
    setDateOpen(true);
  };

  /* =========================
     SELECT DATE
  ========================= */

  const selectDate = async (date: string) => {
    setSelectedDate(date);

    try {
      const response = await fetch(
        `${API_URL}/bookings/showtimes?movie_id=${movieId}&date=${date}`,
      );

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();

      setShowtimes(data.showtimes);
    } catch {
      setShowtimes(
        mockShowtimes.filter(
          (showtime) => showtime.show_date === date,
        ),
      );
    }

    setDateOpen(false);
    setShowtimeOpen(true);
  };

  /* =========================
     SELECT SHOWTIME
  ========================= */

  const selectShowtime = async (showtime: Showtime) => {
    setSelectedShowtime(showtime);
    setSelectedSeats([]);

    try {
      const response = await fetch(
        `${API_URL}/bookings/showtimes/${showtime.id}/seats`,
      );

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();

      setSeats(data.seats);
    } catch {
      setSeats(mockSeats);
    }

    setShowtimeOpen(false);
    setSeatOpen(true);
  };

  /* =========================
     SELECT / UNSELECT SEAT
  ========================= */

  const toggleSeat = (seat: Seat) => {
    if (seat.booked) return;

    if (selectedSeats.includes(seat.id)) {
      setSelectedSeats(
        selectedSeats.filter(
          (id) => id !== seat.id,
        ),
      );
    } else {
      setSelectedSeats([
        ...selectedSeats,
        seat.id,
      ]);
    }
  };

  /* =========================
     TOTAL PRICE
  ========================= */

  const price =
    selectedShowtime?.base_price ??
    movie.base_price ??
    100000;

  const total = selectedSeats.length * price;

  /* =========================
     BOOK
  ========================= */

  const bookTickets = async () => {
    if (!selectedShowtime) return;

    if (selectedSeats.length === 0) {
      setMessage('Vui lòng chọn ít nhất một ghế.');
      return;
    }

    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('access_token');

    if (!token) {
      setMessage('Vui lòng đăng nhập trước.');
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/bookings`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            showtime_id: selectedShowtime.id,
            seat_ids: selectedSeats,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Đặt vé thất bại',
        );
      }

      setMessage('Đặt vé thành công!');

      setSelectedSeats([]);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Đặt vé thất bại',
      );
    }
  };

  /* =========================
     GET UNIQUE DATES
  ========================= */

  const dates: string[] = [];

  showtimes.forEach((showtime) => {
    if (!dates.includes(showtime.show_date)) {
      dates.push(showtime.show_date);
    }
  });

  /* =========================
     RENDER
  ========================= */

  return (
    <Box sx={{ p: 4 }}>

      {/* ================= MOVIE ================= */}

      <Dialog
        open={movieOpen}
        onClose={() => setMovieOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {movie.title_vn || movie.title}
        </DialogTitle>

        <DialogContent>

          <Typography>
            Thể loại: {movie.genre}
          </Typography>

          <Typography>
            Đạo diễn: {movie.director}
          </Typography>

          <Typography>
            Diễn viên: {movie.cast}
          </Typography>

          <Typography>
            Thời lượng: {movie.duration} phút
          </Typography>

          <Typography>
            Ngày phát hành: {movie.release_date}
          </Typography>

          <Typography>
            Rating: {movie.rating}
          </Typography>

          <Typography sx={{ mt: 2 }}>
            {movie.synopsis}
          </Typography>

        </DialogContent>

        <DialogActions>

          <Button
            onClick={() => setMovieOpen(false)}
          >
            Đóng
          </Button>

          <Button
            variant="contained"
            onClick={openDates}
          >
            Book Now
          </Button>

        </DialogActions>
      </Dialog>

      {/* ================= DATE ================= */}

      <Dialog
        open={dateOpen}
        onClose={() => setDateOpen(false)}
      >
        <DialogTitle>
          Chọn ngày chiếu
        </DialogTitle>

        <DialogContent>

          {dates.map((date) => (
            <Button
              key={date}
              variant="outlined"
              onClick={() => selectDate(date)}
              sx={{ m: 1 }}
            >
              {date}
            </Button>
          ))}

        </DialogContent>

        <DialogActions>

          <Button
            onClick={() => {
              setDateOpen(false);
              setMovieOpen(true);
            }}
          >
            Quay lại
          </Button>

        </DialogActions>
      </Dialog>

      {/* ================= SHOWTIME ================= */}

      <Dialog
        open={showtimeOpen}
        onClose={() => setShowtimeOpen(false)}
      >
        <DialogTitle>
          Chọn suất chiếu
        </DialogTitle>

        <DialogContent>

          <Typography sx={{ mb: 2 }}>
            Ngày: {selectedDate}
          </Typography>

          {showtimes
            .filter(
              (showtime) =>
                showtime.show_date === selectedDate,
            )
            .map((showtime) => (
              <Button
                key={showtime.id}
                variant="outlined"
                fullWidth
                onClick={() =>
                  selectShowtime(showtime)
                }
                sx={{ mb: 1 }}
              >
                {showtime.show_time}
                {' - '}
                Phòng {showtime.cinema_room_number}
              </Button>
            ))}

        </DialogContent>

        <DialogActions>

          <Button
            onClick={() => {
              setShowtimeOpen(false);
              setDateOpen(true);
            }}
          >
            Quay lại
          </Button>

        </DialogActions>
      </Dialog>

      {/* ================= SEATS ================= */}

      <Dialog
        open={seatOpen}
        onClose={() => setSeatOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Chọn ghế
        </DialogTitle>

        <DialogContent>

          <Typography sx={{ mb: 2 }}>
            Phim:{' '}
            {movie.title_vn || movie.title}
          </Typography>

          <Typography sx={{ mb: 2 }}>
            Suất:{' '}
            {selectedShowtime?.show_time}
          </Typography>

          {/* Screen */}

          <Box
            sx={{
              textAlign: 'center',
              backgroundColor: '#ddd',
              p: 1,
              mb: 3,
            }}
          >
            MÀN HÌNH
          </Box>

          {/* Seats */}

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {['A', 'B', 'C'].map((row) => (
              <Box
                key={row}
                sx={{
                  display: 'flex',
                  gap: 1,
                }}
              >
                {seats
                  .filter(
                    (seat) =>
                      seat.row_label === row,
                  )
                  .map((seat) => (
                    <Button
                      key={seat.id}
                      disabled={seat.booked}
                      variant={
                        selectedSeats.includes(
                          seat.id,
                        )
                          ? 'contained'
                          : 'outlined'
                      }
                      onClick={() =>
                        toggleSeat(seat)
                      }
                      sx={{
                        minWidth: 45,

                        '&.Mui-disabled': {
                          backgroundColor:
                            '#d32f2f',
                          color: 'white',
                        },
                      }}
                    >
                      {seat.seat_code}
                    </Button>
                  ))}
              </Box>
            ))}
          </Box>

          {/* Summary */}

          <Card sx={{ mt: 4 }}>
            <CardContent>

              <Typography>
                Ghế đã chọn:{' '}
                {selectedSeats.length > 0
                  ? selectedSeats.join(', ')
                  : 'Chưa chọn'}
              </Typography>

              <Typography sx={{ mt: 1 }}>
                Giá mỗi ghế:{' '}
                {price.toLocaleString('vi-VN')}
                {' VNĐ'}
              </Typography>

              <Typography
                variant="h6"
                sx={{ mt: 1 }}
              >
                Tổng tiền:{' '}
                {total.toLocaleString('vi-VN')}
                {' VNĐ'}
              </Typography>

              {message && (
                <Typography
                  sx={{
                    mt: 2,
                    color: 'error.main',
                  }}
                >
                  {message}
                </Typography>
              )}

            </CardContent>
          </Card>

        </DialogContent>

        <DialogActions>

          {/* Cancel → showtimes */}

          <Button
            onClick={() => {
              setSeatOpen(false);
              setShowtimeOpen(true);
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={bookTickets}
          >
            Book
          </Button>

        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default BookingPage;