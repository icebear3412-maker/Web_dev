import type { IRoute } from '@/types';

import DefaultLayout from '@/layouts/DefaultLayout';

import LandingPage from '@/pages/Landing';
import SignIn from '@/pages/SignIn';

// Define the pages that anyone can access
const publicRoutes: IRoute[] = [
  {
    path: '',
    component: LandingPage,
    layout: DefaultLayout,
  },
  {
    path: '/signin',
    component: SignIn,
    layout: DefaultLayout,
  },
];

// Define pages that require authentication
const privateRoutes: IRoute[] = [];

export { publicRoutes, privateRoutes };