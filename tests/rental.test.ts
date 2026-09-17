import assert from 'node:assert/strict';
import test from 'node:test';
import { emptyForm, validateRental as validate } from '../src/pages/BookCinemaRoom/data';
import { localDate } from '../src/helpers/date';
const locations = { 'Hà Nội': ['Test cinema'] };
const validateRental = (form: Parameters<typeof validate>[0]) => validate(form, locations);
const valid = {
  ...emptyForm,
  name: 'Khách Demo',
  phone: '0901234567',
  email: 'demo@example.com',
  address: 'Hà Nội',
  date: localDate(new Date()),
  guests: '50',
  city: 'Hà Nội',
  cinema: locations['Hà Nội'][0],
};
test('a complete request for today is accepted', () => assert.deepEqual(validateRental(valid), {}));
test('empty form is blocked with errors beside the required fields', () => {
  const errors = validateRental(emptyForm);
  for (const field of ['name', 'phone', 'email', 'address', 'date', 'guests', 'city', 'cinema'])
    assert.ok(errors[field as keyof typeof errors]);
});
test('changing city invalidates a previously selected room', () =>
  assert.ok(validateRental({ ...valid, city: 'Đà Nẵng' }).cinema));
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

test('missing cinema directory cannot accept a request', () => {
  assert.ok(validate(valid, {}).cinema);
});
