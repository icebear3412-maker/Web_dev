import * as React from 'react';
import type { IDefaultReactProps } from '@/types';
import { Box } from '@mui/material';

const AdminLayout: React.FC<IDefaultReactProps> = ({ children }) => {
  return <Box>{children}</Box>;
};

export default AdminLayout;
