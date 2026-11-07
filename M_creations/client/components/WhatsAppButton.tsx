import type { ReactNode } from 'react';
import { whatsappLink } from '@/lib/format';

export function WhatsAppButton({
  message,
  className = 'btn btn-peacock',
  children = 'Message on WhatsApp',
}: {
  message?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer" className={className}>
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round">
        <path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.200A9 9 0 1 0 12 3z" />
      </svg>
      {children}
    </a>
  );
}
