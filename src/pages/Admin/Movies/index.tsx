import React, { useEffect, useMemo, useState } from 'react';

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
  Divider,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import type { MovieForm, MovieItem, Screening } from '@/types';

const emptyMovie: MovieForm = {
  title: '',
  genre: '',
  image: '',
  trailerUrl: '',
  description: '',
  duration: 120,
  releaseDate: '',
};

const MovieListPage: React.FC = () => {
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [editingMovie, setEditingMovie] = useState<MovieItem | null>(null);
  const [addingMovie, setAddingMovie] = useState(false);
  const [newMovie, setNewMovie] = useState<MovieForm>(emptyMovie);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [newScreening, setNewScreening] = useState({
    time: '',
    room: 'Room 1',
  });
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  const showToast = (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info' = 'success',
  ) => {
    setToast({
      open: true,
      message,
      severity,
    });
  };

  const closeToast = () => {
    setToast((current) => ({
      ...current,
      open: false,
    }));
  };

  const isValidUrl = (value: string) => {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const validateMovie = (movie: MovieForm): string | null => {
    if (!movie.title.trim()) {
      return 'Movie title is required.';
    }

    if (movie.title.trim().length < 2) {
      return 'Movie title must contain at least 2 characters.';
    }

    if (!movie.genre.trim()) {
      return 'Genre is required.';
    }

    if (!movie.image.trim()) {
      return 'Poster URL is required.';
    }

    if (!isValidUrl(movie.image.trim())) {
      return 'Please enter a valid poster URL.';
    }

    if (!movie.trailerUrl.trim()) {
      return 'Trailer URL is required.';
    }

    if (!isValidUrl(movie.trailerUrl.trim())) {
      return 'Please enter a valid trailer URL.';
    }

    if (!movie.description.trim()) {
      return 'Description is required.';
    }

    if (movie.description.trim().length < 5) {
      return 'Description must contain at least 5 characters.';
    }

    if (!Number.isInteger(Number(movie.duration)) || Number(movie.duration) <= 0) {
      return 'Duration must be a positive integer.';
    }

    if (Number(movie.duration) > 600) {
      return 'Duration cannot be greater than 600 minutes.';
    }

    if (!movie.releaseDate) {
      return 'Release date is required.';
    }

    if (Number.isNaN(new Date(`${movie.releaseDate}T00:00:00`).getTime())) {
      return 'Please enter a valid release date.';
    }

    return null;
  };

  const loadMovies = async () => {
    try {
      const response = await fetch('/movies');

      if (!response.ok) {
        throw new Error('Failed to load movies');
      }

      const data = await response.json();

      setMovies(
        data.map((movie: any) => ({
          id: Number(movie.id),
          title: movie.title || '',
          genre: movie.genre || '',
          image: movie.poster || '',
          trailerUrl: movie.trailer_url || '',
          description: movie.description || '',
          duration: Number(movie.duration) || 0,
          releaseDate: movie.release_date || '',
          status: movie.status === 'showing' ? 'Showing' : 'Hidden',
          screenings: [],
        })),
      );
    } catch (error) {
      console.error(error);
      showToast('Failed to load movies from database.', 'error');
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const sortedMovies = useMemo(
    () =>
      [...movies].sort((a, b) => Number(b.status === 'Showing') - Number(a.status === 'Showing')),
    [movies],
  );

  const loadScreenings = async (movieId: number): Promise<Screening[]> => {
    try {
      const response = await fetch(`/movies/${movieId}/screenings`);

      if (!response.ok) {
        throw new Error('Failed to load screenings');
      }

      const data = await response.json();

      return data.map((screening: any) => ({
        id: Number(screening.id),
        time: screening.time || '',
        room: screening.room || '',
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const openModify = async (movie: MovieItem) => {
    const screenings = await loadScreenings(movie.id);

    setEditingMovie({
      ...movie,
      screenings,
    });

    setNewScreening({
      time: '',
      room: 'Room 1',
    });
  };

  const toggleDetails = async (movieId: number) => {
    if (expandedId === movieId) {
      setExpandedId(null);
      return;
    }

    const screenings = await loadScreenings(movieId);

    setMovies((current) =>
      current.map((movie) => (movie.id === movieId ? { ...movie, screenings } : movie)),
    );

    setExpandedId(movieId);
  };

  const addMovie = async () => {
    const error = validateMovie(newMovie);

    if (error) {
      showToast(error, 'warning');
      return;
    }

    try {
      const response = await fetch('/movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newMovie.title.trim(),
          genre: newMovie.genre.trim(),
          duration: Number(newMovie.duration),
          release_date: newMovie.releaseDate,
          poster: newMovie.image.trim(),
          trailer_url: newMovie.trailerUrl.trim(),
          description: newMovie.description.trim(),
          status: 'showing',
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(data?.error || 'Failed to create movie');
      }

      const movie = await response.json();

      setMovies((current) => [
        ...current,
        {
          id: Number(movie.id),
          title: movie.title || '',
          genre: movie.genre || '',
          image: movie.poster || '',
          trailerUrl: movie.trailer_url || '',
          description: movie.description || '',
          duration: Number(movie.duration) || 0,
          releaseDate: movie.release_date || '',
          status: movie.status === 'showing' ? 'Showing' : 'Hidden',
          screenings: [],
        },
      ]);

      setNewMovie(emptyMovie);
      setAddingMovie(false);

      showToast('Movie added successfully.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to add movie.', 'error');
    }
  };

  const updateMovie = async (movie: MovieItem) => {
    const error = validateMovie({
      title: movie.title,
      genre: movie.genre,
      image: movie.image,
      trailerUrl: movie.trailerUrl,
      description: movie.description,
      duration: movie.duration,
      releaseDate: movie.releaseDate,
    });

    if (error) {
      showToast(error, 'warning');
      return;
    }

    try {
      const response = await fetch(`/movies/${movie.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: movie.title.trim(),
          genre: movie.genre.trim(),
          duration: Number(movie.duration),
          release_date: movie.releaseDate,
          poster: movie.image.trim(),
          trailer_url: movie.trailerUrl.trim(),
          description: movie.description.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(data?.error || 'Failed to update movie');
      }

      const updated = await response.json();

      setMovies((current) =>
        current.map((item) =>
          item.id === movie.id
            ? {
                ...item,
                title: updated.title || '',
                genre: updated.genre || '',
                duration: Number(updated.duration) || 0,
                releaseDate: updated.release_date || '',
                image: updated.poster || '',
                trailerUrl: updated.trailer_url || '',
                description: updated.description || '',
              }
            : item,
        ),
      );

      setEditingMovie(null);

      showToast('Movie updated successfully.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to update movie.', 'error');
    }
  };

  const toggleMovieStatus = async (id: number) => {
    const movie = movies.find((item) => item.id === id);

    if (!movie) return;

    const status = movie.status === 'Showing' ? 'hidden' : 'showing';

    try {
      const response = await fetch(`/movies/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update movie status');
      }

      const updated = await response.json();

      setMovies((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                status: updated.status === 'showing' ? 'Showing' : 'Hidden',
              }
            : item,
        ),
      );

      showToast(
        status === 'showing' ? 'Movie restored successfully.' : 'Movie taken down successfully.',
      );
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to update movie status.', 'error');
    }
  };

  const deleteMovie = async (id: number) => {
    const movie = movies.find((item) => item.id === id);

    if (!movie) return;

    if (!window.confirm(`Are you sure you want to permanently delete "${movie.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/movies/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete movie');
      }

      setMovies((current) => current.filter((item) => item.id !== id));

      if (expandedId === id) {
        setExpandedId(null);
      }

      if (editingMovie?.id === id) {
        setEditingMovie(null);
      }

      showToast('Movie deleted successfully.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to delete movie.', 'error');
    }
  };

  const addScreening = async () => {
    if (!editingMovie) return;

    if (!newScreening.time) {
      showToast('Please select a screening time.', 'warning');
      return;
    }

    if (!newScreening.room) {
      showToast('Please select a room.', 'warning');
      return;
    }

    try {
      const response = await fetch(`/movies/${editingMovie.id}/screenings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          screening_time: newScreening.time,
          room: newScreening.room,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(data?.error || 'Failed to add screening');
      }

      const screening = await response.json();

      const item: Screening = {
        id: Number(screening.id),
        time: screening.time || '',
        room: screening.room || '',
      };

      setEditingMovie((current) =>
        current
          ? {
              ...current,
              screenings: [...current.screenings, item],
            }
          : current,
      );

      setMovies((current) =>
        current.map((movie) =>
          movie.id === editingMovie.id
            ? {
                ...movie,
                screenings: [...movie.screenings, item],
              }
            : movie,
        ),
      );

      setNewScreening({
        time: '',
        room: 'Room 1',
      });

      showToast('Screening added successfully.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to add screening.', 'error');
    }
  };

  const removeScreening = async (screeningId: number) => {
    if (!editingMovie) return;

    try {
      const response = await fetch(`/movies/${editingMovie.id}/screenings/${screeningId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete screening');
      }

      setEditingMovie((current) =>
        current
          ? {
              ...current,
              screenings: current.screenings.filter((item) => item.id !== screeningId),
            }
          : current,
      );

      setMovies((current) =>
        current.map((movie) =>
          movie.id === editingMovie.id
            ? {
                ...movie,
                screenings: movie.screenings.filter((item) => item.id !== screeningId),
              }
            : movie,
        ),
      );

      showToast('Screening removed successfully.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to remove screening.', 'error');
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        maxWidth: 1400,
        mx: 'auto',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        gap={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: {
            xs: 'stretch',
            sm: 'center',
          },
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Movie List
          </Typography>

          <Typography color="text.secondary">
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
            <Paper key={movie.id} variant="outlined">
              <Box sx={{ p: 2.5 }}>
                <Stack
                  direction={{
                    xs: 'column',
                    lg: 'row',
                  }}
                  spacing={2}
                  sx={{
                    alignItems: {
                      xs: 'stretch',
                      lg: 'center',
                    },
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Stack
                      direction="row"
                      gap={2}
                      sx={{
                        alignItems: 'center',
                      }}
                    >
                      {movie.image ? (
                        <Box
                          component="img"
                          src={movie.image}
                          alt={movie.title}
                          sx={{
                            width: 100,
                            height: 140,
                            objectFit: 'cover',
                            borderRadius: 1,
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 100,
                            height: 140,
                            bgcolor: 'grey.200',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 1,
                          }}
                        >
                          No image
                        </Box>
                      )}

                      <Box>
                        <Typography variant="h6">{movie.title}</Typography>

                        <Chip
                          size="small"
                          label={movie.status}
                          color={movie.status === 'Showing' ? 'success' : 'default'}
                        />
                      </Box>
                    </Stack>

                    <Typography color="text.secondary" mt={1}>
                      {movie.genre} · {movie.duration} min · Release {movie.releaseDate}
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
                      onClick={() => openModify(movie)}
                    >
                      Modify
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => deleteMovie(movie.id)}
                    >
                      Delete
                    </Button>

                    <Button
                      size="small"
                      onClick={() => toggleDetails(movie.id)}
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
                        {movie.screenings.map((screening) => (
                          <Chip
                            key={screening.id}
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

      <Dialog open={addingMovie} onClose={() => setAddingMovie(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Movie</DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Movie title"
              value={newMovie.title}
              onChange={(e) =>
                setNewMovie({
                  ...newMovie,
                  title: e.target.value,
                })
              }
              required
              fullWidth
            />

            <TextField
              label="Genre"
              value={newMovie.genre}
              onChange={(e) =>
                setNewMovie({
                  ...newMovie,
                  genre: e.target.value,
                })
              }
              required
              fullWidth
            />

            <TextField
              label="Poster URL"
              value={newMovie.image}
              onChange={(e) =>
                setNewMovie({
                  ...newMovie,
                  image: e.target.value,
                })
              }
              required
              fullWidth
            />

            <TextField
              label="Trailer URL"
              value={newMovie.trailerUrl}
              onChange={(e) =>
                setNewMovie({
                  ...newMovie,
                  trailerUrl: e.target.value,
                })
              }
              required
              fullWidth
            />

            <TextField
              label="Description"
              multiline
              rows={3}
              value={newMovie.description}
              onChange={(e) =>
                setNewMovie({
                  ...newMovie,
                  description: e.target.value,
                })
              }
              required
              fullWidth
            />

            <TextField
              label="Duration (minutes)"
              type="number"
              value={newMovie.duration}
              onChange={(e) =>
                setNewMovie({
                  ...newMovie,
                  duration: Number(e.target.value),
                })
              }
              required
              fullWidth
              inputProps={{
                min: 1,
                max: 600,
              }}
            />

            <TextField
              label="Release date"
              type="date"
              value={newMovie.releaseDate}
              onChange={(e) =>
                setNewMovie({
                  ...newMovie,
                  releaseDate: e.target.value,
                })
              }
              required
              fullWidth
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setAddingMovie(false)}>Cancel</Button>

          <Button variant="contained" onClick={addMovie}>
            Add movie
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editingMovie !== null}
        onClose={() => setEditingMovie(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Modify Movie</DialogTitle>

        <DialogContent>
          {editingMovie && (
            <Stack spacing={2} mt={1}>
              <TextField
                label="Movie title"
                value={editingMovie.title}
                onChange={(e) =>
                  setEditingMovie({
                    ...editingMovie,
                    title: e.target.value,
                  })
                }
                required
                fullWidth
              />

              <TextField
                label="Genre"
                value={editingMovie.genre}
                onChange={(e) =>
                  setEditingMovie({
                    ...editingMovie,
                    genre: e.target.value,
                  })
                }
                required
                fullWidth
              />

              <TextField
                label="Poster URL"
                value={editingMovie.image}
                onChange={(e) =>
                  setEditingMovie({
                    ...editingMovie,
                    image: e.target.value,
                  })
                }
                required
                fullWidth
              />

              <TextField
                label="Trailer URL"
                value={editingMovie.trailerUrl}
                onChange={(e) =>
                  setEditingMovie({
                    ...editingMovie,
                    trailerUrl: e.target.value,
                  })
                }
                required
                fullWidth
              />

              <TextField
                label="Description"
                multiline
                rows={3}
                value={editingMovie.description}
                onChange={(e) =>
                  setEditingMovie({
                    ...editingMovie,
                    description: e.target.value,
                  })
                }
                required
                fullWidth
              />

              <TextField
                label="Duration (minutes)"
                type="number"
                value={editingMovie.duration}
                onChange={(e) =>
                  setEditingMovie({
                    ...editingMovie,
                    duration: Number(e.target.value),
                  })
                }
                required
                fullWidth
                inputProps={{
                  min: 1,
                  max: 600,
                }}
              />

              <TextField
                label="Release date"
                type="date"
                value={editingMovie.releaseDate}
                onChange={(e) =>
                  setEditingMovie({
                    ...editingMovie,
                    releaseDate: e.target.value,
                  })
                }
                required
                fullWidth
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              <Divider />

              <Typography variant="h6" fontWeight={700}>
                Screening times & rooms
              </Typography>

              {editingMovie.screenings.length === 0 ? (
                <Typography color="text.secondary">No screening time yet.</Typography>
              ) : (
                <Stack spacing={1}>
                  {editingMovie.screenings.map((screening) => (
                    <Stack
                      key={screening.id}
                      direction="row"
                      spacing={1}
                      sx={{
                        alignItems: 'center',
                      }}
                    >
                      <Chip
                        icon={<CalendarMonth />}
                        label={`${screening.time} · ${screening.room}`}
                      />

                      <Button
                        size="small"
                        color="error"
                        onClick={() => removeScreening(screening.id)}
                      >
                        Remove
                      </Button>
                    </Stack>
                  ))}
                </Stack>
              )}

              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
                spacing={1}
                sx={{
                  alignItems: {
                    xs: 'stretch',
                    sm: 'center',
                  },
                }}
              >
                <TextField
                  label="Time"
                  type="time"
                  value={newScreening.time}
                  onChange={(e) =>
                    setNewScreening({
                      ...newScreening,
                      time: e.target.value,
                    })
                  }
                  required
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />

                <Select
                  value={newScreening.room}
                  onChange={(e) =>
                    setNewScreening({
                      ...newScreening,
                      room: e.target.value,
                    })
                  }
                  sx={{
                    minWidth: 140,
                  }}
                >
                  <MenuItem value="Room 1">Room 1</MenuItem>
                  <MenuItem value="Room 2">Room 2</MenuItem>
                  <MenuItem value="Room 3">Room 3</MenuItem>
                  <MenuItem value="Room 4">Room 4</MenuItem>
                </Select>

                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={addScreening}
                  disabled={!newScreening.time || !newScreening.room}
                >
                  Add Screening
                </Button>
              </Stack>
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setEditingMovie(null)}>Cancel</Button>

          <Button
            variant="contained"
            onClick={() => {
              if (editingMovie) {
                updateMovie(editingMovie);
              }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
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
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MovieListPage;
