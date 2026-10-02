import * as React from 'react';
import type { IDefaultReactProps } from '@/types';
import { Box } from '@mui/material';

const AdminLayout: React.FC<IDefaultReactProps> = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#fcfaed',
        color: '#29241f',
      }}
    >
      {children}
    </Box>
  );
};

export default AdminLayout;