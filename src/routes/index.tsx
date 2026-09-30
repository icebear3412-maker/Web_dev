import type { IRoute } from '@/types';

import DefaultLayout from '@/layouts/DefaultLayout';

import LandingPage from '@/pages/Landing';
import MovieDetails from '@/pages/MovieDetails';
import TicketCheck from '@/pages/TicketCheck';
import EventDetails from '@/pages/EventDetails';
import CinemaRooms from '@/pages/CinemaRooms';

const publicRoutes: IRoute[] = [
  { path: '/', component: LandingPage, layout: DefaultLayout },
  { path: '/movies/:movieId', component: MovieDetails, layout: DefaultLayout },
  { path: '/check_ticket', component: TicketCheck, layout: DefaultLayout },
  { path: '/events/:eventSlug', component: EventDetails, layout: DefaultLayout },
  { path: '/cinemas', component: CinemaRooms, layout: DefaultLayout },
  { path: '/rent', component: CinemaRooms, layout: DefaultLayout },
];

const privateRoutes: IRoute[] = [];

export { publicRoutes, privateRoutes };
