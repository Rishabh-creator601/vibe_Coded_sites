import Link from "next/link";

interface Tab {
  id: string;
  label: string;
  href?: string;
}

/** Tabs as links (href) or buttons (onSelect). */
export default function Tabs({ tabs, active, onSelect, label }: { tabs: Tab[]; active: string; onSelect?: (id: string) => void; label: string }) {
  const cls = (on: boolean) => `rounded-md px-3 py-1.5 text-sm font-medium ${on ? "bg-accent text-accent-ink" : "text-sub hover:text-fg"}`;
  return (
    <nav className="flex flex-wrap gap-1" aria-label={label}>
      {tabs.map((t) =>
        t.href ? (
          <Link key={t.id} href={t.href} aria-current={t.id === active ? "page" : undefined} className={cls(t.id === active)}>
            {t.label}
          </Link>
        ) : (
          <button key={t.id} type="button" onClick={() => onSelect?.(t.id)} aria-pressed={t.id === active} className={cls(t.id === active)}>
            {t.label}
          </button>
        ),
      )}
    </nav>
  );
}
