'use client';

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import Image from 'next/image';
import { Fragment, useEffect, useRef, useState } from 'react';
import { ReservationForm } from '@/components/ReservationForm';
import { ThemeDock } from '@/components/ThemeDock';
import { bagsLabel, roastDate, rupees } from '@/lib/format';
import type { Content } from '@/lib/types';
import { useBatch } from '@/lib/useBatch';
import { fonts } from './fonts';
import styles from './styles.module.css';

const STRIPES = [0, 1, 2, 3, 4];
const STRIPE_CLASS = [styles.stripeA, styles.stripeB, styles.stripeC, styles.stripeD, styles.stripeE];

type Sweep = { cx: number; cy: number; radius: number; gap: number; width: number; bendX: number; bendY: number; left: number; right: number };

/**
 * Five parallel stripes: in from the left, a quarter turn down, then round the photo and off to
 * the right. Offsetting both bends by the stripe width keeps them parallel all the way.
 */
const sweepPaths = ({ cx, cy, radius, gap, width, bendX, bendY, left, right }: Sweep) =>
  STRIPES.map((index) => {
    const around = radius + gap + width * (index + 0.5);
    const x = cx - around;
    const turn = x - bendX;
    return `M${left} ${bendY - turn} H${bendX} A${turn} ${turn} 0 0 1 ${x} ${bendY} V${cy} A${around} ${around} 0 0 0 ${cx} ${cy + around} H${right}`;
  });

const DESKTOP = { width: 30, paths: sweepPaths({ cx: 1010, cy: 400, radius: 250, gap: 10, width: 30, bendX: 470, bendY: 300, left: -40, right: 1480 }) };
const MOBILE = { width: 14, paths: sweepPaths({ cx: 225, cy: 250, radius: 120, gap: 6, width: 14, bendX: 10, bendY: 100, left: -240, right: 640 }) };

/** The second set, behind the gallery: a long S from upper left to lower right. */
const GALLERY_PATHS = STRIPES.map((index) => {
  const y = 80 + 40 * index;
  const turn = 300 - y;
  const x = 520 + turn;
  const back = 900 - x;
  return `M-40 ${y} H520 A${turn} ${turn} 0 0 1 ${x} 300 V330 A${back} ${back} 0 0 0 900 ${330 + back} H1480`;
});

function HeroStripes({ className, viewBox, set }: { className: string; viewBox: string; set: typeof DESKTOP }) {
  const reduce = useReducedMotion();
  return (
    <svg className={className} viewBox={viewBox} aria-hidden="true" fill="none">
      {set.paths.map((d, index) => (
        <motion.path
          key={d}
          d={d}
          className={STRIPE_CLASS[index]}
          strokeWidth={set.width + 0.5}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={reduce ? { duration: 0 } : { duration: 1.9, delay: 0.1 + index * 0.13, ease: [0.65, 0, 0.35, 1] }}
        />
      ))}
    </svg>
  );
}

function ScrollStripe({ d, index, progress, still }: { d: string; index: number; progress: MotionValue<number>; still: boolean }) {
  const drawn = useTransform(progress, [index * 0.05, 0.75 + index * 0.05], [0, 1]);
  return <motion.path d={d} className={STRIPE_CLASS[index]} strokeWidth={40.5} style={{ pathLength: still ? 1 : drawn }} />;
}

export default function Theme({ content }: { content: Content }) {
  const batch = useBatch(content);
  const reduce = useReducedMotion();
  // Only after mount, so the server's HTML and the first client render match.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const gallery = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: gallery, offset: ['start 0.95', 'end 0.55'] });
  const bags = bagsLabel(batch.bagsLeft);
  const date = roastDate(content.batch.nextRoast);
  const photo = (key: string) => content.photos[key];

  return (
    <div className={`${styles.root} ${fonts}`}>
      {/* Without scripts the stripes would stay undrawn, so show them whole. */}
      <noscript>
        <style>{`${STRIPE_CLASS.map((name) => `.${name}`).join(',')}{stroke-dasharray:none !important}`}</style>
      </noscript>

      <header className={styles.nav}>
        <a className={styles.brand} href="#top">
          {content.brand.name}
        </a>
        <nav aria-label="Main">
          <ul className={styles.navLinks}>
            <li>
              <a href="#coffees">Coffees</a>
            </li>
            <li>
              <a href="#steps">How it runs</a>
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

      <main id="top">
        <section className={styles.hero}>
          <div className={styles.heroArt}>
            <HeroStripes className={styles.stripesWide} viewBox="0 0 1440 820" set={DESKTOP} />
            <HeroStripes className={styles.stripesNarrow} viewBox="0 0 390 450" set={MOBILE} />
            <div className={styles.heroPhoto}>
              <Image
                src={photo('cup-peach').src}
                alt={photo('cup-peach').alt}
                fill
                priority
                sizes="(max-width: 62.5rem) min(62vw, 24rem), 35vw"
              />
            </div>
            <div className={styles.sticker}>
              <span>Next roast</span>
              <strong>{date}</strong>
              {bags ? <span>{bags}</span> : null}
            </div>
          </div>
          <div className={styles.heroText}>
            <h1 className={styles.title}>
              {content.hero.lines.map((line) => (
                <span key={line}>
                  {line.split(' ').map((chunk, index) => (
                    <Fragment key={chunk}>
                      {index > 0 ? ' ' : ''}
                      {/* Shrikhand's non-breaking space is too wide, so a plain space is held together instead. */}
                      <span className={styles.keep}>{chunk.replace(/ /g, ' ')}</span>
                    </Fragment>
                  ))}
                </span>
              ))}
            </h1>
            <p className={styles.lede}>{content.hero.lede}</p>
            <a className={styles.heroLink} href="#reserve">
              Reserve a bag
            </a>
          </div>
        </section>

        <section id="coffees" className={styles.coffees}>
          <h2 className={styles.sectionTitle}>Four coffees this roast</h2>
          <ul className={styles.capsules}>
            {content.coffees.map((coffee) => (
              <li key={coffee.id} className={styles.capsule}>
                <div className={styles.capsulePhoto}>
                  <Image src={photo(coffee.image).src} alt={photo(coffee.image).alt} fill sizes="(max-width: 48rem) 12rem, 15rem" />
                </div>
                <div className={styles.capsuleMain}>
                  <h3 className={styles.coffeeName}>{coffee.name}</h3>
                  <p className={styles.region}>{coffee.region}</p>
                  <p className={styles.description}>{coffee.description}</p>
                </div>
                <dl className={styles.facts}>
                  <div>
                    <dt>Altitude</dt>
                    <dd>{coffee.altitude} m</dd>
                  </div>
                  <div>
                    <dt>Process</dt>
                    <dd>{coffee.process}</dd>
                  </div>
                  <div>
                    <dt>Roast</dt>
                    <dd>{coffee.roastName}</dd>
                  </div>
                  <div>
                    <dt>Notes</dt>
                    <dd>{coffee.notes.join(', ')}</dd>
                  </div>
                </dl>
                <div className={styles.capsuleBuy}>
                  <p className={styles.price}>{rupees(coffee.price)}</p>
                  <button type="button" className={styles.buy} onClick={() => batch.pick(coffee.id)}>
                    Reserve {coffee.name}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section ref={gallery} className={styles.gallery} aria-label="Photographs from the roastery">
          <svg className={styles.galleryStripes} viewBox="0 0 1440 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true" fill="none">
            {GALLERY_PATHS.map((d, index) => (
              <ScrollStripe key={d} d={d} index={index} progress={scrollYProgress} still={mounted && Boolean(reduce)} />
            ))}
          </svg>
          <div className={styles.pills}>
            {['iced', 'portafilter', 'crema', 'tool-flatlay', 'cup-tray'].map((key) => (
              <figure key={key} className={styles.pill}>
                <Image src={photo(key).src} alt={photo(key).alt} fill sizes="(max-width: 48rem) 18vw, 14rem" />
              </figure>
            ))}
          </div>
        </section>

        <section id="steps" className={styles.steps}>
          <h2 className={styles.sectionTitle}>From Tuesday to your table</h2>
          <ol className={styles.stepList}>
            {content.steps.map((step) => (
              <li key={step.title} className={styles.step}>
                <svg className={styles.stepArcs} viewBox="0 0 200 104" aria-hidden="true" fill="none">
                  <path d="M12 104a88 88 0 0 1 176 0" />
                  <path d="M34 104a66 66 0 0 1 132 0" />
                  <path d="M56 104a44 44 0 0 1 88 0" />
                </svg>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepTime}>
                  {step.day}, {step.time.toLowerCase()}
                </p>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="story" className={styles.story}>
          <div className={styles.storyPhotos}>
            <div className={styles.storyCircle}>
              <Image src={photo(content.story.image).src} alt={photo(content.story.image).alt} fill sizes="(max-width: 56rem) 70vw, 30rem" />
            </div>
            <div className={styles.storyPill}>
              <Image src={photo(content.story.imageTwo).src} alt={photo(content.story.imageTwo).alt} fill sizes="(max-width: 56rem) 30vw, 12rem" />
            </div>
          </div>
          <div className={styles.storyText}>
            <h2 className={styles.sectionTitle}>{content.story.title}</h2>
            {content.story.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelIntro}>
            <h2 className={styles.panelTitle}>Reserve a bag</h2>
            <p>
              From the {date} roast. {content.batch.bagGrams} grams, paid on delivery.
            </p>
            {bags ? <p className={styles.panelBags}>{bags}</p> : null}
          </div>
          <ReservationForm content={content} batch={batch} styles={styles} />
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerBands} aria-hidden="true">
          {STRIPES.map((index) => (
            <span key={index} />
          ))}
        </div>
        <div className={styles.footerText}>
          <p className={styles.footerName}>{content.brand.fullName}</p>
          <p>
            {content.brand.neighbourhood}, {content.brand.city}
          </p>
          <p>
            <a href={`mailto:${content.brand.email}`}>{content.brand.email}</a>
          </p>
        </div>
      </footer>

      <ThemeDock slug="supergraphic" />
    </div>
  );
}
