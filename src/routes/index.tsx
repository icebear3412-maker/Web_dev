import type { IRoute } from '@/types';

import DefaultLayout from '@/layouts/DefaultLayout';

import LandingPage from '@/pages/Landing';
import BookingPage from '@/pages/Booking';

const publicRoutes: IRoute[] = [
  {
    path: '/',
    component: LandingPage,
    layout: DefaultLayout,
  },
  {
    path: '/booking/:showtimeId',
    component: BookingPage,
    layout: DefaultLayout,
  },
];

const privateRoutes: IRoute[] = [];

export { publicRoutes, privateRoutes };
