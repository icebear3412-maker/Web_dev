import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  CssBaseline,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { EmailOutlined, LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import RandomCaptcha from '../components/Captcha';

const SignInPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (val: string) => {
    if (!val.trim()) return 'Vui lòng nhập Email hoặc Tên đăng nhập.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (val.includes('@') && !emailRegex.test(val)) return 'Định dạng Email không hợp lệ.';
    return '';
  };

  const validatePassword = (val: string) => {
    if (!val) return 'Vui lòng nhập mật khẩu.';
    if (val.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự.';
    return '';
  };

  const handleSignIn = () => {
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);

    setEmailTouched(true);
    setPasswordTouched(true);
    setEmailError(eErr);
    setPasswordError(pErr);

    if (eErr || pErr) return;

    if (!isCaptchaValid) {
      alert('Mã xác minh Captcha không chính xác. Vui lòng kiểm tra lại!');
      return;
    }

    alert(`Đăng nhập thành công với tài khoản: ${email}`);
  };

  const inputStyle = {
    mb: 2,
    '& .MuiInputLabel-root': {
      color: '#666',
      fontSize: 14,
      fontFamily: "'Roboto', 'Arial', sans-serif",
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#e51922',
    },
    '& .MuiOutlinedInput-root': {
      color: '#222',
      backgroundColor: '#fff',
      borderRadius: '6px',
      fontFamily: "'Roboto', 'Arial', sans-serif",
      '& fieldset': {
        borderColor: '#ddd',
      },
      '&:hover fieldset': {
        borderColor: '#aaa',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#e51922',
      },
    },
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

      {/* CHỮ GIỚI THIỆU BÊN GÓC TRÁI DƯỚI */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: 20, md: 45 },
          left: { xs: 20, md: 55 },
          zIndex: 2,
          maxWidth: { xs: '90%', md: 420 },
          display: { xs: 'none', sm: 'block' },
        }}
      >
        <Typography
          sx={{
            color: '#fff',
            fontSize: { sm: 22, md: 26 },
            fontWeight: 700,
            fontFamily: "'Roboto', 'Arial', sans-serif",
            letterSpacing: '0.5px',
            textShadow: '0 2px 6px rgba(0,0,0,0.8)',
          }}
        >
          CHÀO MỪNG BẠN ĐẾN VỚI
        </Typography>

        <Typography
          sx={{
            color: '#e51922',
            fontSize: { sm: 34, md: 42 },
            fontWeight: 900,
            fontFamily: "'Roboto', 'Arial', sans-serif",
            lineHeight: 1.1,
            mt: 0.5,
            textShadow: '0 2px 8px rgba(0,0,0,0.9)',
          }}
        >
          CINEMA TICKET
        </Typography>

        <Typography
          sx={{
            color: '#e0e0e0',
            fontSize: 14,
            fontFamily: "'Roboto', 'Arial', sans-serif",
            lineHeight: 1.6,
            mt: 1.5,
            textShadow: '0 1px 4px rgba(0,0,0,0.9)',
          }}
        >
          Đăng nhập để trải nghiệm không gian điện ảnh đỉnh cao và đặt vé tiện lợi.
        </Typography>
      </Box>

      {/* FORM ĐĂNG NHẬP CHÍNH GIỮA MÀN HÌNH */}
      <Paper
        elevation={10}
        sx={{
          position: 'relative',
          zIndex: 2,
          width: '90%',
          maxWidth: 440,
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          px: { xs: 3, sm: 4.5 },
          py: 4,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* TIÊU ĐỀ */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography
            sx={{
              color: '#111111',
              fontSize: 22,
              fontWeight: 900,
              fontFamily: "'Roboto', 'Segoe UI', Arial, sans-serif",
              letterSpacing: '0.2px',
              lineHeight: 1.3,
            }}
          >
            ĐĂNG NHẬP TÀI KHOẢN
          </Typography>

          <Typography
            sx={{
              mt: 0.8,
              color: '#666666',
              fontSize: 13,
              fontFamily: "'Roboto', 'Segoe UI', Arial, sans-serif",
            }}
          >
            Vui lòng nhập thông tin đăng nhập của bạn
          </Typography>
        </Box>

        {/* EMAIL / USERNAME */}
        <TextField
          fullWidth
          label="Email hoặc Tên đăng nhập"
          variant="outlined"
          margin="dense"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailTouched) setEmailError(validateEmail(e.target.value));
          }}
          onBlur={() => {
            setEmailTouched(true);
            setEmailError(validateEmail(email));
          }}
          error={emailTouched && Boolean(emailError)}
          helperText={emailTouched && emailError}
          sx={inputStyle}
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

        {/* MẬT KHẨU */}
        <TextField
          fullWidth
          label="Mật Khẩu"
          type={showPassword ? 'text' : 'password'}
          variant="outlined"
          margin="dense"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (passwordTouched) setPasswordError(validatePassword(e.target.value));
          }}
          onBlur={() => {
            setPasswordTouched(true);
            setPasswordError(validatePassword(password));
          }}
          error={passwordTouched && Boolean(passwordError)}
          helperText={passwordTouched && passwordError}
          sx={inputStyle}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined sx={{ color: '#888' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? (
                      <VisibilityOff sx={{ color: '#888' }} />
                    ) : (
                      <Visibility sx={{ color: '#888' }} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        {/* REMEMBER ME & FORGOT PASSWORD */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1.5,
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                size="small"
                sx={{
                  color: '#777',
                  '&.Mui-checked': {
                    color: '#e51922',
                  },
                }}
              />
            }
            label={
              <Typography
                sx={{
                  color: '#444',
                  fontSize: 13,
                  fontFamily: "'Roboto', 'Arial', sans-serif",
                }}
              >
                Ghi nhớ đăng nhập
              </Typography>
            }
          />

          <Typography
            onClick={() => navigate('/forgot-password')}
            sx={{
              color: '#e51922',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'Roboto', 'Arial', sans-serif",
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Quên mật khẩu?
          </Typography>
        </Box>

        {/* CAPTCHA SINH MÃ NGẪU NHIÊN */}
        <RandomCaptcha onVerify={(isValid) => setIsCaptchaValid(isValid)} />

        {/* NÚT ĐĂNG NHẬP */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleSignIn}
          sx={{
            height: 44,
            backgroundColor: '#e51922',
            color: '#fff',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: 15,
            fontFamily: "'Roboto', 'Arial', sans-serif",
            '&:hover': {
              backgroundColor: '#c81018',
            },
          }}
        >
          ĐĂNG NHẬP
        </Button>

        {/* HOẶC */}
        <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
          <Divider sx={{ flex: 1, borderColor: '#E2E8F0' }} />
          <Typography
            sx={{
              mx: 2,
              color: '#888',
              fontSize: 12,
              fontFamily: "'Roboto', 'Arial', sans-serif",
            }}
          >
            HOẶC
          </Typography>
          <Divider sx={{ flex: 1, borderColor: '#E2E8F0' }} />
        </Box>

        {/* ĐĂNG NHẬP BẰNG GOOGLE */}
        <Button
          fullWidth
          variant="outlined"
          sx={{
            height: 42,
            color: '#333',
            borderColor: '#CBD5E1',
            borderRadius: '6px',
            textTransform: 'none',
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "'Roboto', 'Arial', sans-serif",
            '&:hover': {
              borderColor: '#94A3B8',
              backgroundColor: '#F8FAFC',
            },
          }}
        >
          <Box
            component="span"
            sx={{
              mr: 1.5,
              fontSize: 16,
              fontWeight: 800,
              color: '#e51922',
            }}
          >
            G
          </Box>
          Đăng nhập bằng Google
        </Button>

        {/* CHUYỂN SANG ĐĂNG KÝ */}
        <Typography
          sx={{
            mt: 2.5,
            textAlign: 'center',
            color: '#666',
            fontSize: 14,
            fontFamily: "'Roboto', 'Arial', sans-serif",
          }}
        >
          Bạn chưa có tài khoản?{' '}
          <Box
            component="span"
            onClick={() => navigate('/signup')}
            sx={{
              color: '#e51922',
              fontWeight: 700,
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Đăng Ký
          </Box>
        </Typography>
      </Paper>
    </Box>
  );
};

export default SignInPage;
