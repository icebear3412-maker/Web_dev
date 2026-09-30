import { Box, Container, Typography } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import type SwiperCore from 'swiper';
import { Autoplay } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';

import 'swiper/css';

import eventOne from '@/assets/event/240x201_14_.png';
import eventTwo from '@/assets/event/birthday_popcorn_box_240x201.png';
import eventThree from '@/assets/event/n_o-hoan-ve-240x201.jpg';
import eventFour from '@/assets/event/onl_n_o_240x201_6_.png';
import eventFive from '@/assets/event/online_package_240x201_1_.png';
import { clickableSx } from '@/theme';
import type { ICardWithDescription } from '@/types';

export const Events: ICardWithDescription[] = [
  { image: eventOne, title: 'Ưu đãi thành viên CGV', text: 'Khám phá các ưu đãi dành cho thành viên.', linkTo: '/events/uu-dai-thanh-vien' },
  { image: eventTwo, title: 'Quà tặng sinh nhật', text: 'Ưu đãi sinh nhật dành cho thành viên CGV.', linkTo: '/events/qua-tang-sinh-nhat' },
  { image: eventThree, title: 'Ưu đãi hoàn vé', text: 'Cập nhật chương trình ưu đãi tại CGV.', linkTo: '/events/uu-dai-hoan-ve' },
  { image: eventFour, title: 'Ưu đãi CGV', text: 'Ưu đãi mới nhất từ CGV.', linkTo: '/events/uu-dai-cgv' },
  { image: eventFive, title: 'Online Package', text: 'Đặt bắp nước tiện lợi qua mạng.', linkTo: '/events/online-package' },
];

const EventSection: React.FC = () => {
  const navigate = useNavigate();
  const swiperRef = useRef<SwiperCore | null>(null);

  return (
    <section className="event-section cgv-event-section" id="member-events">
      <Container maxWidth="lg">
        <Typography className="section-title cgv-event-title">EVENT</Typography>
        <Box className="event-carousel-wrap event-carousel-slider">
          <Swiper
            modules={[Autoplay]}
            onSwiper={(swiper) => { swiperRef.current = swiper; }}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            loop
            spaceBetween={8}
            slidesPerView={4}
            breakpoints={{ 0: { slidesPerView: 1 }, 560: { slidesPerView: 2 }, 850: { slidesPerView: 3 }, 1100: { slidesPerView: 4 } }}
          >
            {Events.map((event) => (
              <SwiperSlide key={event.linkTo}>
                <Box
                  component="button"
                  className="cgv-event-banner event-carousel-banner"
                  sx={clickableSx}
                  onClick={() => navigate(event.linkTo)}
                  aria-label={event.title}
                >
                  <img src={event.image} alt={event.title} />
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
          <button className="event-round-arrow event-round-arrow-prev" type="button" aria-label="Sự kiện trước" onClick={() => swiperRef.current?.slidePrev()}><span>‹</span></button>
          <button className="event-round-arrow event-round-arrow-next" type="button" aria-label="Sự kiện tiếp theo" onClick={() => swiperRef.current?.slideNext()}><span>›</span></button>
        </Box>
      </Container>
    </section>
  );
};

export default EventSection;
