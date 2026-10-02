# Movie and booking API

The Flask server listens on port `5000`. PostgreSQL is configured with
`DATABASE_URL` (or the `POSTGRES_*` variables), and login requires `JWT_SECRET`.
Apply the schema with `alembic -c alembic.ini upgrade head` before starting the
server.

## Movies

- `GET /movies?status=showing&q=keyword` lists movies. Both query parameters are optional.
- `GET /movies/<movie_id>` returns one movie.
- `POST /movies` creates a movie; `PATCH /movies/<movie_id>` updates supported movie fields.
  Both write operations require an admin bearer token.

## Booking flow

1. `GET /bookings/rooms` lists cinema rooms.
2. `GET /bookings/showtimes?movie_id=<id>&date=YYYY-MM-DD` lists showtimes.
3. `GET /bookings/showtimes/<showtime_id>/seats` returns that room's seats with a `booked` flag.
4. `POST /bookings` creates a booking for the authenticated user. Send
   `{"showtime_id":"...","seat_ids":["..."]}` with an `Authorization: Bearer <token>` header.
5. `GET /bookings` lists the signed-in user's bookings;
   `GET /bookings/<booking_ref>` returns one of their bookings.
6. `GET /bookings/check/<booking_ref>` looks up a ticket by its booking reference for the
   public ticket-check page. Keep the reference private because it grants access to the ticket details.
7. Administrators can list every booking with `GET /bookings/admin`, cancel a booking with
   `DELETE /bookings/admin/<booking_ref>`, and change its seats with
   `PATCH /bookings/admin/<booking_ref>/seats` and `{"seat_ids":["..."]}`. These routes
   require an administrator bearer token. Seat changes must keep the original ticket count.

Administrators create showtimes with `POST /bookings/showtimes` and provision
room seats with `POST /bookings/rooms/<room_number>/seats`, sending
`{"seats":[{"seat_code":"A1","row_label":"A","seat_number":1}]}`.

The current price calculation multiplies `movies.base_price` by the number of
selected seats. Seat category pricing and payment processing are not implemented.

## Login token

`POST /auth/login` accepts `{"email":"...","password":"..."}` and returns
an HS256 access token valid for 30 minutes. Passwords in `users.password` must
be bcrypt hashes. Refresh-token issuance is not implemented in this branch yet.

`GET /auth/me` returns the current account for a bearer token. Admin routes
require both the `admin` role and the `admin@gmail.com` account; registration
always creates regular user accounts.
