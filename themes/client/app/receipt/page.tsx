import { getContent } from '@/lib/content';
import { themeMetadata } from '@/lib/themes';
import Theme from '@/themes/receipt';

export const metadata = themeMetadata('receipt');

export default async function Page() {
  return <Theme content={await getContent()} />;
}
