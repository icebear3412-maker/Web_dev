import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ArrowBack,
  Autorenew,
  DeleteOutlined,
  EventSeat,
  Search,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/services/movies';

interface BookingSeat {
  id: string;
  seat_code: string;
}

interface Transaction {
  booking_ref: string;
  status: string;
  total_amount: number;
  created_at: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  showtime_id: string;
  show_date: string;
  show_time: string;
  format?: string | null;
  movie_title: string;
  title_vn?: string | null;
  cinema_name: string;
  room_name: string;
  room_number: number;
  seats: BookingSeat[];
}

interface Seat extends BookingSeat {
  row_label: string;
  seat_number: number;
  seat_type?: string;
  booked: boolean;
}

const getToken = () => localStorage.getItem('token') || localStorage.getItem('access_token');

const formatDate = (value: string) => {
  const [year, month, day] = String(value || '').slice(0, 10).split('-');
  return year && month && day ? `${day}/${month}/${year}` : '—';
};

const formatTime = (value: string) => String(value || '').slice(0, 5) || '—';

const isCancelled = (status: string) => ['cancelled', 'canceled'].includes(status.toLowerCase());

const statusLabel = (status: string) => {
  if (isCancelled(status)) return 'Đã hủy';
  if (status === 'pending_counter_payment') return 'Chờ thanh toán tại quầy';
  if (status === 'confirmed' || status === 'paid') return 'Đã xác nhận';
  return status.replaceAll('_', ' ');
};

export default function AdminTransactionsPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'cancelled'>('all');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [cancelTarget, setCancelTarget] = useState<Transaction | null>(null);
  const [seatTarget, setSeatTarget] = useState<Transaction | null>(null);
  const [seatMap, setSeatMap] = useState<Seat[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);

  const loadTransactions = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError('Hãy đăng nhập tài khoản quản trị để xem giao dịch.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 403) throw new Error('Tài khoản hiện tại không có quyền quản trị.');
        if (response.status === 401) throw new Error('Phiên đăng nhập hết hạn. Hãy đăng nhập lại.');
        throw new Error(payload.error || 'Không tải được danh sách vé.');
      }
      setTransactions(Array.isArray(payload.bookings) ? payload.bookings : []);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không tải được danh sách vé.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  const filteredTransactions = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase('vi-VN');
    return transactions.filter((transaction) => {
      if (statusFilter === 'active' && isCancelled(transaction.status)) return false;
      if (statusFilter === 'cancelled' && !isCancelled(transaction.status)) return false;
      if (!needle) return true;
      return [
        transaction.booking_ref,
        transaction.customer_name,
        transaction.customer_email,
        transaction.title_vn,
        transaction.movie_title,
      ].some((value) => String(value || '').toLocaleLowerCase('vi-VN').includes(needle));
    });
  }, [transactions, search, statusFilter]);

  const openSeatEditor = async (transaction: Transaction) => {
    const token = getToken();
    if (!token) return;
    setSeatTarget(transaction);
    setSelectedSeatIds(transaction.seats.map((seat) => seat.id));
    setLoadingSeats(true);
    setSeatMap([]);
    setError('');
    try {
      const response = await fetch(
        `${API_BASE_URL}/bookings/showtimes/${encodeURIComponent(transaction.showtime_id)}/seats`,
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Không tải được sơ đồ ghế.');
      setSeatMap(Array.isArray(payload.seats) ? payload.seats : []);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không tải được sơ đồ ghế.');
      setSeatTarget(null);
    } finally {
      setLoadingSeats(false);
    }
  };

  const toggleSeat = (seat: Seat) => {
    if (seat.booked && !seatTarget?.seats.some((current) => current.id === seat.id)) return;
    setSelectedSeatIds((current) => {
      if (current.includes(seat.id)) return current.filter((id) => id !== seat.id);
      const requiredCount = seatTarget?.seats.length || 0;
      if (current.length >= requiredCount) return current;
      return [...current, seat.id];
    });
  };

  const saveSeatChange = async () => {
    if (!seatTarget) return;
    const token = getToken();
    if (!token) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch(
        `${API_BASE_URL}/bookings/admin/${encodeURIComponent(seatTarget.booking_ref)}/seats`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ seat_ids: selectedSeatIds }),
        },
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Không thể chuyển ghế.');
      setNotice(payload.message || 'Đã chuyển ghế thành công.');
      setSeatTarget(null);
      await loadTransactions();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể chuyển ghế.');
    } finally {
      setSaving(false);
    }
  };

  const cancelBooking = async () => {
    if (!cancelTarget) return;
    const token = getToken();
    if (!token) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch(
        `${API_BASE_URL}/bookings/admin/${encodeURIComponent(cancelTarget.booking_ref)}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Không thể hủy vé.');
      setNotice(payload.message || 'Đã hủy vé và trả ghế về trạng thái trống.');
      setCancelTarget(null);
      await loadTransactions();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể hủy vé.');
    } finally {
      setSaving(false);
    }
  };

  const currentSeatIds = new Set(seatTarget?.seats.map((seat) => seat.id) || []);
  const rows = Array.from(new Set(seatMap.map((seat) => seat.row_label || seat.seat_code[0]))).sort();
  const targetSeatCount = seatTarget?.seats.length || 0;
  const seatsChanged = Boolean(seatTarget) &&
    [...selectedSeatIds].sort().join(',') !== [...currentSeatIds].sort().join(',');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fcfaed', p: { xs: 2, md: 5 }, color: '#29241f' }}>
      <Box sx={{ maxWidth: 1500, mx: 'auto' }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/admin')} sx={{ mb: 2, color: '#6e6559' }}>
          Quay lại tổng quan
        </Button>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mb: 3, justifyContent: 'space-between' }}
        >
          <Box>
            <Typography sx={{ font: "900 42px 'Roboto Condensed', sans-serif", letterSpacing: 1 }}>
              GIAO DỊCH & VÉ ĐÃ ĐẶT
            </Typography>
            <Typography color="#6e6559">Xem thông tin vé, đổi ghế hoặc hủy vé của khách hàng.</Typography>
          </Box>
          <Button variant="outlined" startIcon={<Autorenew />} onClick={() => void loadTransactions()} disabled={loading}>
            Làm mới
          </Button>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {notice && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNotice('')}>{notice}</Alert>}

        <Paper variant="outlined" sx={{ p: 2, mb: 2, borderColor: '#d9d0c1' }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
          >
            <TextField
              size="small"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm mã vé, khách hàng hoặc phim"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#777' }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ width: { xs: '100%', md: 420 } }}
            />
            <Stack direction="row" spacing={1}>
              {([
                ['all', 'Tất cả'],
                ['active', 'Còn hiệu lực'],
                ['cancelled', 'Đã hủy'],
              ] as const).map(([value, label]) => (
                <Button
                  key={value}
                  size="small"
                  variant={statusFilter === value ? 'contained' : 'outlined'}
                  onClick={() => setStatusFilter(value)}
                >
                  {label}
                </Button>
              ))}
            </Stack>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ borderColor: '#d9d0c1', overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}><CircularProgress color="error" /></Box>
          ) : !filteredTransactions.length ? (
            <Typography align="center" sx={{ py: 7, color: '#6e6559' }}>
              {transactions.length ? 'Không tìm thấy vé phù hợp.' : 'Chưa có vé nào được đặt.'}
            </Typography>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Box component="table" sx={{ width: '100%', minWidth: 1120, borderCollapse: 'collapse' }}>
                <Box component="thead" sx={{ bgcolor: '#f5f0e4' }}>
                  <Box component="tr">
                    {['Mã vé / Khách hàng', 'Phim', 'Suất chiếu / Phòng', 'Ghế', 'Tổng tiền', 'Trạng thái', 'Thao tác'].map((heading) => (
                      <Box component="th" key={heading} sx={{ p: 1.5, textAlign: 'left', fontSize: 13, borderBottom: '1px solid #d9d0c1' }}>{heading}</Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {filteredTransactions.map((transaction) => (
                    <Box component="tr" key={transaction.booking_ref} sx={{ '&:not(:last-child) td': { borderBottom: '1px solid #eee7da' } }}>
                      <Box component="td" sx={{ p: 1.5, verticalAlign: 'top' }}>
                        <Typography sx={{ color: '#e51b23', fontWeight: 800 }}>{transaction.booking_ref}</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>{transaction.customer_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{transaction.customer_email}</Typography>
                      </Box>
                      <Box component="td" sx={{ p: 1.5, verticalAlign: 'top', fontWeight: 600 }}>
                        {transaction.title_vn?.trim() || transaction.movie_title}
                      </Box>
                      <Box component="td" sx={{ p: 1.5, verticalAlign: 'top' }}>
                        <Typography variant="body2">{formatDate(transaction.show_date)} · {formatTime(transaction.show_time)}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {transaction.cinema_name} · {transaction.room_name || `Phòng ${transaction.room_number}`}
                        </Typography>
                      </Box>
                      <Box component="td" sx={{ p: 1.5, verticalAlign: 'top', minWidth: 120 }}>
                        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                          {transaction.seats.map((seat) => <Chip key={seat.id || seat.seat_code} size="small" label={seat.seat_code} />)}
                        </Stack>
                      </Box>
                      <Box component="td" sx={{ p: 1.5, verticalAlign: 'top', whiteSpace: 'nowrap', fontWeight: 700 }}>
                        {Number(transaction.total_amount || 0).toLocaleString('vi-VN')} VNĐ
                      </Box>
                      <Box component="td" sx={{ p: 1.5, verticalAlign: 'top' }}>
                        <Chip
                          size="small"
                          color={isCancelled(transaction.status) ? 'default' : 'success'}
                          label={statusLabel(transaction.status)}
                        />
                      </Box>
                      <Box component="td" sx={{ p: 1, verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Chuyển ghế">
                            <span>
                          <IconButton
                                aria-label={`Chuyển ghế vé ${transaction.booking_ref}`}
                                color="primary"
                                disabled={isCancelled(transaction.status)}
                                onClick={() => void openSeatEditor(transaction)}
                              >
                                <EventSeat />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Hủy vé">
                            <span>
                              <IconButton
                                aria-label={`Hủy vé ${transaction.booking_ref}`}
                                color="error"
                                disabled={isCancelled(transaction.status)}
                                onClick={() => setCancelTarget(transaction)}
                              >
                                <DeleteOutlined />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>

      <Dialog open={Boolean(cancelTarget)} onClose={() => !saving && setCancelTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Hủy vé đã đặt?</DialogTitle>
        <DialogContent>
          <Typography>
            Vé <b>{cancelTarget?.booking_ref}</b> sẽ chuyển sang trạng thái đã hủy và các ghế {cancelTarget?.seats.map((seat) => seat.seat_code).join(', ')} sẽ được giải phóng.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelTarget(null)} disabled={saving}>Giữ vé</Button>
          <Button color="error" variant="contained" onClick={() => void cancelBooking()} disabled={saving}>
            {saving ? 'Đang hủy…' : 'Xác nhận hủy'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(seatTarget)} onClose={() => !saving && setSeatTarget(null)} maxWidth="lg" fullWidth>
        <DialogTitle>Chuyển ghế · {seatTarget?.booking_ref}</DialogTitle>
        <DialogContent dividers>
          {seatTarget && (
            <>
              <Typography sx={{ mb: 1 }}>
                {seatTarget.title_vn?.trim() || seatTarget.movie_title} · {formatDate(seatTarget.show_date)} {formatTime(seatTarget.show_time)} · {seatTarget.room_name}
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Chọn đúng {targetSeatCount} ghế. Ghế đang được đặt bởi vé khác không thể chọn.
                Đã chọn {selectedSeatIds.length}/{targetSeatCount}.
              </Alert>
            </>
          )}
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
          {loadingSeats ? (
            <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}><CircularProgress color="error" /></Box>
          ) : (
            <Box sx={{ overflowX: 'auto', pb: 1 }}>
              <Box sx={{ mx: 'auto', mb: 3, maxWidth: 900, bgcolor: '#eee', p: 1, textAlign: 'center', letterSpacing: 2 }}>MÀN HÌNH</Box>
              <Stack spacing={1} sx={{ alignItems: 'center', minWidth: 600 }}>
                {rows.map((row) => (
                  <Stack key={row} direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                    <Typography sx={{ width: 20, fontWeight: 800 }}>{row}</Typography>
                    {seatMap.filter((seat) => (seat.row_label || seat.seat_code[0]) === row).map((seat) => {
                      const selected = selectedSeatIds.includes(seat.id);
                      const occupiedByOther = seat.booked && !currentSeatIds.has(seat.id);
                      return (
                        <Tooltip key={seat.id} title={occupiedByOther ? 'Ghế đã có vé khác đặt' : seat.seat_code}>
                          <span>
                            <Button
                              size="small"
                              variant={selected ? 'contained' : 'outlined'}
                              disabled={occupiedByOther || (!selected && selectedSeatIds.length >= targetSeatCount)}
                              onClick={() => toggleSeat(seat)}
                              sx={{ minWidth: 42, width: 42, height: 38, p: 0, ...(selected && { bgcolor: '#e51b23' }) }}
                            >
                              {seat.seat_code}
                            </Button>
                          </span>
                        </Tooltip>
                      );
                    })}
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSeatTarget(null)} disabled={saving}>Đóng</Button>
          <Button
            variant="contained"
            startIcon={<EventSeat />}
            onClick={() => void saveSeatChange()}
            disabled={saving || loadingSeats || selectedSeatIds.length !== targetSeatCount || !seatsChanged}
          >
            {saving ? 'Đang lưu…' : 'Lưu ghế mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
