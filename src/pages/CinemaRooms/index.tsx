import { Alert, Box, ButtonBase, CircularProgress, Container, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import cinemaImage from '@/assets/cinema-hero-enhanced.png';
import { fetchCinemaRooms, type CinemaRoom } from '@/services/movies';

const CinemaRooms: React.FC = () => {
  const [rooms, setRooms] = useState<CinemaRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roomsVisible, setRoomsVisible] = useState(false);
  const cinemaName = rooms.find((room) => room.cinema_name)?.cinema_name || 'Cinema USTH';
  const orderedRooms = [...rooms].sort((first, second) => first.room_number - second.room_number);

  useEffect(() => {
    const controller = new AbortController();
    fetchCinemaRooms(controller.signal)
      .then(setRooms)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : 'Không tải được danh sách phòng.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return (
    <main className="movie-detail-page">
      <Container maxWidth="lg">
        <Typography className="section-title">HỆ THỐNG RẠP CHIẾU</Typography>
        <Typography
          component="h1"
          sx={{
            color: '#21180f',
            fontFamily: 'Roboto Condensed, sans-serif',
            fontSize: { xs: 32, md: 42 },
            fontWeight: 800,
            mb: 2,
            textAlign: 'center',
          }}
        >
          {cinemaName}
        </Typography>

        <ButtonBase
          component="button"
          type="button"
          onClick={() => setRoomsVisible((visible) => !visible)}
          aria-expanded={roomsVisible}
          aria-controls="cinema-room-list"
          sx={{
            display: 'block',
            width: '100%',
            overflow: 'hidden',
            border: '1px solid #d9d0c1',
            borderRadius: 1,
            boxShadow: '0 5px 20px #35251920',
            position: 'relative',
            textAlign: 'left',
            '&:focus-visible': { outline: '3px solid #e51b23', outlineOffset: 3 },
            '&:hover .cinema-hero-image': { transform: 'scale(1.025)' },
            '&:hover .cinema-hero-cta': { backgroundColor: '#c9131a' },
          }}
        >
          <Box
            component="img"
            className="cinema-hero-image"
            src={cinemaImage}
            alt="Không gian phòng chiếu Cinema USTH"
            sx={{
              display: 'block',
              width: '100%',
              height: 'auto',
              aspectRatio: '3 / 2',
              objectFit: 'contain',
              transition: 'transform 250ms ease',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 'auto 0 0',
              px: { xs: 2, sm: 4 },
              py: { xs: 2.5, sm: 3.5 },
              color: '#fff',
              background: 'linear-gradient(transparent, rgb(0 0 0 / 78%))',
            }}
          >
            <Typography
              component="span"
              className="cinema-hero-cta"
              sx={{
                display: 'inline-block',
                borderRadius: 0.5,
                backgroundColor: '#e51b23',
                px: 2.5,
                py: 1.25,
                fontWeight: 800,
                transition: 'background-color 180ms ease',
              }}
            >
              {roomsVisible ? 'ẨN CÁC PHÒNG CHIẾU' : 'XEM CÁC PHÒNG CHIẾU'}
            </Typography>
          </Box>
        </ButtonBase>

        {error && (
          <Alert severity="warning" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}

        {roomsVisible && (
          <Box
            id="cinema-room-list"
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
              gap: 2,
              mt: 3,
            }}
          >
            {loading ? (
              <Box className="api-loading" sx={{ gridColumn: '1 / -1' }}>
                <CircularProgress size={24} /> Đang tải phòng chiếu…
              </Box>
            ) : orderedRooms.length ? (
              orderedRooms.map((room) => (
                <Box
                  key={room.id}
                  sx={{
                    backgroundColor: '#fff',
                    border: '1px solid #d9d0c1',
                    borderTop: '4px solid #e51b23',
                    boxShadow: '0 3px 12px #35251912',
                    p: { xs: 2.5, sm: 3 },
                  }}
                >
                  <Typography className="movie-detail-kicker">{room.type}</Typography>
                  <Typography
                    component="h2"
                    sx={{
                      color: '#21180f',
                      fontFamily: 'Roboto Condensed, sans-serif',
                      fontSize: 24,
                      fontWeight: 800,
                      lineHeight: 1.2,
                      my: 1,
                    }}
                  >
                    {room.name}
                  </Typography>
                  <Typography sx={{ color: '#6b6052' }}>
                    Phòng {room.room_number} · Sức chứa {room.capacity} chỗ
                  </Typography>
                  <Typography sx={{ color: '#e51b23', fontSize: 20, fontWeight: 800, mt: 1.5 }}>
                    {Number(room.ticket_price).toLocaleString('vi-VN')} VND / vé
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography sx={{ gridColumn: '1 / -1', py: 2, textAlign: 'center' }}>
                Chưa có thông tin phòng chiếu.
              </Typography>
            )}
          </Box>
        )}
      </Container>
    </main>
  );
};

export default CinemaRooms;
