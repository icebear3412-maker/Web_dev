import { Box, Container } from '@mui/material';
import type { ICardWithLink } from '@/types';
import { useNavigate } from 'react-router-dom';

const Cards: ICardWithLink[] = [
  { image: '', linkTo: '/location' },
  { image: '', linkTo: '/now_showing' },
  { image: '', linkTo: '/special_room' },
  { image: '', linkTo: '/rent' },
  { image: '', linkTo: '/contact' },
  { image: '', linkTo: '/new_offer' },
  { image: '', linkTo: '/signup' },
];

const FrontPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box className="quick-links">
      <Container maxWidth="lg" className="quick-links-inner">
        {Cards.map((card) => (
          <Box key={card.linkTo} onClick={() => navigate(card.linkTo)}>
            <img src={card.image} />
          </Box>
        ))}
      </Container>
    </Box>
  );
};

export default FrontPage;
