import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { IMovieShowTime, IMovieShowday, IRoomDetailResPayload } from '../../types';
import { API_BASE_URL } from '@/services/movies';

interface Movie {
  id: string;
  title: string;
  title_vn?: string | null;
  poster?: string | null;
  genre?: string | null;
  director?: string | null;
  cast?: string | null;
  duration?: number | string | null;
  release_date?: string | null;
  age_rating?: string | null;
  rating?: number | null;
  synopsis?: string | null;
  base_price?: number | null;
}

interface Showtime {
  id: string;
  date: string;
  startTime: string;
  endTime?: string;
  room?: string | number;
  price: number;
  time: number[];
}

interface Seat {
  id: string;
  seat_code: string;
  row_label: string;
  seat_number: number;
  seat_type?: string;
  booked: boolean;
}

interface ApiShowtime {
  id: string;
  show_date?: string;
  show_time?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  cinema_room_number?: string | number;
  cinema_room_name?: string;
  base_price?: number;
}

const getDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const formatDate = (value: string) =>
  getDate(value).toLocaleDateString('vi-VN');

const formatTime = (value?: string) =>
  value ? value.slice(0, 5) : '';

const getVietnameseError = (error: unknown, fallback: string) => {
  if (error instanceof Error && /[\u00c0-\u024f\u1e00-\u1eff]/u.test(error.message)) {
    return error.message;
  }
  return fallback;
};

const translateBookingError = (message: string) => {
  const translations: Record<string, string> = {
    'Showtime not found': 'Không tìm thấy suất chiếu.',
    "One or more seats do not belong to this showtime's room":
      'Có ghế không thuộc phòng của suất chiếu này.',
    'One or more seats have already been booked':
      'Một hoặc nhiều ghế vừa được người khác đặt. Vui lòng chọn ghế khác.',
    'Booking failed.': 'Đặt vé thất bại. Vui lòng thử lại.',
  };

  return translations[message] || 'Không thể đặt vé lúc này. Vui lòng thử lại.';
};

const convertShowtime = (item: ApiShowtime): Showtime => {
  const startTime = item.show_time || item.start_time || '';
  const [hour = 0, minute = 0] = startTime
    .split(':')
    .map(Number);

  return {
    id: String(item.id),
    date: item.show_date || item.date || '',
    startTime: formatTime(startTime),
    endTime: formatTime(item.end_time),
    room: item.cinema_room_name || item.cinema_room_number,
    price: item.base_price ?? 100000,
    time: [hour, minute],
  };
};

const getMovieTitle = (movie: Movie) => movie.title_vn?.trim() || movie.title;

const createRoom = (
  seats: Seat[],
  price: number,
): IRoomDetailResPayload => {
  const rows = seats.map(
    (seat) =>
      seat.row_label.toUpperCase().charCodeAt(0) - 64,
  );

  return {
    occupiedSeat: seats
      .filter((seat) => seat.booked)
      .map((seat) => seat.seat_code),
    size: [
      Math.max(...rows, 1),
      Math.max(...seats.map((seat) => seat.seat_number), 1),
    ],
    price,
  };
};

const BookingPage = () => {
  const navigate = useNavigate();
  const movieId = new URLSearchParams(
    window.location.search,
  ).get('movieId');

  const token =
    localStorage.getItem('access_token') ||
    localStorage.getItem('token');

  const [movies, setMovies] = useState<Movie[]>([]);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [room, setRoom] =
    useState<IRoomDetailResPayload | null>(null);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedShowtime, setSelectedShowtime] =
    useState<Showtime | null>(null);
  const [selectedSeats, setSelectedSeats] =
    useState<string[]>([]);

  const [movieOpen, setMovieOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [seatOpen, setSeatOpen] = useState(false);

  const [loadingMovie, setLoadingMovie] = useState(false);
  const [movieError, setMovieError] = useState('');
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [booking, setBooking] = useState(false);
  const [bookingReference, setBookingReference] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const loadMovies = async () => {
      setLoadingMovie(true);
      setMovieError('');

      try {
        if (movieId) {
          const response = await fetch(
            `${API_BASE_URL}/movies/${encodeURIComponent(movieId)}`,
            { signal: controller.signal },
          );
          if (!response.ok) throw new Error('Không tìm thấy phim trong cơ sở dữ liệu.');

          const data = await response.json();
          if (!data.movie) throw new Error('Không tìm thấy phim trong cơ sở dữ liệu.');
          setMovie(data.movie);
          return;
        }

        setMovie(null);
        const response = await fetch(`${API_BASE_URL}/movies?status=showing`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Không tải được danh sách phim.');

        const data = await response.json();
        setMovies(Array.isArray(data.movies) ? data.movies : []);
      } catch (error) {
        if (controller.signal.aborted) return;
        setMovie(null);
        setMovies([]);
        setMovieError(
          getVietnameseError(error, 'Không thể kết nối tới máy chủ phim.'),
        );
      } finally {
        if (!controller.signal.aborted) setLoadingMovie(false);
      }
    };

    loadMovies();
    return () => controller.abort();
  }, [movieId]);

  const loadShowtimes = async (selectedMovieId: string, date?: string) => {
    setLoadingTimes(true);
    setMessage('');

    try {
      const params = new URLSearchParams({ movie_id: selectedMovieId });
      if (date) params.set('date', date);

      const response = await fetch(
        `${API_BASE_URL}/bookings/showtimes?${params.toString()}`,
      );

      if (!response.ok) throw new Error('Không tải được lịch chiếu.');

      const data = await response.json();
      const items: ApiShowtime[] = Array.isArray(data)
        ? data
        : data.showtimes || [];

      setShowtimes(items.map(convertShowtime));
    } catch (error) {
      setShowtimes([]);
      setMessage(getVietnameseError(error, 'Không thể tải lịch chiếu. Vui lòng thử lại.'));
    } finally {
      setLoadingTimes(false);
    }
  };

  const openDates = async (selectedMovie: Movie | null = movie) => {
    if (!selectedMovie) return;
    setMovie(selectedMovie);
    setSelectedDate('');
    setSelectedShowtime(null);
    setDateOpen(true);
    await loadShowtimes(selectedMovie.id);
  };

  const selectDate = async (date: string) => {
    setSelectedDate(date);
    setDateOpen(false);
    setTimeOpen(true);
    if (movie) await loadShowtimes(movie.id, date);
  };

  const selectShowtime = async (showtime: Showtime) => {
    setSelectedShowtime(showtime);
    setSelectedSeats([]);
    setMessage('');
    setLoadingSeats(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/bookings/showtimes/${showtime.id}/seats`,
      );
      if (!response.ok) throw new Error('Không tải được sơ đồ ghế.');

      const data = await response.json();
      const items: Seat[] = Array.isArray(data)
        ? data
        : data.seats || [];
      if (!items.length) throw new Error('Suất chiếu này chưa có ghế trong cơ sở dữ liệu.');

      setSeats(items);
      setRoom(createRoom(items, showtime.price));

      setTimeOpen(false);
      setSeatOpen(true);
    } catch (error) {
      setMessage(
        getVietnameseError(error, 'Không thể tải sơ đồ ghế. Vui lòng thử lại.'),
      );
    } finally {
      setLoadingSeats(false);
    }
  };

  const toggleSeat = (seat: Seat) => {
    if (
      !room ||
      room.occupiedSeat.includes(seat.seat_code)
    ) {
      return;
    }

    setSelectedSeats((current) =>
      current.includes(seat.id)
        ? current.filter((id) => id !== seat.id)
        : [...current, seat.id],
    );
  };

  const cancelSeats = () => {
    setSeatOpen(false);
    setSelectedSeats([]);
    setTimeOpen(true);
  };

  const book = async () => {
    if (!token) {
      setMessage('Vui lòng đăng nhập trước khi đặt vé.');
      return;
    }
    if (!selectedShowtime || !selectedSeats.length) {
      setMessage('Vui lòng chọn ít nhất một ghế.');
      return;
    }

    setBooking(true);
    setMessage('');
    setBookingReference('');

    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
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

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          data?.error || data?.message || data?.detail || 'Booking failed.',
        );
      }

      const result = await response.json();
      const bookingReference = result.booking?.booking_ref;
      if (!bookingReference) throw new Error('Đặt vé thành công nhưng không nhận được mã vé.');
      setBookingReference(bookingReference);
      setMessage(`Đặt vé thành công! Mã vé của bạn: ${bookingReference}`);
      setSelectedSeats([]);

      try {
        const seatsResponse = await fetch(
          `${API_BASE_URL}/bookings/showtimes/${selectedShowtime.id}/seats`,
        );
        if (seatsResponse.ok) {
          const seatsResult = await seatsResponse.json();
          const refreshedSeats: Seat[] = Array.isArray(seatsResult)
            ? seatsResult
            : seatsResult.seats || [];
          setSeats(refreshedSeats);
          setRoom(createRoom(refreshedSeats, selectedShowtime.price));
        }
      } catch {
        // The reservation is already saved; a seat-map refresh can be retried by reopening the showtime.
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? translateBookingError(error.message)
          : 'Không thể đặt vé lúc này. Vui lòng thử lại.',
      );
    } finally {
      setBooking(false);
    }
  };

  const dates: IMovieShowday[] = [];
  const dateSet = new Set<string>();

  showtimes.forEach((showtime) => {
    if (dateSet.has(showtime.date)) return;

    dateSet.add(showtime.date);
    const date = getDate(showtime.date);

    dates.push({
      date: [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
      ],
    });
  });

  const movieShowtimes: IMovieShowTime[] = showtimes.map(
    (showtime) => ({ time: showtime.time }),
  );

  const currentShowtimes = showtimes.filter(
    (showtime) =>
      !selectedDate || showtime.date === selectedDate,
  );

  const selectedSeatCodes = selectedSeats
    .map((id) => seats.find((seat) => seat.id === id)?.seat_code)
    .filter(Boolean) as string[];

  const total = room
    ? selectedSeats.length * room.price
    : 0;

  const [rowCount, columnCount] = room?.size || [0, 0];

  const rows = Array.from({ length: rowCount }, (_, i) =>
    String.fromCharCode(65 + i),
  );

  void movieShowtimes;

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {movieId ? 'Đặt vé phim' : 'Chọn phim'}
        </Typography>

        {loadingMovie ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress aria-label="Đang tải danh sách phim" />
          </Box>
        ) : movieError ? (
          <Alert severity="error" sx={{ mt: 2 }}>{movieError}</Alert>
        ) : movieId ? (
          movie ? (
            <>
              <Typography variant="h5" sx={{ mt: 2 }}>
                {getMovieTitle(movie)}
              </Typography>
              <Typography sx={{ mt: 1 }}>
                {movie.synopsis || 'Chọn lịch chiếu để tiếp tục đặt vé.'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button variant="outlined" onClick={() => setMovieOpen(true)}>
                  Thông tin phim
                </Button>
                <Button variant="contained" onClick={() => openDates(movie)}>
                  Đặt vé
                </Button>
              </Box>
            </>
          ) : null
        ) : !movies.length ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            Chưa có phim đang chiếu trong cơ sở dữ liệu.
          </Alert>
        ) : (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {movies.map((item) => {
              const title = getMovieTitle(item);
              return (
                <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {item.poster ? (
                      <CardMedia
                        component="img"
                        image={item.poster}
                        alt={`Áp phích phim ${title}`}
                        sx={{ height: 320, objectFit: 'cover' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 320,
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: '#f2eee5',
                          color: '#70675d',
                        }}
                      >
                        Chưa có áp phích
                      </Box>
                    )}
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      {item.age_rating && (
                        <Typography variant="caption" color="error" sx={{ fontWeight: 700 }}>
                          {item.age_rating}
                        </Typography>
                      )}
                      <Typography variant="h6" sx={{ fontWeight: 700, minHeight: 56 }}>
                        {title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {[item.genre, item.duration ? `${item.duration} phút` : null]
                          .filter(Boolean)
                          .join(' · ') || 'Thông tin phim đang được cập nhật'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                        <Button
                          fullWidth
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setMovie(item);
                            setMovieOpen(true);
                          }}
                        >
                          Chi tiết
                        </Button>
                        <Button
                          fullWidth
                          size="small"
                          variant="contained"
                          onClick={() => openDates(item)}
                        >
                          Đặt vé
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Paper>

      <Dialog
        open={movieOpen}
        onClose={() => setMovieOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {movie ? getMovieTitle(movie) : 'Thông tin phim'}
        </DialogTitle>

        <DialogContent dividers>
          {movie?.poster && (
            <Box
              component="img"
              src={movie.poster}
              alt={getMovieTitle(movie)}
              sx={{
                display: 'block',
                width: 'auto',
                height: 'auto',
                maxWidth: '100%',
                maxHeight: 'min(65vh, 560px)',
                objectFit: 'contain',
                mx: 'auto',
                mb: 2,
              }}
            />
          )}

          <Typography>
            <b>Thể loại:</b> {movie?.genre || 'Đang cập nhật'}
          </Typography>
          <Typography>
            <b>Đạo diễn:</b> {movie?.director || 'Đang cập nhật'}
          </Typography>
          <Typography>
            <b>Diễn viên:</b> {movie?.cast || 'Đang cập nhật'}
          </Typography>
          <Typography>
            <b>Thời lượng:</b>{' '}
            {movie?.duration ? `${movie.duration} phút` : 'Đang cập nhật'}
          </Typography>
          <Typography>
            <b>Khởi chiếu:</b> {movie?.release_date || 'Đang cập nhật'}
          </Typography>
          <Typography>
            <b>Đánh giá:</b> {movie?.rating ?? 'Đang cập nhật'}
          </Typography>

          <Typography sx={{ mt: 2 }}>
            {movie?.synopsis || 'Chưa có nội dung phim.'}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setMovieOpen(false)}>
            Đóng
          </Button>
          {movie && (
            <Button
              variant="contained"
              onClick={() => {
                setMovieOpen(false);
                void openDates(movie);
              }}
            >
              Đặt vé
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={dateOpen}
        onClose={() => setDateOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Chọn ngày chiếu</DialogTitle>

        <DialogContent dividers>
          {loadingTimes ? (
            <Typography>Đang tải ngày chiếu...</Typography>
          ) : !dates.length ? (
            <Typography>{message || 'Chưa có lịch chiếu cho phim này trong cơ sở dữ liệu.'}</Typography>
          ) : (
            <Grid container spacing={2}>
              {dates.map((item) => {
                const [year, month, day] = item.date;
                const value = `${year}-${String(month).padStart(
                  2,
                  '0',
                )}-${String(day).padStart(2, '0')}`;

                return (
                  <Grid size={{ xs: 12, sm: 6 }} key={value}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => selectDate(value)}
                    >
                      {formatDate(value)}
                    </Button>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDateOpen(false)}>
            Hủy
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={timeOpen}
        onClose={() => setTimeOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Chọn suất chiếu</DialogTitle>

        <DialogContent dividers>
          {message && <Alert severity="error" sx={{ mb: 2 }}>{message}</Alert>}
          {loadingTimes ? (
            <Typography>Đang tải suất chiếu...</Typography>
          ) : !currentShowtimes.length ? (
            <Typography>
              Không có suất chiếu vào ngày này.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {currentShowtimes.map((showtime) => (
                <Grid size={{ xs: 12, sm: 6 }} key={showtime.id}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => selectShowtime(showtime)}
                  >
                    <Box>
                      <Typography>
                        {showtime.startTime}
                        {showtime.endTime
                          ? ` - ${showtime.endTime}`
                          : ''}
                      </Typography>
                      <Typography variant="body2">
                        Phòng: {showtime.room ?? 'Chưa xác định'}
                      </Typography>
                      <Typography variant="body2">
                        {showtime.price.toLocaleString('vi-VN')} VNĐ
                      </Typography>
                    </Box>
                  </Button>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setTimeOpen(false);
              setDateOpen(true);
            }}
          >
            Quay lại chọn ngày
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={seatOpen}
        onClose={cancelSeats}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Chọn ghế</DialogTitle>

        <DialogContent dividers>
          {loadingSeats || !room ? (
            <Typography>Đang tải sơ đồ ghế...</Typography>
          ) : (
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 1,
                    mb: 3,
                    backgroundColor: '#eee',
                  }}
                >
                  MÀN HÌNH
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    overflowX: 'auto',
                  }}
                >
                  {rows.map((row) => (
                    <Box
                      key={row}
                      sx={{
                        display: 'flex',
                        gap: 1,
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        sx={{
                          width: 25,
                          fontWeight: 'bold',
                        }}
                      >
                        {row}
                      </Typography>

                      {Array.from(
                        { length: columnCount },
                        (_, index) => {
                          const number = index + 1;
                          const seat = seats.find(
                            (item) =>
                              item.row_label.toUpperCase() ===
                                row &&
                              item.seat_number === number,
                          );

                          if (!seat) {
                            return (
                              <Box
                                key={`${row}-${number}`}
                                sx={{
                                  width: 42,
                                  height: 42,
                                }}
                              />
                            );
                          }

                          const occupied =
                            room.occupiedSeat.includes(
                              seat.seat_code,
                            );

                          const selected =
                            selectedSeats.includes(seat.id);

                          return (
                            <Button
                              key={seat.id}
                              disabled={occupied}
                              variant={
                                selected ? 'contained' : 'outlined'
                              }
                              onClick={() => toggleSeat(seat)}
                              sx={{
                                minWidth: 42,
                                width: 42,
                                height: 42,
                                p: 0,
                                ...(occupied && {
                                  backgroundColor: '#d32f2f',
                                  color: '#fff',
                                  '&:disabled': {
                                    backgroundColor: '#d32f2f',
                                    color: '#fff',
                                  },
                                }),
                              }}
                            >
                              {seat.seat_code}
                            </Button>
                          );
                        },
                      )}
                    </Box>
                  ))}
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    height: '100%',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Thông tin đặt vé
                  </Typography>

                  <Typography sx={{ mt: 2 }}>
                    <b>Phim:</b> {movie ? getMovieTitle(movie) : '—'}
                  </Typography>

                  <Typography>
                    <b>Ngày chiếu:</b>{' '}
                    {selectedShowtime
                      ? formatDate(selectedShowtime.date)
                      : '-'}
                  </Typography>

                  <Typography>
                    <b>Giờ chiếu:</b>{' '}
                    {selectedShowtime?.startTime || '-'}
                  </Typography>

                  <Typography>
                    <b>Phòng:</b>{' '}
                    {selectedShowtime?.room ?? '-'}
                  </Typography>

                  <Typography>
                    <b>Ghế:</b>{' '}
                    {selectedSeatCodes.length
                      ? selectedSeatCodes.join(', ')
                      : 'Chưa chọn ghế'}
                  </Typography>

                  <Typography>
                    <b>Giá vé:</b>{' '}
                    {room.price.toLocaleString('vi-VN')} VNĐ / ghế
                  </Typography>

                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Tổng cộng: {total.toLocaleString('vi-VN')} VNĐ
                  </Typography>

                  {message && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        color={
                          message.startsWith('Đặt vé thành công!')
                            ? 'success.main'
                            : 'error.main'
                        }
                      >
                        {message}
                      </Typography>
                      {bookingReference && (
                        <Button
                          size="small"
                          sx={{ mt: 1, textTransform: 'none' }}
                          onClick={() => navigate(`/check_ticket?reference=${encodeURIComponent(bookingReference)}`)}
                        >
                          Xem vé bằng mã này
                        </Button>
                      )}
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={cancelSeats}>Hủy</Button>

          <Button
            variant="contained"
            disabled={!selectedSeats.length || booking}
            onClick={book}
          >
            {booking ? 'Đang đặt vé...' : 'Đặt vé'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookingPage;
