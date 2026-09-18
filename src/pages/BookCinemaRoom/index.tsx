import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import CinemaLayout from '@/layouts/CinemaLayout';
import { localDate } from '@/helpers/date';
import { emptyForm, services, validateRental } from './data';
import { cities, emptyRooms, roomTypesForCity } from '@/shared/cinemaRooms';
import type { CinemaRoom } from '@/shared/cinemaRooms';
import type { RentalForm } from './data';
import './styles.css';

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="rental-section-title">
      <span />
      <Typography component="h2">{children}</Typography>
      <span />
    </div>
  );
}
export default function BookCinemaRoom({ rooms = emptyRooms }: { rooms?: CinemaRoom[] }) {
  const [form, setForm] = useState<RentalForm>({ ...emptyForm });
  const [touched, setTouched] = useState<Partial<Record<keyof RentalForm, boolean>>>({});
  const [attempted, setAttempted] = useState(false);
  const [tab, setTab] = useState(2);
  const service = services[tab];
  const errors = validateRental(form, rooms);
  const roomTypes = roomTypesForCity(rooms, form.city);
  const update = (name: keyof RentalForm, value: string | boolean) => {
    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === 'city' ? { roomType: '' } : {}),
    }));
  };
  const fieldError = (name: keyof RentalForm) =>
    attempted || touched[name] ? errors[name] : undefined;
  const blur = (name: keyof RentalForm) => () =>
    setTouched((previous) => ({ ...previous, [name]: true }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttempted(true);
    if (Object.keys(errors).length) {
      const first = Object.keys(errors)[0];
      document.getElementById(`rental-${first}`)?.focus();
      return;
    }
    // TODO: connect the rental request endpoint owned by the backend team.
  };
  const textField = (
    name: 'name' | 'phone' | 'email' | 'address' | 'company' | 'date' | 'guests',
    label: string,
    type = 'text',
    required = true,
  ) => (
    <TextField
      id={`rental-${name}`}
      name={name}
      label={label}
      type={type}
      required={required}
      fullWidth
      value={form[name]}
      onChange={(event) => update(name, event.target.value)}
      onBlur={blur(name)}
      error={!!fieldError(name)}
      helperText={fieldError(name)}
      slotProps={{
        inputLabel: type === 'date' ? { shrink: true } : undefined,
        htmlInput: {
          ...(type === 'date' ? { min: localDate(new Date()) } : {}),
          ...(type === 'number' ? { min: 1, max: 500, step: 1 } : {}),
          maxLength: 150,
        },
      }}
    />
  );

  return (
    <CinemaLayout light>
      <Container maxWidth="lg" className="rental-container">
        <Typography className="rental-breadcrumb">
          USTH Cinema / Trải nghiệm / Thuê rạp & sự kiện
        </Typography>
        <div className="rental-intro-title">
          <span className="rental-overline">KHÔNG GIAN ĐIỆN ẢNH, DẤU ẤN RIÊNG</span>
          <Typography component="h1">
            THUÊ RẠP / SỰ KIỆN
            <br />& VÉ NHÓM
          </Typography>
          <div className="title-rule" />
        </div>
        <Box className="rental-intro-grid">
          <img
            className="rental-hero-image"
            src="/images/usth-auditorium.png"
            alt="Không gian phòng chiếu với ghế đỏ và màn ảnh lớn"
          />
          <Box className="rental-intro-copy">
            <Typography className="rental-overline">MÀN ẢNH LỚN. KẾT NỐI THẬT.</Typography>
            <Typography component="h2">
              Biến buổi gặp gỡ
              <br />
              thành một sự kiện đáng nhớ.
            </Typography>
            <Typography>
              Bạn muốn thưởng thức một bộ phim thật riêng tư cùng bạn bè, người thân hay đồng
              nghiệp? Hay đang tìm một không gian khác biệt cho sự kiện tiếp theo?
            </Typography>
            <Typography>
              Từ buổi chiếu riêng, vé nhóm đến hội thảo và quà tặng doanh nghiệp, hãy cùng USTH
              Cinema lên kế hoạch cho trải nghiệm phù hợp với bạn.
            </Typography>
          </Box>
        </Box>
        <Box sx={{ mt: 6 }}>
          <SectionTitle>DỊCH VỤ CỦA CHÚNG TÔI</SectionTitle>
          <Tabs
            value={tab}
            onChange={(_, value: number) => {
              setTab(value);
              update('service', services[value].name);
            }}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="Các dịch vụ thuê rạp"
            className="service-tabs"
          >
            {services.map((item, index) => (
              <Tab
                key={item.name}
                id={`service-tab-${index}`}
                aria-controls={`service-panel-${index}`}
                label={
                  <>
                    <strong>{item.name}</strong>
                    <span>{item.subtitle}</span>
                  </>
                }
              />
            ))}
          </Tabs>
          <Box
            role="tabpanel"
            id={`service-panel-${tab}`}
            aria-labelledby={`service-tab-${tab}`}
            className="service-panel"
          >
            <Box>
              <Typography className="rental-overline">{service.name}</Typography>
              <Typography component="h3">{service.heading}</Typography>
              <Typography>{service.description}</Typography>
              <ul>
                {service.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </Box>
            <img src={service.image} alt="Không gian phòng chiếu" />
          </Box>
        </Box>
        <Box component="section" id="rental-form" className="rental-form-section">
          <SectionTitle>ĐĂNG KÝ THUÊ RẠP</SectionTitle>
          <Typography className="form-intro">
            Chia sẻ kế hoạch của bạn. Chúng tôi sẽ cùng bạn tìm ra không gian phù hợp.
          </Typography>
          <Box component="form" noValidate onSubmit={submit} className="rental-form">
            <div className="form-section-label">
              <span>01</span> THÔNG TIN LIÊN HỆ
            </div>
            <div className="form-grid">
              {textField('name', 'Họ và tên')}
              {textField('phone', 'Số điện thoại', 'tel')}
              {textField('email', 'Email', 'email')}
              {textField('company', 'Công ty / Tổ chức', 'text', false)}
              <div className="full-field">{textField('address', 'Địa chỉ liên hệ')}</div>
            </div>
            <div className="form-section-label">
              <span>02</span> KẾ HOẠCH CỦA BẠN
            </div>
            <div className="form-grid">
              <TextField
                select
                fullWidth
                required
                label="Dịch vụ"
                value={form.service}
                onChange={(event) => {
                  update('service', event.target.value);
                  setTab(services.findIndex((item) => item.name === event.target.value));
                }}
              >
                {services.map((item) => (
                  <MenuItem key={item.name} value={item.name}>
                    {item.name} — {item.subtitle}
                  </MenuItem>
                ))}
              </TextField>
              {textField('date', 'Ngày dự kiến', 'date')}
              {textField('guests', 'Số lượng khách', 'number')}
              <TextField
                select
                fullWidth
                required
                id="rental-city"
                label="Thành phố"
                value={form.city}
                onChange={(event) => update('city', event.target.value)}
                onBlur={blur('city')}
                error={!!fieldError('city')}
                helperText={fieldError('city')}
              >
                {cities.map((city) => (
                  <MenuItem value={city} key={city}>
                    {city}
                  </MenuItem>
                ))}
              </TextField>
              <div className="full-field">
                <TextField
                  select
                  fullWidth
                  required
                  id="rental-roomType"
                  label="Loại phòng chiếu"
                  disabled={!form.city || !roomTypes.length}
                  value={form.roomType}
                  onChange={(event) => update('roomType', event.target.value)}
                  onBlur={blur('roomType')}
                  error={!!fieldError('roomType')}
                  helperText={
                    fieldError('roomType') ||
                    (form.city && !roomTypes.length
                      ? 'Chưa có thông tin loại phòng tại thành phố này.'
                      : '')
                  }
                >
                  {roomTypes.map((roomType) => (
                    <MenuItem value={roomType} key={roomType}>
                      {roomType}
                    </MenuItem>
                  ))}
                </TextField>
              </div>
              <div className="full-field">
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  label="Chia sẻ thêm về sự kiện của bạn"
                  placeholder="Mục đích tổ chức, khung giờ, yêu cầu trang trí hoặc thiết bị…"
                  value={form.note}
                  onChange={(event) => update('note', event.target.value)}
                  slotProps={{ htmlInput: { maxLength: 2000 } }}
                  helperText={`${form.note.length}/2000 ký tự`}
                />
              </div>
            </div>
            {attempted && Object.keys(errors).length > 0 && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Vui lòng kiểm tra các mục được đánh dấu trước khi tiếp tục.
              </Alert>
            )}
            <div className="form-submit-row">
              <Typography variant="body2">Các trường có dấu * là bắt buộc.</Typography>
              <Button size="large" type="submit" variant="contained" disabled>
                Gửi yêu cầu
              </Button>
            </div>
          </Box>
        </Box>
      </Container>
    </CinemaLayout>
  );
}
