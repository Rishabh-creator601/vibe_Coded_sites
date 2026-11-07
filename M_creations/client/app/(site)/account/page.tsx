import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/components/LogoutButton';
import { PhoneForm } from '@/components/PhoneForm';
import { getCurrentUser } from '@/lib/server-api';

export const metadata: Metadata = { title: 'My account' };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/account');

  return (
    <main className="mx-auto max-w-2xl px-5 pt-10 md:px-8">
      <h1 className="text-5xl text-rani">{user.name}</h1>
      <p className="mt-3 mb-6">{user.email}</p>
      <PhoneForm initial={user.phone} />
      <div className="mt-8 flex flex-wrap gap-3 border-t border-ink/20 pt-6">
        <Link href="/catalog" className="btn btn-primary">
          See the catalog
        </Link>
        <LogoutButton />
      </div>
    </main>
  );
}
