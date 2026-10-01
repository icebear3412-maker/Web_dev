import React, { useState, useEffect } from 'react';
import { Box, TextField, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

interface CaptchaProps {
  onVerify: (isValid: boolean) => void;
}

const RandomCaptcha: React.FC<CaptchaProps> = ({ onVerify }) => {
  const [captchaCode, setCaptchaCode] = useState('');
  const [userInput, setUserInput] = useState('');

  // Hàm sinh mã captcha ngẫu nhiên 5 ký tự
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setUserInput('');
    onVerify(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserInput(val);
    onVerify(val === captchaCode);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 1,
        }}
      >
        {/* Khung hiển thị mã Captcha với nền nhiễu nhẹ */}
        <Box
          sx={{
            flex: 1,
            py: 1,
            px: 2,
            backgroundColor: '#222',
            color: '#00E676',
            borderRadius: '6px',
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: '6px',
            textAlign: 'center',
            userSelect: 'none',
            textDecoration: 'line-through',
            border: '1px dashed #444',
          }}
        >
          {captchaCode}
        </Box>

        <IconButton
          onClick={generateCaptcha}
          title="Đổi mã xác minh khác"
          sx={{ color: '#e51922' }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      <TextField
        fullWidth
        size="small"
        placeholder="Nhập mã xác minh ở trên"
        value={userInput}
        onChange={handleChange}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#fff',
            fontSize: 13,
            fontFamily: "'Roboto', 'Arial', sans-serif",
            '& fieldset': { borderColor: '#ddd' },
            '&.Mui-focused fieldset': { borderColor: '#e51922' },
          },
        }}
      />
    </Box>
  );
};

export default RandomCaptcha;
