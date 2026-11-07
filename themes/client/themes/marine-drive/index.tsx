'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { ReservationForm } from '@/components/ReservationForm';
import { ThemeDock } from '@/components/ThemeDock';
import { bagsLabel, roastDate, rupees } from '@/lib/format';
import type { Content } from '@/lib/types';
import { useBatch } from '@/lib/useBatch';
import { fonts } from './fonts';
import styles from './styles.module.css';

/** Seventeen rays across the half circle above the arch's base. Odd ones are long, even ones short. */
const RAYS = Array.from({ length: 17 }, (_, index) => ({ angle: -90 + index * 11.25, long: index % 2 === 0 }));

const NUMERALS = ['I', 'II', 'III', 'IV'];

/** The little fan above each step, drawn as wedges from the middle of the base line. */
const FAN_BLADES = Array.from({ length: 9 }, (_, index) => {
  const point = (degrees: number) => {
    const radians = (degrees * Math.PI) / 180;
    return `${(100 + Math.cos(radians) * 98).toFixed(2)} ${(100 - Math.sin(radians) * 98).toFixed(2)}`;
  };
  const start = 4 + index * 20;
  return `M100 100 L${point(start)} L${point(start + 12)} Z`;
});

const SITE_LINKS: [string, string][][] = [
  [
    ['#coffees', 'Coffees'],
    ['#programme', 'Programme'],
  ],
  [
    ['#story', 'Our story'],
    ['#reserve', 'Box office'],
  ],
];

export default function Theme({ content }: { content: Content }) {
  const batch = useBatch(content);
  const reduce = useReducedMotion();
  const bags = bagsLabel(batch.bagsLeft);
  const date = roastDate(content.batch.nextRoast);
  const photo = (key: string) => content.photos[key];

  return (
    <div className={`${styles.root} ${fonts}`}>
      <header className={styles.nav}>
        <nav aria-label="Main" className={styles.navInner}>
          <ul className={styles.navSide}>
            {SITE_LINKS[0].map(([href, label]) => (
              <li key={href}>
                <a href={href}>{label}</a>
              </li>
            ))}
          </ul>
          <a className={styles.brand} href="#top">
            {content.brand.name}
          </a>
          <ul className={styles.navSide}>
            {SITE_LINKS[1].map(([href, label]) => (
              <li key={href}>
                <a href={href}>{label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="top">
        <section className={styles.hero}>
          <div className={styles.stage}>
            <div className={styles.rays} aria-hidden="true">
              {RAYS.map((ray) => (
                <motion.span
                  key={ray.angle}
                  className={ray.long ? styles.rayLong : styles.rayShort}
                  style={{ originX: 0.5, originY: 1 }}
                  initial={{ rotate: 0 }}
                  animate={{ rotate: ray.angle }}
                  transition={{ duration: 1.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                />
              ))}
            </div>
            <div className={styles.heroArch}>
              <div className={styles.heroArchPhoto}>
                <Image
                  src={photo('espresso-glass').src}
                  alt={photo('espresso-glass').alt}
                  fill
                  priority
                  sizes="(max-width: 48rem) 15rem, 22.5rem"
                />
              </div>
            </div>
          </div>

          <div className={styles.marquee}>
            <motion.div
              className={styles.bulbs}
              aria-hidden="true"
              initial={{ opacity: 0.25 }}
              animate={{ opacity: 1 }}
              transition={reduce ? { duration: 0 } : { duration: 0.5, delay: 1.2, ease: (t: number) => Math.floor(t * 4) / 4 }}
            />
            <p className={styles.marqueeName}>{content.brand.name}</p>
            <h1 className={styles.marqueeLine}>
              {content.hero.lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h1>
            <motion.div
              className={styles.bulbs}
              aria-hidden="true"
              initial={{ opacity: 0.25 }}
              animate={{ opacity: 1 }}
              transition={reduce ? { duration: 0 } : { duration: 0.5, delay: 1.2, ease: (t: number) => Math.floor(t * 4) / 4 }}
            />
          </div>

          <div className={styles.foyer}>
            <p className={styles.lede}>{content.hero.lede}</p>
            <p className={styles.showing}>
              <span>Next roast {date}</span>
              {bags ? <span>{bags}</span> : null}
            </p>
            <a className={styles.heroLink} href="#reserve">
              Reserve a bag
            </a>
          </div>
        </section>

        <section id="coffees" className={styles.section}>
          <h2 className={styles.heading}>Now showing</h2>
          <ul className={styles.windows}>
            {content.coffees.map((coffee) => (
              <li key={coffee.id} className={styles.window}>
                <div className={styles.windowPhoto}>
                  <Image
                    src={photo(coffee.image).src}
                    alt={photo(coffee.image).alt}
                    fill
                    sizes="(max-width: 40rem) 86vw, (max-width: 72rem) 44vw, 20vw"
                  />
                </div>
                <div className={styles.windowText}>
                  <h3 className={styles.coffeeName}>{coffee.name}</h3>
                  <p className={styles.region}>{coffee.region}</p>
                  <p className={styles.description}>{coffee.description}</p>
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
                  <p className={styles.price}>{rupees(coffee.price)}</p>
                  <button type="button" className={styles.windowButton} onClick={() => batch.pick(coffee.id)}>
                    Reserve {coffee.name}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section id="programme" className={styles.programme}>
          <h2 className={styles.heading}>Programme</h2>
          <ol className={styles.fans}>
            {content.steps.map((step, index) => (
              <li key={step.title} className={styles.fan}>
                <div className={styles.fanMark}>
                  <svg viewBox="0 0 200 100" aria-hidden="true">
                    {FAN_BLADES.map((blade) => (
                      <path key={blade} d={blade} />
                    ))}
                  </svg>
                  <span className={styles.numeral}>{NUMERALS[index]}</span>
                </div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepTime}>
                  {step.day}, {step.time.toLowerCase()}
                </p>
                <p className={styles.stepBody}>{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="story" className={`${styles.section} ${styles.story}`}>
          <figure className={styles.storyPhoto}>
            <Image src={photo(content.story.image).src} alt={photo(content.story.image).alt} fill sizes="(max-width: 56rem) 44vw, 24vw" />
          </figure>
          <div className={styles.storyText}>
            <h2 className={styles.heading}>{content.story.title}</h2>
            {content.story.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <figure className={styles.storyPhoto}>
            <Image
              src={photo(content.story.imageTwo).src}
              alt={photo(content.story.imageTwo).alt}
              fill
              sizes="(max-width: 56rem) 44vw, 24vw"
            />
          </figure>
        </section>

        <section className={styles.triptych} aria-label="Photographs from the roastery">
          {['portafilter', 'cup-tray', 'crema'].map((key) => (
            <figure key={key} className={key === 'cup-tray' ? styles.panelTall : styles.panel}>
              <div className={styles.panelPhoto}>
                <Image src={photo(key).src} alt={photo(key).alt} fill sizes="(max-width: 48rem) 34vw, 28vw" />
              </div>
            </figure>
          ))}
        </section>

        <section className={styles.boxOffice}>
          <div className={styles.ticket}>
            <div className={styles.ticketPaper}>
              <h2 className={styles.ticketTitle}>Admit one bag</h2>
              <p className={styles.ticketMeta}>
                <span>{date}</span>
                {bags ? <span>{bags}</span> : null}
              </p>
              <div className={styles.perforation} aria-hidden="true" />
              <ReservationForm content={content} batch={batch} styles={styles} labels={{ name: 'Name on the ticket' }} />
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p className={styles.footerName}>{content.brand.fullName}</p>
        <p>
          {content.brand.neighbourhood}, {content.brand.city}, since {content.brand.since}
        </p>
        <p>
          <a href={`mailto:${content.brand.email}`}>{content.brand.email}</a>
        </p>
      </footer>

      <ThemeDock slug="marine-drive" />
    </div>
  );
}
