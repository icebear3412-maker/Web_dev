import React, { useState } from 'react';
import {
  Box,
  Button,
  CssBaseline,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import {
  EmailOutlined,
  LockOutlined,
  PersonOutlined,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import usthLogo from '../../../assets/logo.png';
import RandomCaptcha from '../components/Captcha';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);

  // States quản lý lỗi Validation (FE)
  const [fullNameTouched, setFullNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const validateFullName = (val: string) => {
    if (!val.trim()) return 'Vui lòng nhập Họ và Tên.';
    return '';
  };

  const validateEmail = (val: string) => {
    if (!val.trim()) return 'Vui lòng nhập địa chỉ Email.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) return 'Địa chỉ Email không hợp lệ.';
    return '';
  };

  const validatePassword = (val: string) => {
    if (!val) return 'Vui lòng nhập mật khẩu.';
    if (val.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự.';
    return '';
  };

  const validateConfirmPassword = (val: string, passVal: string) => {
    if (!val) return 'Vui lòng xác nhận mật khẩu.';
    if (val !== passVal) return 'Mật khẩu xác nhận không trùng khớp.';
    return '';
  };

  // CẬP NHẬT HÀM HANDLESIGNUP GỌI API & CHUYỂN HƯỚNG
  const handleSignUp = async () => {
    const fnErr = validateFullName(fullName);
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    const cpErr = validateConfirmPassword(confirmPassword, password);

    setFullNameTouched(true);
    setEmailTouched(true);
    setPasswordTouched(true);
    setConfirmPasswordTouched(true);

    setFullNameError(fnErr);
    setEmailError(eErr);
    setPasswordError(pErr);
    setConfirmPasswordError(cpErr);

    if (fnErr || eErr || pErr || cpErr) return;

    if (!isCaptchaValid) {
      alert('Mã xác minh Captcha không chính xác. Vui lòng kiểm tra lại!');
      return;
    }

    try {
      // 1. Gọi API đăng ký tới Flask Backend (port 5000)
      const response = await fetch('http://localhost:5000/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
        // 2. Tự động chuyển hướng sang trang SignIn (http://localhost:5173/signin)
        navigate('/signin');
      } else {
        alert(data.error || data.message || 'Đăng ký thất bại. Email có thể đã tồn tại!');
      }
    } catch (error) {
      console.error('Lỗi khi gọi API đăng ký:', error);
      alert('Không thể kết nối đến máy chủ Backend. Vui lòng kiểm tra server Flask!');
    }
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

      {/* CHỮ GIỚI THIỆU & LOGO BÊN GÓC TRÁI DƯỚI */}
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

        {/* Logo USTH về trang chủ */}
        <Box
          component="img"
          src={usthLogo}
          alt="USTH Logo"
          onClick={() => navigate('/')}
          sx={{
            height: { xs: 50, sm: 60, md: 72 },
            objectFit: 'contain',
            mt: 1,
            mb: 1,
            cursor: 'pointer',
            display: 'block',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.8))',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        />

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
          Khám phá không gian điện ảnh đỉnh cao, đặt vé nhanh chóng và nhận nhiều ưu đãi dành riêng
          cho thành viên.
        </Typography>
      </Box>

      {/* FORM ĐĂNG KÝ CHÍNH GIỮA MÀN HÌNH */}
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
            ĐĂNG KÝ TÀI KHOẢN
          </Typography>

          <Typography
            sx={{
              mt: 0.8,
              color: '#666666',
              fontSize: 13,
              fontFamily: "'Roboto', 'Segoe UI', Arial, sans-serif",
            }}
          >
            Trở thành thành viên để trải nghiệm dịch vụ đặt vé tốt nhất
          </Typography>
        </Box>

        {/* HỌ VÀ TÊN */}
        <TextField
          fullWidth
          label="Họ và Tên"
          variant="outlined"
          margin="dense"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (fullNameTouched) setFullNameError(validateFullName(e.target.value));
          }}
          onBlur={() => {
            setFullNameTouched(true);
            setFullNameError(validateFullName(fullName));
          }}
          error={fullNameTouched && Boolean(fullNameError)}
          helperText={fullNameTouched && fullNameError}
          sx={inputStyle}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlined sx={{ color: '#888' }} />
                </InputAdornment>
              ),
            },
          }}
        />

        {/* EMAIL */}
        <TextField
          fullWidth
          label="Địa chỉ Email"
          type="email"
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

        {/* XÁC NHẬN MẬT KHẨU */}
        <TextField
          fullWidth
          label="Xác Nhận Mật Khẩu"
          type={showConfirmPassword ? 'text' : 'password'}
          variant="outlined"
          margin="dense"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (confirmPasswordTouched)
              setConfirmPasswordError(validateConfirmPassword(e.target.value, password));
          }}
          onBlur={() => {
            setConfirmPasswordTouched(true);
            setConfirmPasswordError(validateConfirmPassword(confirmPassword, password));
          }}
          error={confirmPasswordTouched && Boolean(confirmPasswordError)}
          helperText={confirmPasswordTouched && confirmPasswordError}
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
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? (
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

        {/* CAPTCHA SINH MÃ NGẪU NHIÊN */}
        <RandomCaptcha onVerify={(isValid) => setIsCaptchaValid(isValid)} />

        {/* NÚT ĐĂNG KÝ */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleSignUp}
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
          ĐĂNG KÝ
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

        {/* ĐĂNG KÝ BẰNG GOOGLE */}
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
          Đăng ký bằng Google
        </Button>

        {/* CHUYỂN SANG ĐĂNG NHẬP */}
        <Typography
          sx={{
            mt: 2.5,
            textAlign: 'center',
            color: '#666',
            fontSize: 14,
            fontFamily: "'Roboto', 'Arial', sans-serif",
          }}
        >
          Bạn đã có tài khoản?{' '}
          <Box
            component="span"
            onClick={() => navigate('/signin')}
            sx={{
              color: '#e51922',
              fontWeight: 700,
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Đăng Nhập
          </Box>
        </Typography>
      </Paper>
    </Box>
  );
};

export default SignUpPage;
