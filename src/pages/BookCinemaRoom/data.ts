import type { RentalForm } from '@/types/cinema';

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
  roomType: '',
  note: '',
};
