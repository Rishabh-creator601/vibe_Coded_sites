'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { ReservationForm } from '@/components/ReservationForm';
import { ThemeDock } from '@/components/ThemeDock';
import { bagsLabel, roastDate, rupees } from '@/lib/format';
import type { Content, Cupping, Photo } from '@/lib/types';
import { useBatch } from '@/lib/useBatch';
import { hand, printed } from './fonts';
import styles from './styles.module.css';

const AXES: (keyof Cupping)[] = ['acidity', 'sweetness', 'body', 'aroma', 'finish'];
const CENTRE = 160;
const RADIUS = 112;

const corner = (axis: number, score: number) => {
  const angle = (axis / AXES.length) * Math.PI * 2 - Math.PI / 2;
  const distance = (score / 5) * RADIUS;
  return {
    x: Math.round((CENTRE + distance * Math.cos(angle)) * 10) / 10,
    y: Math.round((CENTRE + distance * Math.sin(angle)) * 10) / 10,
  };
};

const shape = (scores: (axis: number) => number) =>
  AXES.map((_, axis) => {
    const point = corner(axis, scores(axis));
    return `${point.x},${point.y}`;
  }).join(' ');

/** The flavour chart. Choosing a coffee reshapes the pen line. */
function Radar({ cupping, label }: { cupping: Cupping; label: string }) {
  return (
    <svg className={styles.radar} viewBox="-30 0 380 320" role="img" aria-label={label}>
      {[1, 2, 3, 4, 5].map((ring) => (
        <polygon key={ring} points={shape(() => ring)} className={styles.radarRing} />
      ))}
      {AXES.map((axis, index) => {
        const tip = corner(index, 5);
        const text = corner(index, 5.75);
        return (
          <g key={axis}>
            <line x1={CENTRE} y1={CENTRE} x2={tip.x} y2={tip.y} className={styles.radarRing} />
            <text x={text.x} y={text.y} className={styles.radarLabel} textAnchor="middle" dominantBaseline="middle">
              {axis}
            </text>
          </g>
        );
      })}
      <motion.polygon
        className={styles.radarShape}
        animate={{ points: shape((axis) => cupping[AXES[axis]]) }}
        initial={false}
        transition={{ type: 'spring', stiffness: 130, damping: 14 }}
      />
    </svg>
  );
}

/** A print stuck into the notebook with a strip of tape. */
function Taped({ photo, sizes, tilt, priority, className = '', caption }: { photo: Photo; sizes: string; tilt: number; priority?: boolean; className?: string; caption?: string }) {
  return (
    <figure className={`${styles.print} ${className}`} style={{ rotate: `${tilt}deg` }}>
      <span className={styles.tape} aria-hidden="true" />
      <span className={styles.printImage}>
        <Image src={photo.src} alt={photo.alt} fill sizes={sizes} priority={priority} />
      </span>
      {caption ? <figcaption className={styles.printCaption}>{caption}</figcaption> : null}
    </figure>
  );
}

/** Pen strokes that draw themselves when the page opens. */
const stroke = (calm: boolean | null, delay: number, duration = 0.7) => ({
  initial: { pathLength: 0 },
  animate: { pathLength: 1 },
  transition: calm ? { duration: 0 } : { delay, duration, ease: 'easeInOut' as const },
});

/** Finds "4 a.m." in the headline so the pen can circle it. */
function TitleLine({ line }: { line: string }) {
  const calm = useReducedMotion();
  const match = line.match(/^(.*?)(4\s*a\.m\.)(.*)$/);
  if (!match) return <span className={styles.titleLine}>{line}</span>;
  return (
    <span className={styles.titleLine}>
      {match[1]}
      <span className={styles.circled}>
        {match[2]}
        <svg viewBox="0 0 200 90" preserveAspectRatio="none" aria-hidden="true">
          <motion.path d="M28 16C74 2 168 2 190 32c18 28-40 52-98 52S2 66 8 38C13 18 62 6 132 8" {...stroke(calm, 0.5, 1)} />
        </svg>
      </span>
      {match[3]}
    </span>
  );
}

export default function Theme({ content }: { content: Content }) {
  const batch = useBatch(content);
  const bags = bagsLabel(batch.bagsLeft);
  const calm = useReducedMotion();
  const { brand, hero, coffees, steps, story, photos } = content;
  const [selectedId, setSelectedId] = useState(coffees[0].id);
  const selected = coffees.find((coffee) => coffee.id === selectedId) ?? coffees[0];

  return (
    <div className={`${styles.root} ${hand.variable} ${printed.variable}`}>
      <div className={styles.notebook}>
        <header className={styles.top}>
          <a className={styles.brand} href="#top">
            {brand.name} roastery notebook
          </a>
          <nav className={styles.nav} aria-label="On this page">
            <a href="#scores">Scores</a>
            <a href="#routine">Routine</a>
            <a href="#reserve">Reserve</a>
          </nav>
        </header>

        <main id="top">
          <section className={styles.hero}>
            <div className={styles.heroText}>
              <h1 className={styles.title}>
                {hero.lines.map((line) => (
                  <TitleLine key={line} line={line} />
                ))}
              </h1>
              <p className={styles.lede}>{hero.lede}</p>
              <p className={styles.nextNote}>
                Next roast: {roastDate(content.batch.nextRoast)}
                {bags ? <>, {bags.toLowerCase()}</> : null}
              </p>
              <a className={styles.cta} href="#reserve">
                Reserve a bag
              </a>
            </div>

            <div className={styles.heroPhoto}>
              <Taped photo={photos['pour-over']} sizes="(max-width: 800px) 90vw, 44vw" tilt={2.2} priority />
              <svg className={styles.arrow} viewBox="0 0 120 90" aria-hidden="true">
                <motion.path d="M112 8C86 2 40 14 18 68" {...stroke(calm, 1.4)} />
                <motion.path d="M6 50 16 74 38 60" {...stroke(calm, 2.05, 0.25)} />
              </svg>
              <motion.p className={styles.scribble} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={calm ? { duration: 0 } : { delay: 2.2, duration: 0.3 }}>
                Taste it before the sun comes up
              </motion.p>
            </div>
          </section>

          <section id="scores" className={styles.scores}>
            <h2 className={styles.heading}>This week&rsquo;s scores</h2>

            <div className={styles.tabs} role="group" aria-label="Choose a coffee">
              {coffees.map((coffee) => (
                <button
                  key={coffee.id}
                  type="button"
                  className={styles.tab}
                  aria-pressed={coffee.id === selected.id}
                  onClick={() => setSelectedId(coffee.id)}
                >
                  {coffee.name}
                </button>
              ))}
            </div>

            <div className={styles.scoreCard}>
              <Radar cupping={selected.cupping} label={`Scores for ${selected.name}: ${AXES.map((axis) => `${axis} ${selected.cupping[axis]} of 5`).join(', ')}`} />

              <div className={styles.scoreText} aria-live="polite">
                <h3 className={styles.coffeeName}>{selected.name}</h3>
                <p className={styles.coffeeNotes}>{selected.notes.join(', ')}</p>
                <p>{selected.description}</p>
                <dl className={styles.facts}>
                  <div>
                    <dt>From</dt>
                    <dd>{selected.region}</dd>
                  </div>
                  <div>
                    <dt>Grown at</dt>
                    <dd>{selected.altitude.toLocaleString('en-IN')} m</dd>
                  </div>
                  <div>
                    <dt>Process</dt>
                    <dd>{selected.process}</dd>
                  </div>
                  <div>
                    <dt>Roast</dt>
                    <dd>{selected.roastName}</dd>
                  </div>
                </dl>
                <button type="button" className={styles.reserveButton} onClick={() => batch.pick(selected.id)}>
                  Reserve {selected.name}, {rupees(selected.price)}
                </button>
              </div>

              <Taped key={selected.id} photo={photos[selected.image]} sizes="(max-width: 800px) 70vw, 22vw" tilt={-2.5} className={styles.scorePhoto} />
            </div>
          </section>

          <section id="routine" className={styles.routine}>
            <h2 className={styles.heading}>The routine, every week</h2>
            <ol className={styles.checklist}>
              {steps.map((step) => (
                <li key={step.title} className={styles.check}>
                  <svg className={styles.checkBox} viewBox="0 0 40 40" aria-hidden="true">
                    <rect x="4" y="6" width="28" height="28" rx="2" />
                    <motion.path
                      d="M10 20l8 10L36 4"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true, amount: 0.9 }}
                      transition={{ duration: 0.35 }}
                    />
                  </svg>
                  <div>
                    <h3 className={styles.checkTitle}>
                      {step.title}
                      <span>
                        {step.day}, {step.time}
                      </span>
                    </h3>
                    <p>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.story}>
            <div className={styles.storyText}>
              <h2 className={styles.heading}>{story.title}</h2>
              {story.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className={styles.prints}>
              <Taped photo={photos[story.image]} sizes="(max-width: 800px) 80vw, 30vw" tilt={-1.5} className={styles.printWide} caption="The bar, after the garage" />
              <Taped photo={photos[story.imageTwo]} sizes="(max-width: 800px) 45vw, 18vw" tilt={3} className={styles.printSmall} caption="Green in, brown out" />
              <Taped photo={photos['cup-tray']} sizes="(max-width: 800px) 45vw, 16vw" tilt={-3.5} className={styles.printTall} caption="Seven cups, one morning" />
            </div>
          </section>

          <section className={styles.slip}>
            <div className={styles.slipHead}>
              <h2 className={styles.heading}>Order slip</h2>
              <p>
                For the {roastDate(content.batch.nextRoast)} roast. {content.batch.bagGrams} g bag, pay on delivery.
              </p>
            </div>
            <ReservationForm content={content} batch={batch} styles={styles} />
          </section>
        </main>

        <footer className={styles.footer}>
          <p>
            {brand.fullName}, {brand.neighbourhood}, {brand.city}.
          </p>
          <a href={`mailto:${brand.email}`}>{brand.email}</a>
        </footer>
      </div>

      <ThemeDock slug="cupping-notes" />
    </div>
  );
}
