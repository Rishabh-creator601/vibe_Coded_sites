import assert from 'node:assert/strict';
import { test } from 'node:test';
import { nextRoastDate } from '../src/batch.js';

const IST = { timeZone: 'Asia/Kolkata', weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: false };
const label = (date) => new Intl.DateTimeFormat('en-GB', IST).format(date);

test('the next roast is always Tuesday 04:00 in Bengaluru', () => {
  for (let day = 0; day < 14; day += 1) {
    const now = new Date(Date.UTC(2026, 10, 1 + day, 6));
    assert.equal(label(nextRoastDate(now)), 'Tuesday 04:00');
  }
});

test('one minute before the roast still counts that roast', () => {
  const roast = new Date('2026-11-09T22:30:00.000Z');
  const before = new Date(roast.getTime() - 60_000);
  assert.equal(nextRoastDate(before).toISOString(), roast.toISOString());
});

test('at the moment of the roast, the next batch is a week away', () => {
  const roast = new Date('2026-11-09T22:30:00.000Z');
  assert.equal(nextRoastDate(roast).toISOString(), '2026-11-16T22:30:00.000Z');
});

test('roast dates are stable across a month boundary', () => {
  assert.equal(nextRoastDate(new Date('2026-11-30T23:00:00.000Z')).toISOString(), '2026-12-07T22:30:00.000Z');
});
