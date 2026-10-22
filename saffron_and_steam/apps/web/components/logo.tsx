/** A kulhad (clay chai cup) with two wisps of steam. */
export function KulhadMark({ className = "", animated = false }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 24 28" className={className} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="text-roast-soft">
        <path d="M9.5 9c-1.6-1.8 1.4-3.2 0-5.4" className={animated ? "animate-steam origin-bottom" : ""} />
        <path d="M14.5 9c-1.6-1.8 1.4-3.2 0-5.4" className={animated ? "animate-steam origin-bottom [animation-delay:1.1s]" : ""} />
      </g>
      <path d="M3.5 12h17l-2.3 12.2a2 2 0 0 1-2 1.6H7.8a2 2 0 0 1-2-1.6z" fill="var(--color-kulhad)" />
      <path d="M3.5 12h17" stroke="var(--color-kulhad-deep)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="flex items-center gap-2">
      <KulhadMark className="h-8 w-7" />
      <span lang="en" className="font-display text-[1.45rem] leading-none tracking-tight whitespace-nowrap">
        Saffron &amp; Steam
      </span>
    </span>
  );
}
