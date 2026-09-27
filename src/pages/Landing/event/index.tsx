import { Box, Card, CardMedia, Container, Typography } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

import 'swiper/css';

import curtan from '@/assets/curtan.jpg';
import popcorn from '@/assets/popcorn.jpg';
import seat from '@/assets/seat.jpg';

import type { ICardWithDescription } from '@/types';

const Events: ICardWithDescription[] = [
  {
    title: 'WEEKEND MOVIE FEST',
    text: 'Ưu đãi cho hội bạn thân vào cuối tuần.',
    image: curtan,
  },
  {
    title: 'MEMBER SPECIAL',
    text: 'Đặc quyền dành riêng cho thành viên.',
    image: seat,
  },
  {
    title: 'COMBO TIME',
    text: 'Bắp nước ngon hơn khi đi cùng phim hay.',
    image: popcorn,
  },
];

const EventSection: React.FC = () => {
  return (
    <section className="event-section">
      <Container maxWidth="lg">
        <Typography className="section-title">SỰ KIỆN</Typography>

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
              <Card className="event-card">
                <CardMedia component="img" image={event.image} alt={event.title} />

                <Box className="event-overlay">
                  <Typography className="event-title">{event.title}</Typography>

                  <Typography>{event.text}</Typography>
                </Box>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      </Container>
    </section>
  );
};

export default EventSection;
