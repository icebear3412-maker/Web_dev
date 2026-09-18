import { Box, Card, CardMedia, Container, Typography } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

import 'swiper/css';

interface Event {
  title: string;
  text: string;
  image: string;
}

const events: Event[] = [
  {
    title: 'WEEKEND MOVIE FEST',
    text: 'Ưu đãi cho hội bạn thân vào cuối tuần.',
    image:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1000&q=85',
  },
  {
    title: 'MEMBER SPECIAL',
    text: 'Đặc quyền dành riêng cho thành viên.',
    image:
      'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=1000&q=85',
  },
  {
    title: 'COMBO TIME',
    text: 'Bắp nước ngon hơn khi đi cùng phim hay.',
    image:
      'https://images.unsplash.com/photo-1585647347384-2593bc35786b?auto=format&fit=crop&w=1000&q=85',
  },
];

function EventSection() {
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
          {events.map((event) => (
            <SwiperSlide key={event.title}>
              <Card className="event-card">
                <CardMedia
                  component="img"
                  image={event.image}
                  alt={event.title}
                />

                <Box className="event-overlay">
                  <Typography className="event-title">
                    {event.title}
                  </Typography>

                  <Typography>{event.text}</Typography>
                </Box>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      </Container>
    </section>
  );
}

export default EventSection;