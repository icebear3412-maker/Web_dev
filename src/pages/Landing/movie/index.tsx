import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  IconButton,
  Snackbar,
  Typography,
} from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
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
  const [activeTrailer, setActiveTrailer] = useState<{ title: string; embedUrl: string } | null>(
    null,
  );
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

  const getYouTubeEmbedUrl = (url?: string | null) => {
    if (!url) return null;
    const value = url.trim();
    const videoIdPattern = /^[\w-]{11}$/;
    if (videoIdPattern.test(value))
      return `https://www.youtube-nocookie.com/embed/${value}?autoplay=1&rel=0`;

    try {
      const parsed = new URL(value);
      const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
      let videoId = '';
      if (host === 'youtu.be') videoId = parsed.pathname.split('/').filter(Boolean)[0] ?? '';
      else if (
        host === 'youtube.com' ||
        host === 'm.youtube.com' ||
        host === 'youtube-nocookie.com'
      ) {
        if (parsed.pathname === '/watch') videoId = parsed.searchParams.get('v') ?? '';
        else if (/^\/(embed|shorts)\//.test(parsed.pathname))
          videoId = parsed.pathname.split('/')[2] ?? '';
      }
      return videoIdPattern.test(videoId)
        ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`
        : null;
    } catch {
      return null;
    }
  };

  const openTrailer = (movie: Movie, title: string) => {
    const embedUrl = getYouTubeEmbedUrl(movie.trailer_url);
    if (!embedUrl) {
      setTrailerNotice(true);
      return;
    }
    setActiveTrailer({ title: title || 'Trailer phim', embedUrl });
  };

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
            breakpoints={{
              0: { slidesPerView: 1.2 },
              600: { slidesPerView: 2 },
              900: { slidesPerView: 3 },
              1200: { slidesPerView: 4 },
            }}
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
                          onClick={() => openTrailer(movie, title)}
                        >
                          <PlayArrowRoundedIcon />
                          <span>PLAY</span>
                        </Button>
                        <Box className="movie-actions">
                          <Button
                            className="movie-detail-button"
                            onClick={() => navigate(movieUrl)}
                          >
                            XEM CHI TIẾT
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
        <Snackbar
          open={trailerNotice}
          autoHideDuration={2800}
          onClose={() => setTrailerNotice(false)}
        >
          <Alert severity="info" onClose={() => setTrailerNotice(false)}>
            Trailer phim chưa được cập nhật.
          </Alert>
        </Snackbar>
        <Dialog
          open={Boolean(activeTrailer)}
          onClose={() => setActiveTrailer(null)}
          maxWidth="md"
          fullWidth
          aria-labelledby="movie-trailer-title"
          PaperProps={{ sx: { overflow: 'visible', bgcolor: 'transparent', boxShadow: 'none' } }}
        >
          <DialogContent sx={{ p: 0, overflow: 'visible' }}>
            <Typography
              id="movie-trailer-title"
              component="h2"
              sx={{
                position: 'absolute',
                width: 1,
                height: 1,
                p: 0,
                m: -1,
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
              }}
            >
              {activeTrailer?.title}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.25 }}>
              <IconButton
                aria-label="Đóng trailer"
                onClick={() => setActiveTrailer(null)}
                sx={{
                  width: 44,
                  height: 44,
                  color: '#fff',
                  bgcolor: '#e51b23',
                  border: '2px solid #fff',
                  boxShadow: '0 3px 12px #0008',
                  '&:hover': { bgcolor: '#bf1118', transform: 'scale(1.08)' },
                }}
              >
                <CloseRoundedIcon />
              </IconButton>
            </Box>
            {activeTrailer && (
              <Box
                component="iframe"
                src={activeTrailer.embedUrl}
                title={`Trailer: ${activeTrailer.title}`}
                allow="autoplay; encrypted-media; picture-in-picture; web-share"
                allowFullScreen
                sx={{
                  display: 'block',
                  width: '100%',
                  aspectRatio: '16 / 9',
                  border: '1px solid #fff',
                  boxShadow: '0 8px 28px #0008',
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </section>
  );
};

export default MovieSection;
