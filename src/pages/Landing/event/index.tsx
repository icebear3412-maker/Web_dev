import { Box, Card, CardMedia, Container, ThemeProvider, Typography } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

import 'swiper/css';

import curtan from '@/assets/curtan.jpg';
import popcorn from '@/assets/popcorn.jpg';
import seat from '@/assets/seat.jpg';

import type { ICardWithDescription } from '@/types';
import { landingPageTheme, sectionSx, sectionTitleSx } from '@/theme';

const Events: ICardWithDescription[] = [
  { title: 'WEEKEND MOVIE FEST', text: 'Ưu đãi cho hội bạn thân vào cuối tuần.', image: curtan },
  { title: 'MEMBER SPECIAL', text: 'Đặc quyền dành riêng cho thành viên.', image: seat },
  { title: 'COMBO TIME', text: 'Bắp nước ngon hơn khi đi cùng phim hay.', image: popcorn },
];

const EventSection: React.FC = () => {
  return (
    <ThemeProvider theme={landingPageTheme}>
      <Box component="section" sx={sectionSx}>
        <Container>
          <Typography sx={[sectionTitleSx, { mb: 2 }]}>SỰ KIỆN</Typography>

          <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 3500 }}
            spaceBetween={20}
            slidesPerView={2}
            breakpoints={{
              0: { slidesPerView: 1 },
              800: { slidesPerView: 2 },
            }}
          >
            {Events.map((event) => (
              <SwiperSlide key={event.title}>
                <Card sx={{ position: 'relative', overflow: 'hidden', borderRadius: 2 }}>
                  <CardMedia
                    component="img"
                    image={event.image}
                    alt={event.title}
                    sx={{ display: 'block', width: '100%', aspectRatio: '16 / 7', objectFit: 'cover' }}
                  />

                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 'auto 0 0 0',
                      p: 2,
                      color: 'common.white',
                      background: 'linear-gradient(transparent, rgba(0,0,0,.8))',
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, fontSize: 18 }}>{event.title}</Typography>
                    <Typography variant="body2">{event.text}</Typography>
                  </Box>
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default EventSection;
