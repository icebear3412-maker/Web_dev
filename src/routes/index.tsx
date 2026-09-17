import type { IRoute } from '@/types';

import DefaultLayout from '@/layouts/DefaultLayout';

import LandingPage from '@/pages/Landing';
import FilmPage from '@/pages/Film';

const publicRoutes: IRoute[] = [
  {
    path: '/',
    component: LandingPage,
    layout: DefaultLayout,
  },
  {
    path: '/film/:filmId',
    component: FilmPage,
    layout: DefaultLayout,
  },
];

const privateRoutes: IRoute[] = [];

export { publicRoutes, privateRoutes };