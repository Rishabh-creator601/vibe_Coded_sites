import { getContent } from '@/lib/content';
import { themeMetadata } from '@/lib/themes';
import Theme from '@/themes/kissa';

export const metadata = themeMetadata('kissa');

export default async function Page() {
  return <Theme content={await getContent()} />;
}
