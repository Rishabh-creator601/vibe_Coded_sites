const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Checks a reservation request against the coffees and grinds on offer.
 * Every field must be a string, which also keeps query operators out of MongoDB.
 */
export function validateReservation(body, content) {
  const input = body && typeof body === 'object' ? body : {};
  const text = (value) => (typeof value === 'string' ? value.trim() : '');

  const value = {
    name: text(input.name),
    email: text(input.email).toLowerCase(),
    coffee: text(input.coffee),
    grind: text(input.grind),
  };

  const errors = {};
  if (!value.name) errors.name = 'Enter your name.';
  else if (value.name.length > 80) errors.name = 'Use 80 characters or fewer.';

  if (!EMAIL.test(value.email) || value.email.length > 160) {
    errors.email = 'Enter an email address like you@example.com.';
  }
  if (!content.coffees.some((coffee) => coffee.id === value.coffee)) {
    errors.coffee = 'Choose a coffee.';
  }
  if (!content.grinds.some((grind) => grind.id === value.grind)) {
    errors.grind = 'Choose a grind.';
  }

  return { value, errors, valid: Object.keys(errors).length === 0 };
}
