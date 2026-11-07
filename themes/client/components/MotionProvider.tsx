'use client';

import { MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';

/** Turns off movement for visitors who ask their system to reduce motion. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
