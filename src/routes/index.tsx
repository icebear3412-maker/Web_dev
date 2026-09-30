import type { IRoute } from '@/types';
import DefaultLayout from '@/layouts/DefaultLayout';
import LandingPage from '@/pages/Landing';
import BookCinemaRoom from '@/pages/BookCinemaRoom';
import NotFound from '@/pages/NotFound';

const publicRoutes: IRoute[] = [
  { path: '/', component: LandingPage, layout: DefaultLayout },
  { path: '/book-cinema-room', component: BookCinemaRoom, layout: null },
  { path: '*', component: NotFound, layout: null },
];
const privateRoutes: IRoute[] = [];
export { publicRoutes, privateRoutes };
