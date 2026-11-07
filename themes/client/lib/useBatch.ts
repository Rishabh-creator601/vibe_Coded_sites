'use client';

import { useCallback, useState } from 'react';
import type { Content } from './types';

/**
 * The state a theme shares between its page and its form: the live bag count,
 * and which coffee the form has selected.
 */
export function useBatch(content: Content) {
  const [bagsLeft, setBagsLeft] = useState(content.batch.bagsLeft);
  const [coffeeId, setCoffeeId] = useState(content.coffees[0].id);

  /** Selects a coffee, then takes the visitor to the form. */
  const pick = useCallback((id: string) => {
    setCoffeeId(id);
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('reserve')?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' });
    document.getElementById('reserve-name')?.focus({ preventScroll: true });
  }, []);

  return { bagsLeft, setBagsLeft, coffeeId, setCoffeeId, pick };
}

export type Batch = ReturnType<typeof useBatch>;
