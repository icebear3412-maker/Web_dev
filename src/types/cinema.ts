import type { ReactNode } from 'react';

export interface CinemaRoom {
  id: string;
  room_number: number;
  name: string;
  type: string;
  city: string;
  capacity?: number;
}
export interface Movie {
  id: string;
  slug?: string;
  title: string;
  poster?: string;
  director?: string;
  cast?: string;
  synopsis?: string;
  duration?: string;
  releaseDate?: string;
  rating?: string;
  genres?: string[];
  trailerUrl?: string;
}
export interface Showtime {
  id: string;
  movie_id: string;
  cinema_room_number: number;
  show_date: string;
  show_time: string;
}
// Frontend input shape, not an assumed backend endpoint or response contract.
export interface FilmDetailData {
  movies: Movie[];
  rooms: CinemaRoom[];
  showtimes: Showtime[];
}
export interface RentalForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  company: string;
  service: string;
  date: string;
  guests: string;
  city: string;
  roomType: string;
  note: string;
}

export interface ICinemaLayoutProps {
  children: ReactNode;
  light?: boolean;
  onLocate?: () => void;
  locating?: boolean;
}
export interface IFilmDetailProps {
  data?: FilmDetailData;
}
export interface IBookCinemaRoomProps {
  rooms?: CinemaRoom[];
}
export interface ISectionTitleProps {
  children: string;
}
