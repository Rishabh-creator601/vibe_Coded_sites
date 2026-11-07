import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PhoneForm } from '@/components/PhoneForm';
import { safeNext } from '@/lib/format';
import { getCurrentUser } from '@/lib/server-api';

export const metadata: Metadata = { title: 'Add your WhatsApp number' };

export default async function AddPhonePage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const target = safeNext(next, user.role === 'admin' ? '/admin' : '/account');
  if (user.phone || user.role === 'admin') redirect(target);

  return (
    <main className="mx-auto max-w-2xl px-5 pt-10 md:px-8">
      <h1 className="text-5xl text-rani">One last step, {user.name}</h1>
      <p className="mt-3 mb-6">Add the number you use on WhatsApp to finish setting up your account.</p>
      <PhoneForm next={target} />
    </main>
  );
}
