import { roomTypesForCity } from '../src/shared/cinemaRooms';
import { getScreenings } from '../src/pages/FilmDetail/data';
import assert from 'node:assert/strict';
import test from 'node:test';
import { emptyForm, validateRental as validate } from '../src/pages/BookCinemaRoom/data';
import { localDate } from '../src/helpers/date';
const rooms = [
  { id: 'test-room', room_number: 1, name: 'Test room', type: 'IMAX', city: 'Hà Nội' },
];
const validateRental = (form: Parameters<typeof validate>[0]) => validate(form, rooms);
const valid = {
  ...emptyForm,
  name: 'Khách Demo',
  phone: '0901234567',
  email: 'demo@example.com',
  address: 'Hà Nội',
  date: localDate(new Date()),
  guests: '50',
  city: 'Hà Nội',
  roomType: 'IMAX',
};
test('a complete request for today is accepted', () => assert.deepEqual(validateRental(valid), {}));
test('empty form is blocked with errors beside the required fields', () => {
  const errors = validateRental(emptyForm);
  for (const field of ['name', 'phone', 'email', 'address', 'date', 'guests', 'city', 'roomType'])
    assert.ok(errors[field as keyof typeof errors]);
});
test('changing city invalidates a previously selected room', () =>
  assert.ok(validateRental({ ...valid, city: 'Đà Nẵng' }).roomType));
test('group booking needs 20 people; guest count must be an integer within bounds', () => {
  for (const guests of ['0', '1.5', '501', 'text'])
    assert.ok(validateRental({ ...valid, guests }).guests);
  assert.ok(validateRental({ ...valid, guests: '19', service: 'Group Booking' }).guests);
  assert.equal(
    validateRental({ ...valid, guests: '20', service: 'Group Booking' }).guests,
    undefined,
  );
});
test('past, impossible and malformed dates are rejected', () => {
  for (const date of ['2000-01-01', 'not-a-date', '2099-02-30', '92026-09-25'])
    assert.ok(validateRental({ ...valid, date }).date);
});
test('contact validation rejects malformed values and accepts formatted local phones', () => {
  assert.ok(validateRental({ ...valid, email: 'bad email' }).email);
  assert.ok(validateRental({ ...valid, phone: '123' }).phone);
  assert.equal(validateRental({ ...valid, phone: '+84 901 234 567' }).phone, undefined);
});

test('missing rooms cannot accept a rental request', () => {
  assert.ok(validate(valid, []).roomType);
});

test('room types are unique and limited to the selected city', () => {
  assert.deepEqual(
    roomTypesForCity(
      [
        ...rooms,
        { ...rooms[0], id: 'second', room_number: 2 },
        { ...rooms[0], id: 'other-city', room_number: 3, city: 'Đà Nẵng', type: '4DX' },
      ],
      'Hà Nội',
    ),
    ['IMAX'],
  );
  assert.deepEqual(roomTypesForCity(rooms, ''), []);
});
test('same-time screenings retain distinct room and showtime IDs', () => {
  const roomList = [...rooms, { ...rooms[0], id: 'second', room_number: 2 }];
  const slots = [1, 2].map((number) => ({
    id: `slot-${number}`,
    movie_id: 'film',
    cinema_room_number: number,
    show_date: '2026-09-18',
    show_time: '19:00',
  }));
  const result = getScreenings('film', '2026-09-18', slots, roomList);
  assert.deepEqual(
    result.map((slot) => [slot.id, slot.room.id]),
    [
      ['slot-1', 'test-room'],
      ['slot-2', 'second'],
    ],
  );
  assert.deepEqual(getScreenings('different-film', '2026-09-18', slots, roomList), []);
});
