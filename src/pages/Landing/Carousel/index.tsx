import { Box, Container, Typography } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import type { Movie } from '@/services/movies';
import { clickableSx } from '@/theme';

import studioGhibli from '@/assets/banner/studio-ghibli-usth.jpg';
import scotty from '@/assets/banner/scotty-usth.jpg';
import suzume from '@/assets/banner/suzume-usth.jpg';
import moonFestival from '@/assets/banner/moon-festival-usth.jpg';
import battle from '@/assets/banner/980x448_67__15.jpg';
import visa from '@/assets/banner/visa-applepay-usth.jpg';
import bradPitt from '@/assets/banner/copy_of_hob_rollingbanner_980x448.jpg';
import fanC from '@/assets/banner/fan-c-usth.jpg';
import lays from '@/assets/banner/lays-usth.jpg';
import quyetCua from '@/assets/banner/quyetcua.jpg';
import vcb from '@/assets/banner/vnpay-usth.jpg';

interface CarouselProps {
  movies: Movie[];
}

interface CarouselSlide {
  id: string;
  image: string;
  alt: string;
  kind: 'banner' | 'movie';
  title?: string;
}

const BannerSlides: CarouselSlide[] = [
  { id: 'scotty', image: scotty, alt: 'Scotty giải cứu hoàng thượng', kind: 'banner' },
  { id: 'quyet-cua', image: quyetCua, alt: 'Quyết của anh này', kind: 'banner' },
  { id: 'brad-pitt', image: bradPitt, alt: 'Trái tim quái thú', kind: 'banner' },
  {
    id: 'studio-ghibli',
    image: studioGhibli,
    alt: 'Hành trình tìm lại bản thân cùng Studio Ghibli',
    kind: 'banner',
  },
  { id: 'suzume', image: suzume, alt: 'Khóa chặt cửa nào Suzume', kind: 'banner' },
  { id: 'moon-festival', image: moonFestival, alt: 'Ưu đãi Tết Trung thu', kind: 'banner' },
  { id: 'battle', image: battle, alt: 'Vĩnh biệt đại chiến', kind: 'banner' },
  { id: 'visa-apple-pay', image: visa, alt: 'Ưu đãi thanh toán Visa Apple Pay', kind: 'banner' },
  { id: 'fan-c', image: fanC, alt: 'Đặc quyền thành viên Fan C', kind: 'banner' },
  { id: 'lays', image: lays, alt: 'Ưu đãi combo Lays', kind: 'banner' },
  { id: 'vnpay', image: vcb, alt: 'Ưu đãi VNPAY phim', kind: 'banner' },
];

const Carousel: React.FC<CarouselProps> = ({ movies }) => {
  const movieSlides: CarouselSlide[] = movies
    .filter((movie) => Boolean(movie.backdrop))
    .map((movie) => ({
      id: `movie-${movie.id}`,
      image: movie.backdrop as string,
      alt: movie.title_vn || movie.title,
      title: movie.title_vn || movie.title,
      path: `/movies/${encodeURIComponent(movie.id)}`,
      kind: 'movie',
    }));
  const slides = [...BannerSlides, ...movieSlides];

  return (
    <section className="carousel-section">
      <Container maxWidth="lg" className="carousel-layout">
        <Box className="carousel-slider">
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            loop={slides.length > 1}
            speed={650}
          >
            {slides.map((slide) => (
              <SwiperSlide key={slide.id}>
                <Box
                  className={`carousel-slide ${slide.kind === 'movie' ? 'carousel-slide--movie' : ''}`}
                  sx={clickableSx}
                  role="link"
                  tabIndex={0}
                >
                  <img src={slide.image} alt={slide.alt} />
                  {slide.kind === 'movie' && (
                    <Box className="carousel-slide-caption">
                      <Typography className="carousel-slide-type">PHIM ĐANG CHIẾU</Typography>
                      <Typography className="carousel-slide-title">{slide.title}</Typography>
                      <span className="carousel-slide-cta">
                        ĐẶT VÉ NGAY <b>→</b>
                      </span>
                    </Box>
                  )}
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      </Container>
    </section>
  );
};

export default Carousel;
