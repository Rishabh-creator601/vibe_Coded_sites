import { redirect } from 'next/navigation';
import { afterLogin } from '@/lib/format';
import { getCurrentUser } from '@/lib/server-api';
import { AuthForm } from './AuthForm';
import { ChalkDraft } from './ChalkDraft';

export async function AuthScreen({ mode, next }: { mode: 'login' | 'register'; next?: string }) {
  const user = await getCurrentUser();
  if (user) redirect(afterLogin(user, next));

  return (
    <main className="mx-auto mt-6 grid max-w-5xl items-center gap-12 px-5 md:grid-cols-2 md:px-8">
      <AuthForm mode={mode} next={next} />
      <div className="cloth pinked hidden aspect-[4/5] bg-peacock p-8 text-petal md:block">
        <ChalkDraft kind="krishna" className="h-full w-full" />
      </div>
    </main>
  );
}
