// Dates use a fixed locale and time zone so the server and browser render the same text.
const IST = { timeZone: 'Asia/Kolkata' } as const;

/** "Tuesday 10 November" */
export const roastDate = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', { ...IST, weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(iso));

/** "10 Nov" */
export const roastDateShort = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', { ...IST, day: 'numeric', month: 'short' }).format(new Date(iso));

/** "₹720" */
export const rupees = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

/** "31 bags left", "1 bag left", "Sold out". Null when the count is unknown. */
export const bagsLabel = (bagsLeft: number | null) => {
  if (bagsLeft === null) return null;
  if (bagsLeft === 0) return 'Sold out';
  return `${bagsLeft} ${bagsLeft === 1 ? 'bag' : 'bags'} left`;
};
