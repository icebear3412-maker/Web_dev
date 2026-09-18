import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CloseIcon from '@mui/icons-material/Close';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import LocalActivityOutlinedIcon from '@mui/icons-material/LocalActivityOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CinemaLayout from '@/layouts/CinemaLayout';
import { emptyFilmData, getScreenings } from './data';
import type { FilmDetailData } from './data';
import { cities } from '@/shared/cinemaRooms';
import { localDate } from '@/helpers/date';
import './styles.css';

export default function FilmDetail({ data = emptyFilmData }: { data?: FilmDetailData }) {
  const { movies, rooms, showtimes } = data;
  const roomTypes = [...new Set(rooms.map((room) => room.type))].map((type) => ({
    id: type,
    name: type,
  }));
  const { id } = useParams();
  const navigate = useNavigate();
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const movie = movies.find((item) => item.id === id || item.slug === id);
  const [roomType, setRoomType] = useState('ALL');
  const [date, setDate] = useState(localDate(new Date()));
  const [showtimeId, setShowtimeId] = useState('');
  const [bookingOpen, setBookingOpen] = useState(false);
  const [city, setCity] = useState('');
  const [posterError, setPosterError] = useState(false);
  const screeningsRef = useRef<HTMLElement>(null);
  const dates = [
    ...new Set(
      showtimes.filter((slot) => slot.movie_id === movie?.id).map((slot) => slot.show_date),
    ),
  ]
    .sort()
    .map((value) => ({ value, label: value, day: value }));
  const dayScreenings = getScreenings(movie?.id ?? '', date, showtimes, rooms).filter(
    (slot) => slot.room.city === city,
  );
  const availableTypes = roomTypes.filter((type) =>
    dayScreenings.some((slot) => slot.room.type === type.id),
  );
  const visibleScreenings = dayScreenings.filter(
    (slot) => roomType === 'ALL' || slot.room.type === roomType,
  );
  const selectedShowtime = visibleScreenings.find((slot) => slot.id === showtimeId);
  const selectRoomType = (value: string) => {
    setRoomType(value);
    setShowtimeId('');
    setBookingOpen(false);
  };
  const selectDate = (value: string) => {
    setDate(value);
    selectRoomType('ALL');
  };
  const locate = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Trình duyệt không hỗ trợ định vị. Bạn có thể chọn thành phố bên dưới.');
      return;
    }
    setLocating(true);
    setLocationMessage('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const centers = [
          { name: 'Hà Nội', lat: 21.0285, lng: 105.8542 },
          { name: 'Hồ Chí Minh', lat: 10.8231, lng: 106.6297 },
          { name: 'Đà Nẵng', lat: 16.0544, lng: 108.2022 },
        ];
        const radians = (value: number) => (value * Math.PI) / 180;
        const distance = (center: (typeof centers)[number]) => {
          const a =
            Math.sin(radians(center.lat - coords.latitude) / 2) ** 2 +
            Math.cos(radians(coords.latitude)) *
              Math.cos(radians(center.lat)) *
              Math.sin(radians(center.lng - coords.longitude) / 2) ** 2;
          return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, a)));
        };
        const nearest = centers.sort((a, b) => distance(a) - distance(b))[0];
        setCity(nearest.name);
        selectRoomType('ALL');
        setLocating(false);
        setLocationMessage(`Đã chọn ${nearest.name}, khu vực gần bạn nhất trong danh sách.`);
        screeningsRef.current?.scrollIntoView({ behavior: 'smooth' });
      },
      (error) => {
        setLocating(false);
        setLocationMessage(
          error.code === 1
            ? 'Bạn chưa cho phép vị trí. Hãy chọn thành phố bên dưới.'
            : 'Không lấy được vị trí. Hãy thử lại hoặc chọn thành phố.',
        );
        screeningsRef.current?.scrollIntoView({ behavior: 'smooth' });
      },
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false },
    );
  };
  const goToScreenings = () =>
    screeningsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <CinemaLayout onLocate={locate} locating={locating}>
      <Box className="film-topline">
        <Container maxWidth="lg">
          <span>CHI TIẾT PHIM</span>
          <span>ĐIỆN ẢNH LỚN HƠN MỖI NGÀY</span>
        </Container>
      </Box>
      <Container maxWidth="lg" className="film-content">
        <Box className="film-detail-grid">
          <Box className="film-poster-column">
            {!movie?.poster || posterError ? (
              <Box className="poster-fallback" role="img" aria-label="Không có ảnh poster">
                <LocalActivityOutlinedIcon sx={{ fontSize: 48 }} />
                <Typography>Không có ảnh poster</Typography>
              </Box>
            ) : (
              <img
                className="film-poster"
                src={movie.poster}
                alt={`Poster ${movie.title ?? ''}`}
                onError={() => setPosterError(true)}
              />
            )}
            <Button
              fullWidth
              variant="contained"
              className="cut-button"
              onClick={goToScreenings}
              disabled={!movie || !showtimes.some((slot) => slot.movie_id === movie.id)}
              startIcon={<LocalActivityOutlinedIcon />}
            >
              Đặt vé ngay
            </Button>
            {movie?.trailerUrl ? (
              <Button
                fullWidth
                variant="outlined"
                className="trailer-button"
                startIcon={<PlayArrowRoundedIcon />}
                component="a"
                href={movie?.trailerUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Xem trailer
              </Button>
            ) : (
              <Button fullWidth variant="outlined" className="trailer-button" disabled>
                Chưa có trailer
              </Button>
            )}
          </Box>
          <Box className="film-description">
            <div className="film-title-row">
              <Typography component="h1" className="film-title">
                {movie?.title?.trim() || 'Chưa có tên phim'}
              </Typography>
              {movie?.rating ? (
                <span className="age-badge">{movie.rating}</span>
              ) : (
                <Typography variant="caption">Chưa có phân loại độ tuổi</Typography>
              )}
            </div>
            <Box className="film-field">
              <Typography className="field-label">ĐẠO DIỄN</Typography>
              <Typography>{movie?.director?.trim() || 'Chưa có thông tin'}</Typography>
            </Box>

            <Box className="film-field">
              <Typography className="field-label">DIỄN VIÊN</Typography>
              <Typography>{movie?.cast?.trim() || 'Chưa có thông tin'}</Typography>
            </Box>

            <Box className="film-field">
              <Typography className="field-label">NỘI DUNG PHIM</Typography>
              <Typography className="synopsis">
                {movie?.synopsis?.trim() || 'Chưa có thông tin'}
              </Typography>
            </Box>
          </Box>
          <Box className="film-facts">
            <Box className="film-field">
              <Typography className="field-label">THỜI LƯỢNG</Typography>
              <Typography>{movie?.duration?.trim() || 'Chưa có thông tin'}</Typography>
            </Box>

            <Box className="film-field">
              <Typography className="field-label">KHỞI CHIẾU</Typography>
              <Typography>{movie?.releaseDate?.trim() || 'Chưa có thông tin'}</Typography>
            </Box>

            {!movie?.genres?.length && <Typography>Chưa có thể loại</Typography>}
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
              {movie?.genres?.map((genre) => (
                <Chip key={genre} label={genre} variant="outlined" size="small" />
              ))}
            </Stack>
          </Box>
        </Box>
        <Box component="section" id="showtimes" ref={screeningsRef} className="showtimes-section">
          <Box className="section-heading-row">
            <div>
              <Typography className="eyebrow">HẸN BẠN TẠI RẠP</Typography>
              <Typography component="h2" variant="h4">
                Chọn suất chiếu của bạn
              </Typography>
            </div>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Chọn thành phố và ngày để xem giờ chiếu theo loại phòng.
          </Typography>
          {locationMessage && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {locationMessage}
            </Alert>
          )}
          <Box className="location-filters">
            <FormControl fullWidth>
              <InputLabel id="city-label">Chọn thành phố</InputLabel>
              <Select
                labelId="city-label"
                label="Chọn thành phố"
                value={city}
                onChange={(event) => {
                  setCity(event.target.value);
                  selectRoomType('ALL');
                }}
              >
                {cities.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box className="date-strip" aria-label="Chọn ngày chiếu">
            {!dates.length && <Typography color="text.secondary">Chưa có ngày chiếu.</Typography>}
            {dates.map((item) => (
              <Button
                key={item.value}
                className={date === item.value ? 'date-button selected' : 'date-button'}
                aria-pressed={date === item.value}
                onClick={() => {
                  selectDate(item.value);
                }}
              >
                <span>{item.label}</span>
                <strong>{item.day}</strong>
              </Button>
            ))}
          </Box>
          <Box className="experience-filters" aria-label="Loại phòng chiếu">
            <Typography className="field-label">LOẠI PHÒNG CHIẾU</Typography>
            {!availableTypes.length && (
              <Typography color="text.secondary">Chưa có thông tin loại phòng.</Typography>
            )}
            <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant={roomType === 'ALL' ? 'contained' : 'outlined'}
                aria-pressed={roomType === 'ALL'}
                onClick={() => selectRoomType('ALL')}
              >
                Tất cả
              </Button>
              {availableTypes.map((type) => (
                <Button
                  key={type.id}
                  variant={roomType === type.id ? 'contained' : 'outlined'}
                  aria-pressed={roomType === type.id}
                  onClick={() => selectRoomType(type.id)}
                >
                  {type.name}
                </Button>
              ))}
            </Stack>
          </Box>

          <Box aria-live="polite" className="screening-results">
            {visibleScreenings.length === 0 ? (
              <Box className="cinema-empty">
                <PlaceOutlinedIcon sx={{ fontSize: 40 }} />
                <Typography variant="h6">
                  {!showtimes.length
                    ? 'Chưa có suất chiếu'
                    : !city
                      ? 'Bạn muốn xem phim ở đâu?'
                      : 'Chưa có suất chiếu phù hợp'}
                </Typography>
                <Typography color="text.secondary">
                  {!showtimes.length
                    ? 'Lịch chiếu hiện chưa có thông tin.'
                    : !city
                      ? 'Chọn thành phố để xem loại phòng và giờ chiếu.'
                      : 'Bạn hãy chọn ngày hoặc loại phòng khác.'}
                </Typography>
              </Box>
            ) : (
              availableTypes
                .filter((type) => visibleScreenings.some((slot) => slot.room.type === type.id))
                .map((type) => (
                  <Box className="screening-card" key={type.id}>
                    <Typography component="h3" variant="h5" sx={{ mb: 2 }}>
                      {type.name}
                    </Typography>
                    <Stack direction="row" sx={{ gap: 1.5, flexWrap: 'wrap' }}>
                      {visibleScreenings
                        .filter((slot) => slot.room.type === type.id)
                        .sort((a, b) => a.show_time.localeCompare(b.show_time))
                        .map((slot) => (
                          <Button
                            key={slot.id}
                            variant="outlined"
                            className="showtime-tile"
                            aria-label={`${slot.show_time}, ${type.name}, Phòng ${slot.room.room_number}`}
                            onClick={() => {
                              setShowtimeId(slot.id);
                              setBookingOpen(true);
                            }}
                          >
                            <strong>{slot.show_time}</strong>
                            <span>Phòng {slot.room.room_number}</span>
                            <small>Chọn suất →</small>
                          </Button>
                        ))}
                    </Stack>
                  </Box>
                ))
            )}
          </Box>
        </Box>
        <Box className="private-screening">
          <div>
            <Typography className="eyebrow">MỘT KHÔNG GIAN. RIÊNG CHO BẠN.</Typography>
            <Typography variant="h5" component="h2">
              Mang cả rạp phim đến buổi hẹn của bạn.
            </Typography>
            <Typography color="text.secondary">
              Sinh nhật, gặp mặt hay một buổi chiếu riêng cùng đồng nghiệp.
            </Typography>
          </div>
          <Button
            component={Link}
            to="/book-cinema-room"
            variant="outlined"
            endIcon={<ArrowForwardIcon />}
          >
            Khám phá thuê rạp
          </Button>
        </Box>
      </Container>
      <Box className="quick-booking">
        <Container maxWidth="lg" className="quick-booking-inner">
          <FormControl size="small" className="quick-film-select" disabled={!movies.length}>
            <InputLabel shrink id="quick-film-label">
              Chọn phim
            </InputLabel>
            <Select
              labelId="quick-film-label"
              label="Chọn phim"
              value={movie?.id ?? ''}
              displayEmpty
              renderValue={(value) =>
                movies.find((item) => item.id === value)?.title || 'Chưa có phim'
              }
              MenuProps={{
                slotProps: { paper: { sx: { bgcolor: '#fff', color: '#112039', maxHeight: 320 } } },
              }}
              onChange={(event) => {
                selectRoomType('ALL');
                setPosterError(false);
                navigate(`/film/${event.target.value}`);
              }}
            >
              {movies.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small">
            <InputLabel id="quick-city-label">Thành phố</InputLabel>
            <Select
              labelId="quick-city-label"
              label="Thành phố"
              value={city}
              onChange={(event) => {
                setCity(event.target.value);
                selectRoomType('ALL');
              }}
            >
              {cities.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" disabled={!dates.length}>
            <InputLabel shrink id="quick-date-label">
              Ngày chiếu
            </InputLabel>
            <Select
              labelId="quick-date-label"
              label="Ngày chiếu"
              displayEmpty
              renderValue={(value) => value || 'Chưa có ngày chiếu'}
              value={dates.some((item) => item.value === date) ? date : ''}
              onChange={(event) => {
                selectDate(event.target.value);
              }}
            >
              {dates.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label} · {item.day}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" disabled={!city || !visibleScreenings.length}>
            <InputLabel shrink id="quick-time-label">
              Giờ chiếu
            </InputLabel>
            <Select
              labelId="quick-time-label"
              label="Giờ chiếu"
              displayEmpty
              renderValue={(value) =>
                visibleScreenings.find((slot) => slot.id === value)?.show_time ||
                (!visibleScreenings.length ? 'Chưa có giờ chiếu' : 'Chọn giờ chiếu')
              }
              value={showtimeId}
              onChange={(event) => setShowtimeId(event.target.value)}
            >
              {visibleScreenings.map((slot) => (
                <MenuItem key={slot.id} value={slot.id}>
                  {slot.show_time} · {roomTypes.find((type) => type.id === slot.room.type)?.name} ·{' '}
                  {slot.room.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            className="cut-button"
            disabled={!movie || !showtimes.length}
            onClick={() => (selectedShowtime ? setBookingOpen(true) : goToScreenings())}
          >
            {selectedShowtime ? 'Xem lựa chọn' : 'Tìm suất chiếu'}{' '}
            <ArrowForwardIcon sx={{ ml: 1, fontSize: 18 }} />
          </Button>
        </Container>
      </Box>
      <Dialog open={bookingOpen} onClose={() => setBookingOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>
          Suất chiếu đã chọn
          <IconButton
            aria-label="Đóng lựa chọn"
            onClick={() => setBookingOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            {movie?.title?.trim() || 'Chưa có tên phim'}
          </Typography>
          <Typography>
            {city} · Phòng {selectedShowtime?.room.room_number}
          </Typography>
          <Typography sx={{ my: 1 }}>
            {dates.find((item) => item.value === date)?.day} · {selectedShowtime?.show_time}
          </Typography>
          <Typography sx={{ mb: 3 }}>
            {roomTypes.find((item) => item.id === selectedShowtime?.room.type)?.name}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingOpen(false)}>Đổi suất chiếu</Button>
        </DialogActions>
      </Dialog>
    </CinemaLayout>
  );
}
