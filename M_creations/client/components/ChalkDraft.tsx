import { useId } from 'react';

export type DraftKind = 'blouse' | 'krishna' | 'kurti';

const NECKS = {
  sweetheart: 'M140 90 C142 150 180 178 200 152 C220 178 258 150 260 90',
  round: 'M140 90 C148 170 252 170 260 90',
  boat: 'M140 90 C165 116 235 116 260 90',
  v: 'M140 90 L200 182 L260 90',
};

export function draftKindFor(categorySlug?: string): DraftKind {
  if (categorySlug === 'krishna-dresses') return 'krishna';
  if (categorySlug === 'blouses' || categorySlug === 'stitching') return 'blouse';
  return 'kurti';
}

function neckFor(slug: string) {
  if (slug.includes('boat')) return NECKS.boat;
  if (slug.includes('round')) return NECKS.round;
  if (slug.includes('v-neck')) return NECKS.v;
  return NECKS.sweetheart;
}

const Line = ({ d }: { d: string }) => <path className="chalk-line" pathLength={1} d={d} />;
const Mark = ({ d }: { d: string }) => <path className="chalk-mark" strokeDasharray="7 8" strokeWidth={2} d={d} />;
const Note = ({ x, y, children }: { x: number; y: number; children: string }) => (
  <text className="chalk-mark" x={x} y={y} fill="currentColor" stroke="none" fontFamily="var(--font-chalk)" fontSize={19}>
    {children}
  </text>
);

function Blouse({ slug }: { slug: string }) {
  return (
    <>
      <Line d={neckFor(slug)} />
      <Line d="M260 90 L305 106 L346 190 L300 206 L282 152 L276 300 Q200 320 124 300 L118 152 L100 206 L54 190 L95 106 L140 90" />
      <Line d="M162 305 L171 238 L180 310" />
      <Line d="M220 310 L229 238 L238 305" />
      <Mark d="M118 152 Q200 166 282 152" />
      <Mark d="M200 180 V312" />
      <Mark d="M124 342 H276 M124 334 V350 M276 334 V350" />
      <Note x={178} y={373}>waist</Note>
      <Note x={290} y={70}>shoulder</Note>
    </>
  );
}

function Krishna() {
  return (
    <>
      <Line d="M165 88 L168 54 L184 70 L200 42 L216 70 L232 54 L235 88 Z" />
      <Line d="M204 42 C204 30 210 20 222 14" />
      <Line d="M222 14 C234 2 250 8 246 20 C242 32 226 30 222 14 Z" />
      <Line d="M170 112 Q200 134 230 112 L258 128 L248 156 L229 146 L228 182 L172 182 L171 146 L152 156 L142 128 L170 112" />
      <Line d="M172 182 C150 244 112 306 84 344 Q200 382 316 344 C288 306 250 244 228 182" />
      <Mark d="M101 322 Q200 358 299 322" />
      <Mark d="M186 186 L152 350 M200 186 V362 M214 186 L248 350" />
      <Note x={258} y={70}>mukut</Note>
      <Note x={296} y={282}>ghera</Note>
    </>
  );
}

function Kurti() {
  return (
    <>
      <Line d="M162 58 Q200 100 238 58" />
      <Line d="M238 58 L282 74 L322 190 L288 202 L262 122 L270 252 L288 352 Q200 372 112 352 L130 252 L138 122 L112 202 L78 190 L118 74 L162 58" />
      <Mark d="M200 84 V176" />
      <Mark d="M132 244 Q200 256 268 244" />
      <Mark d="M108 330 Q200 350 292 330" />
      <Note x={304} y={290}>length</Note>
    </>
  );
}

export function ChalkDraft({
  kind,
  slug = '',
  animate = false,
  className = '',
}: {
  kind: DraftKind;
  slug?: string;
  animate?: boolean;
  className?: string;
}) {
  // Each SVG needs its own filter id when many sit on one page.
  const filterId = `chalk${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg
      viewBox="0 0 400 400"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${animate ? 'draft-draw' : ''} ${className}`}
    >
      <filter id={filterId} x="-5%" y="-5%" width="110%" height="110%">
        {/* Roughens the line so it reads as chalk on cloth, not a vector stroke. */}
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
        <feDisplacementMap in="SourceGraphic" scale="2.6" />
      </filter>
      <g filter={`url(#${filterId})`}>
        {kind === 'blouse' && <Blouse slug={slug} />}
        {kind === 'krishna' && <Krishna />}
        {kind === 'kurti' && <Kurti />}
      </g>
    </svg>
  );
}
