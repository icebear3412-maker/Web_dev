import type { ICardWithLink } from '@/types';
import { Box, Container, Typography } from '@mui/material';

const Partners: ICardWithLink[] = [
  {
    image: 'USTH',
    linkTo: 'USTH',
  },
  {
    image: 'USTH',
    linkTo: 'USTH',
  },
  {
    image: 'USTH',
    linkTo: 'USTH',
  },
  {
    image: 'USTH',
    linkTo: 'USTH',
  },
  {
    image: 'USTH',
    linkTo: 'USTH',
  },
  {
    image: 'USTH',
    linkTo: 'USTH',
  },
  {
    image: 'USTH',
    linkTo: 'USTH',
  },
];

const PartnerLine: React.FC = () => {
  return (
    <section className="partners-section">
      <Container maxWidth="lg">
        <Typography className="partners-title">ĐỐI TÁC</Typography>

        <Box className="partners-row">
          {Partners.map((partner) => (
            <Box key={partner.linkTo}>
              <img src={partner.image} />
            </Box>
          ))}
        </Box>
      </Container>
    </section>
  );
};

export default PartnerLine;
