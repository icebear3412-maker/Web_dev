// src/pages/Admin/Movies/index.tsx

import React, { useEffect, useMemo, useState } from 'react';
import {
  Add,
  CalendarMonth,
  Delete,
  Edit,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Movie,
  PlayCircleOutline,
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
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import type { MovieForm, MovieItem, Screening } from '../../../types';

const emptyMovie: MovieForm = {
  title: '',
  genre: '',
  image: '',
  trailerUrl: '',
  description: '',
  duration: 0,
  releaseDate: '',
};

const API_URL = '/movies';

const MoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [editMovie, setEditMovie] = useState<MovieItem | null>(null);
  const [movieForm, setMovieForm] = useState<MovieForm>(emptyMovie);

  const [expandedMovie, setExpandedMovie] = useState<number | null>(null);

  const [screeningTime, setScreeningTime] = useState('');
  const [screeningRoom, setScreeningRoom] = useState('');

  const [filter, setFilter] = useState<'all' | 'showing' | 'hidden'>('all');

  const loadMovies = async () => {
    setLoading(true);

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error('Failed to load movies');
      }

      const data = await response.json();

      const moviesWithScreenings: MovieItem[] = await Promise.all(
        data.map(async (movie: any) => {
          let screenings: Screening[] = [];

          try {
            const screeningResponse = await fetch(`${API_URL}/${movie.id}/screenings`);

            if (screeningResponse.ok) {
              screenings = await screeningResponse.json();
            }
          } catch {
            screenings = [];
          }

          return {
            id: movie.id,
            title: movie.title || '',
            genre: movie.genre || '',
            image: movie.poster || '',
            trailerUrl: movie.trailer_url || '',
            description: movie.description || '',
            duration: movie.duration || 0,
            releaseDate: movie.release_date || '',
            status: movie.status === 'hidden' ? 'Hidden' : 'Showing',
            screenings,
          };
        }),
      );

      setMovies(moviesWithScreenings);
    } catch (error) {
      console.error(error);
      alert('Cannot load movies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovies();
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

  const handleAddMovie = async () => {
    if (!movieForm.title.trim()) {
      alert('Movie title is required.');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: movieForm.title,
          genre: movieForm.genre,
          duration: movieForm.duration,
          release_date: movieForm.releaseDate || null,
          poster: movieForm.image,
          trailer_url: movieForm.trailerUrl,
          description: movieForm.description,
          status: 'showing',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create movie');
      }

      const createdMovie = await response.json();

      setMovies((prev) => [
        ...prev,
        {
          id: createdMovie.id,
          title: createdMovie.title || '',
          genre: createdMovie.genre || '',
          image: createdMovie.poster || '',
          trailerUrl: createdMovie.trailer_url || '',
          description: createdMovie.description || '',
          duration: createdMovie.duration || 0,
          releaseDate: createdMovie.release_date || '',
          status: createdMovie.status === 'hidden' ? 'Hidden' : 'Showing',
          screenings: [],
        },
      ]);

      setMovieForm(emptyMovie);
      setAddOpen(false);
    } catch (error) {
      console.error(error);
      alert('Cannot create movie.');
    }
  };

  const handleUpdateMovie = async () => {
    if (!editMovie) {
      return;
    }

    if (!movieForm.title.trim()) {
      alert('Movie title is required.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${editMovie.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: movieForm.title,
          genre: movieForm.genre,
          duration: movieForm.duration,
          release_date: movieForm.releaseDate || null,
          poster: movieForm.image,
          trailer_url: movieForm.trailerUrl,
          description: movieForm.description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update movie');
      }

      const updatedMovie = await response.json();

      setMovies((prev) =>
        prev.map((movie) =>
          movie.id === editMovie.id
            ? {
                ...movie,
                title: updatedMovie.title || '',
                genre: updatedMovie.genre || '',
                image: updatedMovie.poster || '',
                trailerUrl: updatedMovie.trailer_url || '',
                description: updatedMovie.description || '',
                duration: updatedMovie.duration || 0,
                releaseDate: updatedMovie.release_date || '',
              }
            : movie,
        ),
      );

      setEditMovie(null);
      setMovieForm(emptyMovie);
    } catch (error) {
      console.error(error);
      alert('Cannot update movie.');
    }
  };

  const handleChangeStatus = async (movie: MovieItem, status: 'showing' | 'hidden') => {
    try {
      const response = await fetch(`${API_URL}/${movie.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to change movie status');
      }

      setMovies((prev) =>
        prev.map((item) =>
          item.id === movie.id
            ? {
                ...item,
                status: status === 'hidden' ? 'Hidden' : 'Showing',
              }
            : item,
        ),
      );
    } catch (error) {
      console.error(error);
      alert('Cannot change movie status.');
    }
  };

  const handleDeleteMovie = async (movie: MovieItem) => {
    const confirmed = window.confirm(`Delete "${movie.title}" permanently?`);

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${movie.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete movie');
      }

      setMovies((prev) => prev.filter((item) => item.id !== movie.id));
    } catch (error) {
      console.error(error);
      alert('Cannot delete movie.');
    }
  };

  const handleAddScreening = async (movie: MovieItem) => {
    if (!screeningTime || !screeningRoom.trim()) {
      alert('Please enter both time and room.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${movie.id}/screenings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          time: screeningTime,
          room: screeningRoom,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create screening');
      }

      const createdScreening = await response.json();

      setMovies((prev) =>
        prev.map((item) =>
          item.id === movie.id
            ? {
                ...item,
                screenings: [...item.screenings, createdScreening],
              }
            : item,
        ),
      );

      setScreeningTime('');
      setScreeningRoom('');
    } catch (error) {
      console.error(error);
      alert('Cannot add screening.');
    }
  };

  const handleDeleteScreening = async (movie: MovieItem, screening: Screening) => {
    try {
      const response = await fetch(`${API_URL}/${movie.id}/screenings/${screening.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete screening');
      }

      setMovies((prev) =>
        prev.map((item) =>
          item.id === movie.id
            ? {
                ...item,
                screenings: item.screenings.filter(
                  (itemScreening) => itemScreening.id !== screening.id,
                ),
              }
            : item,
        ),
      );
    } catch (error) {
      console.error(error);
      alert('Cannot delete screening.');
    }
  };

  const openEditDialog = (movie: MovieItem) => {
    setEditMovie(movie);

    setMovieForm({
      title: movie.title,
      genre: movie.genre,
      image: movie.image,
      trailerUrl: movie.trailerUrl,
      description: movie.description,
      duration: movie.duration,
      releaseDate: movie.releaseDate,
    });
  };

  return (
    <Box sx={{ p: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Movie List
          </Typography>

          <Typography color="text.secondary">
            Manage movies, descriptions and screening schedules.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setMovieForm(emptyMovie);
            setAddOpen(true);
          }}
        >
          Add Movie
        </Button>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <Button
          variant={filter === 'all' ? 'contained' : 'outlined'}
          onClick={() => setFilter('all')}
        >
          All
        </Button>

        <Button
          variant={filter === 'showing' ? 'contained' : 'outlined'}
          onClick={() => setFilter('showing')}
        >
          Showing
        </Button>

        <Button
          variant={filter === 'hidden' ? 'contained' : 'outlined'}
          onClick={() => setFilter('hidden')}
        >
          Hidden
        </Button>
      </Stack>

      {loading ? (
        <Typography>Loading movies...</Typography>
      ) : filteredMovies.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <Movie sx={{ fontSize: 50, mb: 1 }} />

          <Typography variant="h6">No movies found</Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {filteredMovies.map((movie) => {
            const expanded = expandedMovie === movie.id;

            return (
              <Paper
                key={movie.id}
                elevation={2}
                sx={{
                  p: 2,
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 90,
                      height: 120,
                      borderRadius: 1,
                      overflow: 'hidden',
                      backgroundColor: '#eee',
                      flexShrink: 0,
                    }}
                  >
                    {movie.image ? (
                      <Box
                        component="img"
                        src={movie.image}
                        alt={movie.title}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
                        <Movie />
                      </Stack>
                    )}
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="h6" fontWeight={700}>
                        {movie.title}
                      </Typography>

                      <Chip
                        size="small"
                        label={movie.status}
                        color={movie.status === 'Showing' ? 'success' : 'default'}
                      />
                    </Stack>

                    <Typography color="text.secondary">
                      {movie.genre || 'No genre'} • {movie.duration} minutes
                    </Typography>

                    {movie.releaseDate && (
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                        <CalendarMonth fontSize="small" />

                        <Typography variant="body2">Release: {movie.releaseDate}</Typography>
                      </Stack>
                    )}

                    {movie.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          maxWidth: 800,
                        }}
                      >
                        {movie.description}
                      </Typography>
                    )}
                  </Box>

                  <Stack direction="row" spacing={0.5}>
                    <IconButton onClick={() => setExpandedMovie(expanded ? null : movie.id)}>
                      {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>

                    <IconButton onClick={() => openEditDialog(movie)}>
                      <Edit />
                    </IconButton>

                    {movie.status === 'Showing' ? (
                      <IconButton onClick={() => handleChangeStatus(movie, 'hidden')}>
                        <VisibilityOff />
                      </IconButton>
                    ) : (
                      <IconButton onClick={() => handleChangeStatus(movie, 'showing')}>
                        <Restore />
                      </IconButton>
                    )}

                    <IconButton color="error" onClick={() => handleDeleteMovie(movie)}>
                      <Delete />
                    </IconButton>
                  </Stack>
                </Stack>

                {expanded && (
                  <>
                    <Divider sx={{ my: 2 }} />

                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                        Description
                      </Typography>

                      <Typography color="text.secondary" sx={{ mb: 3 }}>
                        {movie.description || 'No description available.'}
                      </Typography>

                      {movie.trailerUrl && (
                        <Button
                          variant="outlined"
                          startIcon={<PlayCircleOutline />}
                          href={movie.trailerUrl}
                          target="_blank"
                          rel="noreferrer"
                          sx={{ mb: 3 }}
                        >
                          Watch Trailer
                        </Button>
                      )}

                      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                        Screening Times
                      </Typography>

                      <Stack spacing={1} sx={{ mb: 3 }}>
                        {movie.screenings.length === 0 ? (
                          <Typography color="text.secondary">No screening times.</Typography>
                        ) : (
                          movie.screenings.map((screening) => (
                            <Stack
                              key={screening.id}
                              direction="row"
                              spacing={2}
                              alignItems="center"
                            >
                              <Chip label={screening.time} />

                              <Typography>Room {screening.room}</Typography>

                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteScreening(movie, screening)}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Stack>
                          ))
                        )}
                      </Stack>

                      <Stack
                        direction={{
                          xs: 'column',
                          sm: 'row',
                        }}
                        spacing={1}
                        alignItems={{
                          xs: 'stretch',
                          sm: 'center',
                        }}
                      >
                        <TextField
                          label="Time"
                          type="time"
                          value={screeningTime}
                          onChange={(event) => setScreeningTime(event.target.value)}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />

                        <TextField
                          label="Room"
                          value={screeningRoom}
                          onChange={(event) => setScreeningRoom(event.target.value)}
                        />

                        <Button
                          variant="contained"
                          startIcon={<Add />}
                          onClick={() => handleAddScreening(movie)}
                        >
                          Add Screening
                        </Button>
                      </Stack>
                    </Box>
                  </>
                )}
              </Paper>
            );
          })}
        </Stack>
      )}

      {/* ADD MOVIE */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Movie</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={movieForm.title}
              onChange={(event) =>
                setMovieForm({
                  ...movieForm,
                  title: event.target.value,
                })
              }
              fullWidth
              required
            />

            <TextField
              label="Genre"
              value={movieForm.genre}
              onChange={(event) =>
                setMovieForm({
                  ...movieForm,
                  genre: event.target.value,
                })
              }
              fullWidth
            />

            <TextField
              label="Duration (minutes)"
              type="number"
              value={movieForm.duration}
              onChange={(event) =>
                setMovieForm({
                  ...movieForm,
                  duration: Number(event.target.value),
                })
              }
              fullWidth
            />

            <TextField
              label="Release Date"
              type="date"
              value={movieForm.releaseDate}
              onChange={(event) =>
                setMovieForm({
                  ...movieForm,
                  releaseDate: event.target.value,
                })
              }
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />

            <TextField
              label="Poster URL"
              value={movieForm.image}
              onChange={(event) =>
                setMovieForm({
                  ...movieForm,
                  image: event.target.value,
                })
              }
              fullWidth
            />

            <TextField
              label="Trailer URL"
              value={movieForm.trailerUrl}
              onChange={(event) =>
                setMovieForm({
                  ...movieForm,
                  trailerUrl: event.target.value,
                })
              }
              fullWidth
            />

            <TextField
              label="Description"
              value={movieForm.description}
              onChange={(event) =>
                setMovieForm({
                  ...movieForm,
                  description: event.target.value,
                })
              }
              fullWidth
              multiline
              minRows={4}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>

          <Button variant="contained" onClick={handleAddMovie}>
            Add Movie
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODIFY MOVIE */}
      <Dialog open={Boolean(editMovie)} onClose={() => setEditMovie(null)} fullWidth maxWidth="sm">
        <DialogTitle>Modify Movie</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={movieForm.title}
              onChange={(event) =>
                setMovieForm({
                  ...movieForm,
                  title: event.target.value,
                })
              }
              fullWidth
              required
            />

            <TextField
              label="Genre"
              value={movieForm.genre}
              onChange={(event) =>
                setMovieForm({
                  ...movieForm,
                  genre: event.target.value,
                })
              }
              fullWidth
            />

            <TextField
              label="Duration (minutes)"
              type="number"
              value={movieForm.duration}
              onChange={(event) =>
                setMovieForm({
                  ...movieForm,
                  duration: Number(event.target.value),
                })
              }
              fullWidth
            />

            <TextField
              label="Release Date"
              type="date"
              value={movieForm.releaseDate}
              onChange={(event) =>
                setMovieForm({
                  ...movieForm,
                  releaseDate: event.target.value,
                })
              }
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />

            <TextField
              label="Poster URL"
              value={movieForm.image}
              onChange={(event) =>
                setMovieForm({
                  ...movieForm,
                  image: event.target.value,
                })
              }
              fullWidth
            />

            <TextField
              label="Trailer URL"
              value={movieForm.trailerUrl}
              onChange={(event) =>
                setMovieForm({
                  ...movieForm,
                  trailerUrl: event.target.value,
                })
              }
              fullWidth
            />

            <TextField
              label="Description"
              value={movieForm.description}
              onChange={(event) =>
                setMovieForm({
                  ...movieForm,
                  description: event.target.value,
                })
              }
              fullWidth
              multiline
              minRows={4}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setEditMovie(null)}>Cancel</Button>

          <Button variant="contained" onClick={handleUpdateMovie}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MoviesPage;
