import { useMemo, useState } from 'react';
import {
  Add,
  CalendarMonth,
  Edit,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Movie,
  PlayArrow,
  Restore,
  VisibilityOff,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

interface Screening {
  time: string;
  room: string;
}

interface MovieItem {
  id: number;
  title: string;
  genre: string;
  duration: number;
  releaseDate: string;
  poster: string;
  status: 'Showing' | 'Hidden';
  screenings: Screening[];
}

const initialMovies: MovieItem[] = [
  {
    id: 1,
    title: 'Dune: Part Two',
    genre: 'Sci-Fi',
    duration: 166,
    releaseDate: '2026-09-10',
    poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    status: 'Showing',
    screenings: [
      { time: '10:00', room: 'Room 1' },
      { time: '14:00', room: 'Room 2' },
      { time: '19:30', room: 'Room 1' },
    ],
  },
  {
    id: 2,
    title: 'How to Train Your Dragon',
    genre: 'Adventure',
    duration: 125,
    releaseDate: '2026-09-12',
    poster: 'https://image.tmdb.org/t/p/w500/ygGmAO60t8GyqLGSZS6Qh2lH8kU.jpg',
    status: 'Showing',
    screenings: [
      { time: '11:30', room: 'Room 3' },
      { time: '18:00', room: 'Room 3' },
    ],
  },
  {
    id: 3,
    title: 'The Batman',
    genre: 'Action',
    duration: 176,
    releaseDate: '2026-08-20',
    poster: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    status: 'Hidden',
    screenings: [],
  },
];

const emptyMovie: Omit<MovieItem, 'id' | 'status'> = {
  title: '',
  genre: '',
  duration: 120,
  releaseDate: '',
  poster: '',
  screenings: [],
};

const MovieListPage = () => {
  const [movies, setMovies] = useState<MovieItem[]>(initialMovies);
  const [editingMovie, setEditingMovie] = useState<MovieItem | null>(null);
  const [addingMovie, setAddingMovie] = useState(false);
  const [newMovie, setNewMovie] = useState(emptyMovie);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [newScreening, setNewScreening] = useState<Screening>({ time: '', room: 'Room 1' });

  const sortedMovies = useMemo(
    () =>
      [...movies].sort((a, b) => Number(b.status === 'Showing') - Number(a.status === 'Showing')),
    [movies],
  );

  const updateMovie = (movie: MovieItem) => {
    setMovies((current) => current.map((item) => (item.id === movie.id ? movie : item)));
    setEditingMovie(null);
  };

  const addMovie = () => {
    if (!newMovie.title.trim()) return;
    setMovies((current) => [
      ...current,
      {
        ...newMovie,
        id: Math.max(0, ...current.map((movie) => movie.id)) + 1,
        status: 'Showing',
      },
    ]);
    setNewMovie(emptyMovie);
    setAddingMovie(false);
  };

  const toggleMovieStatus = (id: number) => {
    setMovies((current) =>
      current.map((movie) =>
        movie.id === id
          ? { ...movie, status: movie.status === 'Showing' ? 'Hidden' : 'Showing' }
          : movie,
      ),
    );
  };

  const addScreening = () => {
    if (!editingMovie || !newScreening.time) return;
    setEditingMovie({
      ...editingMovie,
      screenings: [...editingMovie.screenings, newScreening],
    });
    setNewScreening({ time: '', room: 'Room 1' });
  };

  const removeScreening = (index: number) => {
    if (!editingMovie) return;
    setEditingMovie({
      ...editingMovie,
      screenings: editingMovie.screenings.filter((_, itemIndex) => itemIndex !== index),
    });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        gap={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Movie List
          </Typography>
          <Typography color="text.secondary" mt={0.5}>
            Manage movies, screening times and cinema rooms.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setAddingMovie(true)}>
          Add new movie
        </Button>
      </Stack>

      <Stack spacing={2}>
        {sortedMovies.map((movie) => {
          const expanded = expandedId === movie.id;
          return (
            <Paper key={movie.id} variant="outlined" sx={{ overflow: 'hidden' }}>
              <Box sx={{ p: 2.5 }}>
                <Stack
                  direction={{ xs: 'column', lg: 'row' }}
                  spacing={2}
                  sx={{
                    alignItems: { xs: 'stretch', lg: 'center' },
                  }}
                >
                  <Box
                    sx={{
                      width: 72,
                      height: 100,
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      bgcolor: 'grey.100',
                      flexShrink: 0,
                    }}
                  >
                    {movie.poster ? (
                      <Box
                        component="img"
                        src={movie.poster}
                        alt={movie.title}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        <Movie color="action" />
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 180 }}>
                    <Stack
                      direction="row"
                      gap={1}
                      sx={{
                        alignItems: 'center',
                        flexWrap: 'wrap',
                      }}
                    >
                      <Typography variant="h6" fontWeight={700}>
                        {movie.title}
                      </Typography>
                      <Chip
                        size="small"
                        label={movie.status}
                        color={movie.status === 'Showing' ? 'success' : 'default'}
                      />
                    </Stack>
                    <Typography color="text.secondary" mt={0.5}>
                      {movie.genre} · {movie.duration} min · Release {movie.releaseDate || '—'}
                    </Typography>
                  </Box>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      flexWrap: 'wrap',
                    }}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={movie.status === 'Showing' ? <VisibilityOff /> : <Restore />}
                      onClick={() => toggleMovieStatus(movie.id)}
                    >
                      {movie.status === 'Showing' ? 'Take down' : 'Bring back'}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => {
                        setEditingMovie({ ...movie, screenings: [...movie.screenings] });
                        setNewScreening({ time: '', room: 'Room 1' });
                      }}
                    >
                      Modify
                    </Button>
                    <Button
                      size="small"
                      onClick={() => setExpandedId(expanded ? null : movie.id)}
                      endIcon={expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    >
                      Details
                    </Button>
                  </Stack>
                </Stack>

                {expanded && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography fontWeight={700} mb={1}>
                      Screening times & rooms
                    </Typography>
                    {movie.screenings.length === 0 ? (
                      <Typography color="text.secondary">No screening time yet.</Typography>
                    ) : (
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          flexWrap: 'wrap',
                        }}
                      >
                        {' '}
                        {movie.screenings.map((screening, index) => (
                          <Chip
                            key={`${screening.time}-${screening.room}-${index}`}
                            icon={<CalendarMonth />}
                            label={`${screening.time} · ${screening.room}`}
                          />
                        ))}
                      </Stack>
                    )}
                  </>
                )}
              </Box>
            </Paper>
          );
        })}
      </Stack>

      <Dialog
        open={addingMovie}
        onClose={() => setAddingMovie(false)}
        fullWidth
        maxWidth="sm"
        disableRestoreFocus
      >
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Movie title"
              value={newMovie.title}
              onChange={(event) => setNewMovie({ ...newMovie, title: event.target.value })}
              fullWidth
            />
            <TextField
              label="Poster URL"
              placeholder="https://..."
              value={newMovie.poster}
              onChange={(event) => setNewMovie({ ...newMovie, poster: event.target.value })}
              fullWidth
            />
            {newMovie.poster && (
              <Box
                component="img"
                src={newMovie.poster}
                alt="Poster preview"
                sx={{ width: 100, height: 140, objectFit: 'cover', borderRadius: 1 }}
              />
            )}
            <TextField
              label="Genre"
              value={newMovie.genre}
              onChange={(event) => setNewMovie({ ...newMovie, genre: event.target.value })}
              fullWidth
            />
            <TextField
              label="Duration (minutes)"
              type="number"
              value={newMovie.duration}
              onChange={(event) =>
                setNewMovie({ ...newMovie, duration: Number(event.target.value) })
              }
              fullWidth
            />
            <TextField
              label="Release date"
              type="date"
              value={newMovie.releaseDate}
              onChange={(event) => setNewMovie({ ...newMovie, releaseDate: event.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddingMovie(false)}>Cancel</Button>
          <Button variant="contained" onClick={addMovie} disabled={!newMovie.title.trim()}>
            Add movie
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(editingMovie)}
        onClose={() => setEditingMovie(null)}
        fullWidth
        maxWidth="md"
        disableRestoreFocus
      >
        <DialogContent>
          {editingMovie && (
            <Stack spacing={2} mt={1}>
              <TextField
                label="Movie title"
                value={editingMovie.title}
                onChange={(event) =>
                  setEditingMovie({ ...editingMovie, title: event.target.value })
                }
                fullWidth
              />
              <TextField
                label="Poster URL"
                placeholder="https://..."
                value={editingMovie.poster}
                onChange={(event) =>
                  setEditingMovie({ ...editingMovie, poster: event.target.value })
                }
                fullWidth
              />
              {editingMovie.poster && (
                <Box
                  component="img"
                  src={editingMovie.poster}
                  alt={editingMovie.title}
                  sx={{ width: 100, height: 140, objectFit: 'cover', borderRadius: 1 }}
                />
              )}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Genre"
                  value={editingMovie.genre}
                  onChange={(event) =>
                    setEditingMovie({ ...editingMovie, genre: event.target.value })
                  }
                  fullWidth
                />
                <TextField
                  label="Duration (minutes)"
                  type="number"
                  value={editingMovie.duration}
                  onChange={(event) =>
                    setEditingMovie({ ...editingMovie, duration: Number(event.target.value) })
                  }
                  fullWidth
                />
              </Stack>
              <TextField
                label="Release date"
                type="date"
                value={editingMovie.releaseDate}
                onChange={(event) =>
                  setEditingMovie({ ...editingMovie, releaseDate: event.target.value })
                }
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />

              <Divider />
              <Typography fontWeight={700}>Screening times & rooms</Typography>
              {editingMovie.screenings.map((screening, index) => (
                <Stack
                  key={`${screening.time}-${screening.room}-${index}`}
                  direction="row"
                  spacing={1}
                >
                  <TextField
                    label="Time"
                    type="time"
                    value={screening.time}
                    onChange={(event) => {
                      const screenings = [...editingMovie.screenings];
                      screenings[index] = { ...screenings[index], time: event.target.value };
                      setEditingMovie({ ...editingMovie, screenings });
                    }}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  <FormControl sx={{ minWidth: 140 }}>
                    <InputLabel>Room</InputLabel>
                    <Select
                      label="Room"
                      value={screening.room}
                      onChange={(event) => {
                        const screenings = [...editingMovie.screenings];
                        screenings[index] = { ...screenings[index], room: event.target.value };
                        setEditingMovie({ ...editingMovie, screenings });
                      }}
                    >
                      <MenuItem value="Room 1">Room 1</MenuItem>
                      <MenuItem value="Room 2">Room 2</MenuItem>
                      <MenuItem value="Room 3">Room 3</MenuItem>
                      <MenuItem value="Room 4">Room 4</MenuItem>
                    </Select>
                  </FormControl>
                  <Button color="error" onClick={() => removeScreening(index)}>
                    Remove
                  </Button>
                </Stack>
              ))}

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{ alignItems: 'stretch' }}
              >
                <TextField
                  label="New time"
                  type="time"
                  value={newScreening.time}
                  onChange={(event) =>
                    setNewScreening({ ...newScreening, time: event.target.value })
                  }
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <FormControl sx={{ minWidth: 140 }}>
                  <InputLabel>Room</InputLabel>
                  <Select
                    label="Room"
                    value={newScreening.room}
                    onChange={(event) =>
                      setNewScreening({ ...newScreening, room: event.target.value })
                    }
                  >
                    <MenuItem value="Room 1">Room 1</MenuItem>
                    <MenuItem value="Room 2">Room 2</MenuItem>
                    <MenuItem value="Room 3">Room 3</MenuItem>
                    <MenuItem value="Room 4">Room 4</MenuItem>
                  </Select>
                </FormControl>
                <Button variant="outlined" startIcon={<PlayArrow />} onClick={addScreening}>
                  Add screening
                </Button>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingMovie(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => editingMovie && updateMovie(editingMovie)}>
            Save changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MovieListPage;
