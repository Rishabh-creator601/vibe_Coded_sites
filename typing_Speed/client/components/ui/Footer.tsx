import Link from "next/link";

export default function Footer() {
  return (
    <footer className="chrome mx-auto mt-24 flex w-full max-w-5xl flex-wrap gap-x-6 gap-y-2 px-5 pb-10 text-sm text-sub">
      <span>Tab then Enter restarts. Esc finishes an untimed run. Ctrl+Backspace deletes a word.</span>
      <Link href="/about" className="ml-auto hover:text-fg">
        How scoring works
      </Link>
    </footer>
  );
}
