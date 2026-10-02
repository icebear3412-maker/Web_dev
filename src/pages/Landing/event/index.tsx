import { Box, Container, Typography } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import type SwiperCore from 'swiper';
import { Autoplay } from 'swiper/modules';
import { useRef } from 'react';

import 'swiper/css';

import eventOne from '@/assets/event/member-offer-usth.jpg';
import eventTwo from '@/assets/event/birthday-offer-usth.jpg';
import eventThree from '@/assets/event/ticket-refund-usth.jpg';
import eventFour from '@/assets/event/fixed-price-offer-usth.jpg';
import eventFive from '@/assets/event/online-package-usth.jpg';
import type { ICardWithDescription } from '@/types';

export const Events: ICardWithDescription[] = [
  {
    image: eventOne,
    title: 'Ưu đãi thành viên USTH',
    text: 'Khám phá các ưu đãi dành cho thành viên.',
    linkTo: '/events/uu-dai-thanh-vien',
  },
  {
    image: eventTwo,
    title: 'Quà tặng sinh nhật',
    text: 'Ưu đãi sinh nhật dành cho thành viên USTH.',
    linkTo: '/events/qua-tang-sinh-nhat',
  },
  {
    image: eventThree,
    title: 'Ưu đãi hoàn vé',
    text: 'Cập nhật chương trình ưu đãi tại USTH.',
    linkTo: '/events/uu-dai-hoan-ve',
  },
  {
    image: eventFour,
    title: 'Ưu đãi USTH',
    text: 'Ưu đãi mới nhất từ USTH.',
    linkTo: '/events/uu-dai-cgv',
  },
  {
    image: eventFive,
    title: 'Online Package',
    text: 'Đặt bắp nước tiện lợi qua mạng.',
    linkTo: '/events/online-package',
  },
];

const EventSection: React.FC = () => {
  const swiperRef = useRef<SwiperCore | null>(null);

  return (
    <section className="event-section cgv-event-section" id="member-events">
      <Container maxWidth="lg">
        <Typography className="section-title cgv-event-title">SỰ KIỆN</Typography>
        <Box className="event-carousel-wrap event-carousel-slider">
          <Swiper
            modules={[Autoplay]}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            loop
            spaceBetween={8}
            slidesPerView={4}
            breakpoints={{
              0: { slidesPerView: 1 },
              560: { slidesPerView: 2 },
              850: { slidesPerView: 3 },
              1100: { slidesPerView: 4 },
            }}
          >
            {Events.map((event) => (
              <SwiperSlide key={event.linkTo}>
                <Box
                  className="cgv-event-banner event-carousel-banner"
                  onClick={(clickEvent) => {
                    clickEvent.preventDefault();
                    clickEvent.stopPropagation();
                  }}
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    draggable={false}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  />
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
          <button
            className="event-round-arrow event-round-arrow-prev"
            type="button"
            aria-label="Sự kiện trước"
            onClick={() => swiperRef.current?.slidePrev()}
          >
            <span>‹</span>
          </button>
          <button
            className="event-round-arrow event-round-arrow-next"
            type="button"
            aria-label="Sự kiện tiếp theo"
            onClick={() => swiperRef.current?.slideNext()}
          >
            <span>›</span>
          </button>
        </Box>
      </Container>
    </section>
  );
};

export default EventSection;
