import React from 'react';

import QuickLinks from '@/pages/Landing/QuickLink';
import HeroSection from '@/pages/Landing/Carousel';
import MovieSection from '@/pages/Landing/Movie';
import EventSection from '@/pages/Landing/Event';
import CinemaRoomBanner from '@/pages/Landing/NewOfferBanner';
import PartnerLine from '@/pages/Landing/Partner';

const FrontPage: React.FC = () => {
  return (
    <div className="cgv-page">
      <QuickLinks />
      <HeroSection />
      <MovieSection />
      <EventSection />
      <CinemaRoomBanner />
      <PartnerLine />
    </div>
  );
};

export default FrontPage;
