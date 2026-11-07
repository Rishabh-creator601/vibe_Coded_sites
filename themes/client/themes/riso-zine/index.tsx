'use client';

import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import Image from 'next/image';
import type { PointerEvent } from 'react';
import { ReservationForm } from '@/components/ReservationForm';
import { ThemeDock } from '@/components/ThemeDock';
import { bagsLabel, roastDate, rupees } from '@/lib/format';
import type { Content, Photo } from '@/lib/types';
import { useBatch } from '@/lib/useBatch';
import { body, display } from './fonts';
import styles from './styles.module.css';

/** A photo printed in two inks: `tint` for highlights, the page's shadow ink for everything dark. */
function TwoInk({ photo, sizes, tint = 'pink', priority, className = '' }: { photo: Photo; sizes: string; tint?: 'pink' | 'second'; priority?: boolean; className?: string }) {
  return (
    <figure className={`${styles.twoInk} ${className}`} data-tint={tint}>
      <Image src={photo.src} alt={photo.alt} fill sizes={sizes} priority={priority} />
    </figure>
  );
}

/** The second ink sits out of register and drifts into place, then leans toward the pointer. */
function MisprintedTitle({ lines, driftX, driftY }: { lines: string[]; driftX: ReturnType<typeof useSpring>; driftY: ReturnType<typeof useSpring> }) {
  return (
    <h1 className={styles.title}>
      <span className={styles.titleBase}>
        {lines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </span>
      <motion.span
        className={styles.titleOverprint}
        aria-hidden="true"
        initial={{ x: -34, y: 26 }}
        animate={{ x: 0, y: 0 }}
        transition={{ duration: 1.5, ease: [0.2, 0.9, 0.25, 1] }}
      >
        <motion.span className={styles.titleInk} style={{ x: driftX, y: driftY }}>
          {lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </motion.span>
      </motion.span>
    </h1>
  );
}

export default function Theme({ content }: { content: Content }) {
  const batch = useBatch(content);
  const bags = bagsLabel(batch.bagsLeft);
  const calm = useReducedMotion();
  const { brand, hero, coffees, steps, story, photos } = content;

  const pointerX = useMotionValue(5);
  const pointerY = useMotionValue(4);
  const driftX = useSpring(pointerX, { stiffness: 90, damping: 18 });
  const driftY = useSpring(pointerY, { stiffness: 90, damping: 18 });

  const lean = (event: PointerEvent<HTMLElement>) => {
    if (calm || event.pointerType !== 'mouse') return;
    const box = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - box.left) / box.width - 0.5) * 22);
    pointerY.set(((event.clientY - box.top) / box.height - 0.5) * 16);
  };

  return (
    <div className={`${styles.root} ${display.variable} ${body.variable}`}>
      <header className={styles.top}>
        <a className={styles.brand} href="#top">
          {brand.name}
        </a>
        <nav className={styles.nav} aria-label="On this page">
          <a href="#coffees">Coffees</a>
          <a href="#strip">How it works</a>
          <a href="#reserve">Reserve</a>
        </nav>
      </header>

      <main id="top">
        <section className={styles.hero} onPointerMove={lean}>
          <MisprintedTitle lines={hero.lines} driftX={driftX} driftY={driftY} />

          <div className={styles.heroLower}>
            <div className={styles.heroCopy}>
              <p className={styles.lede}>{hero.lede}</p>
              <a className={styles.cta} href="#reserve">
                Reserve a bag
              </a>
            </div>
            <div className={styles.heroPhotoWrap}>
              <span className={styles.heroBlock} aria-hidden="true" />
              <TwoInk photo={photos['pour-over']} sizes="(max-width: 800px) 90vw, 58vw" priority className={styles.heroPhoto} />
              <p className={styles.sticker}>
                <span>Next roast</span>
                <strong>{roastDate(content.batch.nextRoast)}</strong>
                {bags ? <span>{bags}</span> : null}
              </p>
            </div>
          </div>
        </section>

        <section id="coffees" className={styles.coffees}>
          <h2 className={styles.heading}>Four coffees, two inks</h2>
          <ul className={styles.pages}>
            {coffees.map((coffee, index) => (
              <li key={coffee.id} className={styles.page} data-side={index % 2 === 0 ? 'a' : 'b'}>
                <TwoInk photo={photos[coffee.image]} tint={index % 2 === 0 ? 'pink' : 'second'} sizes="(max-width: 700px) 90vw, 44vw" className={styles.pagePhoto} />
                <div className={styles.pageText}>
                  <h3 className={styles.pageName}>
                    <span>{coffee.name}</span>
                  </h3>
                  <p className={styles.pageNotes}>{coffee.notes.join(' / ')}</p>
                  <p>{coffee.description}</p>
                  <dl className={styles.facts}>
                    <div>
                      <dt>From</dt>
                      <dd>{coffee.region}</dd>
                    </div>
                    <div>
                      <dt>Grown at</dt>
                      <dd>{coffee.altitude.toLocaleString('en-IN')} m</dd>
                    </div>
                    <div>
                      <dt>Process</dt>
                      <dd>{coffee.process}</dd>
                    </div>
                    <div>
                      <dt>Roast</dt>
                      <dd>{coffee.roastName}</dd>
                    </div>
                  </dl>
                  <button type="button" className={styles.pageButton} onClick={() => batch.pick(coffee.id)}>
                    Reserve {coffee.name}, {rupees(coffee.price)}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section id="strip" className={styles.strip}>
          <h2 className={styles.heading}>A batch in four panels</h2>
          <ol className={styles.panels}>
            {steps.map((step, index) => (
              <li key={step.title} className={styles.panel}>
                <span className={styles.panelNumber} aria-hidden="true">
                  {index + 1}
                </span>
                <h3 className={styles.panelTitle}>{step.title}</h3>
                <p className={styles.panelWhen}>
                  {step.day}, {step.time}
                </p>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.story}>
          <TwoInk photo={photos[story.image]} tint="second" sizes="(max-width: 800px) 100vw, 60vw" className={styles.storyPhoto} />
          <div className={styles.storyText}>
            <h2 className={styles.heading}>{story.title}</h2>
            {story.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className={styles.collage} aria-label="Photos from the roastery">
          {['cup-tray', 'crema', 'bean-sack', 'iced', 'portafilter'].map((key, index) => (
            <TwoInk key={key} photo={photos[key]} tint={index % 2 === 0 ? 'pink' : 'second'} sizes="(max-width: 700px) 50vw, 25vw" className={styles.collagePhoto} />
          ))}
        </section>

        <section className={styles.coupon}>
          <svg className={styles.scissors} viewBox="0 0 32 24" aria-hidden="true">
            <circle cx="6" cy="6" r="4" />
            <circle cx="6" cy="18" r="4" />
            <path d="M9 8l21 12M9 16 30 4" />
          </svg>
          <div className={styles.couponHead}>
            <h2 className={styles.couponTitle}>Cut here for coffee</h2>
            <p>
              Good for one {content.batch.bagGrams} g bag from the {roastDate(content.batch.nextRoast)} roast. Pay on delivery.
              {bags ? ` ${bags}.` : ''}
            </p>
          </div>
          <ReservationForm content={content} batch={batch} styles={styles} />
        </section>
      </main>

      <footer className={styles.footer}>
        <p>
          Printed in {brand.city} by {brand.fullName}, {brand.neighbourhood}.
        </p>
        <a href={`mailto:${brand.email}`}>{brand.email}</a>
      </footer>

      <ThemeDock slug="riso-zine" />
    </div>
  );
}
