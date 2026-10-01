import { Alert, Box, CircularProgress, Container, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { fetchCinemaRooms, type CinemaRoom } from '@/services/movies';

const CinemaRooms: React.FC = () => {
  const [rooms, setRooms] = useState<CinemaRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetchCinemaRooms(controller.signal)
      .then(setRooms)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted)
          setError(reason instanceof Error ? reason.message : 'Không tải được danh sách phòng.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  return (
    <main className="movie-detail-page">
      <Container maxWidth="lg">
        <Typography className="section-title">HỆ THỐNG PHÒNG CHIẾU</Typography>
        {error && <Alert severity="warning">{error}</Alert>}
        {loading ? (
          <Box className="api-loading">
            <CircularProgress size={24} /> Đang tải phòng chiếu…
          </Box>
        ) : (
          <Box className="cinema-room-grid">
            {rooms.map((room) => (
              <Box className="cinema-room-card" key={room.id}>
                <Typography className="movie-detail-kicker">{room.type}</Typography>
                <Typography component="h2" className="movie-detail-title">
                  {room.name}
                </Typography>
                <Typography>
                  Phòng {room.room_number} · Sức chứa {room.capacity} chỗ
                </Typography>
              </Box>
            ))}
            {rooms.length === 0 && !error && (
              <Typography>Chưa có thông tin phòng chiếu.</Typography>
            )}
          </Box>
        )}
      </Container>
    </main>
  );
};

export default CinemaRooms;
