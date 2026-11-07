import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-5 py-24">
      <h1 className="text-4xl text-rani">This page is not here</h1>
      <p className="mt-4">The piece may have been removed from the catalog.</p>
      <Link href="/catalog" className="btn btn-primary mt-6">
        See the catalog
      </Link>
    </main>
  );
}
