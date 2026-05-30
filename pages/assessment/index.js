import Head from 'next/head';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

export default function Assessment() {
  const router = useRouter();
  const embedRef = useRef(null);

  useEffect(() => {
    if (!router.isReady) return;

    const { token, name, email } = router.query;

    // Build hidden fields string for Typeform embed
    const hiddenParts = [];
    if (name)  hiddenParts.push(`name=${encodeURIComponent(name)}`);
    if (email) hiddenParts.push(`email=${encodeURIComponent(email)}`);
    if (token) hiddenParts.push(`token=${encodeURIComponent(token)}`);

    if (embedRef.current && hiddenParts.length > 0) {
      embedRef.current.setAttribute('data-tf-hidden', hiddenParts.join(','));
    }

    const script = document.createElement('script');
    script.src = '//embed.typeform.com/next/embed.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, [router.isReady, router.query]);

  return (
    <Layout>
      <Head>
        <title>Take the Assessment — Curio</title>
        <meta name="description" content="Discover your MindPrint™ Profile. Take the assessment to find out how you think — and how to use it." />
        <style>{`
          #assessment-hero {
            background: #0F172A;
            padding: calc(var(--nav-h) + 64px) 0 56px;
            text-align: center;
            position: relative;
          }
          .assessment-back {
            position: absolute;
            top: calc(var(--nav-h) + 20px);
            left: 50%;
            transform: translateX(-50%);
            width: calc(100% - 48px);
            max-width: 1200px;
            display: flex;
            justify-content: flex-end;
          }
          .assessment-back a {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 0.85rem;
            font-weight: 500;
            color: rgba(255,255,255,0.5);
            text-decoration: none;
            transition: color 0.2s;
          }
          .assessment-back a:hover { color: rgba(255,255,255,0.9); }
          .assessment-eyebrow {
            font-size: 0.78rem;
            font-weight: 600;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: var(--gold);
            margin-bottom: 16px;
          }
          .assessment-title {
            font-family: var(--font-display);
            font-size: clamp(2.4rem, 5vw, 4rem);
            font-weight: 900;
            color: #fff;
            line-height: 1.05;
            margin: 0 0 20px;
          }
          .assessment-sub {
            font-size: clamp(1rem, 1.3vw, 1.15rem);
            font-weight: 400;
            color: rgba(255,255,255,0.72);
            max-width: 560px;
            margin: 0 auto;
            line-height: 1.75;
          }
          #assessment-embed {
            background: var(--paper-warm);
            padding: 0;
            min-height: 640px;
          }
          .tf-wrap {
            max-width: 900px;
            margin: 0 auto;
            padding: 64px 24px 80px;
          }
          [data-tf-live] { min-height: 560px; }
        `}</style>
      </Head>

      {/* HERO */}
      <section id="assessment-hero">
        <div className="assessment-back">
          <a href="#" onClick={(e) => { e.preventDefault(); history.back(); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Go back
          </a>
        </div>
        <div className="container">
          <p className="assessment-eyebrow">MindPrint™ Assessment</p>
          <h1 className="assessment-title">Discover your profile.</h1>
          <p className="assessment-sub">Find out how you think — and how to use it. Takes about 5 minutes.</p>
        </div>
      </section>

      {/* EMBED */}
      <section id="assessment-embed">
        <div className="tf-wrap">
          <div ref={embedRef} data-tf-live="01KSPEY5T3A63WKTMY1XMBT178"></div>
        </div>
      </section>
    </Layout>
  );
}
