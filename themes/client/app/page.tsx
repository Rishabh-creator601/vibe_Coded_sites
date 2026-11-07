import type { Metadata } from 'next';
import { Gallery } from '@/components/gallery/Gallery';

export const metadata: Metadata = {
  title: 'Odd Hour: one page, ten themes',
  description: 'The first page of a fictional coffee roaster, designed ten different ways, each in light and dark.',
};

export default function Home() {
  return <Gallery />;
}
