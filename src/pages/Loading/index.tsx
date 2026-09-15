import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingPage: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9f9f9',
        textAlign: 'center',
        padding: 3,
      }}
    >
      <CircularProgress size={80} thickness={5} color="primary" sx={{ mb: 3 }} />

      <Typography
        variant="h5"
        color="text.secondary"
        sx={{
          animation: 'pulse 1.5s infinite',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.5 },
          },
        }}
      >
        Đang Tải...
      </Typography>
    </Box>
  );
};

export default LoadingPage;
