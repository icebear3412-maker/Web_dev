import type { CinemaRoom, Showtime, FilmDetailData } from '@/types/cinema';
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
