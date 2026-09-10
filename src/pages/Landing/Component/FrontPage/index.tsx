import React from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const FrontPage: React.FC = () => {
  const navigate = useNavigate();
  const handleNavigate = (link: string) => {
    if (link.startsWith('http')) {
      window.open(link);
      return;
    }
    navigate(link);
    return;
  };
  return (
    <Box
      sx={{
        height: '100vh',
        backgroundColor: 'black',
        color: 'white',
        lineHeight: '1.5rem',
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
      }}
    />
  );
};

export default FrontPage;
