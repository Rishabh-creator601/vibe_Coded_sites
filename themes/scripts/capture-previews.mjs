// Takes the gallery's screenshots of every theme, in light and dark.
// Run `npm run dev` first, then `npm run previews`. Needs Google Chrome installed.
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const SITE = process.env.SITE_URL || 'http://localhost:3000';
const OUTPUT = fileURLToPath(new URL('../client/public/previews/', import.meta.url));
const SLUGS = [
  'night-chart',
  'meter-kaapi',
  'riso-zine',
  'departures',
  'cupping-notes',
  'marine-drive',
  'supergraphic',
  'receipt',
  'herbarium',
  'kissa',
];

mkdirSync(OUTPUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });

for (const slug of SLUGS) {
  for (const mode of ['light', 'dark']) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      // Reduced motion lands each theme straight on its finished state.
      reducedMotion: 'reduce',
    });
    await context.addCookies([{ name: 'oh-mode', value: mode, url: SITE }]);
    const page = await context.newPage();
    const response = await page.goto(`${SITE}/${slug}`, { waitUntil: 'networkidle', timeout: 90_000 });
    if (!response.ok()) throw new Error(`${slug} answered ${response.status()}. Is the site running?`);

    // Leave the site's own controls and Next's dev badge out of the picture.
    await page.addStyleTag({ content: '[class*="ThemeDock"], [class*="HomeBar"], nextjs-portal { display: none !important; }' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUTPUT}${slug}-${mode}.jpg`, type: 'jpeg', quality: 80 });
    await context.close();
    console.log(`Captured ${slug} ${mode}`);
  }
}

await browser.close();
