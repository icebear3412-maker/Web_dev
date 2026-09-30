import assert from 'node:assert/strict';
import test from 'node:test';
import { phoneValidation } from '../src/helpers/phoneValidation';
import { emailValidation } from '../src/helpers/emailValidation';
import { dateValidation } from '../src/helpers/dateValidation';
import { roomTypesForCity } from '../src/shared/cinemaRooms';

test('Vietnamese domestic and international phone forms are accepted', () => {
  for (const value of ['0901234567', '+84 901 234 567', '090-123-4567', '02412345678']) {
    assert.equal(phoneValidation(value), true, value);
  }
});
test('invalid phone prefixes, lengths and characters are rejected', () => {
  for (const value of [
    '',
    '0001234567',
    '0123456789',
    '+840901234567',
    '09012345678',
    'phone0901234567',
  ]) {
    assert.equal(phoneValidation(value), false, value);
  }
});
test('email allows surrounding whitespace and plus addressing', () => {
  assert.equal(emailValidation(' person+tag@example.com '), true);
});
test('malformed email local parts and domains are rejected', () => {
  for (const value of [
    '',
    'bad email',
    'a..b@example.com',
    '.a@example.com',
    'a.@example.com',
    'a@-example.com',
    'a@example..com',
    'a@exa_mple.com',
    'a@@example.com',
    `${'a'.repeat(65)}@example.com`,
  ]) {
    assert.equal(emailValidation(value), false, value);
  }
});
test('date validation checks calendar validity and local today boundary', () => {
  assert.equal(dateValidation('2026-09-30', '2026-09-30'), true);
  assert.equal(dateValidation('2026-09-29', '2026-09-30'), false);
  assert.equal(dateValidation('2028-02-29', '2026-09-30'), true);
  for (const value of ['', '2027-02-29', '2026-09-31', 'not-a-date', '92026-09-25']) {
    assert.equal(dateValidation(value, '2026-09-30'), false, value);
  }
});
test('room types are scoped to city, deduplicated and empty without data', () => {
  const rooms = [
    { id: 'one', room_number: 1, name: 'Room 1', type: 'IMAX', city: 'Hà Nội' },
    { id: 'two', room_number: 2, name: 'Room 2', type: 'IMAX', city: 'Hà Nội' },
    { id: 'three', room_number: 3, name: 'Room 3', type: '4DX', city: 'Đà Nẵng' },
  ];
  assert.deepEqual(roomTypesForCity(rooms, 'Hà Nội'), ['IMAX']);
  assert.deepEqual(roomTypesForCity(rooms, 'Đà Nẵng'), ['4DX']);
  assert.deepEqual(roomTypesForCity(rooms, ''), []);
  assert.deepEqual(roomTypesForCity([], 'Hà Nội'), []);
});
