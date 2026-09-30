import type { ICardWithLink } from '@/types';
import { Box, Container, ThemeProvider, Typography } from '@mui/material';
import { landingPageTheme, sectionSx, sectionTitleSx } from '@/theme';

const Partners: ICardWithLink[] = Array.from({ length: 7 }, () => ({
  image: 'USTH',
  linkTo: 'USTH',
}));

const Partner: React.FC = () => {
  return (
    <ThemeProvider theme={landingPageTheme}>
      <Box component="section" sx={sectionSx}>
        <Container>
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
              // index in the key because the placeholder data has duplicate linkTo values
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
    </ThemeProvider>
  );
};

export default Partner;
