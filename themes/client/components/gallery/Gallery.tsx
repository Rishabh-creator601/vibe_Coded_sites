'use client';

import { LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ModeButton } from '@/components/ModeButton';
import { CATEGORIES, THEMES, type ThemeCategory, type ThemeInfo } from '@/lib/themes';
import { headline, reading, THEME_FONTS } from './fonts';
import styles from './Gallery.module.css';

const bySlug = (slug: string) => THEMES.find((theme) => theme.slug === slug) as ThemeInfo;
const themeNumber = (slug: string) => THEMES.findIndex((theme) => theme.slug === slug) + 1;

function Arrow({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
      <path
        d={direction === 'left' ? 'M10 3 5 8l5 5' : 'm6 3 5 5-5 5'}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The light and dark screenshots of a theme. CSS shows the one for the current mode. */
function Screenshot({ slug, sizes, priority }: { slug: string; sizes: string; priority?: boolean }) {
  return (
    <>
      <Image className={styles.shotLight} src={`/previews/${slug}-light.jpg`} alt="" fill sizes={sizes} priority={priority} />
      <Image className={styles.shotDark} src={`/previews/${slug}-dark.jpg`} alt="" fill sizes={sizes} />
    </>
  );
}

/** Header links that show which category is on screen. */
function Header() {
  const [current, setCurrent] = useState('top');
  const list = useRef<HTMLUListElement>(null);

  // On a phone the links scroll sideways, so keep the current one in view.
  useEffect(() => {
    const link = list.current?.querySelector<HTMLElement>('[aria-current]');
    if (!link || !list.current) return;
    list.current.scrollTo({ left: link.offsetLeft - list.current.clientWidth / 2 + link.clientWidth / 2 });
  }, [current]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setCurrent(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    ['top', ...CATEGORIES.map((category) => category.id)].forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  const links = [{ id: 'top', name: 'All themes' }, ...CATEGORIES];

  return (
    <header className={styles.header}>
      <a className={styles.brand} href="#top">
        Odd Hour
      </a>
      <nav className={styles.nav} aria-label="Theme categories">
        <LayoutGroup>
          <ul ref={list} className={styles.navList}>
            {links.map((link) => (
              <li key={link.id}>
                <a
                  className={styles.navLink}
                  href={`#${link.id}`}
                  aria-current={current === link.id ? 'true' : undefined}
                  onClick={() => setCurrent(link.id)}
                >
                  {current === link.id ? (
                    <motion.span className={styles.navPill} layoutId="nav-pill" transition={{ type: 'spring', stiffness: 380, damping: 34 }} />
                  ) : null}
                  <span className={styles.navText}>{link.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </LayoutGroup>
      </nav>
      <ModeButton className={styles.mode} />
    </header>
  );
}

/** The large carousel of all ten themes. A new slide develops from cyan into full colour. */
function Featured() {
  const calm = useReducedMotion();
  const [active, setActive] = useState(0);
  const [develops, setDevelops] = useState(0);
  const strip = useRef<HTMLOListElement>(null);
  const theme = THEMES[active];

  const show = useCallback((index: number) => {
    const next = (index + THEMES.length) % THEMES.length;
    setActive(next);
    setDevelops((count) => count + 1);
    const thumb = strip.current?.children[next];
    const list = strip.current;
    // Keeps the chosen thumbnail in the strip's view without moving the page.
    if (thumb instanceof HTMLElement && list) {
      list.scrollTo({ left: thumb.offsetLeft - list.clientWidth / 2 + thumb.clientWidth / 2 });
    }
  }, []);

  // The one movement the page makes unprompted: the first print develops when it opens.
  useEffect(() => setDevelops(1), []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') show(active + 1);
    if (event.key === 'ArrowLeft') show(active - 1);
  };

  return (
    <section id="top" className={styles.hero} aria-labelledby="page-title">
      <div className={styles.heroIntro}>
        <h1 id="page-title" className={styles.title}>
          <span>One page,</span> <span>ten themes</span>
        </h1>
        <p className={styles.lede}>
          The first page of Odd Hour, a fictional coffee roaster, designed ten different ways. Each has a light and a dark
          mode.
        </p>
        <p className={styles.hint}>
          Inside a theme, Back to home at the top left brings you here. The bar at the bottom right moves to the next
          theme.
        </p>
      </div>

      <div className={styles.stage} role="group" aria-roledescription="carousel" aria-label="All themes" onKeyDown={onKeyDown}>
        <div className={styles.printFrame}>
          <div className={styles.print}>
            {THEMES.map((item, index) => (
              <motion.div
                key={item.slug}
                className={styles.printLayer}
                initial={false}
                animate={{ opacity: index === active ? 1 : 0 }}
                transition={{ duration: calm ? 0 : 0.25 }}
              >
                <Screenshot slug={item.slug} sizes="(max-width: 62rem) 92vw, 58vw" priority={index === 0} />
              </motion.div>
            ))}
            {develops > 0 && !calm ? (
              <motion.span
                key={develops}
                className={styles.develop}
                aria-hidden="true"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              />
            ) : null}
          </div>
          <button type="button" className={`${styles.arrow} ${styles.arrowPrevious}`} onClick={() => show(active - 1)} aria-label="Previous theme">
            <Arrow direction="left" />
          </button>
          <button type="button" className={`${styles.arrow} ${styles.arrowNext}`} onClick={() => show(active + 1)} aria-label="Next theme">
            <Arrow direction="right" />
          </button>
        </div>

        <div className={styles.caption}>
          <div className={styles.captionText} aria-live="polite">
            <p className={styles.captionCount}>
              Theme {active + 1} of {THEMES.length}
            </p>
            <p className={`${styles.captionName} ${THEME_FONTS[theme.slug]}`} data-slug={theme.slug}>
              {theme.name}
            </p>
            <p>{theme.blurb}</p>
          </div>
          <Link className={styles.open} href={`/${theme.slug}`}>
            Open {theme.name}
          </Link>
        </div>

        <ol ref={strip} className={styles.strip} aria-label="Choose a theme">
          {THEMES.map((item, index) => (
            <li key={item.slug}>
              <button
                type="button"
                className={styles.thumb}
                aria-label={`Show ${item.name}`}
                aria-current={index === active ? 'true' : undefined}
                title={item.name}
                onClick={() => show(index)}
              >
                <Screenshot slug={item.slug} sizes="120px" />
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** One category: a row of large cards that swipes, with arrows when there is more to see. */
function CategoryRow({ category }: { category: ThemeCategory }) {
  const calm = useReducedMotion();
  const row = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const list = row.current;
    if (!list) return;
    setEdges({
      start: list.scrollLeft <= 1,
      end: list.scrollLeft + list.clientWidth >= list.scrollWidth - 1,
    });
  }, []);

  useEffect(() => {
    const list = row.current;
    if (!list) return;
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(list);
    return () => resize.disconnect();
  }, [measure]);

  const move = (direction: -1 | 1) => {
    const list = row.current;
    const card = list?.firstElementChild;
    if (!list || !(card instanceof HTMLElement)) return;
    list.scrollBy({ left: direction * (card.offsetWidth + 24), behavior: calm ? 'auto' : 'smooth' });
  };

  const fits = edges.start && edges.end;

  return (
    <section id={category.id} className={styles.category} aria-labelledby={`${category.id}-title`}>
      <div className={styles.categoryHead}>
        <div>
          <h2 id={`${category.id}-title`} className={styles.categoryName}>
            {category.name}
          </h2>
          <p className={styles.categoryNote}>{category.description}</p>
        </div>
        {fits ? null : (
          <div className={styles.controls}>
            <button type="button" className={styles.arrow} onClick={() => move(-1)} disabled={edges.start} aria-label={`Earlier in ${category.name}`}>
              <Arrow direction="left" />
            </button>
            <button type="button" className={styles.arrow} onClick={() => move(1)} disabled={edges.end} aria-label={`Later in ${category.name}`}>
              <Arrow direction="right" />
            </button>
          </div>
        )}
      </div>

      <ul ref={row} className={styles.row} data-count={category.slugs.length} onScroll={measure}>
        {category.slugs.map((slug) => {
          const theme = bySlug(slug);
          return (
            <li key={slug} className={styles.card}>
              <Link className={styles.cardLink} href={`/${slug}`}>
                <span className={styles.cardShot}>
                  <Screenshot slug={slug} sizes="(max-width: 40rem) 84vw, 50vw" />
                </span>
                <span className={styles.cardText}>
                  <span className={styles.cardName}>{theme.name}</span>
                  <span className={styles.cardNumber}>Theme {themeNumber(slug)}</span>
                  <span className={styles.cardBlurb}>{theme.blurb}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function Gallery() {
  return (
    <div className={`${styles.root} ${headline.variable} ${reading.variable}`}>
      <Header />
      <main>
        <Featured />
        {CATEGORIES.map((category) => (
          <CategoryRow key={category.id} category={category} />
        ))}
      </main>
    </div>
  );
}
