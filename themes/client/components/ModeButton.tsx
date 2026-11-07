'use client';

import type { MouseEvent } from 'react';
import { setMode, useMode } from '@/lib/mode';

/** Switches light and dark. The new palette spreads out from the button. */
export function ModeButton({ className, labelClassName }: { className?: string; labelClassName?: string }) {
  const mode = useMode();
  const nextMode = mode === 'dark' ? 'light' : 'dark';

  const switchMode = (event: MouseEvent<HTMLButtonElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    setMode(nextMode, box.left + box.width / 2, box.top + box.height / 2);
  };

  return (
    <button
      className={className}
      type="button"
      onClick={switchMode}
      aria-label={`Switch to ${nextMode} mode`}
      title={`Switch to ${nextMode} mode`}
    >
      <svg
        viewBox="0 0 16 16"
        width="16"
        height="16"
        aria-hidden="true"
        style={{ transform: mode === 'dark' ? 'rotate(180deg)' : undefined }}
      >
        <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 1.5a6.5 6.5 0 0 1 0 13z" fill="currentColor" />
      </svg>
      <span className={labelClassName}>{nextMode === 'dark' ? 'Dark' : 'Light'}</span>
    </button>
  );
}
