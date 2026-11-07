'use client';

/* eslint-disable @next/next/no-img-element -- the dithered PNGs must stay 1-bit, so they skip the image optimiser */

import { motion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';
import { ReservationForm } from '@/components/ReservationForm';
import { ThemeDock } from '@/components/ThemeDock';
import { bagsLabel, roastDate, rupees } from '@/lib/format';
import type { Content, Reservation } from '@/lib/types';
import { useBatch } from '@/lib/useBatch';
import { fonts } from './fonts';
import styles from './styles.module.css';

/** The print head advances in thirty small jumps. */
const feedSteps = (progress: number) => Math.floor(progress * 30) / 30;

/** Which photo each stub shows, and how far down it to centre the crop, since a stub only has room for part of it. */
const STUBS_LEFT: [string, string][] = [
  ['crema', '50%'],
  ['bean-bowl', '45%'],
  ['bean-sack', '60%'],
];
const STUBS_RIGHT: [string, string][] = [
  ['dark-splash', '74%'],
  ['black-glass', '55%'],
  ['shop-counter', '50%'],
];

function Line({ left, right, strong }: { left: ReactNode; right: ReactNode; strong?: boolean }) {
  return (
    <span className={strong ? styles.lineStrong : styles.line}>
      <span>{left}</span>
      <span className={styles.leader} aria-hidden="true" />
      <span className={styles.lineRight}>{right}</span>
    </span>
  );
}

export default function Theme({ content }: { content: Content }) {
  const batch = useBatch(content);
  const bags = bagsLabel(batch.bagsLeft);
  const date = roastDate(content.batch.nextRoast);

  const printed = (key: string, className: string, eager = false) => (
    <img
      className={className}
      src={`/images/dither/${key}.png`}
      alt={content.photos[key].alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
    />
  );

  const stub = ([key, focus]: [string, string], copy: string) => (
    <div key={key} className={styles.stubCell}>
      <figure className={styles.stub}>
        <div className={styles.stubPrint} style={{ '--focus': focus } as CSSProperties}>
          {printed(key, styles.stubImage)}
        </div>
        <figcaption className={styles.stubCaption}>{copy}</figcaption>
      </figure>
    </div>
  );

  const printedReservation = (reservation: Reservation) => (
    <div className={styles.printed}>
      <p className={styles.successTitle}>Reserved</p>
      <div className={styles.lines}>
        <Line left="Item" right={reservation.coffeeName} />
        <Line left="For" right={reservation.name} />
        <Line left="Grind" right={reservation.grindLabel} />
        <Line left="Roast" right={roastDate(reservation.batchDate)} />
        <Line strong left="Pay on delivery" right={rupees(reservation.price)} />
      </div>
      <p className={styles.barcode} aria-hidden="true">
        *{reservation.code}*
      </p>
      <p className={styles.successBody}>Your code is {reservation.code}</p>
    </div>
  );

  return (
    <div className={`${styles.root} ${fonts}`}>
      {/* Without scripts the paper would stay fed back behind the printer. */}
      <noscript>
        <style>{`.${styles.paper}{transform:none !important}`}</style>
      </noscript>

      <header className={styles.printer}>
        <nav className={styles.printerNav} aria-label="Main">
          <a className={styles.printerBrand} href="#top">
            {content.brand.name}
          </a>
          <ul className={styles.printerLinks}>
            <li>
              <a href="#items">Items</a>
            </li>
            <li>
              <a href="#schedule">Schedule</a>
            </li>
            <li>
              <a href="#story">Story</a>
            </li>
            <li>
              <a href="#reserve">Reserve</a>
            </li>
          </ul>
        </nav>
        <div className={styles.slot} aria-hidden="true" />
      </header>

      <div className={styles.counter}>
        <div className={styles.stubs}>{STUBS_LEFT.map((entry, index) => stub(entry, `Customer copy ${index + 1} of 3`))}</div>

        <motion.main
          id="top"
          className={styles.paper}
          initial={{ y: '-70vh' }}
          animate={{ y: 0 }}
          transition={{ duration: 2.6, delay: 0.2, ease: feedSteps }}
        >
          <section className={styles.head}>
            <p className={styles.logo}>{content.brand.name}</p>
            <p>{content.brand.fullName}</p>
            <p>
              {content.brand.neighbourhood}, {content.brand.city}
            </p>
            <p>Since {content.brand.since}</p>
          </section>

          {printed('pour-over', styles.print, true)}

          <section className={styles.block}>
            <h1 className={styles.title}>
              {content.hero.lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h1>
            <p className={styles.small}>{content.hero.lede}</p>
            <div className={styles.lines}>
              <Line left="Next roast" right={date} />
              {bags ? <Line left="Stock" right={bags} /> : null}
              <Line left="Batch" right={`${content.batch.kilos} kg`} />
              <Line left="Bag" right={`${content.batch.bagGrams} g`} />
            </div>
          </section>

          <section id="items" className={styles.block}>
            <h2 className={styles.heading}>Items</h2>
            <ul className={styles.items}>
              {content.coffees.map((coffee) => (
                <li key={coffee.id} className={styles.item}>
                  {printed(coffee.image, styles.printCrop)}
                  <h3 className={styles.itemName}>
                    <Line strong left={coffee.name} right={rupees(coffee.price)} />
                  </h3>
                  <p>{coffee.region}</p>
                  <div className={styles.lines}>
                    <Line left="Altitude" right={`${coffee.altitude} m`} />
                    <Line left="Process" right={coffee.process} />
                    <Line left="Roast" right={coffee.roastName} />
                    <Line left="Notes" right={coffee.notes.join(', ')} />
                  </div>
                  <p className={styles.small}>{coffee.description}</p>
                  <button type="button" className={styles.printButton} onClick={() => batch.pick(coffee.id)}>
                    Reserve {coffee.name}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section id="schedule" className={styles.block}>
            <h2 className={styles.heading}>Schedule</h2>
            <ol className={styles.steps}>
              {content.steps.map((step) => (
                <li key={step.title}>
                  <Line strong left={`${step.day} ${step.time}`} right={step.title} />
                  <p className={styles.small}>{step.body}</p>
                </li>
              ))}
            </ol>
          </section>

          <section id="story" className={styles.block}>
            <h2 className={styles.heading}>{content.story.title}</h2>
            {printed(content.story.image, styles.print)}
            {content.story.paragraphs.map((paragraph) => (
              <p key={paragraph} className={styles.small}>
                {paragraph}
              </p>
            ))}
            {printed(content.story.imageTwo, styles.print)}
          </section>

          <section className={styles.block}>
            <h2 className={styles.heading}>Reserve a bag</h2>
            <p className={styles.small}>
              From the {date} roast{bags ? `. ${bags}.` : '.'}
            </p>
            <ReservationForm
              content={content}
              batch={batch}
              styles={styles}
              labels={{ name: 'Name', email: 'Email', coffee: 'Item', grind: 'Grind' }}
              renderSuccess={printedReservation}
            />
          </section>

          <footer className={styles.foot}>
            <p className={styles.thanks}>Thank you</p>
            <p>{content.brand.fullName}</p>
            <p>
              <a href={`mailto:${content.brand.email}`}>{content.brand.email}</a>
            </p>
            <p className={styles.barcode} aria-hidden="true">
              *ODD HOUR*
            </p>
          </footer>
        </motion.main>

        <div className={styles.stubs}>{STUBS_RIGHT.map((entry, index) => stub(entry, `Merchant copy ${index + 1} of 3`))}</div>
      </div>

      <ThemeDock slug="receipt" />
    </div>
  );
}
