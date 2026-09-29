import { Box, ButtonBase, Container, Typography } from '@mui/material';
import type { ICardWithLink } from '@/types';
import { useNavigate } from 'react-router-dom';

interface QuickLink extends ICardWithLink {
  label: string;
}

const Cards: QuickLink[] = [
  { label: 'Cinemas', image: '', linkTo: '/location' },
  { label: 'Now showing', image: '', linkTo: '/now_showing' },
  { label: 'Special rooms', image: '', linkTo: '/special_room' },
  { label: 'Hall rental', image: '', linkTo: '/rent' },
  { label: 'Contact', image: '', linkTo: '/contact' },
  { label: 'News & offers', image: '', linkTo: '/new_offer' },
  { label: 'Sign up', image: '', linkTo: '/signup' },
];

const QuickLink: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ py: { xs: 2, md: 3 } }}>
      <Container
        maxWidth="lg"
        sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}
      >
        {Cards.map((card) => (
          <ButtonBase
            key={card.linkTo}
            aria-label={card.label}
            onClick={() => navigate(card.linkTo)}
            sx={{ borderRadius: 2, overflow: 'hidden' }}
          >
            {card.image ? (
              <Box
                component="img"
                src={card.image}
                alt=""
                sx={{ display: 'block', height: { xs: 64, md: 88 }, width: 'auto' }}
              />
            ) : (
              // fallback until the real image is added
              <Box
                sx={{
                  display: 'grid',
                  placeItems: 'center',
                  height: { xs: 64, md: 88 },
                  minWidth: { xs: 96, md: 128 },
                  px: 2,
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {card.label}
                </Typography>
              </Box>
            )}
          </ButtonBase>
        ))}
      </Container>
    </Box>
  );
};

export default QuickLink;
