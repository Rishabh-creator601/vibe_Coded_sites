import { getContent } from '@/lib/content';
import { themeMetadata } from '@/lib/themes';
import Theme from '@/themes/cupping-notes';

export const metadata = themeMetadata('cupping-notes');

export default async function Page() {
  return <Theme content={await getContent()} />;
}
