import React from 'react';

import Header from '@/components/header/Header';
import NavigationBar from '@/components/navigation/NavigationBar';
import QuickLinks from '@/components/common/QuickLinks';
import HeroSection from '@/components/hero/HeroSection';
import MovieSection from '@/components/movie/MovieSection';
import EventSection from '@/components/event/EventSection';
import CinemaRoomBanner from '@/components/cinema/CinemaRoomBanner';
import Partners from '@/components/partner/Partners';
import Footer from '@/components/footer/Footer';

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
