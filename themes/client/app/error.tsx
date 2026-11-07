'use client';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main style={{ maxWidth: '34rem', margin: '20vh auto', padding: '0 1.5rem', fontFamily: 'system-ui, sans-serif', lineHeight: 1.5 }}>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>The page could not load its coffee list</h1>
      <p style={{ marginBottom: '1.25rem' }}>
        The website could not reach its API. If you are running this locally, start both servers with{' '}
        <code>npm run dev</code> from the project folder, then try again.
      </p>
      <button type="button" onClick={reset} style={{ font: 'inherit', padding: '0.5rem 1rem', cursor: 'pointer' }}>
        Try again
      </button>
    </main>
  );
}
