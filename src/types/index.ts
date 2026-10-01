import type { FC } from 'react';
import type { SvgIconComponent } from '@mui/icons-material';

interface IDefaultReactProps {
  children?: React.ReactNode;
}

interface IRoute {
  path: string;
  component: FC;
  layout: FC<IDefaultReactProps> | null;
}

interface Screening {
  id: string;
  time: string;
  date: string;
  room: string;
}

interface MovieItem {
  id: string;
  title: string;
  genre: string;
  image: string;
  trailerUrl: string;
  description: string;
  duration: string;
  releaseDate: string;
  status: 'Showing' | 'Hidden';
  screenings: Screening[];
}

interface MovieForm {
  title: string;
  genre: string;
  image: string;
  trailerUrl: string;
  description: string;
  duration: number;
  releaseDate: string;
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

export type {
  IDefaultReactProps,
  IRoute,
  Screening,
  MovieItem,
  MovieForm,
  ICardWithLink,
  ICardWithDescription,
  IButtonWithIconAndDisplayText,
};