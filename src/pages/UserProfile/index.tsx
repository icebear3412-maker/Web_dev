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
  AdminPanelSettingsOutlined,
  LogoutOutlined,
  SaveOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/services/movies';

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
  const [isAdminAccount, setIsAdminAccount] = useState(false);

  // State thông tin người dùng (Đã bỏ phone và dob)
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
  });

  // State lịch sử đặt vé
  const [bookingHistory, setBookingHistory] = useState<any[]>([]);

  // 1. Kiểm tra đăng nhập & Gọi API lấy thông tin Profile + Booking History
  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');

    // Nếu chưa đăng nhập, tự động chuyển về trang /signin
    if (!token) {
      navigate('/signin');
      return;
    }

    const fetchUserData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const result = await res.json();
        if (res.ok && result.data) {
          setUserData({
            fullName: result.data.full_name || '',
            email: result.data.email || '',
          });
        } else if (res.status === 401 || res.status === 403) {
          ['token', 'access_token', 'accessToken', 'user', 'rememberMe'].forEach((key) =>
            localStorage.removeItem(key),
          );
          navigate('/signin', { replace: true });
        } else if (!res.ok) {
          alert(result.error || 'Không thể tải thông tin tài khoản.');
        }
      } catch (err) {
        console.error('Lỗi khi lấy thông tin profile từ BE:', err);
      }
    };

    const fetchAdminAccess = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        const verifiedUser = result?.user;
        setIsAdminAccount(
          res.ok &&
            verifiedUser?.role === 'admin' &&
            verifiedUser.email?.toLowerCase() === 'admin@gmail.com',
        );
      } catch (err) {
        setIsAdminAccount(false);
        console.error('Lỗi khi xác thực quyền quản trị:', err);
      }
    };

    const fetchBookingHistory = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/bookings`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const result = await res.json();
        if (res.ok && Array.isArray(result.bookings)) {
          setBookingHistory(result.bookings.map((booking: any) => {
            const showDate = String(booking.show_date || '').slice(0, 10);
            const [year, month, day] = showDate.split('-');
            const dateLabel = year && month && day ? `${day}/${month}/${year}` : showDate;
            const timeLabel = String(booking.show_time || '').slice(0, 5);

            return {
              id: booking.booking_ref,
              movieTitle: booking.title_vn?.trim() || booking.movie_title || 'Phim',
              cinema: booking.cinema_name || 'Rạp chiếu',
              room: booking.room_name || `Phòng ${booking.room_number ?? ''}`,
              seats: Array.isArray(booking.seats)
                ? booking.seats.map((seat: { seat_code: string }) => seat.seat_code).join(', ')
                : '',
              showtime: `${timeLabel} - ${dateLabel}`,
              totalPrice: `${Number(booking.total_amount || 0).toLocaleString('vi-VN')} VNĐ`,
            };
          }));
        }
      } catch (err) {
        console.error('Lỗi khi lấy lịch sử đặt vé từ BE:', err);
      }
    };

    fetchUserData();
    fetchAdminAccess();
    fetchBookingHistory();
  }, [navigate]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 2. Gọi API cập nhật Họ và tên
  const handleLogout = () => {
    ['token', 'access_token', 'accessToken', 'user', 'rememberMe'].forEach((key) =>
      localStorage.removeItem(key),
    );
    navigate('/signin', { replace: true });
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/user/profile`, {
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
        if (result.data) {
          setUserData({
            fullName: result.data.full_name || '',
            email: result.data.email || '',
          });
          try {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({
              ...storedUser,
              name: result.data.full_name,
              email: result.data.email,
            }));
          } catch {
            localStorage.setItem('user', JSON.stringify({
              name: result.data.full_name,
              email: result.data.email,
            }));
          }
        }
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
                {userData.fullName.trim().charAt(0).toLocaleUpperCase('vi-VN') || 'U'}
              </Avatar>

              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111' }}>
                {userData.fullName || 'Người dùng'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                {userData.email}
              </Typography>

              {isAdminAccount && (
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AdminPanelSettingsOutlined />}
                  onClick={() => navigate('/admin')}
                  sx={{
                    mt: 1,
                    mb: 1,
                    bgcolor: '#e51922',
                    fontWeight: 700,
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#c81018' },
                  }}
                >
                  Quyền quản trị
                </Button>
              )}

              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<LogoutOutlined />}
                onClick={handleLogout}
                sx={{ mt: 1, textTransform: 'none', fontWeight: 700 }}
              >
                Đăng xuất tài khoản
              </Button>
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
                      {bookingHistory.length === 0 ? (
                        <TableRow key="no-bookings">
                          <TableCell colSpan={5} align="center" sx={{ color: '#666' }}>
                            Bạn chưa có vé đã đặt.
                          </TableCell>
                        </TableRow>
                      ) : bookingHistory.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>
                            <Button
                              size="small"
                              onClick={() => navigate(`/check_ticket?reference=${encodeURIComponent(row.id)}`)}
                              sx={{ fontWeight: 700, color: '#e51922', minWidth: 0, p: 0 }}
                            >
                              {row.id}
                            </Button>
                          </TableCell>
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
                          USTH NEW MEMBER 2026
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
