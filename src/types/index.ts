import type { FC, ReactNode } from 'react';

interface IDefaultReactProps {
  children: ReactNode;
}

interface IRoute {
  path: string;
  component: FC;
  layout: FC<IDefaultReactProps> | null;
}

interface Screening {
  id: number;
  time: string;
  room: string;
}

interface MovieItem {
  id: number;
  title: string;
  genre: string;
  image: string;
  trailerUrl: string;
  description: string;
  duration: number;
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

export type { IDefaultReactProps, IRoute, Screening, MovieItem, MovieForm };
