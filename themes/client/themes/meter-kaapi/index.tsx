'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ReservationForm } from '@/components/ReservationForm';
import { ThemeDock } from '@/components/ThemeDock';
import { bagsLabel, roastDate, rupees } from '@/lib/format';
import type { Content } from '@/lib/types';
import { useBatch } from '@/lib/useBatch';
import { body, display, kannada } from './fonts';
import styles from './styles.module.css';

const POURS = 3;
const POUR_SECONDS = 2.2;

/** Three long pours from the tumbler down to the davara, then it comes to rest. */
function MeterPour() {
  const loop = { duration: POUR_SECONDS, repeat: POURS - 1, ease: 'easeInOut' as const, times: [0, 0.2, 0.75, 1] };
  return (
    <svg className={styles.pour} viewBox="0 0 320 460" role="img" aria-label="Coffee poured in a long stream from a steel tumbler into a davara">
      <motion.g
        style={{ originX: '50%', originY: '100%' }}
        initial={{ rotate: 0 }}
        animate={{ rotate: [0, -58, -58, 0] }}
        transition={loop}
      >
        <path className={styles.steel} d="M128 22h74l-9 92h-56z" />
        <path className={styles.steelShade} d="M128 22h20l5 92h-16z" />
        <path className={styles.rim} d="M124 16h82v9h-82z" />
      </motion.g>

      <motion.rect
        className={styles.stream}
        x="63"
        y="94"
        width="10"
        height="256"
        rx="5"
        style={{ originY: '0%' }}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
        transition={loop}
      />

      <path className={styles.steel} d="M26 352h216c-4 58-34 86-108 86s-104-28-108-86z" />
      <path className={styles.steelShade} d="M26 352h44c2 44 16 70 40 86-58-4-80-32-84-86z" />
      <path className={styles.rim} d="M18 344h232v10H18z" />
      <motion.ellipse
        className={styles.froth}
        cx="134"
        cy="349"
        rx="96"
        ry="5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      />
    </svg>
  );
}

export default function Theme({ content }: { content: Content }) {
  const batch = useBatch(content);
  const bags = bagsLabel(batch.bagsLeft);
  const { brand, hero, coffees, steps, story, photos } = content;

  return (
    <div className={`${styles.root} ${display.variable} ${body.variable} ${kannada.variable}`}>
      <header className={styles.board}>
        <div className={styles.boardInner}>
          <span className={styles.boardSide} lang="kn">
            ಕಾಫಿ
          </span>
          <a className={styles.boardName} href="#top">
            {brand.name} Coffee
          </a>
          <span className={styles.boardSide}>Since {brand.since}</span>
        </div>
        <nav className={styles.nav} aria-label="On this page">
          <a href="#menu">Menu</a>
          <a href="#timings">Timings</a>
          <a href="#reserve">Reserve</a>
          <span>
            {brand.neighbourhood}, {brand.city}
          </span>
        </nav>
      </header>

      <main id="top">
        <section className={styles.hero}>
          <div>
            <h1 className={styles.title}>
              {hero.lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h1>
            <p className={styles.lede}>{hero.lede}</p>
            <a href="#reserve" className={styles.cta}>
              Reserve a bag
            </a>
          </div>
          <div className={styles.pourPanel}>
            <MeterPour />
            <p className={styles.pourNote}>
              Poured from a height, so it arrives with froth.
            </p>
          </div>
        </section>

        <section id="menu" className={styles.menu}>
          <div className={styles.menuHead}>
            <h2 className={styles.menuTitle}>Today&rsquo;s menu</h2>
            <p>
              {content.batch.bagGrams} g bag. Next roast {roastDate(content.batch.nextRoast)}.
              {bags ? <strong className={styles.bags}> {bags}.</strong> : null}
            </p>
          </div>
          <ul className={styles.menuList}>
            {coffees.map((coffee) => (
              <li key={coffee.id} className={styles.menuItem}>
                <div className={styles.menuPhoto}>
                  <Image src={photos[coffee.image].src} alt={photos[coffee.image].alt} fill sizes="(max-width: 700px) 30vw, 160px" />
                </div>
                <div className={styles.menuBody}>
                  <div className={styles.menuLine}>
                    <h3 className={styles.menuName}>{coffee.name}</h3>
                    <span className={styles.leader} aria-hidden="true" />
                    <span className={styles.price}>{rupees(coffee.price)}</span>
                  </div>
                  <p className={styles.menuNotes}>{coffee.notes.join(', ')}</p>
                  <p className={styles.menuDescription}>{coffee.description}</p>
                  <p className={styles.menuMeta}>
                    {coffee.region}. {coffee.altitude.toLocaleString('en-IN')} m. {coffee.process}. {coffee.roastName} roast.
                  </p>
                  <button type="button" className={styles.menuButton} onClick={() => batch.pick(coffee.id)}>
                    Reserve {coffee.name}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section id="timings" className={styles.timings}>
          <h2 className={styles.sectionTitle}>Timings</h2>
          <ol className={styles.timingList}>
            {steps.map((step) => (
              <li key={step.title}>
                <p className={styles.timingWhen}>
                  {step.day}
                  <span>{step.time}</span>
                </p>
                <h3 className={styles.timingTitle}>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.story}>
          <figure className={styles.storyPhoto}>
            <Image src={photos[story.image].src} alt={photos[story.image].alt} fill sizes="(max-width: 800px) 100vw, 55vw" />
          </figure>
          <div className={styles.storyText}>
            <h2 className={styles.sectionTitle}>{story.title}?</h2>
            {story.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className={styles.tiles} aria-label="Photos from the roastery">
          {['bean-sack', 'crema', 'tool-flatlay', 'iced'].map((key) => (
            <figure key={key} className={styles.tile}>
              <Image src={photos[key].src} alt={photos[key].alt} fill sizes="(max-width: 700px) 50vw, 25vw" />
            </figure>
          ))}
        </section>

        <section className={styles.counter}>
          <div className={styles.counterHead}>
            <h2 className={styles.sectionTitle}>Token counter</h2>
            <p>Take a token for the next roast. Pay when the bag reaches you.</p>
          </div>
          <ReservationForm content={content} batch={batch} styles={styles} labels={{ submit: 'Reserve my bag' }} />
        </section>
      </main>

      <footer className={styles.footer}>
        <p>
          {brand.fullName}, {brand.neighbourhood}, {brand.city}.
        </p>
        <a href={`mailto:${brand.email}`}>{brand.email}</a>
      </footer>

      <ThemeDock slug="meter-kaapi" />
    </div>
  );
}
