import { getContent } from '@/lib/content';
import { themeMetadata } from '@/lib/themes';
import Theme from '@/themes/riso-zine';

export const metadata = themeMetadata('riso-zine');

export default async function Page() {
  return <Theme content={await getContent()} />;
}
