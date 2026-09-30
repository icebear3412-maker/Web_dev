import type { IRoute } from '@/types';

import DefaultLayout from '@/layouts/DefaultLayout';

import LandingPage from '@/pages/Landing';
import MovieListPage from '@/pages/Admin/Movies';
const publicRoutes: IRoute[] = [
  {
    path: '/',
    component: LandingPage,
    layout: DefaultLayout,
  },
  {
    path: '/admin/movies',
    component: MovieListPage,
    layout: DefaultLayout,
  },
];

const privateRoutes: IRoute[] = [];

export { publicRoutes, privateRoutes };
