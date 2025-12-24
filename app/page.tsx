import Link from 'next/link';

export default function Home() {
  return (
    <main className="page">
      <header className="hero">
        <div>
          <div className="badge">VOLCANO</div>
          <h1>Virtuoso AI Art Assistant</h1>
          <p className="muted">
            Model-aware prompt engineering studio with learning modes, glossary, style DNA blending,
            intelligent color vocabulary, and live concept expansion.
          </p>
          <div className="row">
            <Link className="btn primary" href="/studio">Open Studio</Link>
            <a className="btn" href="#setup">Setup Supabase</a>
          </div>
        </div>
      </header>

      <section className="card" id="setup">
        <h2>Quick Setup</h2>
        <ol className="list">
          <li>Create a Supabase project.</li>
          <li>Run the SQL in <code>supabase/schema.sql</code>.</li>
          <li>Set env vars in Vercel: <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.</li>
          <li>Deploy from GitHub to Vercel.</li>
        </ol>
      </section>

      <footer className="footer">Built for iPhone/PWA: open in Safari → Share → Add to Home Screen.</footer>
    </main>
  );
}
