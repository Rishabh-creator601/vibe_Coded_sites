import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { MotionProvider } from '@/components/MotionProvider';
import { MODE_COOKIE } from '@/lib/themes';
import './globals.css';

// First visit only: follow the system setting before the page paints.
const followSystem = `document.documentElement.dataset.mode=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'`;

export default async function RootLayout({ children }: { children: ReactNode }) {
  const saved = (await cookies()).get(MODE_COOKIE)?.value;
  const mode = saved === 'dark' || saved === 'light' ? saved : undefined;

  return (
    <html lang="en" data-mode={mode} suppressHydrationWarning>
      <head>{mode ? null : <script dangerouslySetInnerHTML={{ __html: followSystem }} />}</head>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
