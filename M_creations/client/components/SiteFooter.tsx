import Link from 'next/link';
import { SHOP_PHONE, SHOP_PHONE_LINK } from '@/lib/format';
import { WhatsAppButton } from './WhatsAppButton';

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-ink text-petal">
      <div className="zari" />
      <div className="mx-auto flex max-w-7xl flex-wrap items-start justify-between gap-8 px-5 py-10 md:px-8">
        <div>
          <p className="font-display text-3xl leading-none">M Creations</p>
          <p className="mt-2">Stitching and tailoring</p>
        </div>
        <ul className="space-y-1">
          <li><Link className="hover:underline" href="/catalog/stitching">Stitching</Link></li>
          <li><Link className="hover:underline" href="/catalog/ready-made">Ready-made items</Link></li>
          <li><Link className="hover:underline" href="/catalog">All pieces</Link></li>
        </ul>
        <div>
          <a className="block text-xl font-semibold hover:underline" href={SHOP_PHONE_LINK}>{SHOP_PHONE}</a>
          <WhatsAppButton className="mt-1 inline-flex items-center gap-2 hover:underline" />
        </div>
      </div>
    </footer>
  );
}
