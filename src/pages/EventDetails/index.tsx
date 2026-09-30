import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { Events } from '@/pages/Landing/Event';

const EventDetails: React.FC = () => {
  const { eventSlug = '' } = useParams();
  const navigate = useNavigate();
  const event = Events.find((item) => item.linkTo.endsWith(`/${eventSlug}`));

  return (
    <main className="movie-detail-page">
      <Container maxWidth="md">
        <Button className="movie-detail-back" onClick={() => navigate('/#member-events')}>← QUAY LẠI SỰ KIỆN</Button>
        {event ? <Box className="event-detail-card">
          <img src={event.image} alt={event.title} />
          <Box className="event-detail-copy">
            <Typography className="movie-detail-kicker">SỰ KIỆN THÀNH VIÊN</Typography>
            <Typography component="h1" className="movie-detail-title">{event.title}</Typography>
            <Typography>{event.text}</Typography>
          </Box>
        </Box> : <Typography>Không tìm thấy sự kiện này.</Typography>}
      </Container>
    </main>
  );
};

export default EventDetails;
