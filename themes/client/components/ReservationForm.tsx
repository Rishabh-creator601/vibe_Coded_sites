'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState, type FormEvent, type ReactNode } from 'react';
import { roastDate, rupees } from '@/lib/format';
import type { Batch } from '@/lib/useBatch';
import type { Content, Reservation } from '@/lib/types';

type Field = 'name' | 'email' | 'coffee' | 'grind';

type Labels = Partial<Record<Field, string>> & { submit?: string; submitting?: string };

type Props = {
  content: Content;
  batch: Batch;
  /** The theme's CSS module. See the class list in the README. */
  styles: Record<string, string>;
  labels?: Labels;
  /** Replaces the default confirmation, e.g. to print a barcode. */
  renderSuccess?: (reservation: Reservation) => ReactNode;
};

/** The same behaviour in every theme. Each theme styles it through its own CSS module. */
export function ReservationForm({ content, batch, styles, labels = {}, renderSuccess }: Props) {
  const [status, setStatus] = useState<'idle' | 'saving'>('idle');
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<Reservation | null>(null);

  const soldOut = batch.bagsLeft === 0;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setStatus('saving');
    setErrors({});
    setFormError(null);

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        setReservation(result.reservation);
        batch.setBagsLeft(result.bagsLeft);
        return;
      }
      if (typeof result.bagsLeft === 'number') batch.setBagsLeft(result.bagsLeft);
      setErrors(result.errors ?? {});
      setFormError(result.message ?? 'The reservation was not saved. Try again.');
    } catch {
      setFormError('The reservation was not saved because the connection failed. Try again.');
    } finally {
      setStatus('idle');
    }
  }

  const describedBy = (field: Field) => (errors[field] ? `reserve-${field}-error` : undefined);

  const fieldError = (field: Field) =>
    errors[field] ? (
      <p id={`reserve-${field}-error`} className={styles.fieldError}>
        {errors[field]}
      </p>
    ) : null;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {reservation ? (
        <motion.div
          key="done"
          id="reserve"
          className={styles.success}
          role="status"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {renderSuccess ? (
            renderSuccess(reservation)
          ) : (
            <>
              <p className={styles.successTitle}>
                {reservation.coffeeName} reserved for {reservation.name}.
              </p>
              <p className={styles.successBody}>
                It comes from the {roastDate(reservation.batchDate)} roast, ground for{' '}
                {reservation.grindLabel.toLowerCase()}. Pay {rupees(reservation.price)} on delivery. Your code is{' '}
                <strong>{reservation.code}</strong>.
              </p>
            </>
          )}
        </motion.div>
      ) : (
        <motion.form
          key="form"
          id="reserve"
          className={styles.form}
          onSubmit={submit}
          noValidate
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.2 }}
        >
          <div className={styles.field}>
            <label className={styles.label} htmlFor="reserve-name">
              {labels.name ?? 'Your name'}
            </label>
            <input
              id="reserve-name"
              className={styles.input}
              name="name"
              autoComplete="name"
              required
              maxLength={80}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={describedBy('name')}
            />
            {fieldError('name')}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="reserve-email">
              {labels.email ?? 'Email'}
            </label>
            <input
              id="reserve-email"
              className={styles.input}
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={160}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={describedBy('email')}
            />
            {fieldError('email')}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="reserve-coffee">
              {labels.coffee ?? 'Coffee'}
            </label>
            <select
              id="reserve-coffee"
              className={styles.select}
              name="coffee"
              value={batch.coffeeId}
              onChange={(event) => batch.setCoffeeId(event.target.value)}
              aria-invalid={Boolean(errors.coffee)}
              aria-describedby={describedBy('coffee')}
            >
              {content.coffees.map((coffee) => (
                <option key={coffee.id} value={coffee.id}>
                  {coffee.name}, {rupees(coffee.price)}
                </option>
              ))}
            </select>
            {fieldError('coffee')}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="reserve-grind">
              {labels.grind ?? 'Grind'}
            </label>
            <select
              id="reserve-grind"
              className={styles.select}
              name="grind"
              defaultValue={content.grinds[0].id}
              aria-invalid={Boolean(errors.grind)}
              aria-describedby={describedBy('grind')}
            >
              {content.grinds.map((grind) => (
                <option key={grind.id} value={grind.id}>
                  {grind.label}
                </option>
              ))}
            </select>
            {fieldError('grind')}
          </div>

          {formError ? (
            <p className={styles.formError} role="alert">
              {formError}
            </p>
          ) : null}

          <button className={styles.submit} type="submit" disabled={status === 'saving' || soldOut}>
            {soldOut
              ? 'Sold out'
              : status === 'saving'
                ? (labels.submitting ?? 'Reserving...')
                : (labels.submit ?? 'Reserve my bag')}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
