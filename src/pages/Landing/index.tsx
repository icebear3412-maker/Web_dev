import React from 'react';

import Header from './header';
import QuickLinks from './common';
import HeroSection from './hero';
import MovieSection from './movie';
import EventSection from './event';
import CinemaRoomBanner from './cinema';
import Partners from './partner';
import Footer from './footer';

const FrontPage: React.FC = () => {
  return (
    <div className="cgv-page">
      <Header />

      <QuickLinks />

      <main>
        <HeroSection />
        <MovieSection />
        <EventSection />
        <CinemaRoomBanner />
        <Partners />
      </main>

      <Footer />
    </div>
  );
};

export default FrontPage;