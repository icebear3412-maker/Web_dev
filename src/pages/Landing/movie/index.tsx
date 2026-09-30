import { Alert, Box, Button, Container, Snackbar, Typography } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Movie } from '@/services/movies';
import { localMoviePosters } from '@/services/moviePosters';
import { clickableSx } from '@/theme';

interface MovieSectionProps {
  movies: Movie[];
}

const MovieSection: React.FC<MovieSectionProps> = ({ movies }) => {
  const navigate = useNavigate();
  const [trailerNotice, setTrailerNotice] = useState(false);
  const displayMovies = localMoviePosters.map((poster, index) => {
    const movie = movies[index]?.poster ? movies[index] : undefined;
    return {
      ...poster,
      ...movie,
      id: movie?.id ?? poster.id,
      poster: movie?.poster || poster.poster,
      title: movie?.title ?? poster.title,
      title_vn: movie?.title_vn ?? poster.title_vn,
      age_rating: movie?.age_rating ?? poster.age_rating,
      trailer_url: movie?.trailer_url ?? poster.trailer_url,
    };
  });

  const getMovieUrl = (movie: Movie) => `/movies/${encodeURIComponent(movie.id)}`;

  return (
    <section className="content-section" id="now-showing">
      <Container maxWidth="lg">
        <Typography className="section-title">PHIM ĐANG CHIẾU</Typography>
        {displayMovies.length === 0 ? (
          <Typography className="empty-movies">Chưa có poster phim để hiển thị.</Typography>
        ) : (
          <Swiper
            className="movie-carousel"
            modules={[Navigation]}
            navigation
            spaceBetween={8}
            slidesPerView={4}
            breakpoints={{ 0: { slidesPerView: 1.2 }, 600: { slidesPerView: 2 }, 900: { slidesPerView: 3 }, 1200: { slidesPerView: 4 } }}
          >
            {displayMovies.map((movie) => {
              const title = movie.title_vn || movie.title;
              const movieUrl = getMovieUrl(movie);
              return (
                <SwiperSlide key={movie.id}>
                  <Box className="movie-card" sx={clickableSx}>
                    <Box className="movie-poster-frame">
                      <Box
                        component="img"
                        className="movie-poster-image"
                        src={movie.poster || undefined}
                        alt={title || 'Poster phim'}
                        loading="lazy"
                      />
                      {movie.age_rating && <span className="age-badge">{movie.age_rating}</span>}
                      <Box className="movie-poster-overlay">
                        {title && <Typography className="movie-overlay-title">{title}</Typography>}
                        <Button
                          className="movie-play-button"
                          aria-label={title ? `Xem trailer ${title}` : 'Xem trailer phim'}
                          onClick={() => movie.trailer_url ? window.open(movie.trailer_url, '_blank', 'noopener,noreferrer') : setTrailerNotice(true)}
                        >
                          <PlayArrowRoundedIcon />
                          <span>PLAY</span>
                        </Button>
                        <Box className="movie-actions">
                          <Button className="movie-detail-button" onClick={() => navigate(movieUrl)}>XEM CHI TIẾT</Button>
                          <Button className="movie-buy-button" onClick={() => navigate(movieUrl)}>
                            <ConfirmationNumberOutlinedIcon /> MUA VÉ
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                    {title && <Typography className="movie-title">{title}</Typography>}
                  </Box>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}
        <Snackbar open={trailerNotice} autoHideDuration={2800} onClose={() => setTrailerNotice(false)}>
          <Alert severity="info" onClose={() => setTrailerNotice(false)}>Trailer phim chưa được cập nhật.</Alert>
        </Snackbar>
      </Container>
    </section>
  );
};

export default MovieSection;
