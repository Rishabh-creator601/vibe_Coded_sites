import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateReservation } from '../src/validate.js';

const content = { coffees: [{ id: 'araku-dawn' }], grinds: [{ id: 'whole' }] };
const good = { name: ' Asha ', email: 'Asha@Example.com ', coffee: 'araku-dawn', grind: 'whole' };

test('accepts a good request and normalises it', () => {
  const { valid, value } = validateReservation(good, content);
  assert.equal(valid, true);
  assert.equal(value.name, 'Asha');
  assert.equal(value.email, 'asha@example.com');
});

test('reports every missing field', () => {
  const { valid, errors } = validateReservation({}, content);
  assert.equal(valid, false);
  assert.deepEqual(Object.keys(errors).sort(), ['coffee', 'email', 'grind', 'name']);
});

test('rejects a coffee or grind that is not on offer', () => {
  const { errors } = validateReservation({ ...good, coffee: 'nope', grind: 'nope' }, content);
  assert.ok(errors.coffee);
  assert.ok(errors.grind);
});

test('rejects query operators sent instead of strings', () => {
  const { valid, errors } = validateReservation({ ...good, email: { $ne: null } }, content);
  assert.equal(valid, false);
  assert.ok(errors.email);
});

test('survives a body that is not an object', () => {
  assert.equal(validateReservation(null, content).valid, false);
  assert.equal(validateReservation('text', content).valid, false);
});
