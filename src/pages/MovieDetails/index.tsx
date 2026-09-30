import { Alert, Box, Button, CircularProgress, Container, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchMovie, type Movie } from '@/services/movies';

const MovieDetails: React.FC = () => {
  const { movieId = '' } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetchMovie(movieId, controller.signal)
      .then(setMovie)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Không tải được phim.');
      });
    return () => controller.abort();
  }, [movieId]);

  return (
    <main className="movie-detail-page">
      <Container maxWidth="lg">
        <Button className="movie-detail-back" onClick={() => navigate('/')}>← TRỞ VỀ TRANG CHỦ</Button>
        {error ? <Alert severity="warning">{error}</Alert> : !movie ? (
          <Box className="api-loading"><CircularProgress size={24} /> Đang tải thông tin phim…</Box>
        ) : (
          <Box className="movie-detail-card">
            <Box
              component="img"
              className="movie-detail-poster"
              src={movie.backdrop || movie.poster || undefined}
              alt={movie.title_vn || movie.title || 'Poster phim'}
            />
            <Box className="movie-detail-copy">
              <Typography className="movie-detail-kicker">ĐANG CHIẾU</Typography>
              <Typography component="h1" className="movie-detail-title">{movie.title_vn || movie.title || 'Tên phim sẽ cập nhật sau'}</Typography>
              {movie.age_rating && <Typography className="movie-detail-rating">{movie.age_rating}</Typography>}
              {movie.genre && <Typography><b>Thể loại:</b> {movie.genre}</Typography>}
              {movie.duration != null && <Typography><b>Thời lượng:</b> {movie.duration} phút</Typography>}
              {movie.synopsis && <Typography className="movie-detail-synopsis">{movie.synopsis}</Typography>}
            </Box>
          </Box>
        )}
      </Container>
    </main>
  );
};

export default MovieDetails;
