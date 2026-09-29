import type { ICardWithLink } from '@/types';
import { Box, Container, Typography } from '@mui/material';
import { sectionSx, sectionTitleSx } from '@/theme';

const Partners: ICardWithLink[] = Array.from({ length: 7 }, () => ({
  image: 'USTH',
  linkTo: 'USTH',
}));

const Partner: React.FC = () => {
  return (
    <Box component="section" sx={sectionSx}>
      <Container maxWidth="lg">
        <Typography sx={[sectionTitleSx, { mb: 2 }]}>ĐỐI TÁC</Typography>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 2, md: 4 },
          }}
        >
          {Partners.map((partner, i) => (
            <Box key={`${partner.linkTo}-${i}`}>
              <Box
                component="img"
                src={partner.image}
                alt={partner.linkTo}
                sx={{ display: 'block', height: 48, width: 'auto', objectFit: 'contain' }}
              />
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Partner;
