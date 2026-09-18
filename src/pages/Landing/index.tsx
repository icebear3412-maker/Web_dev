import React from 'react';

import Header from '@/components/header';
import NavigationBar from '@/components/navigation';
import QuickLinks from '@/components/common';
import HeroSection from '@/components/hero';
import MovieSection from '@/components/movie';
import EventSection from '@/components/event';
import CinemaRoomBanner from '@/components/cinema';
import Partners from '@/components/partner';
import Footer from '@/components/footer';

const FrontPage: React.FC = () => {
  return (
    <div className="cgv-page">
      <Header />

      <NavigationBar />

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
