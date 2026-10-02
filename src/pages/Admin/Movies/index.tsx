import { useEffect, useMemo, useState } from 'react';
import {
  Add,
  ArrowBack,
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
import { useNavigate } from 'react-router-dom';
import type { MovieForm, MovieItem, Screening } from '../../../types';

const API = '/api/admin/movies';

const adminHeaders = (json = false): Record<string, string> => {
  const token = localStorage.getItem('token') || localStorage.getItem('access_token');
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

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
  const navigate = useNavigate();
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
      const response = await fetch(API, { headers: adminHeaders() });

      if (!response.ok) {
        throw new Error('Không tải được danh sách phim.');
      }

      const data = await response.json();

      const result = await Promise.all(
        data.map(async (movie: any) => {
          const screeningResponse = await fetch(
            `${API}/${movie.id}/screenings`,
            { headers: adminHeaders() },
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
      showToast('Không thể tải danh sách phim từ máy chủ.', 'error');
    }
  };

  const loadRooms = async () => {
    try {
      const response = await fetch(`${API}/rooms`, { headers: adminHeaders() });

      if (!response.ok) {
        throw new Error('Không tải được danh sách phòng chiếu.');
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
      showToast('Không thể tải danh sách phòng chiếu.', 'error');
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
      errors.title = 'Vui lòng nhập tên phim.';
    } else if (title.length < 2) {
      errors.title = 'Tên phim phải có ít nhất 2 ký tự.';
    } else if (title.length > 255) {
      errors.title = 'Tên phim không được vượt quá 255 ký tự.';
    }

    if (!genre) {
      errors.genre = 'Vui lòng nhập thể loại phim.';
    } else if (genre.length > 100) {
      errors.genre = 'Thể loại không được vượt quá 100 ký tự.';
    }

    if (!form.duration) {
      errors.duration = 'Vui lòng nhập thời lượng phim.';
    } else if (
      !Number.isInteger(Number(form.duration)) ||
      Number(form.duration) <= 0
    ) {
      errors.duration = 'Thời lượng phải là số nguyên lớn hơn 0.';
    } else if (Number(form.duration) > 600) {
      errors.duration = 'Thời lượng không được vượt quá 600 phút.';
    }

    if (!form.releaseDate) {
      errors.releaseDate = 'Vui lòng chọn ngày khởi chiếu.';
    } else if (!isValidDate(form.releaseDate)) {
      errors.releaseDate = 'Ngày khởi chiếu không hợp lệ.';
    }

    if (!image) {
      errors.image = 'Vui lòng nhập đường dẫn áp phích.';
    } else if (!isValidUrl(image)) {
      errors.image = 'Vui lòng nhập đường dẫn HTTP hoặc HTTPS hợp lệ.';
    }

    if (!trailerUrl) {
      errors.trailerUrl = 'Vui lòng nhập đường dẫn trailer.';
    } else if (!isValidUrl(trailerUrl)) {
      errors.trailerUrl = 'Vui lòng nhập đường dẫn HTTP hoặc HTTPS hợp lệ.';
    }

    if (!description) {
      errors.description = 'Vui lòng nhập mô tả phim.';
    } else if (description.length < 10) {
      errors.description = 'Mô tả phim phải có ít nhất 10 ký tự.';
    }

    setMovieErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const validateScreening = (movie: MovieItem) => {
    const errors: ScreeningErrors = {};

    if (!screening.date) {
      errors.date = 'Vui lòng chọn ngày chiếu.';
    } else if (!isValidDate(screening.date)) {
      errors.date = 'Ngày chiếu không hợp lệ.';
    } else {
      const selectedDate = new Date(
        `${screening.date}T00:00:00`,
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errors.date = 'Ngày chiếu không được ở quá khứ.';
      }

      if (
        movie.releaseDate &&
        selectedDate <
          new Date(`${movie.releaseDate}T00:00:00`)
      ) {
        errors.date = 'Ngày chiếu không được trước ngày khởi chiếu của phim.';
      }
    }

    if (!screening.time) {
      errors.time = 'Vui lòng chọn giờ chiếu.';
    }

    if (!screening.room) {
      errors.room = 'Vui lòng chọn phòng chiếu.';
    } else if (
      !rooms.some(
        (room) =>
          String(room.room_number) === String(screening.room),
      )
    ) {
      errors.room = 'Vui lòng chọn phòng chiếu hợp lệ.';
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
      showToast('Vui lòng kiểm tra các thông tin được đánh dấu.', 'warning');
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
          headers: adminHeaders(true),
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
          data?.error || 'Không thể lưu phim.',
          'error',
        );
        return;
      }

      closeMovieDialog();
      await loadMovies();

      showToast(
        editMovie
          ? 'Cập nhật phim thành công.'
          : 'Thêm phim thành công.',
        'success',
      );
    } catch (error) {
      console.error(error);
      showToast('Không thể kết nối đến máy chủ.', 'error');
    }
  };

  const deleteMovie = async (movie: MovieItem) => {
    if (!window.confirm(`Bạn có chắc muốn xóa phim “${movie.title}” không?`)) {
      return;
    }

    try {
      const response = await fetch(`${API}/${movie.id}`, {
        method: 'DELETE',
        headers: adminHeaders(),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        showToast(
          data?.error || 'Không thể xóa phim.',
          'error',
        );
        return;
      }

      setMovies((prev) =>
        prev.filter((item) => item.id !== movie.id),
      );

      showToast('Đã xóa phim.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Không thể kết nối đến máy chủ.', 'error');
    }
  };

  const changeStatus = async (
    movie: MovieItem,
    status: 'showing' | 'hidden',
  ) => {
    try {
      const response = await fetch(`${API}/${movie.id}`, {
        method: 'PATCH',
        headers: adminHeaders(true),
        body: JSON.stringify({ status }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        showToast(
          data?.error || 'Không thể thay đổi trạng thái phim.',
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

      showToast(status === 'showing' ? 'Đã chuyển phim sang trạng thái đang chiếu.' : 'Đã ẩn phim.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Không thể kết nối đến máy chủ.', 'error');
    }
  };

  const addScreening = async (movie: MovieItem) => {
    if (!validateScreening(movie)) {
      showToast('Vui lòng kiểm tra thông tin lịch chiếu.', 'warning');
      return;
    }

    try {
      const response = await fetch(
        `${API}/${movie.id}/screenings`,
        {
          method: 'POST',
          headers: adminHeaders(true),
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
          data?.error || 'Không thể thêm lịch chiếu.',
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
        'Đã thêm lịch chiếu.',
        'success',
      );
    } catch (error) {
      console.error(error);
      showToast('Không thể kết nối đến máy chủ.', 'error');
    }
  };

  const deleteScreening = async (
    movie: MovieItem,
    item: Screening,
  ) => {
    if (!window.confirm('Bạn có chắc muốn xóa lịch chiếu này không?')) {
      return;
    }

    try {
      const response = await fetch(
        `${API}/${movie.id}/screenings/${item.id}`,
        {
          method: 'DELETE',
          headers: adminHeaders(),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        showToast(
          data?.error || 'Không thể xóa lịch chiếu.',
          'error',
        );
        return;
      }

      await loadMovies();

      showToast(
        'Đã xóa lịch chiếu.',
        'success',
      );
    } catch (error) {
      console.error(error);
      showToast('Không thể kết nối đến máy chủ.', 'error');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#fcfaed',
        color: '#29241f',
        p: { xs: 2, md: 5 },
      }}
    >
      <Box
        sx={{
          maxWidth: 1500,
          mx: 'auto',
        }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin')}
          sx={{ mb: 2, color: '#6e6559', textTransform: 'none' }}
        >
          Quay lại tổng quan
        </Button>

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
              sx={{
                font: {
                  xs: "900 34px 'Roboto Condensed', sans-serif",
                  sm: "900 42px 'Roboto Condensed', sans-serif",
                },
                letterSpacing: 1,
                color: '#29241f',
                textTransform: 'uppercase',
              }}
            >
              DANH SÁCH PHIM
            </Typography>

            <Box sx={{ width: 68, height: 4, bgcolor: '#e51b23', mt: 1.25 }} />

            <Typography
              sx={{
                color: '#6e6559',
                mt: 0.5,
              }}
            >
              Quản lý phim, lịch chiếu và phòng chiếu.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={openAddMovie}
            sx={{
              borderRadius: '2px',
              px: 2.5,
              py: 1.2,
              textTransform: 'none',
              fontWeight: 800,
              backgroundColor: '#e51b23',
              boxShadow: '0 3px 0 #aa1111',
              '&:hover': { backgroundColor: '#c9151b', boxShadow: '0 3px 0 #8f0e0e' },
            }}
          >
            Thêm phim
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
                  borderRadius: '2px',
                  px: 2.5,
                  textTransform: 'none',
                  fontWeight: 700,
                  color: filter === item ? '#fff' : '#e51b23',
                  borderColor: '#e51b23',
                  backgroundColor: filter === item ? '#e51b23' : 'transparent',
                  '&:hover': {
                    color: '#fff',
                    borderColor: '#c9151b',
                    backgroundColor: '#c9151b',
                  },
                }}
              >
                {item === 'all'
                  ? 'Tất cả'
                  : item === 'showing'
                    ? 'Đang chiếu'
                    : 'Đã ẩn'}
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
                border: '1px solid #d9d0c1',
                borderRadius: 0,
                backgroundColor: '#fff',
              }}
            >
              <Typography sx={{ color: '#6e6559' }}>
                Không tìm thấy phim nào.
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
                    border: '1px solid #d9d0c1',
                    borderRadius: 0,
                    backgroundColor: '#fff',
                    transition: '0.2s',
                    '&:hover': {
                      borderColor: '#e51b23',
                      boxShadow: '0 4px 0 #e51b23',
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
                          label={movie.status === 'Showing' ? 'Đang chiếu' : 'Đã ẩn'}
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
                          label={`${movie.duration} phút`}
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
                            ? 'Ẩn lịch chiếu'
                            : 'Hiện lịch chiếu'
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

                      <Tooltip title="Sửa thông tin phim">
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
                            ? 'Ẩn phim'
                            : 'Hiện phim'
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

                      <Tooltip title="Xóa phim">
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
                        borderTop: '1px solid #d9d0c1',
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight={800}
                        mb={1.5}
                      >
                        Lịch chiếu và phòng chiếu
                      </Typography>

                      <Stack spacing={1.2} mb={3}>
                        {movie.screenings.length === 0 ? (
                          <Typography
                            sx={{
                              fontSize: 14,
                              color: '#6e6559',
                            }}
                          >
                            Phim chưa có lịch chiếu.
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
                                label={`${item.date} · ${item.time} · Phòng ${item.room}`}
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
                                Xóa lịch
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
                        Thêm lịch chiếu
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
                          label="Ngày chiếu"
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
                          label="Giờ chiếu"
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
                              Chọn phòng chiếu
                            </MenuItem>

                            {rooms.map((room) => (
                              <MenuItem
                                key={room.room_number}
                                value={String(
                                  room.room_number,
                                )}
                              >
                                {room.type} - Phòng{' '}
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
                            borderRadius: '2px',
                            mt: 0.5,
                            backgroundColor: '#e51b23',
                            boxShadow: '0 3px 0 #aa1111',
                            '&:hover': { backgroundColor: '#c9151b', boxShadow: '0 3px 0 #8f0e0e' },
                          }}
                        >
                          Thêm lịch chiếu
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
          {editMovie ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Tên phim"
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
              label="Thể loại"
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
              label="Thời lượng (phút)"
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
              label="Ngày khởi chiếu"
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
              label="Đường dẫn áp phích"
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
                'Nhập đường dẫn ảnh bắt đầu bằng http:// hoặc https://.'
              }
              required
              fullWidth
            />

            <TextField
              label="Đường dẫn trailer"
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
                'Nhập đường dẫn bắt đầu bằng http:// hoặc https://.'
              }
              required
              fullWidth
            />

            <TextField
              label="Mô tả phim"
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
                'Mô tả cần có ít nhất 10 ký tự.'
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
            Hủy
          </Button>

          <Button
            variant="contained"
            onClick={saveMovie}
            sx={{
              textTransform: 'none',
              borderRadius: '2px',
              px: 3,
              backgroundColor: '#e51b23',
              boxShadow: '0 3px 0 #aa1111',
              '&:hover': { backgroundColor: '#c9151b', boxShadow: '0 3px 0 #8f0e0e' },
            }}
          >
            {editMovie ? 'Lưu thay đổi' : 'Thêm phim'}
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
