import { Box, Button, Card, Container, Typography } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import type { IMovieCard } from '@/types';
import { useNavigate } from 'react-router-dom';

const Movies: IMovieCard[] = [
  {
    title: 'The Amazing Spider-man 3',
    age: 16,
    linkTo: '',
    image:
      'https://preview.redd.it/r-i-p-the-amazing-spider-man-3-it-was-supposed-to-come-out-v0-b5vq82ipje481.jpg?auto=webp&s=bb3494bedc087b8862a50bebe6b9b2da20ea87da',
  },
  {
    title: 'MA TÙ',
    age: 16,
    linkTo: '',
    image:
      'https://static-cgv.vncdn.vn/media/catalog/product/cache/1/image/1800x/71252117777b696995f01934522c402d/4/7/470x700-cell.jpg',
  },
  {
    title: 'VÙNG ĐẤT QUỶ DỮ',
    age: 18,
    linkTo: '',
    image:
      'https://static-cgv.vncdn.vn/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/4/7/470x700-residentevil_1.jpg',
  },
  {
    title: 'NGHỈ HÈ SỢ NGHỈ HƯU',
    age: 13,
    linkTo: '',
    image:
      'https://static-cgv.vncdn.vn/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/z/8/z8075966316749_9fe6a8561d68d468b30c090e068011b7.jpg',
  },
  {
    title: 'Chiikawa bí mật đảo người cá',
    age: 12,
    linkTo: '',
    image:
      'https://upload.wikimedia.org/wikipedia/vi/0/07/Chiikawa_movie_poster_Vietnam.jpg?utm_source=vi.wikipedia.org&utm_campaign=index&utm_content=original',
  },
];

const MovieSection: React.FC = () => {
  const navigate = useNavigate();
  return (
    <section className="content-section">
      <Container maxWidth="lg">
        <Box className="section-heading">
          <Typography className="section-title">PHIM ĐANG CHIẾU</Typography>
          <Button className="see-all">XEM TẤT CẢ →</Button>
        </Box>

        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={18}
          slidesPerView={4}
          breakpoints={{
            0: { slidesPerView: 1.2 },
            600: { slidesPerView: 2 },
            900: { slidesPerView: 3 },
            1200: { slidesPerView: 4 },
          }}
        >
          {Movies.map((movie) => (
            <SwiperSlide key={movie.title}>
              <Card className="movie-card">
                <Box
                  className="movie-poster"
                  sx={{
                    backgroundImage: `url(${movie.image})`,
                  }}
                >
                  <span className="age-badge">{movie.age}</span>
                  <Button className="movie-book-button" onClick={() => navigate(movie.linkTo)}>
                    MUA VÉ
                  </Button>
                </Box>

                <Typography className="movie-title">{movie.title}</Typography>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      </Container>
    </section>
  );
};

export default MovieSection;
