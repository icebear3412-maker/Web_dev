import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { IDefaultReactProps } from '@/types';
import { API_BASE_URL } from '@/services/movies';

type AccessState = 'checking' | 'allowed' | 'denied';

const AdminLayout: FC<IDefaultReactProps> = ({ children }) => {
  const navigate = useNavigate();
  const [access, setAccess] = useState<AccessState>('checking');

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (!token) {
      setAccess('denied');
      return;
    }

    const controller = new AbortController();
    fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return (await response.json()) as {
          user?: { email?: string; role?: string };
        };
      })
      .then((payload) => {
        const user = payload?.user;
        setAccess(
          user?.role === 'admin' && user.email?.toLowerCase() === 'admin@gmail.com'
            ? 'allowed'
            : 'denied',
        );
      })
      .catch(() => {
        if (!controller.signal.aborted) setAccess('denied');
      });

    return () => controller.abort();
  }, []);

  const shellSx = {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#fcfaed',
    color: '#29241f',
  };

  if (access === 'checking') {
    return (
      <Box sx={{ ...shellSx, display: 'grid', placeItems: 'center' }}>
        <CircularProgress sx={{ color: '#ed1c24' }} aria-label="Đang kiểm tra quyền quản trị" />
      </Box>
    );
  }

  if (access === 'denied') {
    return (
      <Box sx={{ ...shellSx, display: 'grid', placeItems: 'center', p: 3 }}>
        <Stack spacing={2} alignItems="center" textAlign="center">
          <Typography variant="h5" fontWeight={700}>
            Bạn không có quyền truy cập trang quản trị.
          </Typography>
          <Typography color="text.secondary">
            Hãy đăng nhập bằng tài khoản quản trị được cấp.
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => navigate('/', { replace: true })}>
              Về trang chủ
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/signin', { replace: true })}
              sx={{ bgcolor: '#ed1c24' }}
            >
              Đăng nhập
            </Button>
          </Stack>
        </Stack>
      </Box>
    );
  }

  return <Box sx={shellSx}>{children}</Box>;
};

export default AdminLayout;
