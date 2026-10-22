import type { ReactNode } from "react";

export const inputClass =
  "min-h-12 w-full min-w-0 rounded-xl border-[1.5px] border-line bg-white px-4 text-roast placeholder:text-roast-soft/60 focus:border-roast focus:outline-none aria-[invalid=true]:border-chili";

/** aria-describedby value for a field's hint and error. */
export function describedBy(id: string, hint?: ReactNode, error?: ReactNode) {
  return [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;
}

/** Label above, hint under the label, error under the control. */
export function Field({ id, label, hint, error, children, className = "" }: { id: string; label: ReactNode; hint?: ReactNode; error?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block font-semibold">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-roast-soft">
          {hint}
        </p>
      )}
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-chili">
          {error}
        </p>
      )}
    </div>
  );
}

/** A radio or checkbox drawn as a pill. The input stays in the DOM for keyboard and screen readers. */
export function Chip({
  type,
  name,
  checked,
  onChange,
  children,
  disabled,
}: {
  type: "radio" | "checkbox";
  name: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <label className={`relative inline-flex ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}>
      <input type={type} name={name} checked={checked} onChange={onChange} disabled={disabled} className="peer sr-only" />
      <span className="flex min-h-11 items-center gap-2 rounded-full border-[1.5px] border-line bg-white px-4 font-medium transition-colors duration-150 peer-checked:border-roast peer-checked:bg-roast peer-checked:text-cream peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-saffron hover:border-roast">
        {children}
      </span>
    </label>
  );
}

/** A radio drawn as a card with a title and a hint, for choices like payment method. */
export function OptionCard({ name, checked, onChange, title, hint, disabled }: { name: string; checked: boolean; onChange: () => void; title: ReactNode; hint?: ReactNode; disabled?: boolean }) {
  return (
    <label className={`relative block ${disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer"}`}>
      <input type="radio" name={name} checked={checked} onChange={onChange} disabled={disabled} className="peer sr-only" />
      <span className="flex h-full gap-3 rounded-2xl border-[1.5px] border-line bg-white p-4 transition-colors duration-150 peer-checked:border-roast peer-checked:bg-paper peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-saffron hover:border-roast peer-checked:[&>i]:border-[6px]">
        <i className="mt-1 size-5 shrink-0 rounded-full border-2 border-roast bg-white transition-[border-width] duration-150" aria-hidden="true" />
        <span>
          <span className="block font-semibold">{title}</span>
          {hint && <span className="block text-sm text-roast-soft">{hint}</span>}
        </span>
      </span>
    </label>
  );
}
