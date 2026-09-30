export interface CinemaRoom {
  id: string;
  room_number: number;
  name: string;
  type: string;
  city: string;
  capacity?: number;
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

export interface IBookCinemaRoomProps {
  rooms?: CinemaRoom[];
  onSubmit?: (form: RentalForm) => Promise<void>;
}
export interface ISectionTitleProps {
  children: string;
}

export type RentalErrors = Partial<Record<keyof RentalForm, string>>;
export type RentalTouched = Partial<Record<keyof RentalForm, boolean>>;
export type RentalTextField =
  'name' | 'phone' | 'email' | 'address' | 'company' | 'date' | 'guests';
