import type { IRoute } from '@/types';
import DefaultLayout from '@/layouts/DefaultLayout';
import LandingPage from '@/pages/Landing';
import MovieDetails from '@/pages/MovieDetails';
import TicketCheck from '@/pages/TicketCheck';
import EventDetails from '@/pages/EventDetails';
import CinemaRooms from '@/pages/CinemaRooms';
import SignUpPage from '@/pages/Authentication/SignUp';
import SignInPage from '@/pages/Authentication/SignIn';
import ForgotPasswordPage from '@/pages/Authentication/ForgotPassword';
import BookCinemaRoom from '@/pages/BookCinemaRoom';
import NotFound from '@/pages/NotFound';


const publicRoutes: IRoute[] = [
  { path: '/', component: LandingPage, layout: DefaultLayout },
  { path: '/movies/:movieId', component: MovieDetails, layout: DefaultLayout },
  { path: '/check_ticket', component: TicketCheck, layout: DefaultLayout },
  { path: '/events/:eventSlug', component: EventDetails, layout: DefaultLayout },
  { path: '/cinemas', component: CinemaRooms, layout: DefaultLayout },
  { path: '/rent', component: CinemaRooms, layout: DefaultLayout },
  { path: '/signup', component: SignUpPage, layout: null },
  { path: '/signin', component: SignInPage, layout: null },
  { path: '/forgot-password', component: ForgotPasswordPage, layout: null },
  { path: '/book-cinema-room', component: BookCinemaRoom, layout: null },
  { path: '*', component: NotFound, layout: null },
];

const privateRoutes: IRoute[] = [];
export { publicRoutes, privateRoutes };
