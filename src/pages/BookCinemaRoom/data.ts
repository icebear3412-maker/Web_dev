import { localDate } from '@/helpers/date';
import { cinemas, cities } from '@/shared/cinemaLocations';
export const services = [
  {
    name: 'Group Booking',
    subtitle: 'Xem phim theo nhóm',
    heading: 'CÙNG NHAU XEM PHIM. CÙNG NHAU KẾT NỐI.',
    description:
      'Một buổi xem phim để cả tập thể thư giãn, chia sẻ cảm xúc và tạo nên những kỷ niệm chung. Lựa chọn phù hợp cho công ty, trường học và những nhóm bạn yêu điện ảnh.',
    benefits: [
      'Dành cho nhóm từ 20 khách',
      'Lựa chọn phim và lịch chiếu phù hợp',
      'Tư vấn chỗ ngồi liền kề cho cả nhóm',
    ],
    image: '/images/usth-auditorium.png',
  },
  {
    name: 'Private Show',
    subtitle: 'Suất chiếu riêng',
    heading: 'MỘT BỘ PHIM. MỘT BUỔI HẸN RIÊNG.',
    description:
      'Dành trọn một suất chiếu cho những người quan trọng. Tổ chức sinh nhật, ngày kỷ niệm hoặc một buổi gặp mặt thật khác biệt trong không gian điện ảnh riêng tư.',
    benefits: [
      'Không gian riêng cho khách mời',
      'Tư vấn thời gian và nội dung chiếu',
      'Có thể kết hợp trang trí và quà tặng',
    ],
    image: '/images/usth-auditorium.png',
  },
  {
    name: 'Hall Rental',
    subtitle: 'Thuê phòng chiếu',
    heading: 'SÂN KHẤU LỚN CHO Ý TƯỞNG CỦA BẠN.',
    description:
      'Biến phòng chiếu thành không gian hội thảo, ra mắt sản phẩm hoặc sự kiện doanh nghiệp. Màn hình lớn và âm thanh sống động giúp mỗi thông điệp để lại dấu ấn.',
    benefits: [
      'Phòng chiếu với màn hình lớn',
      'Hỗ trợ trình chiếu và âm thanh',
      'Bố trí theo nhu cầu của sự kiện',
    ],
    image: '/images/usth-auditorium.png',
  },
  {
    name: 'Ticket Voucher',
    subtitle: 'Vé tặng doanh nghiệp',
    heading: 'TRAO MỘT TẤM VÉ. GỬI NGÀN CẢM XÚC.',
    description:
      'Một món quà thiết thực dành cho khách hàng, đối tác và nhân viên. Người nhận có thể chủ động lựa chọn bộ phim và thời gian yêu thích theo điều kiện của chương trình.',
    benefits: [
      'Phù hợp chương trình tri ân',
      'Tư vấn số lượng theo ngân sách',
      'Thông tin sử dụng được cung cấp rõ ràng',
    ],
    image: '/images/usth-auditorium.png',
  },
  {
    name: 'Gift Card',
    subtitle: 'Thẻ quà tặng',
    heading: 'MÓN QUÀ NHỎ. TRẢI NGHIỆM LỚN.',
    description:
      'Dành tặng một trải nghiệm điện ảnh thay cho lời cảm ơn. Thẻ quà tặng là lựa chọn linh hoạt cho những dịp đặc biệt và hoạt động chăm sóc khách hàng.',
    benefits: [
      'Quà tặng cho nhiều dịp',
      'Linh hoạt theo nhu cầu doanh nghiệp',
      'Được tư vấn trước khi xác nhận',
    ],
    image: '/images/usth-auditorium.png',
  },
];
export interface RentalForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  company: string;
  service: string;
  date: string;
  guests: string;
  city: string;
  cinema: string;
  note: string;
}
export const emptyForm: RentalForm = {
  name: '',
  phone: '',
  email: '',
  address: '',
  company: '',
  service: 'Hall Rental',
  date: '',
  guests: '',
  city: '',
  cinema: '',
  note: '',
};
export const locations: Record<string, string[]> = Object.fromEntries(
  cities.map((city) => [
    city,
    cinemas.filter((cinema) => cinema.city === city).map((cinema) => cinema.name),
  ]),
);
export function validateRental(
  form: RentalForm,
  availableLocations: Record<string, string[]> = locations,
): Partial<Record<keyof RentalForm, string>> {
  const errors: Partial<Record<keyof RentalForm, string>> = {};
  if (form.name.trim().length < 2) errors.name = 'Nhập họ tên từ 2 ký tự.';
  if (!/^(0\d{9}|\+84\d{9})$/.test(form.phone.replace(/[\s.-]/g, '')))
    errors.phone = 'Nhập số điện thoại Việt Nam hợp lệ.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    errors.email = 'Nhập địa chỉ email hợp lệ.';
  if (!form.address.trim()) errors.address = 'Nhập địa chỉ liên hệ.';
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(form.date) ||
    Number.isNaN(Date.parse(form.date)) ||
    new Date(form.date).toISOString().slice(0, 10) !== form.date ||
    form.date < localDate(new Date())
  )
    errors.date = 'Chọn hôm nay hoặc một ngày trong tương lai.';
  const guests = Number(form.guests);
  if (!Number.isInteger(guests) || guests < 1 || guests > 500)
    errors.guests = 'Nhập số khách từ 1 đến 500.';
  else if (form.service === 'Group Booking' && guests < 20)
    errors.guests = 'Xem phim theo nhóm dành cho ít nhất 20 khách.';
  if (!availableLocations[form.city]) errors.city = 'Chọn khu vực tổ chức.';
  if (!availableLocations[form.city]?.includes(form.cinema))
    errors.cinema = 'Chọn cụm rạp phù hợp.';
  if (!services.some((service) => service.name === form.service)) errors.service = 'Chọn dịch vụ.';
  return errors;
}
