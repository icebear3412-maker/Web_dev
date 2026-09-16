import { Box, Button, Container } from '@mui/material';

function NavigationBar() {
  return (
    <Box
      sx={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 4,
            py: 1,
          }}
        >
          <Button color="inherit">MOVIES</Button>

          <Button color="inherit">CINEMAS</Button>

          <Button color="inherit">PROMOTIONS</Button>

          <Button color="inherit">MEMBERSHIP</Button>
        </Box>
      </Container>
    </Box>
  );
}

export default NavigationBar;
