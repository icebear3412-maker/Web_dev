import type { IRoute } from '@/types';
import DefaultLayout from '@/layouts/DefaultLayout';
import LandingPage from '@/pages/Landing';
import FilmDetail from '@/pages/FilmDetail';
import BookCinemaRoom from '@/pages/BookCinemaRoom';
import NotFound from '@/pages/NotFound';

const publicRoutes: IRoute[] = [
    { path: '/', component: LandingPage, layout: DefaultLayout },
    { path: '/film/:id', component: FilmDetail, layout: null },
    { path: '/film/:slug/:id', component: FilmDetail, layout: null },
    { path: '/book-cinema-room', component: BookCinemaRoom, layout: null },
    { path: '*', component: NotFound, layout: null },
];
const privateRoutes: IRoute[] = [];
export { publicRoutes, privateRoutes };
