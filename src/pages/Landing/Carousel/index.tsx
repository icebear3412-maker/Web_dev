import { Box, Container } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import lenhuong from '@/assets/banner/lenhuong.jpg';
import re from '@/assets/banner/RE.jpg';
import vcb from '@/assets/banner/vcb.jpg';

import type { ICardWithLink } from '@/types';
import type React from 'react';
import { useNavigate } from 'react-router-dom';

const Slides: ICardWithLink[] = [
  {
    linkTo: '',
    image: lenhuong,
  },
  {
    linkTo: '',
    image: re,
  },
  {
    linkTo: '',
    image: vcb,
  },
];

const Carousel: React.FC = () => {
  const navigate = useNavigate();
  return (
    <section className="hero-section">
      <Container maxWidth="xl" className="hero-layout">
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
            {Slides.map((slide) => (
              <SwiperSlide key={slide.linkTo}>
                <Box
                  onClick={() => navigate(slide.linkTo)}
                  sx={{
                    backgroundImage: `linear-gradient(
                      90deg,
                      rgba(0,0,0,.82),
                      rgba(0,0,0,.15)
                    ), url(${slide.image})`,
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      </Container>
    </section>
  );
};

export default Carousel;
