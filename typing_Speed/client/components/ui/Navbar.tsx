"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";

const LINKS = [
  { href: "/practice", label: "Practice" },
  { href: "/test", label: "Test" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const { settings, update } = useSettings();
  const path = usePathname();
  const router = useRouter();
  const link = (href: string) => `rounded-md px-3 py-1.5 text-sm font-medium ${path.startsWith(href) ? "text-accent" : "text-sub hover:text-fg"}`;

  return (
    <header className="chrome mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-5">
      <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
        <span className="keycap inline-flex h-8 w-8 items-center justify-center font-mono text-sm text-accent" aria-hidden>
          _
        </span>
        Keystone
      </Link>
      <nav className="flex gap-1" aria-label="Main">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={link(l.href)}>
            {l.label}
          </Link>
        ))}
        {user && (
          <Link href="/dashboard" className={link("/dashboard")}>
            Dashboard
          </Link>
        )}
      </nav>
      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={() => update({ theme: settings.theme === "dark" ? "light" : "dark" })}
          className="rounded-md px-3 py-1.5 text-sm text-sub hover:text-fg"
          aria-label={`Switch to ${settings.theme === "dark" ? "light" : "dark"} theme`}
        >
          {settings.theme === "dark" ? "Light" : "Dark"}
        </button>
        {!loading &&
          (user ? (
            <>
              <Link href="/settings" className={link("/settings")}>
                {user.name}
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  router.push("/");
                }}
                className="rounded-md px-3 py-1.5 text-sm text-sub hover:text-fg"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={link("/login")}>
                Log in
              </Link>
              <Link href="/register" className="keycap !bg-accent !border-accent !border-b-[#8a6a10] px-4 py-1.5 text-sm font-semibold text-accent-ink">
                Sign up
              </Link>
            </>
          ))}
      </div>
    </header>
  );
}
