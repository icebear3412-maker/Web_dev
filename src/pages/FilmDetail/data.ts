import type { CinemaRoom } from '@/shared/cinemaRooms';
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
// No fallback content: the backend integration must supply real records.
export const emptyFilmData: FilmDetailData = {
  movies: [],
  rooms: [],
  showtimes: [],
};
export function getScreenings(
  movieId: string,
  date: string,
  showtimes: Showtime[],
  rooms: CinemaRoom[],
) {
  return showtimes
    .filter((slot) => slot.movie_id === movieId && slot.show_date === date)
    .flatMap((slot) => {
      const room = rooms.find((item) => item.room_number === slot.cinema_room_number);
      return room ? [{ ...slot, room }] : [];
    });
}
