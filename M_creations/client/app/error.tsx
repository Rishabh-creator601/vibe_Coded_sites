'use client';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-xl px-5 py-24">
      <h1 className="text-4xl text-rani">This page could not load</h1>
      <p className="mt-4">The catalog server did not respond. Try again in a moment.</p>
      <button type="button" onClick={reset} className="btn btn-primary mt-6">
        Try again
      </button>
    </main>
  );
}
