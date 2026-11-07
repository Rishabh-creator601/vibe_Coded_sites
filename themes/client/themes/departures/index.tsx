'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ReservationForm } from '@/components/ReservationForm';
import { ThemeDock } from '@/components/ThemeDock';
import { bagsLabel, roastDate, rupees } from '@/lib/format';
import type { Content } from '@/lib/types';
import { useBatch } from '@/lib/useBatch';
import { archivo } from './fonts';
import styles from './styles.module.css';

const DRUM = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.';
const FLIP_MS = 38;

/** One split-flap cell. It turns through the drum in order until it reaches its letter. */
function Flap({ target, delay }: { target: string; delay: number }) {
  const calm = useReducedMotion();
  const [letter, setLetter] = useState(target);
  const [turning, setTurning] = useState(false);

  useEffect(() => {
    const stop = DRUM.indexOf(target);
    // A blank cell is already at the start of the drum, so it never turns.
    if (calm || stop <= 0) return;
    let position = 0;
    let interval: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      setTurning(true);
      setLetter(DRUM[0]);
      interval = setInterval(() => {
        position += 1;
        setLetter(DRUM[position]);
        if (position >= stop) clearInterval(interval);
      }, FLIP_MS);
    }, delay);
    return () => {
      clearTimeout(start);
      clearInterval(interval);
    };
  }, [calm, delay, target]);

  return (
    <span className={styles.flap}>
      <motion.span
        key={letter}
        className={styles.flapLetter}
        initial={turning ? { rotateX: -70 } : false}
        animate={{ rotateX: 0 }}
        transition={{ duration: 0.05 }}
      >
        {letter === ' ' ? ' ' : letter}
      </motion.span>
    </span>
  );
}

/** Splits the headline into board rows of at most `width` cells, breaking at spaces. */
function boardRows(lines: string[], width: number) {
  const rows: string[] = [];
  for (const line of lines) {
    let row = '';
    for (const word of line.toUpperCase().split(' ')) {
      const next = row ? `${row} ${word}` : word;
      if (next.length > width && row) {
        rows.push(row);
        row = word;
      } else {
        row = next;
      }
    }
    rows.push(row);
  }
  return rows;
}

/** Bengaluru time. Rendered only in the browser, so server and client markup agree. */
function Clock() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const format = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
    const tick = () => setTime(format.format(new Date()));
    tick();
    const interval = setInterval(tick, 10_000);
    return () => clearInterval(interval);
  }, []);
  return <span className={styles.clock}>{time ?? '--:--'}</span>;
}

const WIDTH = 14;

/** Each coffee leaves the drum forty minutes after the last. */
const departureTime = (index: number) => {
  const minutes = 4 * 60 + index * 40;
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
};

export default function Theme({ content }: { content: Content }) {
  const batch = useBatch(content);
  const bags = bagsLabel(batch.bagsLeft);
  const { brand, hero, coffees, steps, story, photos } = content;
  // The drum has only plain characters, so the non-breaking spaces in the copy become ordinary spaces.
  const rows = boardRows(
    hero.lines.map((line) => line.replace(/ /g, ' ')),
    WIDTH,
  );

  return (
    <div className={`${styles.root} ${archivo.variable}`}>
      <header className={styles.top}>
        <a className={styles.brand} href="#top">
          {brand.name}
        </a>
        <nav className={styles.nav} aria-label="On this page">
          <a href="#board">Departures</a>
          <a href="#route">Route</a>
          <a href="#reserve">Book</a>
        </nav>
        <Clock />
      </header>

      <main id="top">
        <section className={styles.hero}>
          <h1 className="vh">{hero.lines.join(' ')}</h1>
          <div className={styles.flapBoard} aria-hidden="true">
            {rows.map((row, rowIndex) => (
              <div key={row} className={styles.flapRow}>
                {row
                  .padEnd(WIDTH, ' ')
                  .split('')
                  .map((character, index) => (
                    <Flap key={`${rowIndex}-${index}`} target={character} delay={rowIndex * 180 + index * 34} />
                  ))}
              </div>
            ))}
          </div>
          <div className={styles.heroFoot}>
            <p className={styles.lede}>{hero.lede}</p>
            <a className={styles.cta} href="#reserve">
              Book a bag
            </a>
          </div>
        </section>

        <section id="board" className={styles.board}>
          <div className={styles.boardHead}>
            <h2 className={styles.heading}>Departures, {roastDate(content.batch.nextRoast)}</h2>
            {bags ? <p className={styles.status}>{bags} on this roast</p> : null}
          </div>

          <div className={styles.rowHead} aria-hidden="true">
            <span>Departs</span>
            <span />
            <span>Coffee</span>
            <span>From</span>
            <span>Grown at</span>
            <span>Roast</span>
            <span>Fare</span>
            <span />
          </div>

          <ul className={styles.rows}>
            {coffees.map((coffee, index) => (
              <li key={coffee.id} className={styles.row}>
                <span className={styles.time}>{departureTime(index)}</span>
                <div className={styles.thumb}>
                  <Image src={photos[coffee.image].src} alt={photos[coffee.image].alt} fill sizes="(max-width: 800px) 30vw, 120px" />
                </div>
                <div className={styles.rowCoffee}>
                  <h3 className={styles.coffeeName}>{coffee.name}</h3>
                  <p className={styles.coffeeNotes}>{coffee.notes.join(', ')}</p>
                  <p className={styles.coffeeDescription}>{coffee.description}</p>
                </div>
                <p className={styles.cell}>{coffee.region}</p>
                <p className={styles.cell}>
                  {coffee.altitude.toLocaleString('en-IN')} m<br />
                  {coffee.process}
                </p>
                <p className={styles.cell}>
                  <span className={styles.pips} aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <span key={level} data-on={level <= coffee.roast} />
                    ))}
                  </span>
                  {coffee.roastName}
                </p>
                <p className={styles.fare}>{rupees(coffee.price)}</p>
                <button type="button" className={styles.book} onClick={() => batch.pick(coffee.id)}>
                  Book<span className="vh"> {coffee.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section id="route" className={styles.route}>
          <h2 className={styles.heading}>Calling at</h2>
          <ol className={styles.stops}>
            {steps.map((step) => (
              <li key={step.title} className={styles.stop}>
                <span className={styles.stopMark} aria-hidden="true" />
                <h3 className={styles.stopName}>{step.title}</h3>
                <p className={styles.stopTime}>
                  {step.day}, {step.time}
                </p>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.window} aria-label="Photos from the roastery">
          {[story.image, 'portafilter', story.imageTwo].map((key) => (
            <figure key={key} className={styles.windowPane}>
              <Image src={photos[key].src} alt={photos[key].alt} fill sizes="(max-width: 700px) 100vw, 33vw" />
            </figure>
          ))}
        </section>

        <section className={styles.notice}>
          <h2 className={styles.noticeTitle}>{story.title}</h2>
          <div className={styles.noticeBody}>
            {story.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className={styles.ticketSection}>
          <div className={styles.ticket}>
            <div className={styles.stub}>
              <h2 className={styles.stubTitle}>Single to your table</h2>
              <dl className={styles.stubFacts}>
                <div>
                  <dt>Leaves</dt>
                  <dd>{roastDate(content.batch.nextRoast)}</dd>
                </div>
                <div>
                  <dt>Arrives</dt>
                  <dd>By Friday</dd>
                </div>
                <div>
                  <dt>Luggage</dt>
                  <dd>{content.batch.bagGrams} g bag</dd>
                </div>
                <div>
                  <dt>Payment</dt>
                  <dd>On delivery</dd>
                </div>
              </dl>
            </div>
            <ReservationForm content={content} batch={batch} styles={styles} labels={{ submit: 'Book my bag', submitting: 'Booking...' }} />
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>
          {brand.fullName}, {brand.neighbourhood}, {brand.city}. Since {brand.since}.
        </p>
        <a href={`mailto:${brand.email}`}>{brand.email}</a>
      </footer>

      <ThemeDock slug="departures" />
    </div>
  );
}
