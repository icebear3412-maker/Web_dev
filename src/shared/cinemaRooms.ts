import type { CinemaRoom } from '@/types/cinema';
// Frontend view data: resolve room.cinema_id to cinemas.city when integrating the API.
export const cities = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng'];
export const emptyRooms: CinemaRoom[] = [];
export function roomTypesForCity(rooms: CinemaRoom[], city: string) {
  return [
    ...new Set(
      rooms
        .filter((room) => room.city === city)
        .map((room) => room.type)
        .filter(Boolean),
    ),
  ];
}
