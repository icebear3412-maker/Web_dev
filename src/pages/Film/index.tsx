import { Box, Button, Container, Typography } from '@mui/material';

const film = {
  title: 'Film Title',
  poster: 'https://via.placeholder.com/300x450',
  genre: 'Action, Adventure',
  duration: '120 minutes',
  releaseDate: '17 September 2026',
  rating: '8.5/10',
  description:
    'This is a short description of the film. More detailed information about the story, characters and other important information can be displayed here.',
};

const FilmPage = () => {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          padding: '50px 0',
          display: 'flex',
          gap: '40px',
        }}
      >
        <Box
          component="img"
          src={film.poster}
          alt={film.title}
          sx={{
            width: '300px',
            height: '450px',
            objectFit: 'cover',
            borderRadius: '4px',
          }}
        />

        <Box sx={{ flex: 1 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {film.title}
          </Typography>

          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Genre:</strong> {film.genre}
          </Typography>

          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Duration:</strong> {film.duration}
          </Typography>

          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Release date:</strong> {film.releaseDate}
          </Typography>

          <Typography variant="body1" sx={{ mb: 4 }}>
            <strong>Rating:</strong> {film.rating}
          </Typography>

          <Button variant="contained" size="large">
            Book Now
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 5 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Description
        </Typography>

        <Typography variant="body1">{film.description}</Typography>
      </Box>
    </Container>
  );
};

export default FilmPage;