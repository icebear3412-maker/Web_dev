import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Typography,
} from '@mui/material';

const API_URL = 'http://localhost:5000';

/*
 * Backend response types
 */

interface MovieResponse {
  movie: {
    id?: string;
    title?: string;
    title_vn?: string;
    duration?: number;
    director?: string;
    genre?: string;
    cast?: string;
    release_date?: string;
    rating?: number;
    language?: string;
    synopsis?: string;
    poster?: string;
    trailer_url?: string;
    base_price?: number;
  };
}

interface Showtime {
  id: string;
  movie_id: string;
  cinema_room_number: number;
  show_date: string;
  show_time: string;
  format?: string | null;
  movie_title?: string;
  title_vn?: string;
  poster?: string;
  base_price?: number;
  cinema_room_id?: string;
  cinema_room_name?: string;
  room_type?: string;
}

interface ShowtimesResponse {
  showtimes: Showtime[];
}

interface Seat {
  id: string;
  seat_code: string;
  row_label?: string;
  seat_number?: number;
  seat_type?: string;
  booked: boolean;
}

interface SeatsResponse {
  showtime_id: string;
  seats: Seat[];
}

/*
 * Mock movie.
 * Used when backend movie API is unavailable.
 */

const mockMovie = {
  id: 'movie-demo',
  title: 'Phim mẫu',
  title_vn: 'Phim mẫu',
  duration: 120,
  director: 'Đạo diễn mẫu',
  genre: 'Action, Adventure',
  cast: 'Diễn viên mẫu',
  release_date: '2026-09-19',
  rating: 8.5,
  language: 'Tiếng Việt',
  synopsis:
    'Đây là thông tin mô tả mẫu của bộ phim. Dữ liệu này được sử dụng khi backend chưa có dữ liệu phim.',
  poster: '',
  trailer_url: '',
  base_price: 100000,
};

/*
 * Mock showtimes.
 */

const mockShowtimes: Showtime[] = [
  {
    id: 'mock-showtime-1',
    movie_id: 'movie-demo',
    cinema_room_number: 1,
    show_date: '2026-09-19',
    show_time: '10:00',
    format: '2D',
    movie_title: 'Phim mẫu',
    title_vn: 'Phim mẫu',
    base_price: 100000,
    cinema_room_name: 'Phòng 1',
    room_type: '2D',
  },
  {
    id: 'mock-showtime-2',
    movie_id: 'movie-demo',
    cinema_room_number: 1,
    show_date: '2026-09-19',
    show_time: '13:00',
    format: '2D',
    movie_title: 'Phim mẫu',
    title_vn: 'Phim mẫu',
    base_price: 100000,
    cinema_room_name: 'Phòng 1',
    room_type: '2D',
  },
  {
    id: 'mock-showtime-3',
    movie_id: 'movie-demo',
    cinema_room_number: 1,
    show_date: '2026-09-19',
    show_time: '19:00',
    format: '2D',
    movie_title: 'Phim mẫu',
    title_vn: 'Phim mẫu',
    base_price: 100000,
    cinema_room_name: 'Phòng 1',
    room_type: '2D',
  },
];

/*
 * Mock seats.
 */

const mockSeats: Seat[] = [
  ...Array.from({ length: 4 }, (_, rowIndex) =>
    Array.from({ length: 8 }, (_, seatIndex) => {
      const row = String.fromCharCode(65 + rowIndex);
      const number = seatIndex + 1;

      return {
        id: `${row}${number}`,
        seat_code: `${row}${number}`,
        row_label: row,
        seat_number: number,
        seat_type: 'standard',
        booked:
          `${row}${number}` === 'A3' ||
          `${row}${number}` === 'A4' ||
          `${row}${number}` === 'B6' ||
          `${row}${number}` === 'C2',
      };
    }),
  ).flat(),
];

/*
 * Helpers
 */

const formatPrice = (price: number) =>
  price.toLocaleString('vi-VN') + ' VNĐ';

const formatDate = (date: string) => {
  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const BookingPage: React.FC = () => {
  /*
   * Get movieId from:
   *
   * /booking?movieId=123
   */

  const params = useMemo(
    () => new URLSearchParams(window.location.search),
    [],
  );

  const movieId = params.get('movieId');

  /*
   * Movie
   */

  const [movie, setMovie] = useState<MovieResponse['movie'] | null>(null);
  const [movieLoading, setMovieLoading] = useState(true);

  /*
   * Popup states
   */

  const [movieDialogOpen, setMovieDialogOpen] = useState(true);
  const [showdayDialogOpen, setShowdayDialogOpen] = useState(false);
  const [showtimeDialogOpen, setShowtimeDialogOpen] = useState(false);
  const [seatDialogOpen, setSeatDialogOpen] = useState(false);

  /*
   * Showtime
   */

  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedShowtime, setSelectedShowtime] =
    useState<Showtime | null>(null);

  /*
   * Seats
   */

  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [seatLoading, setSeatLoading] = useState(false);

  /*
   * General states
   */

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  /*
   * Load movie
   */

  useEffect(() => {
    const loadMovie = async () => {
      setMovieLoading(true);

      if (!movieId) {
        setMovie(mockMovie);
        setMovieLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/movies/${movieId}`);

        if (!response.ok) {
          throw new Error('Movie API failed');
        }

        const data: MovieResponse = await response.json();

        setMovie(data.movie);
      } catch {
        /*
         * Backend unavailable:
         * use mock movie.
         */

        setMovie({
          ...mockMovie,
          id: movieId,
        });
      } finally {
        setMovieLoading(false);
      }
    };

    void loadMovie();
  }, [movieId]);

  /*
   * Get all available show days.
   *
   * We first get showtimes without date.
   * Then group them by show_date.
   */

  const loadShowdays = async () => {
    setLoading(true);
    setMessage('');

    try {
      if (!movieId) {
        setShowtimes(mockShowtimes);
        setShowdayDialogOpen(true);
        return;
      }

      const response = await fetch(
        `${API_URL}/bookings/showtimes?movie_id=${encodeURIComponent(movieId)}`,
      );

      if (!response.ok) {
        throw new Error('Showtime API failed');
      }

      const data: ShowtimesResponse = await response.json();

      setShowtimes(data.showtimes);

      if (data.showtimes.length === 0) {
        setShowtimes(mockShowtimes);
      }

      setShowdayDialogOpen(true);
    } catch {
      setShowtimes(mockShowtimes);
      setShowdayDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Unique show days.
   */

  const showDays = useMemo(() => {
    const dates = showtimes.map((showtime) => showtime.show_date);

    return [...new Set(dates)].sort();
  }, [showtimes]);

  /*
   * Select a day.
   */

  const selectDate = async (date: string) => {
    setSelectedDate(date);
    setShowdayDialogOpen(false);

    setLoading(true);

    try {
      if (!movieId) {
        setShowtimeDialogOpen(true);
        return;
      }

      const response = await fetch(
        `${API_URL}/bookings/showtimes?movie_id=${encodeURIComponent(
          movieId,
        )}&date=${encodeURIComponent(date)}`,
      );

      if (!response.ok) {
        throw new Error('Showtime API failed');
      }

      const data: ShowtimesResponse = await response.json();

      if (data.showtimes.length > 0) {
        setShowtimes(data.showtimes);
      }

      setShowtimeDialogOpen(true);
    } catch {
      setShowtimeDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Select showtime.
   * Then get seats.
   */

  const selectShowtime = async (showtime: Showtime) => {
    setSelectedShowtime(showtime);
    setShowtimeDialogOpen(false);
    setSeatDialogOpen(true);
    setSeatLoading(true);
    setSelectedSeats([]);

    try {
      const response = await fetch(
        `${API_URL}/bookings/showtimes/${encodeURIComponent(showtime.id)}/seats`,
      );

      if (!response.ok) {
        throw new Error('Seats API failed');
      }

      const data: SeatsResponse = await response.json();

      setSeats(data.seats);
    } catch {
      setSeats(mockSeats);
    } finally {
      setSeatLoading(false);
    }
  };

  /*
   * Toggle seat.
   */

  const toggleSeat = (seat: Seat) => {
    if (seat.booked) {
      return;
    }

    setSelectedSeats((previous) =>
      previous.includes(seat.id)
        ? previous.filter((id) => id !== seat.id)
        : [...previous, seat.id],
    );
  };

  /*
   * Selected seat objects.
   */

  const selectedSeatObjects = useMemo(
    () => seats.filter((seat) => selectedSeats.includes(seat.id)),
    [seats, selectedSeats],
  );

  /*
   * Price.
   */

  const seatPrice =
    selectedShowtime?.base_price ??
    movie?.base_price ??
    mockMovie.base_price ??
    100000;

  const totalPrice = selectedSeats.length * seatPrice;

  /*
   * Group seats by row.
   */

  const seatRows = useMemo(() => {
    const rows: Record<string, Seat[]> = {};

    seats.forEach((seat) => {
      const row = seat.row_label || seat.seat_code.charAt(0);

      if (!rows[row]) {
        rows[row] = [];
      }

      rows[row].push(seat);
    });

    return Object.entries(rows).sort(([a], [b]) =>
      a.localeCompare(b),
    );
  }, [seats]);

  /*
   * Book tickets.
   */

  const confirmBooking = async () => {
    if (!selectedShowtime || selectedSeats.length === 0) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      /*
       * The backend requires an authenticated user.
       *
       * Change this key if the signin implementation
       * in the project stores the JWT under another key.
       */

      const token =
        localStorage.getItem('token') ||
        localStorage.getItem('access_token');

      if (!token) {
        setMessage('Bạn cần đăng nhập trước khi đặt vé.');
        return;
      }

      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          showtime_id: selectedShowtime.id,
          seat_ids: selectedSeats,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Đặt vé thất bại');
      }

      setMessage(
        `Đặt vé thành công! Mã đặt vé: ${data.booking.booking_ref}`,
      );

      setSelectedSeats([]);
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage('Đặt vé thất bại.');
      }
    } finally {
      setLoading(false);
    }
  };

  /*
   * Back from seats -> showtimes.
   */

  const cancelSeatSelection = () => {
    setSelectedSeats([]);
    setSeatDialogOpen(false);
    setShowtimeDialogOpen(true);
  };

  /*
   * Back from showtimes -> days.
   */

  const backToShowdays = () => {
    setShowtimeDialogOpen(false);
    setShowdayDialogOpen(true);
  };

  if (movieLoading) {
    return (
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 5 }}>
      {/* Movie information */}

      <Dialog
        open={movieDialogOpen}
        onClose={() => setMovieDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {movie?.title_vn || movie?.title || 'Thông tin phim'}
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 4 }}>
              {movie?.poster ? (
                <Box
                  component="img"
                  src={movie.poster}
                  alt={movie.title_vn || movie.title || 'Movie poster'}
                  sx={{
                    width: '100%',
                    borderRadius: 2,
                    display: 'block',
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    aspectRatio: '2 / 3',
                    backgroundColor: '#ddd',
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Typography>Poster</Typography>
                </Box>
              )}
            </Grid>

            <Grid size={{ xs: 12, sm: 8 }}>
              <Typography variant="h5" gutterBottom>
                {movie?.title_vn || movie?.title || 'Phim mẫu'}
              </Typography>

              <Typography sx={{ mb: 1 }}>
                <strong>Thể loại:</strong>{' '}
                {movie?.genre || 'Đang cập nhật'}
              </Typography>

              <Typography sx={{ mb: 1 }}>
                <strong>Đạo diễn:</strong>{' '}
                {movie?.director || 'Đang cập nhật'}
              </Typography>

              <Typography sx={{ mb: 1 }}>
                <strong>Diễn viên:</strong>{' '}
                {movie?.cast || 'Đang cập nhật'}
              </Typography>

              <Typography sx={{ mb: 1 }}>
                <strong>Thời lượng:</strong>{' '}
                {movie?.duration
                  ? `${movie.duration} phút`
                  : 'Đang cập nhật'}
              </Typography>

              <Typography sx={{ mb: 1 }}>
                <strong>Ngày phát hành:</strong>{' '}
                {movie?.release_date || 'Đang cập nhật'}
              </Typography>

              <Typography sx={{ mb: 1 }}>
                <strong>Đánh giá:</strong>{' '}
                {movie?.rating ?? 'Đang cập nhật'}
              </Typography>

              <Typography sx={{ mt: 2 }}>
                {movie?.synopsis || 'Chưa có mô tả phim.'}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setMovieDialogOpen(false)}
          >
            Đóng
          </Button>

          <Button
            variant="contained"
            onClick={() => {
              setMovieDialogOpen(false);
              void loadShowdays();
            }}
          >
            Đặt vé
          </Button>
        </DialogActions>
      </Dialog>

      {/* Show days */}

      <Dialog
        open={showdayDialogOpen}
        onClose={() => setShowdayDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Chọn ngày chiếu</DialogTitle>

        <DialogContent dividers>
          {loading ? (
            <Box
              sx={{
                py: 4,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <CircularProgress />
            </Box>
          ) : showDays.length === 0 ? (
            <Typography>
              Hiện chưa có ngày chiếu.
            </Typography>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              {showDays.map((date) => (
                <Button
                  key={date}
                  variant={
                    selectedDate === date
                      ? 'contained'
                      : 'outlined'
                  }
                  onClick={() => void selectDate(date)}
                >
                  {formatDate(date)}
                </Button>
              ))}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setShowdayDialogOpen(false);
              setMovieDialogOpen(true);
            }}
          >
            Quay lại
          </Button>
        </DialogActions>
      </Dialog>

      {/* Showtimes */}

      <Dialog
        open={showtimeDialogOpen}
        onClose={() => setShowtimeDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Suất chiếu
          {selectedDate ? ` - ${formatDate(selectedDate)}` : ''}
        </DialogTitle>

        <DialogContent dividers>
          {showtimes.filter(
            (showtime) =>
              !selectedDate ||
              showtime.show_date === selectedDate,
          ).length === 0 ? (
            <Typography>
              Không có suất chiếu trong ngày này.
            </Typography>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              {showtimes
                .filter(
                  (showtime) =>
                    !selectedDate ||
                    showtime.show_date === selectedDate,
                )
                .map((showtime) => (
                  <Button
                    key={showtime.id}
                    variant="outlined"
                    onClick={() => void selectShowtime(showtime)}
                    sx={{
                      justifyContent: 'space-between',
                      py: 1.5,
                    }}
                  >
                    <span>
                      {showtime.show_time}
                    </span>

                    <span>
                      {showtime.cinema_room_name ||
                        `Phòng ${showtime.cinema_room_number}`}
                    </span>
                  </Button>
                ))}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={backToShowdays}>
            Quay lại
          </Button>
        </DialogActions>
      </Dialog>

      {/* Seat selection */}

      <Dialog
        open={seatDialogOpen}
        onClose={cancelSeatSelection}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>
          Chọn ghế
          {selectedShowtime
            ? ` - ${selectedShowtime.show_time}`
            : ''}
        </DialogTitle>

        <DialogContent dividers>
          {seatLoading ? (
            <Box
              sx={{
                minHeight: 300,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={4}>
              {/* Room */}

              <Grid size={{ xs: 12, md: 8 }}>
                <Typography
                  align="center"
                  sx={{
                    mb: 4,
                    py: 1,
                    backgroundColor: '#ddd',
                    borderRadius: 1,
                    fontWeight: 'bold',
                  }}
                >
                  MÀN HÌNH
                </Typography>

                {seatRows.map(([row, rowSeats]) => (
                  <Box
                    key={row}
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        width: 25,
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: 'bold',
                      }}
                    >
                      {row}
                    </Typography>

                    {rowSeats.map((seat) => {
                      const selected =
                        selectedSeats.includes(seat.id);

                      return (
                        <Button
                          key={seat.id}
                          variant={
                            selected
                              ? 'contained'
                              : 'outlined'
                          }
                          disabled={seat.booked}
                          onClick={() =>
                            toggleSeat(seat)
                          }
                          sx={{
                            minWidth: 48,
                            height: 40,
                            backgroundColor: seat.booked
                              ? '#d32f2f'
                              : undefined,
                            color: seat.booked
                              ? '#fff'
                              : undefined,
                            '&.Mui-disabled': {
                              backgroundColor: '#d32f2f',
                              color: '#fff',
                            },
                          }}
                        >
                          {seat.seat_code}
                        </Button>
                      );
                    })}
                  </Box>
                ))}

                <Box
                  sx={{
                    mt: 4,
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 3,
                    flexWrap: 'wrap',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        border: '1px solid #1976d2',
                      }}
                    />
                    <Typography>
                      Còn trống
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: '#1976d2',
                      }}
                    />
                    <Typography>
                      Đang chọn
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: '#d32f2f',
                      }}
                    />
                    <Typography>
                      Đã đặt
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Booking summary */}

              <Grid size={{ xs: 12, md: 4 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">
                      Thông tin đặt vé
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Typography>
                      <strong>Phim:</strong>{' '}
                      {movie?.title_vn ||
                        movie?.title ||
                        'Phim mẫu'}
                    </Typography>

                    <Typography sx={{ mt: 1 }}>
                      <strong>Ngày:</strong>{' '}
                      {selectedDate
                        ? formatDate(selectedDate)
                        : '---'}
                    </Typography>

                    <Typography sx={{ mt: 1 }}>
                      <strong>Suất:</strong>{' '}
                      {selectedShowtime?.show_time ||
                        '---'}
                    </Typography>

                    <Typography sx={{ mt: 1 }}>
                      <strong>Phòng:</strong>{' '}
                      {selectedShowtime?.cinema_room_name ||
                        `Phòng ${
                          selectedShowtime?.cinema_room_number ||
                          ''
                        }`}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Typography>
                      <strong>Ghế:</strong>
                    </Typography>

                    <Typography
                      sx={{
                        mt: 1,
                        wordBreak: 'break-word',
                      }}
                    >
                      {selectedSeatObjects.length > 0
                        ? selectedSeatObjects
                            .map((seat) => seat.seat_code)
                            .join(', ')
                        : 'Chưa chọn ghế'}
                    </Typography>

                    <Typography
                      variant="h6"
                      sx={{ mt: 3 }}
                    >
                      Tổng tiền
                    </Typography>

                    <Typography
                      variant="h5"
                      sx={{ mt: 1 }}
                    >
                      {formatPrice(totalPrice)}
                    </Typography>

                    {message && (
                      <Typography
                        sx={{
                          mt: 2,
                          color: message.includes(
                            'thành công',
                          )
                            ? 'success.main'
                            : 'error.main',
                        }}
                      >
                        {message}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={cancelSeatSelection}>
            Hủy
          </Button>

          <Button
            variant="contained"
            disabled={
              selectedSeats.length === 0 || loading
            }
            onClick={() => void confirmBooking()}
          >
            {loading ? 'Đang đặt...' : 'Đặt vé'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingPage;