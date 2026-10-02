export interface Movie {
  id: string;
  title: string;
  title_vn?: string | null;
  age_rating?: string | null;
  poster?: string | null;
  backdrop?: string | null;
  status?: string | null;
  genre?: string | null;
  duration?: number | null;
  synopsis?: string | null;
  base_price?: number | null;
  trailer_url?: string | null;
}

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(
  /\/$/,
  '',
);

export async function fetchMovies(signal?: AbortSignal): Promise<Movie[]> {
  const response = await fetch(`${API_BASE_URL}/movies?status=showing`, { signal });
  if (!response.ok) throw new Error(`Không tải được danh sách phim (${response.status})`);
  const payload = (await response.json()) as { movies?: Movie[] };
  return Array.isArray(payload.movies) ? payload.movies : [];
}

export async function fetchMovie(movieId: string, signal?: AbortSignal): Promise<Movie> {
  const localMovie = (await import('@/services/moviePosters')).getLocalMovie(movieId);
  if (localMovie) return localMovie;
  const response = await fetch(`${API_BASE_URL}/movies/${encodeURIComponent(movieId)}`, { signal });
  if (!response.ok) throw new Error(`Không tải được thông tin phim (${response.status})`);
  const payload = (await response.json()) as { movie?: Movie };
  if (!payload.movie) throw new Error('Không tìm thấy phim.');
  return payload.movie;
}

export interface CinemaRoom {
  id: string;
  room_number: number;
  name: string;
  type: string;
  capacity: number;
  ticket_price: number;
  cinema_name?: string;
}

export async function fetchCinemaRooms(signal?: AbortSignal): Promise<CinemaRoom[]> {
  const response = await fetch(`${API_BASE_URL}/bookings/rooms`, { signal });
  if (!response.ok) throw new Error(`Không tải được thông tin phòng chiếu (${response.status})`);
  const payload = (await response.json()) as { cinema_rooms?: CinemaRoom[] };
  return Array.isArray(payload.cinema_rooms) ? payload.cinema_rooms : [];
}

export interface PublicBooking {
  booking_ref: string;
  status: string;
  total_amount: number;
  show_date: string;
  show_time: string;
  format?: string | null;
  movie_title: string;
  title_vn?: string | null;
  cinema_name?: string | null;
  room_name?: string | null;
  room_number?: number | null;
  seats: Array<{ seat_code: string }>;
}

export async function fetchPublicBooking(
  reference: string,
  signal?: AbortSignal,
): Promise<PublicBooking> {
  const response = await fetch(`${API_BASE_URL}/bookings/check/${encodeURIComponent(reference)}`, {
    signal,
  });
  const payload = (await response.json().catch(() => ({}))) as {
    booking?: PublicBooking;
    error?: string;
  };
  if (!response.ok || !payload.booking) throw new Error(payload.error || 'Không tìm thấy vé.');
  return payload.booking;
}
