import Link from "next/link";

export const LEVEL_GLYPH: Record<string, string> = {
  beginner: "asdf",
  easy: "the",
  medium: "Aa,.",
  hard: "; : ?",
  expert: "\" ( )",
  numbers: "#4$",
  code: "{ }",
};

interface Props {
  id: string;
  name: string;
  href: string;
  blurb: string;
  detail?: string;
  locked?: boolean;
  lockedNote?: string;
  best?: number | null;
}

/** A level as a keycap: legend glyph on top, name below, pressed down on click. */
export default function LevelCard({ id, name, href, blurb, detail, locked, lockedNote, best }: Props) {
  const body = (
    <>
      <span className="font-mono text-2xl font-bold text-accent">{LEVEL_GLYPH[id]}</span>
      <span className="mt-4 text-lg font-bold">{name}</span>
      <span className="mt-1 text-sm text-sub">{locked ? lockedNote : blurb}</span>
      {(detail || best != null) && (
        <span className="mt-3 font-mono text-sm text-sub">
          {best != null ? `Best ${Math.round(best)} wpm` : detail}
        </span>
      )}
    </>
  );
  const cls = "keycap flex min-h-44 flex-col items-start p-5 text-left";
  if (locked) {
    return (
      <div className={cls} aria-disabled="true">
        {body}
      </div>
    );
  }
  return (
    <Link href={href} className={cls}>
      {body}
    </Link>
  );
}

export const LEVEL_BLURB: Record<string, string> = {
  beginner: "Row drills, one row at a time",
  easy: "The 200 most common words",
  medium: "1,000 words with capitals and punctuation",
  hard: "Full sentences and longer words",
  expert: "Real paragraphs from books and speeches",
  numbers: "Prices, dates, times and symbols",
  code: "JavaScript and Python snippets",
};
