import type { IRoute } from '@/types';

import DefaultLayout from '@/layouts/DefaultLayout';

import LandingPage from '@/pages/Landing';

import SignUpPage from '@/pages/Authentication/SignUp';
import SignInPage from '@/pages/Authentication/SignIn';
import ForgotPasswordPage from '@/pages/Authentication/ForgotPassword';

const publicRoutes: IRoute[] = [
  { path: '/', component: LandingPage, layout: DefaultLayout },
  { path: '/signup', component: SignUpPage, layout: null },
  { path: '/signin', component: SignInPage, layout: null },
  { path: '/forgot-password', component: ForgotPasswordPage, layout: null },
];

const privateRoutes: IRoute[] = [];

export { publicRoutes, privateRoutes };