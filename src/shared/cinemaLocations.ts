export interface Cinema {
  id: string;
  city: string;
  name: string;
  address?: string;
}
export const cities = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng'];
// Waiting for the group's real cinema directory; do not invent branch locations.
export const cinemas: Cinema[] = [];
