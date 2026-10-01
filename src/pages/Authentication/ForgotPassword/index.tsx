import React, { useState } from 'react';
import {
  Box,
  Button,
  CssBaseline,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { EmailOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!email.trim()) {
      setError('Vui lòng nhập Email của bạn.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Địa chỉ Email không hợp lệ.');
      return;
    }

    setError('');
    setSubmitted(true);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Roboto', 'Arial', sans-serif",
        overflow: 'hidden',
        backgroundImage:
          'url("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1920&q=85")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.85) 100%)',
          zIndex: 1,
        },
      }}
    >
      <CssBaseline />

      <Paper
        elevation={10}
        sx={{
          position: 'relative',
          zIndex: 2,
          width: '90%',
          maxWidth: 420,
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          px: { xs: 3, sm: 4.5 },
          py: 4,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography
            sx={{
              color: '#111111',
              fontSize: 22,
              fontWeight: 900,
              fontFamily: "'Roboto', 'Segoe UI', Arial, sans-serif",
            }}
          >
            QUÊN MẬT KHẨU?
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: '#666666',
              fontSize: 13,
              fontFamily: "'Roboto', 'Arial', sans-serif",
              lineHeight: 1.5,
            }}
          >
            {!submitted
              ? 'Nhập địa chỉ email đăng ký của bạn để nhận liên kết khôi phục mật khẩu.'
              : 'Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư.'}
          </Typography>
        </Box>

        {!submitted ? (
          <>
            <TextField
              fullWidth
              label="Địa chỉ Email"
              type="email"
              variant="outlined"
              margin="dense"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              error={Boolean(error)}
              helperText={error}
              sx={{
                mb: 2.5,
                '& .MuiInputLabel-root': { color: '#666', fontSize: 14 },
                '& .MuiInputLabel-root.Mui-focused': { color: '#e51922' },
                '& .MuiOutlinedInput-root': {
                  color: '#222',
                  backgroundColor: '#fff',
                  borderRadius: '6px',
                  '& fieldset': { borderColor: '#ddd' },
                  '&.Mui-focused fieldset': { borderColor: '#e51922' },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined sx={{ color: '#888' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              sx={{
                height: 44,
                backgroundColor: '#e51922',
                color: '#fff',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: 15,
                fontFamily: "'Roboto', 'Arial', sans-serif",
                '&:hover': { backgroundColor: '#c81018' },
              }}
            >
              GỬI YÊU CẦU
            </Button>
          </>
        ) : (
          <Button
            fullWidth
            variant="contained"
            onClick={() => setSubmitted(false)}
            sx={{
              height: 44,
              backgroundColor: '#333',
              color: '#fff',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: 14,
              fontFamily: "'Roboto', 'Arial', sans-serif",
              '&:hover': { backgroundColor: '#111' },
            }}
          >
            GỬI LẠI EMAIL
          </Button>
        )}

        <Typography
          sx={{
            mt: 3,
            textAlign: 'center',
            color: '#666',
            fontSize: 14,
            fontFamily: "'Roboto', 'Arial', sans-serif",
          }}
        >
          Quay lại{' '}
          <Box
            component="span"
            onClick={() => navigate('/signin')}
            sx={{
              color: '#e51922',
              fontWeight: 700,
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Đăng Nhập
          </Box>
        </Typography>
      </Paper>
    </Box>
  );
};

export default ForgotPasswordPage;
