import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "danger";

const styles: Record<Variant, string> = {
  primary: "keycap !bg-accent !border-accent !border-b-[#8a6a10] text-accent-ink font-semibold",
  ghost: "keycap text-fg",
  danger: "keycap text-err",
};

const base = "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50";

export function Button({ variant = "ghost", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type="button" {...props} className={`${base} ${styles[variant]} ${className}`} />;
}

export function LinkButton({ href, variant = "ghost", children, className = "" }: { href: string; variant?: Variant; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </Link>
  );
}
