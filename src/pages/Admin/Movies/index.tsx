import { useEffect, useMemo, useState } from 'react';
import {
  Add,
  CalendarMonth,
  Delete,
  Edit,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Restore,
  VisibilityOff,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import type { MovieForm, MovieItem, Screening } from '../../../types';

const API = '/movies';

interface Room {
  room_number: number;
  name: string;
  type: string;
}

interface MovieErrors {
  title?: string;
  genre?: string;
  duration?: string;
  releaseDate?: string;
  image?: string;
  trailerUrl?: string;
  description?: string;
}

interface ScreeningErrors {
  date?: string;
  time?: string;
  room?: string;
}

type ToastSeverity = 'success' | 'error' | 'warning' | 'info';

const emptyForm: MovieForm = {
  title: '',
  genre: '',
  image: '',
  trailerUrl: '',
  description: '',
  duration: 120,
  releaseDate: '',
};

const emptyScreening = {
  date: '',
  time: '',
  room: '',
};

const getDuration = (value: unknown) => {
  const match = String(value ?? '').match(/\d+/);
  return match ? Number(match[0]) : 0;
};

const isValidUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const isValidDate = (value: string) => {
  if (!value) return false;

  const date = new Date(`${value}T00:00:00`);

  return !Number.isNaN(date.getTime());
};

export default function MovieListPage() {
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [form, setForm] = useState<MovieForm>(emptyForm);
  const [movieErrors, setMovieErrors] = useState<MovieErrors>({});

  const [editMovie, setEditMovie] = useState<MovieItem | null>(null);
  const [movieDialog, setMovieDialog] = useState(false);

  const [expanded, setExpanded] = useState<string | null>(null);

  const [filter, setFilter] = useState<
    'all' | 'showing' | 'hidden'
  >('all');

  const [screening, setScreening] = useState(emptyScreening);
  const [screeningErrors, setScreeningErrors] =
    useState<ScreeningErrors>({});

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: ToastSeverity;
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showToast = (
    message: string,
    severity: ToastSeverity = 'success',
  ) => {
    setToast({
      open: true,
      message,
      severity,
    });
  };

  const closeToast = () => {
    setToast((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const loadMovies = async () => {
    try {
      const response = await fetch(API);

      if (!response.ok) {
        throw new Error('Failed to load movies.');
      }

      const data = await response.json();

      const result = await Promise.all(
        data.map(async (movie: any) => {
          const screeningResponse = await fetch(
            `${API}/${movie.id}/screenings`,
          );

          const screenings = screeningResponse.ok
            ? await screeningResponse.json()
            : [];

          return {
            id: String(movie.id),
            title: movie.title || '',
            genre: movie.genre || '',
            image: movie.poster || '',
            trailerUrl: movie.trailer_url || '',
            description: movie.description || '',
            duration: getDuration(movie.duration),
            releaseDate: movie.release_date || '',
            status:
              String(movie.status).toLowerCase() === 'hidden'
                ? 'Hidden'
                : 'Showing',
            screenings: screenings.map(
              (item: any): Screening => ({
                id: String(item.id),
                date: item.date || '',
                time: item.time || '',
                room: String(item.room || ''),
              }),
            ),
          };
        }),
      );

      setMovies(result);
    } catch (error) {
      console.error(error);
      showToast('Cannot load movies from the server.', 'error');
    }
  };

  const loadRooms = async () => {
    try {
      const response = await fetch(`${API}/rooms`);

      if (!response.ok) {
        throw new Error('Failed to load rooms.');
      }

      const data = await response.json();

      const result = data.map((room: any) => ({
        room_number: Number(room.room_number),
        name: room.name || '',
        type: room.type || '',
      }));

      setRooms(result);

      if (result.length > 0) {
        setScreening((prev) => ({
          ...prev,
          room: prev.room || String(result[0].room_number),
        }));
      }
    } catch (error) {
      console.error(error);
      showToast('Cannot load cinema rooms.', 'error');
    }
  };

  useEffect(() => {
    loadMovies();
    loadRooms();
  }, []);

  const filteredMovies = useMemo(() => {
    if (filter === 'showing') {
      return movies.filter((movie) => movie.status === 'Showing');
    }

    if (filter === 'hidden') {
      return movies.filter((movie) => movie.status === 'Hidden');
    }

    return movies;
  }, [movies, filter]);

  const validateMovie = () => {
    const errors: MovieErrors = {};

    const title = form.title.trim();
    const genre = form.genre.trim();
    const description = form.description.trim();
    const image = form.image.trim();
    const trailerUrl = form.trailerUrl.trim();

    if (!title) {
      errors.title = 'Movie title is required.';
    } else if (title.length < 2) {
      errors.title = 'Movie title must contain at least 2 characters.';
    } else if (title.length > 255) {
      errors.title = 'Movie title must not exceed 255 characters.';
    }

    if (!genre) {
      errors.genre = 'Genre is required.';
    } else if (genre.length > 100) {
      errors.genre = 'Genre must not exceed 100 characters.';
    }

    if (!form.duration) {
      errors.duration = 'Duration is required.';
    } else if (
      !Number.isInteger(Number(form.duration)) ||
      Number(form.duration) <= 0
    ) {
      errors.duration = 'Duration must be a positive whole number.';
    } else if (Number(form.duration) > 600) {
      errors.duration = 'Duration cannot exceed 600 minutes.';
    }

    if (!form.releaseDate) {
      errors.releaseDate = 'Release date is required.';
    } else if (!isValidDate(form.releaseDate)) {
      errors.releaseDate = 'Please enter a valid release date.';
    }

    if (!image) {
      errors.image = 'Poster URL is required.';
    } else if (!isValidUrl(image)) {
      errors.image = 'Please enter a valid HTTP/HTTPS URL.';
    }

    if (!trailerUrl) {
      errors.trailerUrl = 'Trailer URL is required.';
    } else if (!isValidUrl(trailerUrl)) {
      errors.trailerUrl = 'Please enter a valid HTTP/HTTPS URL.';
    }

    if (!description) {
      errors.description = 'Description is required.';
    } else if (description.length < 10) {
      errors.description =
        'Description must contain at least 10 characters.';
    }

    setMovieErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const validateScreening = () => {
    const errors: ScreeningErrors = {};

    if (!screening.date) {
      errors.date = 'Screening date is required.';
    } else if (!isValidDate(screening.date)) {
      errors.date = 'Please enter a valid date.';
    } else {
      const selectedDate = new Date(
        `${screening.date}T00:00:00`,
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errors.date = 'Screening date cannot be in the past.';
      }

      if (
        editMovie?.releaseDate &&
        selectedDate <
          new Date(`${editMovie.releaseDate}T00:00:00`)
      ) {
        errors.date =
          'Screening date cannot be before the movie release date.';
      }
    }

    if (!screening.time) {
      errors.time = 'Screening time is required.';
    }

    if (!screening.room) {
      errors.room = 'Cinema room is required.';
    } else if (
      !rooms.some(
        (room) =>
          String(room.room_number) === String(screening.room),
      )
    ) {
      errors.room = 'Please select a valid cinema room.';
    }

    setScreeningErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const openAddMovie = () => {
    setForm(emptyForm);
    setMovieErrors({});
    setEditMovie(null);
    setMovieDialog(true);
  };

  const openEditMovie = (movie: MovieItem) => {
    setEditMovie(movie);

    setForm({
      title: movie.title,
      genre: movie.genre,
      image: movie.image,
      trailerUrl: movie.trailerUrl,
      description: movie.description,
      duration: getDuration(movie.duration),
      releaseDate: movie.releaseDate,
    });

    setMovieErrors({});
    setMovieDialog(true);
  };

  const closeMovieDialog = () => {
    setMovieDialog(false);
    setEditMovie(null);
    setForm(emptyForm);
    setMovieErrors({});
  };

  const saveMovie = async () => {
    if (!validateMovie()) {
      showToast(
        'Please correct the highlighted fields.',
        'warning',
      );
      return;
    }

    const body = {
      title: form.title.trim(),
      genre: form.genre.trim(),
      duration: form.duration,
      release_date: form.releaseDate,
      poster: form.image.trim(),
      trailer_url: form.trailerUrl.trim(),
      description: form.description.trim(),
    };

    try {
      const response = await fetch(
        editMovie ? `${API}/${editMovie.id}` : API,
        {
          method: editMovie ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            editMovie
              ? body
              : {
                  ...body,
                  status: 'showing',
                },
          ),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        showToast(
          data?.error || 'Cannot save movie.',
          'error',
        );
        return;
      }

      closeMovieDialog();
      await loadMovies();

      showToast(
        editMovie
          ? 'Movie updated successfully.'
          : 'Movie created successfully.',
        'success',
      );
    } catch (error) {
      console.error(error);
      showToast('Cannot connect to backend.', 'error');
    }
  };

  const deleteMovie = async (movie: MovieItem) => {
    if (!window.confirm(`Delete "${movie.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API}/${movie.id}`, {
        method: 'DELETE',
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        showToast(
          data?.error || 'Cannot delete movie.',
          'error',
        );
        return;
      }

      setMovies((prev) =>
        prev.filter((item) => item.id !== movie.id),
      );

      showToast('Movie deleted successfully.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Cannot connect to backend.', 'error');
    }
  };

  const changeStatus = async (
    movie: MovieItem,
    status: 'showing' | 'hidden',
  ) => {
    try {
      const response = await fetch(`${API}/${movie.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        showToast(
          data?.error || 'Cannot change movie status.',
          'error',
        );
        return;
      }

      setMovies((prev) =>
        prev.map((item) =>
          item.id === movie.id
            ? {
                ...item,
                status:
                  status === 'showing'
                    ? 'Showing'
                    : 'Hidden',
              }
            : item,
        ),
      );

      showToast(
        status === 'showing'
          ? 'Movie is now showing.'
          : 'Movie has been hidden.',
        'success',
      );
    } catch (error) {
      console.error(error);
      showToast('Cannot connect to backend.', 'error');
    }
  };

  const addScreening = async (movie: MovieItem) => {
    if (!validateScreening()) {
      showToast(
        'Please correct the screening information.',
        'warning',
      );
      return;
    }

    try {
      const response = await fetch(
        `${API}/${movie.id}/screenings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            show_date: screening.date,
            show_time: screening.time,
            cinema_room_number: Number(screening.room),
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        showToast(
          data?.error || 'Cannot add screening.',
          'error',
        );
        return;
      }

      setScreening({
        date: '',
        time: '',
        room:
          rooms.length > 0
            ? String(rooms[0].room_number)
            : '',
      });

      setScreeningErrors({});

      await loadMovies();

      showToast(
        'Screening added successfully.',
        'success',
      );
    } catch (error) {
      console.error(error);
      showToast('Cannot connect to backend.', 'error');
    }
  };

  const deleteScreening = async (
    movie: MovieItem,
    item: Screening,
  ) => {
    if (!window.confirm('Delete this screening?')) {
      return;
    }

    try {
      const response = await fetch(
        `${API}/${movie.id}/screenings/${item.id}`,
        {
          method: 'DELETE',
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        showToast(
          data?.error || 'Cannot delete screening.',
          'error',
        );
        return;
      }

      await loadMovies();

      showToast(
        'Screening deleted successfully.',
        'success',
      );
    } catch (error) {
      console.error(error);
      showToast('Cannot connect to backend.', 'error');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#faf9f4',
        p: {
          xs: 2,
          md: 4,
        },
      }}
    >
      <Box
        sx={{
          maxWidth: 1400,
          mx: 'auto',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: {
              xs: 'flex-start',
              md: 'center',
            },
            gap: 2,
            mb: 3,
            flexDirection: {
              xs: 'column',
              md: 'row',
            },
          }}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                letterSpacing: '-0.5px',
                color: '#202020',
              }}
            >
              Movie List
            </Typography>

            <Typography
              sx={{
                color: 'text.secondary',
                mt: 0.5,
              }}
            >
              Manage movies, screening times and cinema rooms.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={openAddMovie}
            sx={{
              borderRadius: 2,
              px: 2.5,
              py: 1.2,
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: 2,
            }}
          >
            Add new movie
          </Button>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mb: 3,
            flexWrap: 'wrap',
          }}
        >
          {(['all', 'showing', 'hidden'] as const).map(
            (item) => (
              <Button
                key={item}
                variant={
                  filter === item ? 'contained' : 'outlined'
                }
                onClick={() => setFilter(item)}
                sx={{
                  borderRadius: 2,
                  px: 2.5,
                  textTransform: 'none',
                  fontWeight: 700,
                }}
              >
                {item === 'all'
                  ? 'All'
                  : item === 'showing'
                    ? 'Showing'
                    : 'Hidden'}
              </Button>
            ),
          )}
        </Box>

        <Stack spacing={2}>
          {filteredMovies.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
              }}
            >
              <Typography color="text.secondary">
                No movies found.
              </Typography>
            </Paper>
          ) : (
            filteredMovies.map((movie) => {
              const isExpanded = expanded === movie.id;

              return (
                <Paper
                  key={movie.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    backgroundColor: '#fff',
                    transition: '0.2s',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      flexDirection: {
                        xs: 'column',
                        sm: 'row',
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={movie.image}
                      alt={movie.title}
                      sx={{
                        width: 110,
                        height: 155,
                        objectFit: 'cover',
                        borderRadius: 2,
                        flexShrink: 0,
                        boxShadow: 2,
                        backgroundColor: '#eee',
                      }}
                    />

                    <Box
                      sx={{
                        flex: 1,
                        width: '100%',
                        minWidth: 0,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          flexWrap: 'wrap',
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight={800}
                        >
                          {movie.title}
                        </Typography>

                        <Chip
                          size="small"
                          label={movie.status}
                          color={
                            movie.status === 'Showing'
                              ? 'success'
                              : 'default'
                          }
                          sx={{
                            fontWeight: 700,
                          }}
                        />
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          gap: 0.8,
                          flexWrap: 'wrap',
                        }}
                      >
                        <Chip
                          size="small"
                          label={movie.genre}
                          variant="outlined"
                        />

                        <Chip
                          size="small"
                          label={`${movie.duration} min`}
                          variant="outlined"
                        />

                        <Chip
                          size="small"
                          icon={<CalendarMonth />}
                          label={movie.releaseDate}
                          variant="outlined"
                        />
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <Tooltip
                        title={
                          isExpanded
                            ? 'Hide details'
                            : 'Show details'
                        }
                      >
                        <IconButton
                          onClick={() =>
                            setExpanded(
                              isExpanded ? null : movie.id,
                            )
                          }
                        >
                          {isExpanded ? (
                            <KeyboardArrowUp />
                          ) : (
                            <KeyboardArrowDown />
                          )}
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Edit movie">
                        <IconButton
                          onClick={() =>
                            openEditMovie(movie)
                          }
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>

                      <Tooltip
                        title={
                          movie.status === 'Showing'
                            ? 'Hide movie'
                            : 'Show movie'
                        }
                      >
                        <IconButton
                          onClick={() =>
                            changeStatus(
                              movie,
                              movie.status === 'Showing'
                                ? 'hidden'
                                : 'showing',
                            )
                          }
                        >
                          {movie.status === 'Showing' ? (
                            <VisibilityOff />
                          ) : (
                            <Restore />
                          )}
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete movie">
                        <IconButton
                          color="error"
                          onClick={() =>
                            deleteMovie(movie)
                          }
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {isExpanded && (
                    <Box
                      sx={{
                        mt: 3,
                        pt: 3,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight={800}
                        mb={1.5}
                      >
                        Screening times & rooms
                      </Typography>

                      <Stack spacing={1.2} mb={3}>
                        {movie.screenings.length === 0 ? (
                          <Typography
                            color="text.secondary"
                            sx={{
                              fontSize: 14,
                            }}
                          >
                            No screening times yet.
                          </Typography>
                        ) : (
                          movie.screenings.map((item) => (
                            <Box
                              key={item.id}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                flexWrap: 'wrap',
                              }}
                            >
                              <Chip
                                icon={<CalendarMonth />}
                                label={`${item.date} · ${item.time} · Room ${item.room}`}
                                sx={{
                                  borderRadius: 2,
                                }}
                              />

                              <Button
                                color="error"
                                size="small"
                                onClick={() =>
                                  deleteScreening(
                                    movie,
                                    item,
                                  )
                                }
                                sx={{
                                  textTransform: 'none',
                                }}
                              >
                                Remove
                              </Button>
                            </Box>
                          ))
                        )}
                      </Stack>

                      <Typography
                        variant="subtitle2"
                        fontWeight={800}
                        mb={1.5}
                      >
                        Add screening
                      </Typography>

                      <Box
                        sx={{
                          display: 'flex',
                          gap: 1.5,
                          flexWrap: 'wrap',
                          alignItems: 'flex-start',
                        }}
                      >
                        <TextField
                          type="date"
                          label="Date"
                          value={screening.date}
                          onChange={(e) => {
                            setScreening({
                              ...screening,
                              date: e.target.value,
                            });

                            setScreeningErrors((prev) => ({
                              ...prev,
                              date: undefined,
                            }));
                          }}
                          error={Boolean(
                            screeningErrors.date,
                          )}
                          helperText={screeningErrors.date}
                          slotProps={{
                            inputLabel: {
                              shrink: true,
                            },
                          }}
                          size="small"
                        />

                        <TextField
                          type="time"
                          label="Time"
                          value={screening.time}
                          onChange={(e) => {
                            setScreening({
                              ...screening,
                              time: e.target.value,
                            });

                            setScreeningErrors((prev) => ({
                              ...prev,
                              time: undefined,
                            }));
                          }}
                          error={Boolean(
                            screeningErrors.time,
                          )}
                          helperText={screeningErrors.time}
                          slotProps={{
                            inputLabel: {
                              shrink: true,
                            },
                          }}
                          size="small"
                        />

                        <Box>
                          <Select
                            size="small"
                            value={screening.room}
                            displayEmpty
                            error={Boolean(
                              screeningErrors.room,
                            )}
                            onChange={(e) => {
                              setScreening({
                                ...screening,
                                room: String(
                                  e.target.value,
                                ),
                              });

                              setScreeningErrors((prev) => ({
                                ...prev,
                                room: undefined,
                              }));
                            }}
                            sx={{
                              minWidth: 190,
                            }}
                          >
                            <MenuItem value="">
                              Select room
                            </MenuItem>

                            {rooms.map((room) => (
                              <MenuItem
                                key={room.room_number}
                                value={String(
                                  room.room_number,
                                )}
                              >
                                {room.type} - Room{' '}
                                {room.room_number}
                              </MenuItem>
                            ))}
                          </Select>

                          {screeningErrors.room && (
                            <Typography
                              color="error"
                              sx={{
                                fontSize: 12,
                                mt: 0.5,
                                ml: 1.5,
                              }}
                            >
                              {screeningErrors.room}
                            </Typography>
                          )}
                        </Box>

                        <Button
                          variant="contained"
                          startIcon={<Add />}
                          onClick={() =>
                            addScreening(movie)
                          }
                          sx={{
                            textTransform: 'none',
                            borderRadius: 2,
                            mt: 0.5,
                          }}
                        >
                          Add Screening
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Paper>
              );
            })
          )}
        </Stack>
      </Box>

      <Dialog
        open={movieDialog}
        onClose={closeMovieDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            fontSize: 24,
          }}
        >
          {editMovie ? 'Modify Movie' : 'Add New Movie'}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => {
                setForm({
                  ...form,
                  title: e.target.value,
                });

                setMovieErrors((prev) => ({
                  ...prev,
                  title: undefined,
                }));
              }}
              error={Boolean(movieErrors.title)}
              helperText={movieErrors.title}
              required
              fullWidth
            />

            <TextField
              label="Genre"
              value={form.genre}
              onChange={(e) => {
                setForm({
                  ...form,
                  genre: e.target.value,
                });

                setMovieErrors((prev) => ({
                  ...prev,
                  genre: undefined,
                }));
              }}
              error={Boolean(movieErrors.genre)}
              helperText={movieErrors.genre}
              required
              fullWidth
            />

            <TextField
              label="Duration (minutes)"
              type="number"
              value={form.duration}
              onChange={(e) => {
                setForm({
                  ...form,
                  duration: Number(e.target.value),
                });

                setMovieErrors((prev) => ({
                  ...prev,
                  duration: undefined,
                }));
              }}
              error={Boolean(movieErrors.duration)}
              helperText={movieErrors.duration}
              slotProps={{
                htmlInput: {
                  min: 1,
                  max: 600,
                },
              }}
              required
              fullWidth
            />

            <TextField
              label="Release date"
              type="date"
              value={form.releaseDate}
              onChange={(e) => {
                setForm({
                  ...form,
                  releaseDate: e.target.value,
                });

                setMovieErrors((prev) => ({
                  ...prev,
                  releaseDate: undefined,
                }));
              }}
              error={Boolean(movieErrors.releaseDate)}
              helperText={movieErrors.releaseDate}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              required
              fullWidth
            />

            <TextField
              label="Poster URL"
              value={form.image}
              onChange={(e) => {
                setForm({
                  ...form,
                  image: e.target.value,
                });

                setMovieErrors((prev) => ({
                  ...prev,
                  image: undefined,
                }));
              }}
              error={Boolean(movieErrors.image)}
              helperText={
                movieErrors.image ||
                'Use a valid http:// or https:// image URL.'
              }
              required
              fullWidth
            />

            <TextField
              label="Trailer URL"
              value={form.trailerUrl}
              onChange={(e) => {
                setForm({
                  ...form,
                  trailerUrl: e.target.value,
                });

                setMovieErrors((prev) => ({
                  ...prev,
                  trailerUrl: undefined,
                }));
              }}
              error={Boolean(movieErrors.trailerUrl)}
              helperText={
                movieErrors.trailerUrl ||
                'Use a valid http:// or https:// URL.'
              }
              required
              fullWidth
            />

            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => {
                setForm({
                  ...form,
                  description: e.target.value,
                });

                setMovieErrors((prev) => ({
                  ...prev,
                  description: undefined,
                }));
              }}
              error={Boolean(movieErrors.description)}
              helperText={
                movieErrors.description ||
                'Minimum 10 characters.'
              }
              multiline
              rows={4}
              required
              fullWidth
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Button
            onClick={closeMovieDialog}
            sx={{
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={saveMovie}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
            }}
          >
            {editMovie ? 'Save Changes' : 'Add Movie'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={closeToast}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Alert
          onClose={closeToast}
          severity={toast.severity}
          variant="filled"
          sx={{
            width: '100%',
            borderRadius: 2,
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}