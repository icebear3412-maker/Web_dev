import type { SvgIconComponent } from '@mui/icons-material';

interface IDefaultReactProps {
  children: React.ReactNode;
}

interface IRoute {
  path: string;
  component: React.FC;
  layout: React.FC<IDefaultReactProps> | null;
}

interface ICardWithLink {
  image: string;
  linkTo: string;
}

interface ICardWithDescription {
  title: string;
  text: string;
  image: string;
  linkTo: string;
}

interface IButtonWithIconAndDisplayText {
  display: string;
  link: string;
  icon: SvgIconComponent;
}

interface IMovieCard {
  title: string;
  age: number;
  image: string;
  linkTo: string;
}

interface IRoomDetailResPayload {
  occupiedSeat: string[];
  size: [number, number];
  price: number;
}

interface IMovieShowday {
  date: number[];
}

interface IMovieShowTime {
  time: number[];
}

interface IMovieInfoPayload {
  image: string;
  name: string;
  time: number;
  director: string;
  genre: string;
  actor: string;
  releaseDate: string;
  rating: number;
  subtitle: string;
  description: string;
  trailerLink: string;
}

export type {
  IDefaultReactProps,
  IRoute,
  ICardWithLink,
  ICardWithDescription,
  IMovieCard,
  IButtonWithIconAndDisplayText,
  IRoomDetailResPayload,
  IMovieInfoPayload,
  IMovieShowTime,
  IMovieShowday,
};
