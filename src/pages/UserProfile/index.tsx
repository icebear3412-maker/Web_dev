import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Grid,
  Button,
  TextField,
  Tabs,
  Tab,
  Divider,
  Chip,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  PersonOutlined,
  ConfirmationNumberOutlined,
  CardGiftcardOutlined,
  EditOutlined,
  SaveOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  // State thông tin người dùng (Đã bỏ phone và dob)
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    membershipTier: '',
    rewardPoints: 0,
  });

  // State lịch sử đặt vé
  const [bookingHistory, setBookingHistory] = useState<any[]>([]);

  // 1. Kiểm tra đăng nhập & Gọi API lấy thông tin Profile + Booking History
  useEffect(() => {
    const token = localStorage.getItem('token');

    // Nếu chưa đăng nhập, tự động chuyển về trang /signin
    if (!token) {
      navigate('/signin');
      return;
    }

    const fetchUserData = async () => {
      try {
        const res = await fetch('http://localhost:5000/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const result = await res.json();
        if (res.ok && result.data) {
          setUserData({
            fullName: result.data.full_name || '',
            email: result.data.email || '',
            membershipTier: result.data.membership_tier || 'Member',
            rewardPoints: result.data.reward_points || 0,
          });
        }
      } catch (err) {
        console.error('Lỗi khi lấy thông tin profile từ BE:', err);
      }
    };

    const fetchBookingHistory = async () => {
      try {
        const res = await fetch('http://localhost:5000/user/bookings', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const result = await res.json();
        if (res.ok && result.data) {
          setBookingHistory(result.data);
        }
      } catch (err) {
        console.error('Lỗi khi lấy lịch sử đặt vé từ BE:', err);
      }
    };

    fetchUserData();
    fetchBookingHistory();
  }, [navigate]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 2. Gọi API cập nhật Họ và tên
  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: userData.fullName,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        setIsEditing(false);
        alert(result.message || 'Cập nhật thông tin tài khoản thành công!');
      } else {
        alert('Cập nhật thất bại. Vui lòng kiểm tra lại!');
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật profile:', err);
      alert('Không thể kết nối đến máy chủ Backend!');
    }
  };

  return (
    <Box sx={{ backgroundColor: '#F4F5F7', minHeight: '100vh', py: 5 }}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* CỘT BÊN TRÁI: THÔNG TIN TÓM TẮT THÀNH VIÊN */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={3}
              sx={{ p: 3, textAlign: 'center', borderRadius: '12px', backgroundColor: '#fff' }}
            >
              <Avatar
                sx={{
                  width: 90,
                  height: 90,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: '#e51922',
                  fontSize: 36,
                  fontWeight: 700,
                }}
              >
                {userData.fullName ? userData.fullName.charAt(0).toUpperCase() : 'U'}
              </Avatar>

              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111' }}>
                {userData.fullName || 'Người dùng'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                {userData.email}
              </Typography>

              <Chip
                label={userData.membershipTier}
                sx={{
                  backgroundColor: '#e51922',
                  color: '#fff',
                  fontWeight: 700,
                  mb: 2,
                }}
              />

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2 }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Điểm thưởng CGV:
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#e51922' }}>
                  {userData.rewardPoints} P
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* CỘT BÊN PHẢI: CHI TIẾT CÁC TAB */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: '12px', backgroundColor: '#fff' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                textColor="primary"
                indicatorColor="primary"
                sx={{
                  '& .MuiTab-root': { fontWeight: 700, fontSize: 14 },
                  '& .Mui-selected': { color: '#e51922 !important' },
                  '& .MuiTabs-indicator': { backgroundColor: '#e51922' },
                }}
              >
                <Tab icon={<PersonOutlined />} iconPosition="start" label="THÔNG TIN TÀI KHOẢN" />
                <Tab icon={<ConfirmationNumberOutlined />} iconPosition="start" label="LỊCH SỬ ĐẶT VÉ" />
                <Tab icon={<CardGiftcardOutlined />} iconPosition="start" label="VOUCHER & ƯU ĐÃI" />
              </Tabs>

              <Divider />

              {/* TAB 1: THÔNG TIN TÀI KHOẢN */}
              <CustomTabPanel value={tabValue} index={0}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#222' }}>
                    Hồ Sơ Cá Nhân
                  </Typography>
                  {!isEditing ? (
                    <Button
                      variant="outlined"
                      startIcon={<EditOutlined />}
                      onClick={() => setIsEditing(true)}
                      sx={{ color: '#e51922', borderColor: '#e51922' }}
                    >
                      Chỉnh sửa
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<SaveOutlined />}
                      onClick={handleSaveProfile}
                      sx={{ backgroundColor: '#e51922', '&:hover': { backgroundColor: '#c81018' } }}
                    >
                      Lưu thay đổi
                    </Button>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Họ và Tên"
                      value={userData.fullName}
                      disabled={!isEditing}
                      onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Địa chỉ Email"
                      value={userData.email}
                      disabled
                    />
                  </Grid>
                </Grid>
              </CustomTabPanel>

              {/* TAB 2: LỊCH SỬ ĐẶT VÉ */}
              <CustomTabPanel value={tabValue} index={1}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#222', mb: 2 }}>
                  Danh Sách Vé Đã Đặt
                </Typography>

                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead sx={{ backgroundColor: '#FAF8F5' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Mã Vé</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Tên Phim</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Rạp / Ghế</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Suất Chiếu</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Tổng Tiền</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bookingHistory.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell sx={{ fontWeight: 700, color: '#e51922' }}>{row.id}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{row.movieTitle}</TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {row.cinema}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#666' }}>
                              {row.room} - Ghế: {row.seats}
                            </Typography>
                          </TableCell>
                          <TableCell>{row.showtime}</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>{row.totalPrice}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CustomTabPanel>

              {/* TAB 3: VOUCHER & ƯU ĐÃI */}
              <CustomTabPanel value={tabValue} index={2}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#222', mb: 2 }}>
                  Voucher Của Bạn
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Card variant="outlined" sx={{ borderColor: '#e51922', borderStyle: 'dashed' }}>
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#e51922' }}>
                          CGV NEW MEMBER 2026
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Giảm 20.000 VNĐ cho vé phim 2D bất kỳ.
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 1 }}>
                          HSD: 31/12/2026
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </CustomTabPanel>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default UserProfilePage;