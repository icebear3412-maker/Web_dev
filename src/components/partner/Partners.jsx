import { Box, Container, Typography } from '@mui/material';

function Partners() {
  const partners = ['USTH', 'PARTNER 01', 'PARTNER 02', 'PARTNER 03', 'PARTNER 04'];

  return (
    <section className="partners-section">
      <Container maxWidth="lg">
        <Typography className="partners-title">ĐỐI TÁC</Typography>
        <Box className="partners-row">
          {partners.map((partner) => (
            <Box className="partner-logo" key={partner}>
              {partner}
            </Box>
          ))}
        </Box>
      </Container>
    </section>
  );
}

export default Partners;
