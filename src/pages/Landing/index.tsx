import React, { useEffect, useState } from 'react';

import QuickLinks from '@/pages/Landing/QuickLink';
import CarouselSection from '@/pages/Landing/Carousel';
import MovieSection from '@/pages/Landing/movie';
import EventSection from '@/pages/Landing/Event';
import PartnerLine from '@/pages/Landing/Partner';
import SideBanners from '@/pages/Landing/SideBanner';
import { fetchMovies, type Movie } from '@/services/movies';
import { Alert, Box, CircularProgress } from '@mui/material';

const FrontPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [movieError, setMovieError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetchMovies(controller.signal)
      .then(setMovies)
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setMovieError(error instanceof Error ? error.message : 'Không tải được phim.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  return (
    <div className="cgv-page">
      <SideBanners />
      <QuickLinks />
      <CarouselSection movies={movies} />
      {movieError && (
        <Alert severity="warning" className="api-message">
          {movieError}
        </Alert>
      )}
      {loading && (
        <Box className="api-loading">
          <CircularProgress size={24} /> Đang tải phim…
        </Box>
      )}
      <MovieSection movies={movies} />
      <EventSection />
      <PartnerLine />
    </div>
  );
};

export default FrontPage;
