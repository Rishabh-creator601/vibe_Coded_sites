// Tuesday 04:00 in Bengaluru (UTC+5:30, no daylight saving) is Monday 22:30 UTC.
const ROAST_UTC_DAY = 1;
const ROAST_UTC_HOUR = 22;
const ROAST_UTC_MINUTE = 30;

/** The next roast strictly after `now`, as a Date. */
export function nextRoastDate(now = new Date()) {
  const roast = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), ROAST_UTC_HOUR, ROAST_UTC_MINUTE),
  );
  const daysAhead = (ROAST_UTC_DAY - roast.getUTCDay() + 7) % 7;
  roast.setUTCDate(roast.getUTCDate() + daysAhead);
  if (roast <= now) roast.setUTCDate(roast.getUTCDate() + 7);
  return roast;
}
