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

  // ============================================================
  // LOAD MOVIES
  // ============================================================

  const loadMovies = async () => {
    try {
      const response = await fetch('/movies');

      if (!response.ok) {
        throw new Error('Failed to load movies');
      }

      const data = await response.json();

      const formattedMovies: MovieItem[] = data.map((movie: any) => ({
        id: Number(movie.id),
        title: movie.title || '',
        genre: movie.genre || '',
        image: movie.poster || '',
        trailerUrl: movie.trailer_url || '',
        duration: Number(movie.duration) || 0,
        releaseDate: movie.release_date || '',
        status: movie.status === 'showing' ? 'Showing' : 'Hidden',
        screenings: [],
      }));

      setMovies(formattedMovies);
    } catch (error) {
      console.error('Failed to load movies:', error);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  // ============================================================
  // SORT MOVIES
  // ============================================================

  const sortedMovies = useMemo(
    () =>
      [...movies].sort((a, b) => Number(b.status === 'Showing') - Number(a.status === 'Showing')),
    [movies],
  );

  // ============================================================
  // LOAD SCREENINGS
  // ============================================================

  const loadScreenings = async (movieId: number): Promise<Screening[]> => {
    try {
      const response = await fetch(`/movies/${movieId}/screenings`);

      if (!response.ok) {
        throw new Error('Failed to load screenings');
      }

      const data = await response.json();

      return data.map((screening: any) => ({
        id: Number(screening.id),
        time: screening.time,
        room: screening.room,
      }));
    } catch (error) {
      console.error('Failed to load screenings:', error);

      return [];
    }
  };

  // ============================================================
  // OPEN MODIFY
  // ============================================================

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

  // ============================================================
  // DETAILS
  // ============================================================

  const toggleDetails = async (movieId: number) => {
    if (expandedId === movieId) {
      setExpandedId(null);
      return;
    }

    const screenings = await loadScreenings(movieId);

    setMovies((current) =>
      current.map((movie) =>
        movie.id === movieId
          ? {
              ...movie,
              screenings,
            }
          : movie,
      ),
    );

    setExpandedId(movieId);
  };

  // ============================================================
  // UPDATE MOVIE
  // ============================================================

  const updateMovie = async (movie: MovieItem) => {
    try {
      const response = await fetch(`/movies/${movie.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: movie.title,
          genre: movie.genre,
          duration: Number(movie.duration),
          release_date: movie.releaseDate || null,
          poster: movie.image,
          trailer_url: movie.trailerUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update movie');
      }

      const updatedMovie = await response.json();

      setMovies((current) =>
        current.map((item) =>
          item.id === movie.id
            ? {
                ...item,
                title: updatedMovie.title,
                genre: updatedMovie.genre || '',
                duration: Number(updatedMovie.duration) || 0,
                releaseDate: updatedMovie.release_date || '',
                image: updatedMovie.poster || '',
                trailerUrl: updatedMovie.trailer_url || '',
              }
            : item,
        ),
      );

      setEditingMovie(null);
    } catch (error) {
      console.error('Failed to update movie:', error);
    }
  };

  // ============================================================
  // ADD MOVIE
  // ============================================================

  const addMovie = async () => {
    if (!newMovie.title.trim()) {
      return;
    }

    try {
      const response = await fetch('/movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newMovie.title,
          genre: newMovie.genre,
          duration: Number(newMovie.duration),
          release_date: newMovie.releaseDate || null,
          poster: newMovie.image,
          trailer_url: newMovie.trailerUrl,
          status: 'showing',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create movie');
      }

      const createdMovie = await response.json();

      const movie: MovieItem = {
        id: Number(createdMovie.id),
        title: createdMovie.title || '',
        genre: createdMovie.genre || '',
        image: createdMovie.poster || '',
        trailerUrl: createdMovie.trailer_url || '',
        duration: Number(createdMovie.duration) || 0,
        releaseDate: createdMovie.release_date || '',
        status: createdMovie.status === 'showing' ? 'Showing' : 'Hidden',
        screenings: [],
      };

      setMovies((current) => [...current, movie]);

      setNewMovie(emptyMovie);
      setAddingMovie(false);
    } catch (error) {
      console.error('Failed to create movie:', error);
    }
  };

  // ============================================================
  // TAKE DOWN / RESTORE
  // ============================================================

  const toggleMovieStatus = async (id: number) => {
    const movie = movies.find((item) => item.id === id);

    if (!movie) {
      return;
    }

    const newStatus = movie.status === 'Showing' ? 'hidden' : 'showing';

    try {
      const response = await fetch(`/movies/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update movie status');
      }

      const updatedMovie = await response.json();

      setMovies((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                status: updatedMovie.status === 'showing' ? 'Showing' : 'Hidden',
              }
            : item,
        ),
      );
    } catch (error) {
      console.error('Failed to update movie status:', error);
    }
  };

  // ============================================================
  // DELETE MOVIE
  // ============================================================

  const deleteMovie = async (id: number) => {
    const movie = movies.find((item) => item.id === id);

    if (!movie) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${movie.title}"?`,
    );

    if (!confirmed) {
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
    } catch (error) {
      console.error('Failed to delete movie:', error);
    }
  };

  // ============================================================
  // ADD SCREENING
  // ============================================================

  const addScreening = async () => {
    if (!editingMovie || !newScreening.time) {
      return;
    }

    try {
      const response = await fetch(`/movies/${editingMovie.id}/screenings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          time: newScreening.time,
          room: newScreening.room,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add screening');
      }

      const screening = await response.json();

      const newScreeningItem: Screening = {
        id: Number(screening.id),
        time: screening.time,
        room: screening.room,
      };

      setEditingMovie((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          screenings: [...current.screenings, newScreeningItem],
        };
      });

      setMovies((current) =>
        current.map((movie) =>
          movie.id === editingMovie.id
            ? {
                ...movie,
                screenings: [...movie.screenings, newScreeningItem],
              }
            : movie,
        ),
      );

      setNewScreening({
        time: '',
        room: 'Room 1',
      });
    } catch (error) {
      console.error('Failed to add screening:', error);
    }
  };

  // ============================================================
  // REMOVE SCREENING
  // ============================================================

  const removeScreening = async (screeningId: number) => {
    if (!editingMovie) {
      return;
    }

    try {
      const response = await fetch(`/movies/${editingMovie.id}/screenings/${screeningId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete screening');
      }

      setEditingMovie((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          screenings: current.screenings.filter((screening) => screening.id !== screeningId),
        };
      });

      setMovies((current) =>
        current.map((movie) =>
          movie.id === editingMovie.id
            ? {
                ...movie,
                screenings: movie.screenings.filter((screening) => screening.id !== screeningId),
              }
            : movie,
        ),
      );
    } catch (error) {
      console.error('Failed to delete screening:', error);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <Box
      sx={{
        p: {
          xs: 2,
          md: 4,
        },
        maxWidth: 1400,
        mx: 'auto',
      }}
    >
      <Stack
        direction={{
          xs: 'column',
          sm: 'row',
        }}
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
            <Paper
              key={movie.id}
              variant="outlined"
              sx={{
                overflow: 'hidden',
              }}
            >
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
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 180,
                    }}
                  >
                    <Stack
                      direction="row"
                      gap={2}
                      sx={{
                        alignItems: 'center',
                        flexWrap: 'wrap',
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
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'grey.200',
                          }}
                        >
                          <Typography color="text.secondary">No image</Typography>
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
                      {movie.genre || 'No genre'} ·{' '}
                      {movie.duration ? `${movie.duration} min` : 'No duration'} · Release{' '}
                      {movie.releaseDate || '—'}
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

      {/* ========================================================
          ADD MOVIE DIALOG
      ======================================================== */}

      <Dialog open={addingMovie} onClose={() => setAddingMovie(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Movie</DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Movie title"
              value={newMovie.title}
              onChange={(event) =>
                setNewMovie({
                  ...newMovie,
                  title: event.target.value,
                })
              }
              fullWidth
            />

            <TextField
              label="Poster URL"
              placeholder="https://..."
              value={newMovie.image}
              onChange={(event) =>
                setNewMovie({
                  ...newMovie,
                  image: event.target.value,
                })
              }
              fullWidth
            />

            {newMovie.image && (
              <Box
                component="img"
                src={newMovie.image}
                alt="Poster preview"
                sx={{
                  width: 100,
                  height: 140,
                  objectFit: 'cover',
                  borderRadius: 1,
                }}
              />
            )}

            <TextField
              label="Genre"
              value={newMovie.genre}
              onChange={(event) =>
                setNewMovie({
                  ...newMovie,
                  genre: event.target.value,
                })
              }
              fullWidth
            />

            <TextField
              label="Duration (minutes)"
              type="number"
              value={newMovie.duration}
              onChange={(event) =>
                setNewMovie({
                  ...newMovie,
                  duration: Number(event.target.value),
                })
              }
              fullWidth
            />

            <TextField
              label="Release date"
              type="date"
              value={newMovie.releaseDate}
              onChange={(event) =>
                setNewMovie({
                  ...newMovie,
                  releaseDate: event.target.value,
                })
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
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

      {/* ========================================================
          MODIFY MOVIE DIALOG
      ======================================================== */}

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
                onChange={(event) =>
                  setEditingMovie({
                    ...editingMovie,
                    title: event.target.value,
                  })
                }
                fullWidth
              />

              <TextField
                label="Poster URL"
                value={editingMovie.image}
                onChange={(event) =>
                  setEditingMovie({
                    ...editingMovie,
                    image: event.target.value,
                  })
                }
                fullWidth
              />

              <TextField
                label="Trailer URL"
                placeholder="https://www.youtube.com/watch?v=..."
                value={editingMovie.trailerUrl}
                onChange={(event) =>
                  setEditingMovie({
                    ...editingMovie,
                    trailerUrl: event.target.value,
                  })
                }
                fullWidth
              />

              {editingMovie.image && (
                <Box
                  component="img"
                  src={editingMovie.image}
                  alt={editingMovie.title}
                  sx={{
                    width: 100,
                    height: 140,
                    objectFit: 'cover',
                    borderRadius: 1,
                  }}
                />
              )}

              <TextField
                label="Genre"
                value={editingMovie.genre}
                onChange={(event) =>
                  setEditingMovie({
                    ...editingMovie,
                    genre: event.target.value,
                  })
                }
                fullWidth
              />

              <TextField
                label="Duration (minutes)"
                type="number"
                value={editingMovie.duration}
                onChange={(event) =>
                  setEditingMovie({
                    ...editingMovie,
                    duration: Number(event.target.value),
                  })
                }
                fullWidth
              />

              <TextField
                label="Release date"
                type="date"
                value={editingMovie.releaseDate}
                onChange={(event) =>
                  setEditingMovie({
                    ...editingMovie,
                    releaseDate: event.target.value,
                  })
                }
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                fullWidth
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
                  onChange={(event) =>
                    setNewScreening({
                      ...newScreening,
                      time: event.target.value,
                    })
                  }
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />

                <Select
                  value={newScreening.room}
                  onChange={(event) =>
                    setNewScreening({
                      ...newScreening,
                      room: event.target.value,
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
                  disabled={!newScreening.time}
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
    </Box>
  );
};

export default MovieListPage;
