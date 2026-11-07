'use client';

import { animate, motion, useMotionValue, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useRef, useState, type KeyboardEvent } from 'react';
import { ReservationForm } from '@/components/ReservationForm';
import { ThemeDock } from '@/components/ThemeDock';
import { bagsLabel, roastDate, rupees } from '@/lib/format';
import type { Content } from '@/lib/types';
import { useBatch } from '@/lib/useBatch';
import { fonts } from './fonts';
import styles from './styles.module.css';

/** Five strips, each drawing back toward its own side, starting from the middle. */
const STRIPS = [
  { originX: 0, delay: 0.44 },
  { originX: 0, delay: 0.22 },
  { originX: 0.5, delay: 0 },
  { originX: 1, delay: 0.22 },
  { originX: 1, delay: 0.44 },
];

const RAIL = ['shop-room', 'iced', 'cup-peach', 'portafilter', 'tool-flatlay', 'crema', 'espresso-glass'];

const RAIL_STEP = 360;

export default function Theme({ content }: { content: Content }) {
  const batch = useBatch(content);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const bags = bagsLabel(batch.bagsLeft);
  const date = roastDate(content.batch.nextRoast);
  const photo = (key: string) => content.photos[key];

  const rail = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const railX = useMotionValue(0);

  const onRailKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!rail.current || !track.current) return;
    const furthest = Math.min(0, rail.current.clientWidth - track.current.scrollWidth);
    const targets: Record<string, number> = {
      ArrowRight: railX.get() - RAIL_STEP,
      ArrowLeft: railX.get() + RAIL_STEP,
      Home: 0,
      End: furthest,
    };
    const target = targets[event.key];
    if (target === undefined) return;
    event.preventDefault();
    animate(railX, Math.max(furthest, Math.min(0, target)), reduce ? { duration: 0 } : { duration: 0.45, ease: [0.3, 0, 0.2, 1] });
  };

  return (
    <div className={`${styles.root} ${fonts}`}>
      {/* Without scripts the curtain would never open. */}
      <noscript>
        <style>{`.${styles.curtain}{display:none}`}</style>
      </noscript>

      <aside className={styles.side}>
        <a className={styles.wordmark} href="#top">
          {content.brand.name}
        </a>
        <span className={styles.seal} aria-hidden="true">
          OH
        </span>
      </aside>

      <main id="top" className={styles.main}>
        <header className={styles.nav}>
          <nav aria-label="Main">
            <ul className={styles.navLinks}>
              <li>
                <a href="#coffees">Coffees</a>
              </li>
              <li>
                <a href="#week">The week</a>
              </li>
              <li>
                <a href="#story">Story</a>
              </li>
              <li>
                <a href="#reserve">Reserve</a>
              </li>
            </ul>
          </nav>
        </header>

        <section>
          <div className={styles.heroPhoto}>
            <Image
              src={photo('saucer').src}
              alt={photo('saucer').alt}
              fill
              priority
              sizes="(max-width: 48rem) calc(100vw - 4.5rem), 88vw"
            />
            <div className={styles.curtain} aria-hidden="true">
              {STRIPS.map((strip, index) => (
                <motion.span
                  key={index}
                  className={styles.strip}
                  style={{ originX: strip.originX }}
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={reduce ? { duration: 0 } : { duration: 1.5, delay: 0.35 + strip.delay, ease: [0.76, 0, 0.24, 1] }}
                />
              ))}
            </div>
          </div>
          <div className={styles.heroText}>
            <h1 className={styles.title}>
              {content.hero.lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h1>
            <div className={styles.heroAside}>
              <p>{content.hero.lede}</p>
              <p>
                Next roast {date}.{bags ? ` ${bags}.` : ''}
              </p>
              <p>
                <a className={styles.quietLink} href="#reserve">
                  Reserve a bag
                </a>
              </p>
            </div>
          </div>
        </section>

        <section id="coffees" className={styles.coffees}>
          <div className={styles.list}>
            <h2 className={styles.heading}>Coffee</h2>
            <ul className={styles.rows}>
              {content.coffees.map((coffee, index) => (
                <li
                  key={coffee.id}
                  className={index === active ? styles.rowActive : styles.row}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                >
                  <div className={styles.rowPhoto}>
                    <Image src={photo(coffee.image).src} alt={photo(coffee.image).alt} fill sizes="calc(100vw - 2.5rem)" />
                  </div>
                  <div className={styles.rowHead}>
                    <h3 className={styles.coffeeName}>{coffee.name}</h3>
                    <p className={styles.price}>{rupees(coffee.price)}</p>
                  </div>
                  <p>{coffee.description}</p>
                  <p className={styles.detail}>
                    {coffee.region}. {coffee.altitude} m. {coffee.process}. {coffee.roastName} roast. {coffee.notes.join(', ')}.
                  </p>
                  <button type="button" className={styles.rowButton} onClick={() => batch.pick(coffee.id)}>
                    Reserve {coffee.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.stage}>
            {content.coffees.map((coffee, index) => (
              <motion.div
                key={coffee.id}
                className={styles.stagePhoto}
                initial={false}
                animate={{ opacity: index === active ? 1 : 0 }}
                transition={reduce ? { duration: 0 } : { duration: 0.6, ease: 'easeInOut' }}
              >
                <Image
                  src={photo(coffee.image).src}
                  alt={index === active ? photo(coffee.image).alt : ''}
                  fill
                  sizes="48vw"
                />
              </motion.div>
            ))}
          </div>
        </section>

        <section className={styles.railSection} aria-label="Photographs from the cafe">
          <div
            ref={rail}
            className={styles.rail}
            tabIndex={0}
            role="group"
            aria-label="Photographs. Use the left and right arrow keys to move along them."
            onKeyDown={onRailKey}
          >
            <motion.div
              ref={track}
              className={styles.track}
              drag="x"
              dragConstraints={rail}
              dragElastic={0.06}
              dragMomentum={!reduce}
              style={{ x: railX }}
            >
              {RAIL.map((key) => (
                <figure key={key} className={styles.railPhoto} style={{ aspectRatio: `${photo(key).width} / ${photo(key).height}` }}>
                  <Image src={photo(key).src} alt={photo(key).alt} fill draggable={false} sizes="(max-width: 48rem) 60vw, 40vw" />
                </figure>
              ))}
            </motion.div>
          </div>
          <p className={styles.railHint}>Drag along the photographs, or select them and use the arrow keys.</p>
        </section>

        <section id="week" className={styles.week}>
          <h2 className={styles.heading}>The week</h2>
          <ol className={styles.steps}>
            {content.steps.map((step) => (
              <li key={step.title} className={styles.step}>
                <p className={styles.stepTime}>
                  {step.day}, {step.time.toLowerCase()}
                </p>
                <div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="story" className={styles.story}>
          <div className={styles.storyLarge}>
            <Image src={photo(content.story.image).src} alt={photo(content.story.image).alt} fill sizes="(max-width: 48rem) 100vw, 56vw" />
          </div>
          <div className={styles.storyText}>
            <h2 className={styles.heading}>{content.story.title}</h2>
            {content.story.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <div className={styles.storySmall}>
              <Image src={photo(content.story.imageTwo).src} alt={photo(content.story.imageTwo).alt} fill sizes="(max-width: 48rem) 60vw, 20vw" />
            </div>
          </div>
        </section>

        <section className={styles.reserve}>
          <div>
            <h2 className={styles.heading}>Reserve a bag</h2>
            <p className={styles.reserveNote}>
              From the {date} roast.{bags ? ` ${bags}.` : ''}
            </p>
          </div>
          <ReservationForm content={content} batch={batch} styles={styles} />
        </section>

        <footer className={styles.footer}>
          <p>{content.brand.fullName}</p>
          <p>
            {content.brand.neighbourhood}, {content.brand.city}
          </p>
          <p>
            <a href={`mailto:${content.brand.email}`}>{content.brand.email}</a>
          </p>
        </footer>
      </main>

      <ThemeDock slug="kissa" />
    </div>
  );
}
