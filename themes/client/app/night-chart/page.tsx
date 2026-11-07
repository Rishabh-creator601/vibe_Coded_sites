import { getContent } from '@/lib/content';
import { themeMetadata } from '@/lib/themes';
import Theme from '@/themes/night-chart';

export const metadata = themeMetadata('night-chart');

export default async function Page() {
  return <Theme content={await getContent()} />;
}
