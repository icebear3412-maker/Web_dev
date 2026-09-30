import React, { useMemo, useState } from 'react';

import {
  Add,
  CalendarMonth,
  Edit,
  KeyboardArrowDown,
  KeyboardArrowUp,
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
  id?: string;
  time: string;
  room: string;
  date?: string;
  format?: string;
}

interface CinemaRoom {
  room_number: number;
  name: string;
  type: string;
  capacity: number;
}

interface MovieItem {
  id: string;
  title: string;
  genre: string;
  image: string;
  duration: string;
  releaseDate: string;
  status: 'Showing' | 'Hidden';
  screenings: Screening[];
}

const emptyMovie: Omit<MovieItem, 'id' | 'status'> = {
  title: '',
  genre: '',
  duration: '120 min',
  releaseDate: '',
  image: '',
  screenings: [],
};

const MovieListPage = () => {
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [rooms, setRooms] = useState<CinemaRoom[]>([]);

  const [editingMovie, setEditingMovie] =
    useState<MovieItem | null>(null);

  const [addingMovie, setAddingMovie] = useState(false);

  const [newMovie, setNewMovie] = useState(emptyMovie);

  const [expandedId, setExpandedId] =
    useState<string | null>(null);

  const [newScreening, setNewScreening] =
    useState<Screening>({
      time: '',
      room: '',
      date: '',
      format: 'IMAX',
    });

  /*
   * LOAD MOVIES
   */
  React.useEffect(() => {
    const loadMovies = async () => {
      try {
        const movieResponse = await fetch('/movies');

        if (!movieResponse.ok) {
          throw new Error('Failed to fetch movies');
        }

        const movieData = await movieResponse.json();

        const formattedMovies: MovieItem[] =
          await Promise.all(
            movieData.map(async (movie: any) => {
              let screenings: Screening[] = [];

              try {
                const screeningResponse = await fetch(
                  `/movies/${movie.id}/showtimes`,
                );

                if (screeningResponse.ok) {
                  const screeningData =
                    await screeningResponse.json();

                  const showtimes = Array.isArray(
                    screeningData,
                  )
                    ? screeningData
                    : screeningData.showtimes || [];

                  screenings = showtimes.map(
                    (screening: any) => ({
                      id: screening.id,
                      time:
                        screening.show_time || '',
                      room:
                        String(
                          screening.cinema_room_number,
                        ),
                      date:
                        screening.show_date || '',
                      format:
                        screening.format || '',
                    }),
                  );
                }
              } catch (error) {
                console.error(
                  `Failed to fetch screenings for ${movie.id}:`,
                  error,
                );
              }

              return {
                id: String(movie.id),
                title: movie.title || '',
                genre: movie.genre || '',
                image: movie.poster || '',
                duration:
                  movie.duration !== undefined &&
                  movie.duration !== null
                    ? String(movie.duration)
                    : '',
                releaseDate:
                  movie.release_date || '',
                status:
                  movie.status === 'showing'
                    ? 'Showing'
                    : 'Hidden',
                screenings,
              };
            }),
          );

        setMovies(formattedMovies);
      } catch (error) {
        console.error(
          'Failed to fetch movies:',
          error,
        );
      }
    };

    /*
     * LOAD CINEMA ROOMS
     */
    const loadRooms = async () => {
      try {
        const response = await fetch(
          '/movies/rooms',
        );

        if (!response.ok) {
          throw new Error(
            'Failed to fetch cinema rooms',
          );
        }

        const roomData = await response.json();

        const formattedRooms: CinemaRoom[] =
          Array.isArray(roomData)
            ? roomData
            : roomData.cinema_rooms || [];

        setRooms(formattedRooms);

        /*
         * Set first room as default.
         */
        if (formattedRooms.length > 0) {
          setNewScreening((current) => ({
            ...current,
            room: String(
              formattedRooms[0].room_number,
            ),
            format:
              formattedRooms[0].type || 'IMAX',
          }));
        }
      } catch (error) {
        console.error(
          'Failed to fetch cinema rooms:',
          error,
        );
      }
    };

    loadMovies();
    loadRooms();
  }, []);

  /*
   * SHOWING MOVIES FIRST
   */
  const sortedMovies = useMemo(
    () =>
      [...movies].sort(
        (a, b) =>
          Number(b.status === 'Showing') -
          Number(a.status === 'Showing'),
      ),
    [movies],
  );

  /*
   * UPDATE MOVIE
   */
  const updateMovie = async (
    movie: MovieItem,
  ) => {
    try {
      const response = await fetch(
        `/movies/${movie.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            title: movie.title,
            genre: movie.genre,
            duration:
              movie.duration.includes('min')
                ? movie.duration
                : `${movie.duration} min`,
            release_date:
              movie.releaseDate,
            poster: movie.image,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          'Failed to update movie',
        );
      }

      const updatedMovie =
        await response.json();

      setMovies((current) =>
        current.map((item) =>
          item.id === movie.id
            ? {
                ...item,
                title:
                  updatedMovie.title ??
                  movie.title,
                genre:
                  updatedMovie.genre ??
                  movie.genre,
                duration:
                  updatedMovie.duration ??
                  movie.duration,
                releaseDate:
                  updatedMovie.release_date ??
                  movie.releaseDate,
                image:
                  updatedMovie.poster ??
                  movie.image,
              }
            : item,
        ),
      );

      setEditingMovie(null);
    } catch (error) {
      console.error(
        'Failed to update movie:',
        error,
      );
    }
  };

  /*
   * ADD NEW MOVIE
   */
  const addMovie = async () => {
    if (!newMovie.title.trim()) {
      return;
    }

    const movieId = newMovie.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    try {
      const response = await fetch(
        '/movies',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            id: movieId,
            title: newMovie.title,
            genre: newMovie.genre,
            duration:
              String(
                newMovie.duration,
              ).includes('min')
                ? String(
                    newMovie.duration,
                  )
                : `${newMovie.duration} min`,
            release_date:
              newMovie.releaseDate,
            poster: newMovie.image,
            status: 'showing',
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          'Failed to create movie',
        );
      }

      const createdMovie =
        await response.json();

      const movie: MovieItem = {
        id: String(createdMovie.id),
        title:
          createdMovie.title ||
          newMovie.title,
        genre:
          createdMovie.genre ||
          newMovie.genre,
        duration:
          createdMovie.duration ||
          newMovie.duration,
        releaseDate:
          createdMovie.release_date ||
          newMovie.releaseDate,
        image:
          createdMovie.poster ||
          newMovie.image,
        status:
          createdMovie.status ===
          'showing'
            ? 'Showing'
            : 'Hidden',
        screenings: [],
      };

      setMovies((current) => [
        ...current,
        movie,
      ]);

      setNewMovie(emptyMovie);
      setAddingMovie(false);
    } catch (error) {
      console.error(
        'Failed to create movie:',
        error,
      );
    }
  };

  /*
   * TAKE DOWN / BRING BACK MOVIE
   */
  const toggleMovieStatus = async (
    id: string,
  ) => {
    const movie = movies.find(
      (item) => item.id === id,
    );

    if (!movie) {
      return;
    }

    const newStatus =
      movie.status === 'Showing'
        ? 'hidden'
        : 'showing';

    try {
      const response = await fetch(
        `/movies/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          'Failed to update movie status',
        );
      }

      const updatedMovie =
        await response.json();

      setMovies((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                status:
                  updatedMovie.status ===
                  'showing'
                    ? 'Showing'
                    : 'Hidden',
              }
            : item,
        ),
      );
    } catch (error) {
      console.error(
        'Failed to update movie status:',
        error,
      );
    }
  };

  /*
   * ADD SCREENING
   */
  const addScreening = async () => {
    if (!editingMovie) {
      return;
    }

    if (
      !newScreening.time ||
      !newScreening.date ||
      !newScreening.room
    ) {
      return;
    }

    const roomNumber = Number(
      newScreening.room,
    );

    if (!roomNumber) {
      return;
    }

    /*
     * Generate unique showtime ID.
     */
    const showtimeId =
      crypto.randomUUID();

    try {
      const response = await fetch(
        `/movies/${editingMovie.id}/showtimes`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            id: showtimeId,
            movie_id: editingMovie.id,
            cinema_room_number:
              roomNumber,
            show_date:
              newScreening.date,
            show_time:
              newScreening.time,
            format:
              newScreening.format ||
              'IMAX',
          }),
        },
      );

      if (!response.ok) {
        const errorData =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          errorData?.error ||
            'Failed to create screening',
        );
      }

      const responseData =
        await response.json();

      /*
       * Backend returns:
       *
       * {
       *   "showtime": {
       *      ...
       *   }
       * }
       */
      const createdScreening =
        responseData.showtime ||
        responseData;

      const screening: Screening = {
        id:
          createdScreening.id ||
          showtimeId,
        time:
          createdScreening.show_time ||
          newScreening.time,
        room: String(
          createdScreening.cinema_room_number ||
            roomNumber,
        ),
        date:
          createdScreening.show_date ||
          newScreening.date,
        format:
          createdScreening.format ||
          newScreening.format ||
          'IMAX',
      };

      const updatedMovie = {
        ...editingMovie,
        screenings: [
          ...editingMovie.screenings,
          screening,
        ],
      };

      setEditingMovie(updatedMovie);

      setMovies((current) =>
        current.map((item) =>
          item.id === editingMovie.id
            ? updatedMovie
            : item,
        ),
      );

      setNewScreening({
        time: '',
        room:
          rooms.length > 0
            ? String(
                rooms[0].room_number,
              )
            : '',
        date: '',
        format:
          rooms.length > 0
            ? rooms[0].type
            : 'IMAX',
      });
    } catch (error) {
      console.error(
        'Failed to create screening:',
        error,
      );
    }
  };

  /*
   * REMOVE SCREENING
   */
  const removeScreening = async (
    screening: Screening,
  ) => {
    if (
      !editingMovie ||
      !screening.id
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/movies/${editingMovie.id}/showtimes/${screening.id}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        const errorData =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          errorData?.error ||
            'Failed to delete screening',
        );
      }

      const updatedScreenings =
        editingMovie.screenings.filter(
          (item) =>
            item.id !== screening.id,
        );

      const updatedMovie = {
        ...editingMovie,
        screenings:
          updatedScreenings,
      };

      setEditingMovie(updatedMovie);

      setMovies((current) =>
        current.map((item) =>
          item.id === editingMovie.id
            ? updatedMovie
            : item,
        ),
      );
    } catch (error) {
      console.error(
        'Failed to delete screening:',
        error,
      );
    }
  };

  /*
   * GET ROOM NAME
   */
  const getRoomName = (
    roomNumber: string,
  ) => {
    const room = rooms.find(
      (item) =>
        String(item.room_number) ===
        roomNumber,
    );

    if (!room) {
      return `Room ${roomNumber}`;
    }

    return `Room ${room.room_number} - ${room.name}`;
  };

  /*
   * GET ROOM TYPE
   */
  const getRoomType = (
    roomNumber: string,
  ) => {
    const room = rooms.find(
      (item) =>
        String(item.room_number) ===
        roomNumber,
    );

    return room?.type || 'IMAX';
  };

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
      {/* HEADER */}
      <Stack
        direction={{
          xs: 'column',
          sm: 'row',
        }}
        gap={2}
        sx={{
          justifyContent:
            'space-between',
          alignItems: {
            xs: 'stretch',
            sm: 'center',
          },
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
          >
            Movie List
          </Typography>

          <Typography
            color="text.secondary"
            mt={0.5}
          >
            Manage movies, screening
            times and cinema rooms.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() =>
            setAddingMovie(true)
          }
        >
          Add new movie
        </Button>
      </Stack>

      {/* MOVIE LIST */}
      <Stack spacing={2}>
        {sortedMovies.map((movie) => {
          const expanded =
            expandedId === movie.id;

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
                  {/* MOVIE INFORMATION */}
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 180,
                    }}
                  >
                    <Stack
                      direction="row"
                      gap={1}
                      sx={{
                        alignItems:
                          'center',
                        flexWrap:
                          'wrap',
                      }}
                    >
                      {/* POSTER */}
                      {movie.image ? (
                        <Box
                          component="img"
                          src={movie.image}
                          alt={movie.title}
                          sx={{
                            width: 100,
                            height: 140,
                            objectFit:
                              'cover',
                            borderRadius: 1,
                            mr: 2,
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 100,
                            height: 140,
                            borderRadius: 1,
                            mr: 2,
                            display: 'flex',
                            alignItems:
                              'center',
                            justifyContent:
                              'center',
                            backgroundColor:
                              '#eeeeee',
                            color: '#777',
                          }}
                        >
                          No poster
                        </Box>
                      )}

                      <Box>
                        <Typography
                          variant="h6"
                        >
                          {movie.title}
                        </Typography>

                        <Chip
                          size="small"
                          label={
                            movie.status
                          }
                          color={
                            movie.status ===
                            'Showing'
                              ? 'success'
                              : 'default'
                          }
                        />
                      </Box>
                    </Stack>

                    <Typography
                      color="text.secondary"
                      mt={0.5}
                    >
                      {movie.genre} ·{' '}
                      {movie.duration} ·
                      Release{' '}
                      {movie.releaseDate ||
                        '—'}
                    </Typography>
                  </Box>

                  {/* ACTION BUTTONS */}
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
                      startIcon={
                        movie.status ===
                        'Showing' ? (
                          <VisibilityOff />
                        ) : (
                          <Restore />
                        )
                      }
                      onClick={() =>
                        toggleMovieStatus(
                          movie.id,
                        )
                      }
                    >
                      {movie.status ===
                      'Showing'
                        ? 'Take down'
                        : 'Bring back'}
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={
                        <Edit />
                      }
                      onClick={() => {
                        setEditingMovie(
                          {
                            ...movie,
                            screenings:
                              [
                                ...movie.screenings,
                              ],
                          },
                        );

                        setNewScreening({
                          time: '',
                          room:
                            rooms.length >
                            0
                              ? String(
                                  rooms[0]
                                    .room_number,
                                )
                              : '',
                          date: '',
                          format:
                            rooms.length >
                            0
                              ? rooms[0]
                                  .type
                              : 'IMAX',
                        });
                      }}
                    >
                      Modify
                    </Button>

                    <Button
                      size="small"
                      onClick={() =>
                        setExpandedId(
                          expanded
                            ? null
                            : movie.id,
                        )
                      }
                      endIcon={
                        expanded ? (
                          <KeyboardArrowUp />
                        ) : (
                          <KeyboardArrowDown />
                        )
                      }
                    >
                      Details
                    </Button>
                  </Stack>
                </Stack>

                {/* DETAILS */}
                {expanded && (
                  <>
                    <Divider
                      sx={{ my: 2 }}
                    />

                    <Typography
                      fontWeight={700}
                      mb={1}
                    >
                      Screening times &
                      rooms
                    </Typography>

                    {movie.screenings
                      .length === 0 ? (
                      <Typography
                        color="text.secondary"
                      >
                        No screening
                        time yet.
                      </Typography>
                    ) : (
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          flexWrap:
                            'wrap',
                        }}
                      >
                        {movie.screenings.map(
                          (
                            screening,
                            index,
                          ) => (
                            <Chip
                              key={
                                screening.id ||
                                `${screening.date}-${screening.time}-${screening.room}-${index}`
                              }
                              icon={
                                <CalendarMonth />
                              }
                              label={`${screening.date || 'No date'} · ${screening.time} · ${getRoomName(screening.room)}${screening.format ? ` · ${screening.format}` : ''}`}
                            />
                          ),
                        )}
                      </Stack>
                    )}
                  </>
                )}
              </Box>
            </Paper>
          );
        })}
      </Stack>

      {/* ADD MOVIE DIALOG */}
      <Dialog
        open={addingMovie}
        onClose={() =>
          setAddingMovie(false)
        }
        fullWidth
        maxWidth="sm"
        disableRestoreFocus
      >
        <DialogTitle>
          Add new movie
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={2}
            mt={1}
          >
            <TextField
              label="Movie title"
              value={newMovie.title}
              onChange={(event) =>
                setNewMovie({
                  ...newMovie,
                  title:
                    event.target
                      .value,
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
                  image:
                    event.target
                      .value,
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
                  objectFit:
                    'cover',
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
                  genre:
                    event.target
                      .value,
                })
              }
              fullWidth
            />

            <TextField
              label="Duration (minutes)"
              type="number"
              value={String(
                newMovie.duration,
              ).replace(
                ' min',
                '',
              )}
              onChange={(event) =>
                setNewMovie({
                  ...newMovie,
                  duration: `${event.target.value} min`,
                })
              }
              fullWidth
            />

            <TextField
              label="Release date"
              type="date"
              value={
                newMovie.releaseDate
              }
              onChange={(event) =>
                setNewMovie({
                  ...newMovie,
                  releaseDate:
                    event.target
                      .value,
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
          <Button
            onClick={() =>
              setAddingMovie(false)
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={addMovie}
            disabled={
              !newMovie.title.trim()
            }
          >
            Add movie
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODIFY MOVIE DIALOG */}
      <Dialog
        open={Boolean(
          editingMovie,
        )}
        onClose={() =>
          setEditingMovie(null)
        }
        fullWidth
        maxWidth="md"
        disableRestoreFocus
      >
        <DialogTitle>
          Modify movie
        </DialogTitle>

        <DialogContent>
          {editingMovie && (
            <Stack
              spacing={2}
              mt={1}
            >
              {/* TITLE */}
              <TextField
                label="Movie title"
                value={
                  editingMovie.title
                }
                onChange={(event) =>
                  setEditingMovie({
                    ...editingMovie,
                    title:
                      event.target
                        .value,
                  })
                }
                fullWidth
              />

              {/* POSTER */}
              <TextField
                label="Poster URL"
                placeholder="https://..."
                value={
                  editingMovie.image
                }
                onChange={(event) =>
                  setEditingMovie({
                    ...editingMovie,
                    image:
                      event.target
                        .value,
                  })
                }
                fullWidth
              />

              {editingMovie.image && (
                <Box
                  component="img"
                  src={
                    editingMovie.image
                  }
                  alt={
                    editingMovie.title
                  }
                  sx={{
                    width: 100,
                    height: 140,
                    objectFit:
                      'cover',
                    borderRadius: 1,
                  }}
                />
              )}

              {/* GENRE + DURATION */}
              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
                spacing={2}
              >
                <TextField
                  label="Genre"
                  value={
                    editingMovie.genre
                  }
                  onChange={(event) =>
                    setEditingMovie({
                      ...editingMovie,
                      genre:
                        event.target
                          .value,
                    })
                  }
                  fullWidth
                />

                <TextField
                  label="Duration (minutes)"
                  type="number"
                  value={String(
                    editingMovie.duration,
                  ).replace(
                    ' min',
                    '',
                  )}
                  onChange={(event) =>
                    setEditingMovie({
                      ...editingMovie,
                      duration: `${event.target.value} min`,
                    })
                  }
                  fullWidth
                />
              </Stack>

              {/* RELEASE DATE */}
              <TextField
                label="Release date"
                type="date"
                value={
                  editingMovie.releaseDate
                }
                onChange={(event) =>
                  setEditingMovie({
                    ...editingMovie,
                    releaseDate:
                      event.target
                        .value,
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

              {/* SCREENINGS */}
              <Typography
                fontWeight={700}
              >
                Screening times &
                rooms
              </Typography>

              {editingMovie.screenings.map(
                (
                  screening,
                  index,
                ) => (
                  <Paper
                    key={
                      screening.id ||
                      `${screening.date}-${screening.time}-${index}`
                    }
                    variant="outlined"
                    sx={{
                      p: 2,
                    }}
                  >
                    <Stack spacing={1}>
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
                        {/* DATE */}
                        <TextField
                          label="Date"
                          type="date"
                          value={
                            screening.date ||
                            ''
                          }
                          disabled
                          slotProps={{
                            inputLabel:
                              {
                                shrink:
                                  true,
                              },
                          }}
                          fullWidth
                        />

                        {/* TIME */}
                        <TextField
                          label="Time"
                          type="time"
                          value={
                            screening.time
                          }
                          disabled
                          slotProps={{
                            inputLabel:
                              {
                                shrink:
                                  true,
                              },
                          }}
                          fullWidth
                        />

                        {/* ROOM */}
                        <TextField
                          label="Room"
                          value={getRoomName(
                            screening.room,
                          )}
                          disabled
                          fullWidth
                        />

                        <Button
                          color="error"
                          onClick={() =>
                            removeScreening(
                              screening,
                            )
                          }
                        >
                          Remove
                        </Button>
                      </Stack>

                      {screening.format && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Format:{' '}
                          {
                            screening.format
                          }
                        </Typography>
                      )}
                    </Stack>
                  </Paper>
                ),
              )}

              {/* ADD SCREENING */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  mb={2}
                >
                  Add screening
                </Typography>

                <Stack
                  direction={{
                    xs: 'column',
                    sm: 'row',
                  }}
                  spacing={1}
                  sx={{
                    alignItems:
                      'stretch',
                  }}
                >
                  {/* DATE */}
                  <TextField
                    label="Date"
                    type="date"
                    value={
                      newScreening.date ||
                      ''
                    }
                    onChange={(event) =>
                      setNewScreening({
                        ...newScreening,
                        date:
                          event.target
                            .value,
                      })
                    }
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                    fullWidth
                  />

                  {/* TIME */}
                  <TextField
                    label="Time"
                    type="time"
                    value={
                      newScreening.time
                    }
                    onChange={(event) =>
                      setNewScreening({
                        ...newScreening,
                        time:
                          event.target
                            .value,
                      })
                    }
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                    fullWidth
                  />

                  {/* ROOM FROM DATABASE */}
                  <FormControl
                    sx={{
                      minWidth: 220,
                    }}
                  >
                    <InputLabel>
                      Room
                    </InputLabel>

                    <Select
                      label="Room"
                      value={
                        newScreening.room
                      }
                      onChange={(
                        event,
                      ) => {
                        const roomNumber =
                          String(
                            event
                              .target
                              .value,
                          );

                        setNewScreening({
                          ...newScreening,
                          room:
                            roomNumber,
                          format:
                            getRoomType(
                              roomNumber,
                            ),
                        });
                      }}
                    >
                      {rooms.length ===
                      0 ? (
                        <MenuItem
                          disabled
                          value=""
                        >
                          No rooms
                          available
                        </MenuItem>
                      ) : (
                        rooms.map(
                          (
                            room,
                          ) => (
                            <MenuItem
                              key={
                                room.room_number
                              }
                              value={String(
                                room.room_number,
                              )}
                            >
                              Room{' '}
                              {
                                room.room_number
                              }{' '}
                              -{' '}
                              {
                                room.name
                              }
                            </MenuItem>
                          ),
                        )
                      )}
                    </Select>
                  </FormControl>

                  {/* FORMAT */}
                  <FormControl
                    sx={{
                      minWidth: 130,
                    }}
                  >
                    <InputLabel>
                      Format
                    </InputLabel>

                    <Select
                      label="Format"
                      value={
                        newScreening.format ||
                        'IMAX'
                      }
                      onChange={(
                        event,
                      ) =>
                        setNewScreening({
                          ...newScreening,
                          format:
                            event
                              .target
                              .value,
                        })
                      }
                    >
                      <MenuItem value="IMAX">
                        IMAX
                      </MenuItem>

                      <MenuItem value="2D">
                        2D
                      </MenuItem>

                      <MenuItem value="3D">
                        3D
                      </MenuItem>
                    </Select>
                  </FormControl>

                  {/* ADD BUTTON */}
                  <Button
                    variant="outlined"
                    startIcon={
                      <PlayArrow />
                    }
                    onClick={
                      addScreening
                    }
                    disabled={
                      !newScreening.date ||
                      !newScreening.time ||
                      !newScreening.room
                    }
                  >
                    Add
                  </Button>
                </Stack>
              </Paper>
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setEditingMovie(null)
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={() =>
              editingMovie &&
              updateMovie(
                editingMovie,
              )
            }
          >
            Save changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MovieListPage;