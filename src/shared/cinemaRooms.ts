// Frontend view data: map the backend city_id to its city name when integrating the API.
export const cities = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng'];
export interface CinemaRoom {
  id: string;
  room_number: number;
  name: string;
  type: string;
  city: string;
  capacity?: number;
}
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
