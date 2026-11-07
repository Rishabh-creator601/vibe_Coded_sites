'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { ReservationForm } from '@/components/ReservationForm';
import { ThemeDock } from '@/components/ThemeDock';
import { bagsLabel, roastDate, rupees } from '@/lib/format';
import type { Content, Photo } from '@/lib/types';
import { useBatch } from '@/lib/useBatch';
import { body, display } from './fonts';
import styles from './styles.module.css';

const CENTRE = 300;

/** Polar to chart position, with 0 degrees at the top and rounding that keeps server and browser identical. */
const polar = (degrees: number, radius: number) => {
  const angle = (degrees * Math.PI) / 180;
  return {
    x: Math.round((CENTRE + radius * Math.sin(angle)) * 10) / 10,
    y: Math.round((CENTRE - radius * Math.cos(angle)) * 10) / 10,
  };
};

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const HOUR_LABELS: Record<number, string> = { 0: 'Midnight', 6: '6 a.m.', 12: 'Noon', 18: '6 p.m.' };

// A fixed scatter of faint stars, with size set by position so it never changes between renders.
const STARS = Array.from({ length: 46 }, (_, index) => {
  const point = polar((index * 137.5) % 360, 168 + ((index * 53) % 76));
  return { ...point, size: 0.8 + (index % 4) * 0.45 };
});

// The constellation ends on the 4 a.m. mark, 60 degrees round the dial.
const CONSTELLATION = [
  polar(-138, 214),
  polar(-104, 188),
  polar(-72, 226),
  polar(-34, 196),
  polar(-4, 232),
  polar(30, 200),
  polar(60, 226),
];

const roastPosition = (roast: number) => 8 + ((roast - 1) / 4) * 84;
const altitudePosition = (altitude: number) => 90 - ((altitude - 800) / 800) * 80;

/** The lit part of a moon, where `lit` runs from 0 (new) to 1 (full). Radius 20, centred on 20,20. */
const moonPath = (lit: number) => {
  if (lit >= 1) return 'M20 0a20 20 0 1 1 0 40a20 20 0 1 1 0-40z';
  const width = Math.round(Math.abs(1 - 2 * lit) * 20 * 10) / 10;
  return `M20 0A20 20 0 0 1 20 40A${width} 20 0 0 ${lit > 0.5 ? 1 : 0} 20 0z`;
};
const MOON_PHASES = [0.16, 0.5, 0.82, 1];

function Porthole({ photo, sizes, className = '', priority }: { photo: Photo; sizes: string; className?: string; priority?: boolean }) {
  return (
    <figure className={`${styles.porthole} ${className}`}>
      <Image src={photo.src} alt={photo.alt} fill sizes={sizes} priority={priority} />
    </figure>
  );
}

export default function Theme({ content }: { content: Content }) {
  const batch = useBatch(content);
  const bags = bagsLabel(batch.bagsLeft);
  const calm = useReducedMotion();
  const { scrollY } = useScroll();
  const skyTurn = useTransform(scrollY, [0, 1600], [0, 80]);
  const { brand, hero, coffees, steps, story, photos } = content;

  return (
    <div className={`${styles.root} ${display.variable} ${body.variable}`}>
      <header className={styles.top}>
        <a className={styles.brand} href="#top">
          {brand.name}
        </a>
        <nav className={styles.nav} aria-label="On this page">
          <a href="#coffees">Coffees</a>
          <a href="#steps">How it works</a>
          <a href="#reserve">Reserve</a>
        </nav>
      </header>

      <main id="top">
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <h1 className={styles.title}>
              {hero.lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h1>
            <p className={styles.lede}>{hero.lede}</p>
            <p className={styles.next}>
              Next roast: {roastDate(content.batch.nextRoast)}
              {bags ? <>. {bags}.</> : '.'}
            </p>
            <a className={styles.cta} href="#reserve">
              Reserve a bag
            </a>
          </div>

          <div className={styles.dial}>
            <svg viewBox="0 0 600 600" aria-hidden="true">
              <motion.g style={{ rotate: skyTurn }}>
                <circle cx={CENTRE} cy={CENTRE} r={296} fill="none" />
                {STARS.map((star) => (
                  <circle key={`${star.x}-${star.y}`} cx={star.x} cy={star.y} r={star.size} className={styles.star} />
                ))}
              </motion.g>

              <circle cx={CENTRE} cy={CENTRE} r={296} className={styles.ring} />
              <circle cx={CENTRE} cy={CENTRE} r={272} className={styles.ringThin} />
              <circle cx={CENTRE} cy={CENTRE} r={156} className={styles.ring} />

              {HOURS.map((hour) => {
                const degrees = hour * 15;
                const inner = polar(degrees, hour % 6 === 0 ? 262 : 272);
                const outer = polar(degrees, 296);
                return <line key={hour} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} className={styles.tick} />;
              })}

              {Object.entries(HOUR_LABELS).map(([hour, label]) => {
                const point = polar(Number(hour) * 15, 244);
                return (
                  <text key={hour} x={point.x} y={point.y} className={styles.hourLabel} textAnchor="middle" dominantBaseline="middle">
                    {label}
                  </text>
                );
              })}

              {(() => {
                const point = polar(70, 246);
                return (
                  <text x={point.x} y={point.y} className={styles.fourLabel} textAnchor="middle" dominantBaseline="middle">
                    4 a.m.
                  </text>
                );
              })()}

              <motion.path
                d={`M${CONSTELLATION.map((point) => `${point.x} ${point.y}`).join('L')}`}
                className={styles.constellation}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={calm ? { duration: 0 } : { delay: 1.5, duration: 1.8, ease: 'easeInOut' }}
              />
              {CONSTELLATION.map((point, index) => (
                <motion.circle
                  key={`${point.x}-${point.y}`}
                  cx={point.x}
                  cy={point.y}
                  r={index === CONSTELLATION.length - 1 ? 8 : 4.5}
                  className={styles.constellationStar}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={calm ? { duration: 0 } : { delay: 1.5 + index * 0.26, duration: 0.3 }}
                />
              ))}

              <motion.g initial={{ rotate: 0 }} animate={{ rotate: 60 }} transition={{ duration: 1.7, ease: [0.3, 0, 0.1, 1] }}>
                <circle cx={CENTRE} cy={CENTRE} r={296} fill="none" />
                <line x1={CENTRE} y1={144} x2={CENTRE} y2={4} className={styles.hand} />
                <circle cx={CENTRE} cy={144} r={5} className={styles.handTip} />
              </motion.g>
            </svg>
            <Porthole photo={photos['pour-over']} sizes="(max-width: 900px) 50vw, 340px" className={styles.dialPhoto} priority />
          </div>
        </section>

        <section id="coffees" className={styles.chartSection}>
          <div className={styles.sectionHead}>
            <h2 className={styles.heading}>Tonight&rsquo;s chart</h2>
            <p>Four coffees, plotted by how high they grew and how dark we take them.</p>
          </div>

          {/* The chart triggers the reveal, because a fully clipped line never counts as in view. */}
          <motion.div className={styles.chart} initial="hidden" whileInView="shown" viewport={{ once: true, amount: 0.4 }}>
            <svg className={styles.chartLines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {[20, 40, 60, 80].map((position) => (
                <line key={`x${position}`} x1={position} x2={position} y1={0} y2={100} className={styles.grid} />
              ))}
              {[25, 50, 75].map((position) => (
                <line key={`y${position}`} x1={0} x2={100} y1={position} y2={position} className={styles.grid} />
              ))}
                          </svg>
            <motion.svg
              className={styles.chartLines}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
              variants={{ hidden: { clipPath: 'inset(0 100% 0 0)' }, shown: { clipPath: 'inset(0 0% 0 0)' } }}
              transition={{ duration: 1.6, ease: 'easeInOut' }}
            >
              <polyline
                points={coffees.map((coffee) => `${roastPosition(coffee.roast)},${altitudePosition(coffee.altitude)}`).join(' ')}
                className={styles.chartPath}
              />
            </motion.svg>
            <span className={styles.axisY}>Grown higher</span>
            <span className={styles.axisX}>Roasted darker</span>
            {coffees.map((coffee) => (
              <a
                key={coffee.id}
                href={`#${coffee.id}`}
                className={styles.point}
                data-edge={coffee.roast === 5 ? 'right' : undefined}
                style={{ left: `${roastPosition(coffee.roast)}%`, top: `${altitudePosition(coffee.altitude)}%` }}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 0c1 7 4 10 12 12-8 2-11 5-12 12-1-7-4-10-12-12 8-2 11-5 12-12z" />
                </svg>
                <span>
                  {coffee.name}
                  <small>{coffee.altitude.toLocaleString('en-IN')} m</small>
                </span>
              </a>
            ))}
          </motion.div>

          <ul className={styles.coffees}>
            {coffees.map((coffee) => (
              <li key={coffee.id} id={coffee.id} className={styles.coffee}>
                <Porthole photo={photos[coffee.image]} sizes="(max-width: 600px) 40vw, 180px" className={styles.coffeePhoto} />
                <div>
                  <h3 className={styles.coffeeName}>{coffee.name}</h3>
                  <p className={styles.coffeeMeta}>
                    {coffee.region}. {coffee.altitude.toLocaleString('en-IN')} m, {coffee.process.toLowerCase()}, {coffee.roastName.toLowerCase()} roast.
                  </p>
                  <p className={styles.coffeeNotes}>{coffee.notes.join(', ')}</p>
                  <p>{coffee.description}</p>
                  <button type="button" className={styles.reserveLink} onClick={() => batch.pick(coffee.id)}>
                    Reserve {coffee.name}, {rupees(coffee.price)}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section id="steps" className={styles.steps}>
          <h2 className={styles.heading}>From new moon to full cup</h2>
          <ol className={styles.stepList}>
            {steps.map((step, index) => (
              <li key={step.title}>
                <svg className={styles.moon} viewBox="0 0 40 40" aria-hidden="true">
                  <circle cx="20" cy="20" r="19.5" />
                  <path d={moonPath(MOON_PHASES[index])} />
                </svg>
                <p className={styles.stepWhen}>
                  {step.day}, {step.time}
                </p>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p>{step.body}</p>
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
          <div className={styles.storyPhotos}>
            <Porthole photo={photos[story.image]} sizes="(max-width: 900px) 60vw, 420px" className={styles.storyLarge} />
            <Porthole photo={photos[story.imageTwo]} sizes="(max-width: 900px) 35vw, 240px" className={styles.storySmall} />
          </div>
        </section>

        <section className={styles.sky} aria-label="Photos from the roastery">
          {['crema', 'cup-tray', 'beans-scatter', 'portafilter', 'saucer'].map((key) => (
            <Porthole key={key} photo={photos[key]} sizes="(max-width: 700px) 45vw, 260px" className={styles.skyPhoto} />
          ))}
        </section>

        <section className={styles.reserve}>
          <div>
            <h2 className={styles.heading}>Reserve a bag before the hand reaches four</h2>
            <p>
              The next roast is on {roastDate(content.batch.nextRoast)}. Each bag is {content.batch.bagGrams} g, and you pay on delivery.
              {batch.bagsLeft ? ` ${bags} of ${content.batch.bags}.` : bags ? ` ${bags}.` : ''}
            </p>
          </div>
          <ReservationForm content={content} batch={batch} styles={styles} />
        </section>
      </main>

      <footer className={styles.footer}>
        <p>
          {brand.fullName}, {brand.neighbourhood}, {brand.city}. Roasting since {brand.since}.
        </p>
        <a href={`mailto:${brand.email}`}>{brand.email}</a>
      </footer>

      <ThemeDock slug="night-chart" />
    </div>
  );
}
