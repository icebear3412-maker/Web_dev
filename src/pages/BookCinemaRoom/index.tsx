import { useState } from 'react';
import type React from 'react';
import type { FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  CssBaseline,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material';
import { localDate } from '@/helpers/date';
import { phoneValidation } from '@/helpers/phoneValidation';
import { emailValidation } from '@/helpers/emailValidation';
import { dateValidation } from '@/helpers/dateValidation';
import { emptyForm, services } from './data';
import { cities, emptyRooms, roomTypesForCity } from '@/shared/cinemaRooms';
import type {
  CinemaRoom,
  RentalForm,
  RentalErrors,
  RentalTouched,
  RentalTextField,
  IBookCinemaRoomProps,
  ISectionTitleProps,
} from '@/types/cinema';

const rentalTheme = createTheme({
  palette: { primary: { main: '#b92b30' }, background: { default: '#fbf9ef', paper: '#fffdf6' } },
  typography: {
    fontFamily: 'Be Vietnam Pro, Arial, sans-serif',
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shape: { borderRadius: 6 },
});
const overlineSx = { fontSize: '10px', fontWeight: 700, letterSpacing: '2px', color: '#a52c30' };
const formGridSx = { display: 'grid', gap: '18px', mb: 4 };
const fieldSx = {
  '& .MuiInputBase-root': { backgroundColor: '#fff' },
  '& input[type=number]': { MozAppearance: 'textfield', appearance: 'textfield' },
  '& input::-webkit-inner-spin-button, & input::-webkit-outer-spin-button': {
    WebkitAppearance: 'none',
    margin: 0,
  },
  '@media (min-width: 701px)': {
    width: '65%',
    ml: '35%',
    '& .MuiInputLabel-root': {
      transform: 'none',
      left: '-53.85%',
      top: '17px',
      width: '48%',
      whiteSpace: 'normal',
      fontSize: '14px',
      color: '#38342e',
    },
    '& .MuiInputLabel-asterisk': { color: '#b92b30' },
    '& .MuiOutlinedInput-notchedOutline': { top: 0, '& legend': { display: 'none' } },
  },
};
const sectionLabelSx = {
  fontSize: '12px',
  fontWeight: 800,
  letterSpacing: '1.5px',
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
  mt: '28px',
  mb: '20px',
  pb: '14px',
  borderBottom: '1px solid #ded7c7',
  '& span': { color: '#b92b30', letterSpacing: 0 },
};

function validateRental(form: RentalForm, rooms: CinemaRoom[] = emptyRooms): RentalErrors {
  const errors: RentalErrors = {};
  if (form.name.trim().length < 2 || form.name.trim().length > 150)
    errors.name = 'Nhập họ tên từ 2 đến 150 ký tự.';
  if (!phoneValidation(form.phone)) errors.phone = 'Nhập số điện thoại Việt Nam hợp lệ.';
  if (!emailValidation(form.email)) errors.email = 'Nhập địa chỉ email hợp lệ.';
  if (!form.address.trim() || form.address.trim().length > 150)
    errors.address = 'Nhập địa chỉ liên hệ, tối đa 150 ký tự.';
  if (form.company.trim().length > 150) errors.company = 'Tên tổ chức tối đa 150 ký tự.';
  if (!dateValidation(form.date)) errors.date = 'Chọn hôm nay hoặc một ngày trong tương lai.';
  const guestCount = Number(form.guests);
  if (!/^\d+$/.test(form.guests) || !Number.isSafeInteger(guestCount) || guestCount < 1)
    errors.guests = 'Nhập số khách là số nguyên lớn hơn 0.';
  else if (form.service === 'Group Booking' && guestCount < 20)
    errors.guests = 'Xem phim theo nhóm dành cho ít nhất 20 khách.';
  if (!services.some((service) => service.name === form.service)) errors.service = 'Chọn dịch vụ.';
  if (!cities.includes(form.city)) errors.city = 'Chọn thành phố tổ chức.';
  else if (!roomTypesForCity(rooms, form.city).includes(form.roomType))
    errors.roomType = 'Chọn loại phòng phù hợp với thành phố.';
  if (form.note.length > 2000) errors.note = 'Ghi chú tối đa 2000 ký tự.';
  return errors;
}

const SectionTitle: React.FC<ISectionTitleProps> = ({ children }) => (
  <Box
    sx={{
      display: 'flex',
      gap: { xs: '12px', md: '22px' },
      alignItems: 'center',
      justifyContent: 'center',
      mb: '28px',
    }}
  >
    <Box
      sx={{
        height: '6px',
        borderTop: '1px solid #aaa18c',
        borderBottom: '1px solid #aaa18c',
        flex: 1,
      }}
    />
    <Typography
      component="h2"
      sx={{
        fontSize: { xs: '16px', md: '19px' },
        fontWeight: 700,
        letterSpacing: '1px',
        textAlign: 'center',
        maxWidth: '70%',
      }}
    >
      {children}
    </Typography>
    <Box
      sx={{
        height: '6px',
        borderTop: '1px solid #aaa18c',
        borderBottom: '1px solid #aaa18c',
        flex: 1,
      }}
    />
  </Box>
);

const BookCinemaRoom: React.FC<IBookCinemaRoomProps> = ({ rooms = emptyRooms, onSubmit }) => {
  const [form, setForm] = useState<RentalForm>({ ...emptyForm });
  const [touched, setTouched] = useState<RentalTouched>({});
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const errors = validateRental(form, rooms);
  const roomTypes = roomTypesForCity(rooms, form.city);
  const selectedServiceIndex = services.findIndex((service) => service.name === form.service);
  const selectedService = services[selectedServiceIndex] ?? services[2];
  const updateField = (name: keyof RentalForm, value: string) => {
    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === 'city' ? { roomType: '' } : {}),
    }));
    setSubmitError('');
    setSubmitted(false);
  };
  const getFieldError = (name: keyof RentalForm) =>
    attempted || touched[name] ? errors[name] : undefined;
  const markTouched = (name: keyof RentalForm) => () =>
    setTouched((previous) => ({ ...previous, [name]: true }));
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setAttempted(true);
    setSubmitted(false);
    setSubmitError('');
    const validationErrors = validateRental(form, rooms);
    const firstError = Object.keys(validationErrors)[0];
    if (firstError) {
      document.getElementById(`rental-${firstError}`)?.focus();
      return;
    }
    if (!onSubmit) {
      setSubmitError('Hiện chưa thể gửi yêu cầu. Vui lòng thử lại sau.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        name: form.name.trim(),
        phone: form.phone.trim().replace(/[\s.-]/g, ''),
        email: form.email.trim(),
        address: form.address.trim(),
        company: form.company.trim(),
        note: form.note.trim(),
      });
      setSubmitted(true);
    } catch {
      setSubmitError('Không gửi được yêu cầu. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };
  const renderTextField = (
    name: RentalTextField,
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
      sx={fieldSx}
      value={form[name]}
      onChange={(event) => updateField(name, event.target.value)}
      onBlur={markTouched(name)}
      error={!!getFieldError(name)}
      helperText={getFieldError(name)}
      slotProps={{
        inputLabel: type === 'date' ? { shrink: true } : undefined,
        htmlInput: {
          ...(type === 'date' ? { min: localDate(new Date()) } : {}),
          ...(type === 'number' ? { min: 1, step: 1 } : {}),
          maxLength: name === 'email' ? 254 : 150,
        },
      }}
    />
  );
  return (
    <ThemeProvider theme={rentalTheme}>
      <CssBaseline />
      <Box component="main" sx={{ minHeight: '100vh', bgcolor: '#fbf9ef', color: '#38342e' }}>
        <Container maxWidth={false} sx={{ maxWidth: '1100px', pt: '40px', pb: '70px' }}>
          <Box sx={{ textAlign: 'center', mb: '36px' }}>
            <Typography sx={overlineSx}>KHÔNG GIAN ĐIỆN ẢNH, DẤU ẤN RIÊNG</Typography>
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: '28px', md: '36px' },
                fontWeight: 800,
                letterSpacing: '1px',
                lineHeight: 1.25,
                mt: '14px',
                mb: '20px',
              }}
            >
              THUÊ RẠP / SỰ KIỆN
              <br />& VÉ NHÓM
            </Typography>
            <Box sx={{ width: '64px', height: '3px', bgcolor: '#b92b30', mx: 'auto' }} />
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1.1fr' },
              gap: { xs: '22px', md: '36px' },
              alignItems: 'center',
            }}
          >
            <Box
              component="img"
              src="/images/usth-auditorium.png"
              alt="Không gian phòng chiếu với ghế đỏ và màn ảnh lớn"
              sx={{
                width: '100%',
                height: { xs: '240px', md: '320px' },
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <Box>
              <Typography sx={overlineSx}>MÀN ẢNH LỚN. KẾT NỐI THẬT.</Typography>
              <Typography
                component="h2"
                sx={{ fontSize: '25px', lineHeight: 1.4, fontWeight: 700, mt: '10px', mb: '16px' }}
              >
                Biến buổi gặp gỡ
                <br />
                thành một sự kiện đáng nhớ.
              </Typography>
              <Typography sx={{ fontSize: '14px', lineHeight: 1.8, color: '#655d50', mb: '12px' }}>
                Bạn muốn thưởng thức một bộ phim thật riêng tư cùng bạn bè, người thân hay đồng
                nghiệp? Hay đang tìm một không gian khác biệt cho sự kiện tiếp theo?
              </Typography>
              <Typography sx={{ fontSize: '14px', lineHeight: 1.8, color: '#655d50' }}>
                Từ buổi chiếu riêng, vé nhóm đến hội thảo và quà tặng doanh nghiệp, hãy cùng USTH
                Cinema lên kế hoạch cho trải nghiệm phù hợp với bạn.
              </Typography>
            </Box>
          </Box>
          <Box sx={{ mt: 6 }}>
            <SectionTitle>DỊCH VỤ CỦA CHÚNG TÔI</SectionTitle>
            <Tabs
              value={selectedServiceIndex < 0 ? false : selectedServiceIndex}
              onChange={(_, index: number) => updateField('service', services[index].name)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              aria-label="Các dịch vụ thuê rạp"
              sx={{
                borderBottom: '1px solid #cec5b1',
                '& .MuiTab-root': {
                  flex: 1,
                  minWidth: '160px',
                  textTransform: 'none',
                  minHeight: '78px',
                  bgcolor: '#eeeadf',
                  mr: '4px',
                  gap: '6px',
                },
                '& .Mui-selected': { bgcolor: '#fffdf7' },
              }}
            >
              {services.map((service, index) => (
                <Tab
                  key={service.name}
                  id={`service-tab-${index}`}
                  aria-controls={`service-panel-${index}`}
                  label={
                    <>
                      <Box component="strong" sx={{ fontSize: '14px' }}>
                        {service.name}
                      </Box>
                      <Box component="span" sx={{ fontSize: '10px' }}>
                        {service.subtitle}
                      </Box>
                    </>
                  }
                />
              ))}
            </Tabs>
            <Box
              role="tabpanel"
              id={`service-panel-${selectedServiceIndex}`}
              aria-labelledby={`service-tab-${selectedServiceIndex}`}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' },
                gap: '32px',
                p: { xs: '24px', md: '32px' },
                bgcolor: '#f4f0e4',
                border: '1px solid #e1d9c7',
                borderTop: 0,
                minHeight: '365px',
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography sx={overlineSx}>{selectedService.name}</Typography>
                <Typography
                  component="h3"
                  sx={{
                    fontSize: { xs: '21px', md: '23px' },
                    lineHeight: 1.4,
                    fontWeight: 800,
                    my: '12px',
                  }}
                >
                  {selectedService.heading}
                </Typography>
                <Typography sx={{ fontSize: '13px', lineHeight: 1.8, color: '#655d50' }}>
                  {selectedService.description}
                </Typography>
                <Box component="ul" sx={{ listStyle: 'none', p: 0, mt: '18px', mb: '22px' }}>
                  {selectedService.benefits.map((benefit) => (
                    <Box
                      component="li"
                      key={benefit}
                      sx={{ fontSize: '12px', my: '9px', color: '#655d50' }}
                    >
                      {benefit}
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box
                component="img"
                src={selectedService.image}
                alt="Không gian phòng chiếu"
                sx={{ width: '100%', height: { xs: '220px', md: '260px' }, objectFit: 'cover' }}
              />
            </Box>
          </Box>
          <Box component="section" id="rental-form" sx={{ pt: '48px', scrollMarginTop: '25px' }}>
            <SectionTitle>ĐĂNG KÝ THUÊ RẠP</SectionTitle>
            <Typography
              sx={{ textAlign: 'center', color: '#7d7364', fontSize: '14px', mb: '24px' }}
            >
              Chia sẻ kế hoạch của bạn. Chúng tôi sẽ cùng bạn tìm ra không gian phù hợp.
            </Typography>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ maxWidth: '820px', mx: 'auto' }}
            >
              <Box
                component="fieldset"
                disabled={submitting}
                sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
              >
                <Box sx={sectionLabelSx}>
                  <span>01</span> THÔNG TIN LIÊN HỆ
                </Box>
                <Box sx={formGridSx}>
                  {renderTextField('name', 'Họ và tên')}
                  {renderTextField('phone', 'Số điện thoại', 'tel')}
                  {renderTextField('email', 'Email', 'email')}
                  {renderTextField('company', 'Công ty / Tổ chức', 'text', false)}
                  {renderTextField('address', 'Địa chỉ liên hệ')}
                </Box>
                <Box sx={sectionLabelSx}>
                  <span>02</span> KẾ HOẠCH CỦA BẠN
                </Box>
                <Box sx={formGridSx}>
                  <TextField
                    select
                    fullWidth
                    required
                    sx={fieldSx}
                    id="rental-service"
                    label="Dịch vụ"
                    value={form.service}
                    onChange={(event) => updateField('service', event.target.value)}
                    onBlur={markTouched('service')}
                    error={!!getFieldError('service')}
                    helperText={getFieldError('service')}
                  >
                    {services.map((service) => (
                      <MenuItem key={service.name} value={service.name}>
                        {service.name} — {service.subtitle}
                      </MenuItem>
                    ))}
                  </TextField>
                  {renderTextField('date', 'Ngày dự kiến', 'date')}
                  {renderTextField('guests', 'Số lượng khách', 'number')}
                  <TextField
                    select
                    fullWidth
                    required
                    sx={fieldSx}
                    id="rental-city"
                    label="Thành phố"
                    value={form.city}
                    onChange={(event) => updateField('city', event.target.value)}
                    onBlur={markTouched('city')}
                    error={!!getFieldError('city')}
                    helperText={getFieldError('city')}
                  >
                    {cities.map((city) => (
                      <MenuItem key={city} value={city}>
                        {city}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    fullWidth
                    required
                    sx={fieldSx}
                    id="rental-roomType"
                    label="Loại phòng chiếu"
                    disabled={!form.city || !roomTypes.length}
                    value={roomTypes.includes(form.roomType) ? form.roomType : ''}
                    onChange={(event) => updateField('roomType', event.target.value)}
                    onBlur={markTouched('roomType')}
                    error={!!getFieldError('roomType')}
                    helperText={
                      form.city && !roomTypes.length
                        ? 'Chưa có thông tin loại phòng tại thành phố này.'
                        : getFieldError('roomType')
                    }
                  >
                    {roomTypes.map((roomType) => (
                      <MenuItem key={roomType} value={roomType}>
                        {roomType}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    sx={fieldSx}
                    id="rental-note"
                    label="Chia sẻ thêm về sự kiện của bạn"
                    placeholder="Mục đích tổ chức, khung giờ, yêu cầu trang trí hoặc thiết bị…"
                    value={form.note}
                    onChange={(event) => updateField('note', event.target.value)}
                    onBlur={markTouched('note')}
                    error={!!getFieldError('note')}
                    slotProps={{ htmlInput: { maxLength: 2000 } }}
                    helperText={getFieldError('note') || `${form.note.length}/2000 ký tự`}
                  />
                </Box>
              </Box>
              {attempted && Object.keys(errors).length > 0 && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Vui lòng kiểm tra các mục được đánh dấu trước khi tiếp tục.
                </Alert>
              )}
              {submitError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {submitError}
                </Alert>
              )}
              {submitted && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Yêu cầu đã được gửi.
                </Alert>
              )}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: { xs: 'stretch', md: 'center' },
                  justifyContent: 'space-between',
                  gap: '20px',
                  mt: '28px',
                  '@media (min-width: 701px)': { pl: '35%' },
                }}
              >
                <Typography sx={{ color: '#897e6b', fontSize: '12px' }}>
                  Các trường có dấu * là bắt buộc.
                </Typography>
                <Button
                  size="large"
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                  sx={{ minWidth: '180px', boxShadow: 'none' }}
                >
                  {submitting ? 'Đang gửi…' : 'Gửi yêu cầu'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};
export default BookCinemaRoom;
