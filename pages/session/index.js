import Head from 'next/head';
import { useEffect } from 'react';

export default function SessionTool() {
  useEffect(() => {
    // Redirect to the static session tool page while Next.js version is in development
    // This will be replaced with the full React component in a future update
  }, []);

  return (
    <>
      <Head>
        <title>Curio Session Tool</title>
        <meta name="robots" content="noindex, nofollow" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'DM Sans', sans-serif; background: #fff; color: #1C2B3A; }
          .placeholder {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            padding: 40px;
            text-align: center;
          }
          .placeholder-logo {
            font-family: 'Caveat', cursive;
            font-size: 2.5rem;
            font-weight: 700;
            color: #1C2B3A;
            letter-spacing: -0.01em;
          }
          .placeholder-logo span { color: #059669; }
          .placeholder-title {
            font-family: 'Caveat', cursive;
            font-size: 1.8rem;
            font-weight: 600;
            color: #1C2B3A;
          }
          .placeholder-sub {
            font-size: 1rem;
            color: #78716C;
            max-width: 400px;
            line-height: 1.75;
          }
        `}</style>
      </Head>
      <div className="placeholder">
        <div className="placeholder-logo">Curio<span>.</span></div>
        <div className="placeholder-title">Session Tool</div>
        <p className="placeholder-sub">This tool is currently being built. Check back soon.</p>
      </div>
    </>
  );
}
