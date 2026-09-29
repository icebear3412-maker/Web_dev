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
import { clickableSx } from '@/theme';

const Slides: ICardWithLink[] = [
  { linkTo: '', image: lenhuong },
  { linkTo: '', image: re },
  { linkTo: '', image: vcb },
];

const Carousel: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box component="section" sx={{ py: { xs: 2, md: 3 } }}>
      <Container maxWidth="xl">
        <Box
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            '& .swiper-button-next, & .swiper-button-prev': { color: 'common.white' },
            '& .swiper-pagination-bullet-active': { bgcolor: 'primary.main' },
          }}
        >
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 4500, disableOnInteraction: false }}
            loop
          >
            {Slides.map((slide) => (
              <SwiperSlide key={slide.image}>
                <Box
                  onClick={() => slide.linkTo && navigate(slide.linkTo)}
                  sx={[
                    clickableSx,
                    {
                      height: { xs: 200, sm: 320, md: 440 },
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundImage: `linear-gradient(90deg, rgba(0,0,0,.82), rgba(0,0,0,.15)), url(${slide.image})`,
                    },
                  ]}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      </Container>
    </Box>
  );
};

export default Carousel;
