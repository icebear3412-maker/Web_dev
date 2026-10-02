import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import type {
  IMovieInfoPayload,
  IMovieShowTime,
  IMovieShowday,
  IRoomDetailResPayload,
} from '../../types';

interface Movie extends Partial<IMovieInfoPayload> {
  id?: string | number;
  base_price?: number;
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
  date: string;
  start_time: string;
  end_time?: string;
  cinema_room_number?: string | number;
  base_price?: number;
}

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

const mockMovie: Movie = {
  id: 'mock-movie',
  name: 'Movie Title',
  genre: 'Action, Adventure',
  director: 'Director',
  actor: 'Actor',
  time: 120,
  releaseDate: '2026-01-01',
  rating: 8,
  description: 'Movie description.',
  base_price: 100000,
};

const mockShowtimes: Showtime[] = [
  {
    id: 'mock-1',
    date: '2026-10-01',
    startTime: '09:00',
    endTime: '11:00',
    room: 1,
    price: 100000,
    time: [9, 0],
  },
  {
    id: 'mock-2',
    date: '2026-10-01',
    startTime: '13:00',
    endTime: '15:00',
    room: 1,
    price: 100000,
    time: [13, 0],
  },
  {
    id: 'mock-3',
    date: '2026-10-01',
    startTime: '19:00',
    endTime: '21:00',
    room: 2,
    price: 100000,
    time: [19, 0],
  },
  {
    id: 'mock-4',
    date: '2026-10-02',
    startTime: '10:00',
    endTime: '12:00',
    room: 1,
    price: 100000,
    time: [10, 0],
  },
  {
    id: 'mock-5',
    date: '2026-10-02',
    startTime: '20:00',
    endTime: '22:00',
    room: 2,
    price: 100000,
    time: [20, 0],
  },
];

const createMockSeats = (): Seat[] =>
  Array.from({ length: 18 }, (_, index) => {
    const row = String.fromCharCode(
      65 + Math.floor(index / 6),
    );
    const number = (index % 6) + 1;

    return {
      id: `mock-seat-${index + 1}`,
      seat_code: `${row}${number}`,
      row_label: row,
      seat_number: number,
      booked: [1, 7, 14].includes(index),
    };
  });

const getDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const formatDate = (value: string) =>
  getDate(value).toLocaleDateString('en-GB');

const formatTime = (value?: string) =>
  value ? value.slice(0, 5) : '';

const convertShowtime = (item: ApiShowtime): Showtime => {
  const [hour = 0, minute = 0] = item.start_time
    .split(':')
    .map(Number);

  return {
    id: String(item.id),
    date: item.date,
    startTime: formatTime(item.start_time),
    endTime: formatTime(item.end_time),
    room: item.cinema_room_number,
    price: item.base_price ?? 100000,
    time: [hour, minute],
  };
};

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
  const movieId = new URLSearchParams(
    window.location.search,
  ).get('movieId');

  const token =
    localStorage.getItem('access_token') ||
    localStorage.getItem('token');

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
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadMovie = async () => {
      setLoadingMovie(true);

      if (!movieId) {
        setMovie(mockMovie);
        setLoadingMovie(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/movies/${movieId}`,
        );

        if (!response.ok) throw new Error();

        const data = await response.json();
        setMovie(data.movie || mockMovie);
      } catch {
        setMovie({ ...mockMovie, id: movieId });
      } finally {
        setLoadingMovie(false);
      }
    };

    loadMovie();
  }, [movieId]);

  const loadShowtimes = async (date?: string) => {
    setLoadingTimes(true);
    setMessage('');

    if (!movieId) {
      setShowtimes(
        date
          ? mockShowtimes.filter((item) => item.date === date)
          : mockShowtimes,
      );
      setLoadingTimes(false);
      return;
    }

    try {
      const query = date
        ? `?movie_id=${movieId}&date=${date}`
        : `?movie_id=${movieId}`;

      const response = await fetch(
        `${API_URL}/bookings/showtimes${query}`,
      );

      if (!response.ok) throw new Error();

      const data = await response.json();
      const items: ApiShowtime[] = Array.isArray(data)
        ? data
        : data.showtimes || [];

      setShowtimes(items.map(convertShowtime));
    } catch {
      setShowtimes(
        date
          ? mockShowtimes.filter((item) => item.date === date)
          : mockShowtimes,
      );
    } finally {
      setLoadingTimes(false);
    }
  };

  const openDates = async () => {
    setDateOpen(true);
    await loadShowtimes();
  };

  const selectDate = async (date: string) => {
    setSelectedDate(date);
    setDateOpen(false);
    setTimeOpen(true);
    await loadShowtimes(date);
  };

  const selectShowtime = async (showtime: Showtime) => {
    setSelectedShowtime(showtime);
    setSelectedSeats([]);
    setMessage('');
    setLoadingSeats(true);

    try {
      if (showtime.id.startsWith('mock-')) {
        const mockSeats = createMockSeats();
        setSeats(mockSeats);
        setRoom(createRoom(mockSeats, showtime.price));
      } else {
        const response = await fetch(
          `${API_URL}/bookings/showtimes/${showtime.id}/seats`,
        );

        if (!response.ok) throw new Error();

        const data = await response.json();
        const items: Seat[] = Array.isArray(data)
          ? data
          : data.seats || [];

        setSeats(items);
        setRoom(createRoom(items, showtime.price));
      }

      setTimeOpen(false);
      setSeatOpen(true);
    } catch {
      const mockSeats = createMockSeats();
      setSeats(mockSeats);
      setRoom(createRoom(mockSeats, showtime.price));
      setTimeOpen(false);
      setSeatOpen(true);
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
    if (!selectedShowtime || !selectedSeats.length) {
      setMessage('Please select at least one seat.');
      return;
    }

    if (selectedShowtime.id.startsWith('mock-')) {
      setMessage(
        'Mock data cannot be booked. Please use backend data.',
      );
      return;
    }

    setBooking(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token
            ? { Authorization: `Bearer ${token}` }
            : {}),
        },
        body: JSON.stringify({
          showtime_id: selectedShowtime.id,
          seat_ids: selectedSeats,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          data?.message || data?.detail || 'Booking failed.',
        );
      }

      setMessage('Booking successful.');
      setSelectedSeats([]);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Booking failed.',
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
        <Typography variant="h4" fontWeight="bold">
          Booking
        </Typography>

        {loadingMovie ? (
          <Typography sx={{ mt: 2 }}>
            Loading movie...
          </Typography>
        ) : (
          <>
            <Typography variant="h5" sx={{ mt: 2 }}>
              {movie?.name || 'Movie'}
            </Typography>

            <Typography sx={{ mt: 1 }}>
              {movie?.description ||
                'Select a showtime to book tickets.'}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => setMovieOpen(true)}
              >
                Movie Information
              </Button>

              <Button variant="contained" onClick={openDates}>
                Book Now
              </Button>
            </Box>
          </>
        )}
      </Paper>

      <Dialog
        open={movieOpen}
        onClose={() => setMovieOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {movie?.name || 'Movie Information'}
        </DialogTitle>

        <DialogContent dividers>
          {movie?.image && (
            <Box
              component="img"
              src={movie.image}
              alt={movie.name || 'Movie'}
              sx={{
                width: '100%',
                maxHeight: 300,
                objectFit: 'cover',
                mb: 2,
              }}
            />
          )}

          <Typography>
            <b>Genre:</b> {movie?.genre || 'N/A'}
          </Typography>
          <Typography>
            <b>Director:</b> {movie?.director || 'N/A'}
          </Typography>
          <Typography>
            <b>Actor:</b> {movie?.actor || 'N/A'}
          </Typography>
          <Typography>
            <b>Duration:</b>{' '}
            {movie?.time ? `${movie.time} minutes` : 'N/A'}
          </Typography>
          <Typography>
            <b>Release:</b> {movie?.releaseDate || 'N/A'}
          </Typography>
          <Typography>
            <b>Rating:</b> {movie?.rating ?? 'N/A'}
          </Typography>

          <Typography sx={{ mt: 2 }}>
            {movie?.description || 'No description available.'}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setMovieOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dateOpen}
        onClose={() => setDateOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Select show date</DialogTitle>

        <DialogContent dividers>
          {loadingTimes ? (
            <Typography>Loading show dates...</Typography>
          ) : !dates.length ? (
            <Typography>No show dates available.</Typography>
          ) : (
            <Grid container spacing={2}>
              {dates.map((item) => {
                const [year, month, day] = item.date;
                const value = `${year}-${String(month).padStart(
                  2,
                  '0',
                )}-${String(day).padStart(2, '0')}`;

                return (
                  <Grid item xs={12} sm={6} key={value}>
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
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={timeOpen}
        onClose={() => setTimeOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Select showtime</DialogTitle>

        <DialogContent dividers>
          {loadingTimes ? (
            <Typography>Loading showtimes...</Typography>
          ) : !currentShowtimes.length ? (
            <Typography>
              No showtimes for this date.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {currentShowtimes.map((showtime) => (
                <Grid item xs={12} sm={6} key={showtime.id}>
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
                        Room {showtime.room ?? 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        {showtime.price.toLocaleString('vi-VN')} VND
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
            Back
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={seatOpen}
        onClose={cancelSeats}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Select seats</DialogTitle>

        <DialogContent dividers>
          {loadingSeats || !room ? (
            <Typography>Loading seats...</Typography>
          ) : (
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 1,
                    mb: 3,
                    backgroundColor: '#eee',
                  }}
                >
                  SCREEN
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

              <Grid item xs={12} md={4}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    height: '100%',
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    Booking Summary
                  </Typography>

                  <Typography sx={{ mt: 2 }}>
                    <b>Movie:</b> {movie?.name || 'Movie'}
                  </Typography>

                  <Typography>
                    <b>Date:</b>{' '}
                    {selectedShowtime
                      ? formatDate(selectedShowtime.date)
                      : '-'}
                  </Typography>

                  <Typography>
                    <b>Time:</b>{' '}
                    {selectedShowtime?.startTime || '-'}
                  </Typography>

                  <Typography>
                    <b>Room:</b>{' '}
                    {selectedShowtime?.room ?? '-'}
                  </Typography>

                  <Typography>
                    <b>Seats:</b>{' '}
                    {selectedSeatCodes.length
                      ? selectedSeatCodes.join(', ')
                      : 'None'}
                  </Typography>

                  <Typography>
                    <b>Price:</b>{' '}
                    {room.price.toLocaleString('vi-VN')} VND / seat
                  </Typography>

                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Total: {total.toLocaleString('vi-VN')} VND
                  </Typography>

                  {message && (
                    <Typography
                      sx={{ mt: 2 }}
                      color={
                        message === 'Booking successful.'
                          ? 'success.main'
                          : 'error.main'
                      }
                    >
                      {message}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={cancelSeats}>Cancel</Button>

          <Button
            variant="contained"
            disabled={!selectedSeats.length || booking}
            onClick={book}
          >
            {booking ? 'Booking...' : 'Book'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookingPage;