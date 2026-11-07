import { getContent } from '@/lib/content';
import { themeMetadata } from '@/lib/themes';
import Theme from '@/themes/departures';

export const metadata = themeMetadata('departures');

export default async function Page() {
  return <Theme content={await getContent()} />;
}
