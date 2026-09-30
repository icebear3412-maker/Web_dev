import type { IRoute } from '@/types';

import DefaultLayout from '@/layouts/DefaultLayout';

import LandingPage from '@/pages/Landing';

const publicRoutes: IRoute[] = [{ path: '/', component: LandingPage, layout: DefaultLayout }];

const privateRoutes: IRoute[] = [];

export { publicRoutes, privateRoutes };
