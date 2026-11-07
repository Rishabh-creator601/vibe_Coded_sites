import { getContent } from '@/lib/content';
import { themeMetadata } from '@/lib/themes';
import Theme from '@/themes/marine-drive';

export const metadata = themeMetadata('marine-drive');

export default async function Page() {
  return <Theme content={await getContent()} />;
}
