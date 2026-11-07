import { getContent } from '@/lib/content';
import { themeMetadata } from '@/lib/themes';
import Theme from '@/themes/herbarium';

export const metadata = themeMetadata('herbarium');

export default async function Page() {
  return <Theme content={await getContent()} />;
}
