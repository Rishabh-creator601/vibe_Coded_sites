import { getContent } from '@/lib/content';
import { themeMetadata } from '@/lib/themes';
import Theme from '@/themes/meter-kaapi';

export const metadata = themeMetadata('meter-kaapi');

export default async function Page() {
  return <Theme content={await getContent()} />;
}
