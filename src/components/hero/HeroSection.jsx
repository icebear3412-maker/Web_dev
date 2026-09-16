import { Box, Button, Container, Typography } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const slides = [
  {
    title: 'LÊN HƯƠNG',
    subtitle: 'Những câu chuyện xứng đáng được nhìn thấy trên màn ảnh lớn.',
    image:
      'https://static-cgv.vncdn.vn/media/banner/cache/1/b58515f018eb873dafa430b6f9ae0c1e/l/e/lenhuong.jpg',
  },
  {
    title: 'ĐẶT VÉ DỄ DÀNG',
    subtitle: 'Chọn bộ phim yêu thích. Đặt vé. Tận hưởng trọn vẹn.',
    image:
      'https://static-cgv.vncdn.vn/media/banner/cache/1/b58515f018eb873dafa430b6f9ae0c1e/v/c/vcb_980x448.jpg',
  },
  {
    title: 'VÙNG ĐẤT QUỶ DỮ',
    subtitle: 'Một phiên bản Resident Evil mới trở lại đầy kịch tính và kinh hoàng.',
    image:
      'https://static-cgv.vncdn.vn/media/banner/cache/1/b58515f018eb873dafa430b6f9ae0c1e/9/8/980x448_67__9.jpg',
  },
];

function HeroSection() {
  return (
    <section className="hero-section">
      <Container maxWidth="xl" className="hero-layout">
        <Box className="side-banner side-banner-left">
          <img
            src="https://static-cgv.vncdn.vn/media/wysiwyg/2026/092026/120wx600h_4_.jpg"
            alt="Lên Hương"
          />
        </Box>

        <Box className="hero-slider">
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            autoplay={{
              delay: 4500,
              disableOnInteraction: false,
            }}
            loop
          >
            {slides.map((slide) => (
              <SwiperSlide key={slide.title}>
                <Box
                  className="hero-slide"
                  sx={{
                    backgroundImage: `linear-gradient(
                      90deg,
                      rgba(0,0,0,.82),
                      rgba(0,0,0,.15)
                    ), url(${slide.image})`,
                  }}
                >
                  <Box className="hero-copy">
                    <Typography className="hero-kicker">NOW SHOWING</Typography>

                    <Typography className="hero-title">{slide.title}</Typography>

                    <Typography className="hero-subtitle">{slide.subtitle}</Typography>

                    <Button className="hero-button">XEM PHIM</Button>
                  </Box>
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>

        <Box className="side-banner side-banner-right">
          <img
            src="https://static-cgv.vncdn.vn/media/wysiwyg/2026/092026/120wx600h_4_.jpg"
            alt="Lên Hương"
          />
        </Box>
      </Container>
    </section>
  );
}

export default HeroSection;
