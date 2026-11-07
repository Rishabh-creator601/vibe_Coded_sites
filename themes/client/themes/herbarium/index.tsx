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

const n = (value: number) => value.toFixed(1);

/** A coffee leaf drawn along +x from its base at 0,0: broad, glossy, with a narrow drawn-out tip. */
const leafOutline = (length: number, width: number) =>
  `M0 0C${n(length * 0.1)} ${n(-width * 0.62)} ${n(length * 0.34)} ${n(-width)} ${n(length * 0.56)} ${n(-width * 0.84)}` +
  `C${n(length * 0.74)} ${n(-width * 0.68)} ${n(length * 0.86)} ${n(-width * 0.2)} ${n(length)} 0` +
  `C${n(length * 0.86)} ${n(width * 0.26)} ${n(length * 0.72)} ${n(width * 0.7)} ${n(length * 0.52)} ${n(width * 0.86)}` +
  `C${n(length * 0.32)} ${n(width)} ${n(length * 0.1)} ${n(width * 0.58)} 0 0Z`;

/** Side veins curve forward from the midrib, stopping short of the leaf's edge. */
const leafVeins = (length: number, width: number) =>
  [0.16, 0.28, 0.4, 0.52, 0.64, 0.76]
    .map((at) => {
      const reach = width * 0.78 * Math.sin(Math.PI * Math.min(at + 0.06, 0.94));
      const x = length * at;
      const tip = x + length * 0.1;
      return `M${n(x)} 0Q${n(x + length * 0.03)} ${n(-reach * 0.6)} ${n(tip)} ${n(-reach)}M${n(x)} 0Q${n(x + length * 0.03)} ${n(reach * 0.6)} ${n(tip)} ${n(reach)}`;
    })
    .join('');

const STEM =
  'M300 842C306 772 292 720 300 660C306 612 330 570 336 520C340 476 322 430 322 386C322 342 346 300 352 258C356 222 342 180 346 140';

const STEM_TIME = 2.2;

type Leaf = { x: number; y: number; angle: number; length: number; width: number; at: number; pale?: boolean };

/** Paired leaves at each node, largest at the old wood. `at` is how far up the stem the node is. */
const LEAVES: Leaf[] = [
  { x: 300, y: 660, angle: -158, length: 214, width: 50, at: 0.3 },
  { x: 300, y: 660, angle: -24, length: 236, width: 56, at: 0.32, pale: true },
  { x: 336, y: 520, angle: -163, length: 226, width: 54, at: 0.47, pale: true },
  { x: 336, y: 520, angle: -33, length: 204, width: 48, at: 0.49 },
  { x: 322, y: 386, angle: -148, length: 186, width: 44, at: 0.63 },
  { x: 322, y: 386, angle: -22, length: 196, width: 46, at: 0.65, pale: true },
  { x: 352, y: 258, angle: -142, length: 136, width: 32, at: 0.79, pale: true },
  { x: 352, y: 258, angle: -38, length: 128, width: 30, at: 0.81 },
  { x: 346, y: 140, angle: -128, length: 70, width: 16, at: 0.97 },
  { x: 346, y: 140, angle: -56, length: 74, width: 17, at: 0.97, pale: true },
  { x: 346, y: 140, angle: -92, length: 96, width: 18, at: 1 },
];

type Cherry = { x: number; y: number; r: number; node: [number, number]; unripe?: boolean };

/** Fruit clusters tight to the nodes, ripening from the old wood upward. */
const CHERRIES: Cherry[] = [
  { x: 278, y: 642, r: 14, node: [300, 660] },
  { x: 302, y: 630, r: 15, node: [300, 660] },
  { x: 326, y: 642, r: 13, node: [300, 660] },
  { x: 272, y: 668, r: 13, node: [300, 660] },
  { x: 331, y: 669, r: 12, node: [300, 660], unripe: true },
  { x: 312, y: 498, r: 13, node: [336, 520] },
  { x: 338, y: 490, r: 14, node: [336, 520] },
  { x: 362, y: 505, r: 12, node: [336, 520], unripe: true },
  { x: 308, y: 524, r: 12, node: [336, 520] },
  { x: 300, y: 366, r: 11, node: [322, 386], unripe: true },
  { x: 324, y: 358, r: 12, node: [322, 386] },
  { x: 346, y: 372, r: 11, node: [322, 386] },
  { x: 366, y: 244, r: 9, node: [352, 258], unripe: true },
  { x: 342, y: 238, r: 9, node: [352, 258], unripe: true },
];

/** Gummed paper strips holding the branch to the sheet. Each arrives once there is something to hold. */
const STRAPS = [
  { x: 268, y: 762, width: 74, angle: 4, at: 0.1 },
  { x: 150, y: 575, width: 58, angle: 72, at: 0.45 },
  { x: 452, y: 430, width: 52, angle: 112, at: 0.62 },
];

function Branch() {
  const reduce = useReducedMotion();

  return (
    <svg className={styles.branch} viewBox="0 0 640 860" aria-hidden="true" fill="none">
      <motion.path
        d={STEM}
        className={styles.stem}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={reduce ? { duration: 0 } : { duration: STEM_TIME, ease: [0.3, 0.1, 0.45, 1] }}
      />

      {LEAVES.map((leaf) => (
        <g key={`${leaf.x}-${leaf.angle}`} transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle})`}>
          <motion.g
            style={{ originX: 0, originY: 0.5 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={reduce ? { duration: 0 } : { duration: 0.7, delay: leaf.at * STEM_TIME, ease: [0.2, 0.9, 0.3, 1] }}
          >
            <path d={leafOutline(leaf.length, leaf.width)} className={leaf.pale ? styles.leafPale : styles.leaf} />
            <path d={`M0 0L${leaf.length} 0`} className={styles.midrib} />
            <path d={leafVeins(leaf.length, leaf.width)} className={styles.veins} />
          </motion.g>
        </g>
      ))}

      {CHERRIES.map((cherry, index) => (
        <motion.g
          key={`${cherry.x}-${cherry.y}`}
          style={{ originX: 0.5, originY: 0.5 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 13, delay: STEM_TIME + 0.15 + index * 0.05 }}
        >
          <path d={`M${cherry.node[0]} ${cherry.node[1]}L${cherry.x} ${cherry.y}`} className={styles.pedicel} />
          <circle cx={cherry.x} cy={cherry.y} r={cherry.r} className={cherry.unripe ? styles.cherryUnripe : styles.cherry} />
          <circle cx={cherry.x - cherry.r * 0.34} cy={cherry.y - cherry.r * 0.36} r={cherry.r * 0.2} className={styles.cherryShine} />
          <circle cx={cherry.x + cherry.r * 0.3} cy={cherry.y + cherry.r * 0.52} r={cherry.r * 0.14} className={styles.cherryCalyx} />
        </motion.g>
      ))}

      {STRAPS.map((strap) => (
        <motion.rect
          key={strap.x}
          x={strap.x}
          y={strap.y}
          width={strap.width}
          height="15"
          className={styles.strapSvg}
          transform={`rotate(${strap.angle} ${strap.x + strap.width / 2} ${strap.y + 7.5})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reduce ? { duration: 0 } : { duration: 0.2, delay: strap.at * STEM_TIME + 0.35 }}
        />
      ))}
    </svg>
  );
}

const PLATE = ['portafilter', 'tool-flatlay', 'crema', 'pour-over', 'cup-tray'];

function Straps() {
  return (
    <>
      <span className={styles.strap} aria-hidden="true" />
      <span className={styles.strap} aria-hidden="true" />
      <span className={styles.strap} aria-hidden="true" />
    </>
  );
}

export default function Theme({ content }: { content: Content }) {
  const batch = useBatch(content);
  const bags = bagsLabel(batch.bagsLeft);
  const date = roastDate(content.batch.nextRoast);
  const photo = (key: string) => content.photos[key];

  return (
    <div className={`${styles.root} ${fonts}`}>
      <header className={styles.nav}>
        <a className={styles.brand} href="#top">
          {content.brand.name}
        </a>
        <nav aria-label="Main">
          <ul className={styles.navLinks}>
            <li>
              <a href="#specimens">Specimens</a>
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

      <main id="top">
        <section className={styles.hero}>
          <div className={styles.heroSheet}>
            <Branch />
            <div className={styles.heroPhoto}>
              <div className={styles.photo}>
                <Image src={photo('beans-scatter').src} alt={photo('beans-scatter').alt} fill priority sizes="(max-width: 56rem) 34vw, 14rem" />
              </div>
              <Straps />
            </div>
            <div className={`${styles.tag} ${styles.heroTag}`}>
              <p className={styles.tagSpecies}>Coffea arabica</p>
              <dl className={styles.tagRows}>
                <div>
                  <dt>Next roast</dt>
                  <dd>{date}</dd>
                </div>
                {bags ? (
                  <div>
                    <dt>Remaining</dt>
                    <dd>{bags}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Coll.</dt>
                  <dd>{content.brand.name}</dd>
                </div>
              </dl>
            </div>
          </div>
          <div className={styles.heroText}>
            <h1 className={styles.title}>
              {content.hero.lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h1>
            <p className={styles.lede}>{content.hero.lede}</p>
            <a className={styles.heroLink} href="#reserve">
              Reserve a bag
            </a>
          </div>
        </section>

        <section id="specimens" className={styles.specimensSection}>
          <h2 className={styles.heading}>Four specimens from this roast</h2>
          <ul className={styles.specimens}>
            {content.coffees.map((coffee) => (
              <li key={coffee.id} className={styles.specimen}>
                <div className={styles.mount}>
                  <div className={styles.photo}>
                    <Image src={photo(coffee.image).src} alt={photo(coffee.image).alt} fill sizes="(max-width: 56rem) 80vw, 30vw" />
                  </div>
                  <Straps />
                </div>
                <div className={styles.specimenText}>
                  <h3 className={styles.coffeeName}>{coffee.name}</h3>
                  <p className={styles.description}>{coffee.description}</p>
                  <div className={styles.buy}>
                    <p className={styles.price}>{rupees(coffee.price)}</p>
                    <button type="button" className={styles.reserve} onClick={() => batch.pick(coffee.id)}>
                      Reserve {coffee.name}
                    </button>
                  </div>
                </div>
                <div className={styles.tag}>
                  <p className={styles.tagSpecies}>Coffea arabica</p>
                  <dl className={styles.tagRows}>
                    <div>
                      <dt>Locality</dt>
                      <dd>{coffee.region}</dd>
                    </div>
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
                    <div>
                      <dt>Coll.</dt>
                      <dd>{content.brand.name}</dd>
                    </div>
                  </dl>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section id="week" className={styles.week}>
          <h2 className={styles.heading}>How a batch grows through the week</h2>
          <ol className={styles.vine}>
            {content.steps.map((step) => (
              <li key={step.title} className={styles.node}>
                <svg className={styles.nodeLeaf} viewBox="0 0 60 28" aria-hidden="true">
                  <path d="M2 26C12 8 34 0 58 4C46 20 24 30 2 26Z" />
                  <path d="M2 26C20 18 38 10 58 4" className={styles.nodeRib} />
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
          <div className={styles.storyText}>
            <h2 className={styles.heading}>{content.story.title}</h2>
            {content.story.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className={styles.storyPhotos}>
            <div className={styles.storyLarge}>
              <div className={styles.photo}>
                <Image src={photo(content.story.image).src} alt={photo(content.story.image).alt} fill sizes="(max-width: 56rem) 90vw, 46vw" />
              </div>
              <Straps />
            </div>
            <div className={styles.storySmall}>
              <div className={styles.photo}>
                <Image src={photo(content.story.imageTwo).src} alt={photo(content.story.imageTwo).alt} fill sizes="(max-width: 56rem) 46vw, 20vw" />
              </div>
              <Straps />
            </div>
          </div>
        </section>

        <section className={styles.plate} aria-label="Plate of photographs from the roastery">
          {PLATE.map((key, index) => (
            <figure key={key} className={styles.figure}>
              <div className={styles.figurePhoto}>
                <Image src={photo(key).src} alt={photo(key).alt} fill sizes="(max-width: 48rem) 50vw, 30vw" />
              </div>
              <figcaption>Fig. {index + 1}</figcaption>
            </figure>
          ))}
        </section>

        <section className={styles.collect}>
          <div className={styles.collectIntro}>
            <h2 className={styles.heading}>Reserve a bag</h2>
            <p>
              Fill in the slip for the {date} roast. {content.batch.bagGrams} grams, paid on delivery.
            </p>
            {bags ? <p className={styles.remaining}>{bags}</p> : null}
          </div>
          <div className={styles.slip}>
            <p className={styles.slipTitle}>Collection slip</p>
            <ReservationForm
              content={content}
              batch={batch}
              styles={styles}
              labels={{ name: 'Collector', email: 'Email', coffee: 'Specimen', grind: 'Prepared as' }}
            />
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p className={styles.footerName}>{content.brand.fullName}</p>
        <p>
          {content.brand.neighbourhood}, {content.brand.city}. Collecting since {content.brand.since}.
        </p>
        <p>
          <a href={`mailto:${content.brand.email}`}>{content.brand.email}</a>
        </p>
      </footer>

      <ThemeDock slug="herbarium" />
    </div>
  );
}
