import { getContent } from '@/lib/content';
import { themeMetadata } from '@/lib/themes';
import Theme from '@/themes/supergraphic';

export const metadata = themeMetadata('supergraphic');

export default async function Page() {
  return <Theme content={await getContent()} />;
}
