'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ModeButton } from '@/components/ModeButton';
import { useMode } from '@/lib/mode';
import { THEMES } from '@/lib/themes';
import styles from './ThemeDock.module.css';

/**
 * The floating theme switcher. It takes its colours from variables on the theme's root:
 * --dock-bg, --dock-fg, --dock-accent and --dock-on-accent.
 */
export function ThemeDock({ slug }: { slug: string }) {
  const mode = useMode();
  const [open, setOpen] = useState(false);
  const dock = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  const index = THEMES.findIndex((theme) => theme.slug === slug);
  const previous = THEMES[(index - 1 + THEMES.length) % THEMES.length];
  const next = THEMES[(index + 1) % THEMES.length];

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (!dock.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <div className={styles.dock} ref={dock}>
      <AnimatePresence>
        {open ? (
          <motion.nav
            id="theme-list"
            className={styles.list}
            aria-label="All themes"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            <ol className={styles.items}>
              {THEMES.map((theme, position) => {
                const [background, accent] = mode === 'dark' ? theme.dark : theme.light;
                return (
                  <li key={theme.slug}>
                    <Link
                      className={styles.item}
                      href={`/${theme.slug}`}
                      aria-current={theme.slug === slug ? 'page' : undefined}
                      onClick={() => setOpen(false)}
                    >
                      <span className={styles.swatch} style={{ background }} aria-hidden="true">
                        <span style={{ background: accent }} />
                      </span>
                      <span className={styles.itemText}>
                        <span className={styles.itemName}>
                          {position + 1}. {theme.name}
                        </span>
                        <span className={styles.itemBlurb}>{theme.blurb}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </motion.nav>
        ) : null}
      </AnimatePresence>

      <div className={styles.bar}>
        <Link className={styles.icon} href={`/${previous.slug}`} aria-label={`Previous theme: ${previous.name}`}>
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        <button
          ref={toggle}
          className={styles.current}
          type="button"
          aria-expanded={open}
          aria-controls="theme-list"
          onClick={() => setOpen((value) => !value)}
        >
          <span className={styles.count}>
            {index + 1}/{THEMES.length}
          </span>
          <span className={styles.name}>{THEMES[index].name}</span>
        </button>

        <Link className={styles.icon} href={`/${next.slug}`} aria-label={`Next theme: ${next.name}`}>
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        <ModeButton className={styles.mode} labelClassName={styles.modeLabel} />
      </div>
    </div>
  );
}
