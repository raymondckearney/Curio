import { useState } from 'react';
import Head from 'next/head';
import { findActiveMirrorToken, getMirrorTokenFromCookie, mirrorCookie } from '../lib/mirrorAuth';
import MD from '../components/CompanionMarkdown';

const NAVY = '#0F172A';
const EMERALD = '#059669';
const DEEP = '#065F46';
const TEAL = '#14B8A6';
const INK = '#1E293B';
const RULE = '#E2E8F0';
const ACCENT = '#14B8A6';
const SOFT = 'rgba(20,184,166,0.12)';

// Hidden, token-gated: no portal auth, reached via /mirror?key=<token>.
// Returns a real 404 (not a redirect, not 403) on any invalid or missing
// credential, so the page reveals nothing about its own existence.
export async function getServerSideProps({ req, res, query }) {
  const cookieToken = getMirrorTokenFromCookie(req);
  let row = cookieToken ? await findActiveMirrorToken(cookieToken) : null;

  if (!row && query.key) {
    row = await findActiveMirrorToken(query.key);
    if (row) res.setHeader('Set-Cookie', mirrorCookie(query.key));
  }

  if (!row) return { notFound: true };

  return { props: {} };
}

export default function LanguageMirrorPage() {
  const [sample, setSample] = useState('');
  const [isMine, setIsMine] = useState(false);
  const [consent, setConsent] = useState(false);
  const [output, setOutput] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const run = async () => {
    if (!sample.trim() || sample.trim().length < 200) {
      setErr('Paste at least a solid paragraph or two, around 200 characters minimum, so the read has something to work with.');
      return;
    }
    if (!isMine) { setErr('The Mirror reads your own writing only. Please confirm the sample is yours.'); return; }
    setBusy(true); setErr(''); setOutput('');
    try {
      const res = await fetch('/api/mirror', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sample, isMine, consent }),
      });
      if (res.status === 404) throw new Error('This link is no longer active.');
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Request failed');
      setOutput(data.text);
    } catch (e) { setErr("The request didn't go through. " + e.message); }
    setBusy(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'DM Sans', sans-serif", color: INK }}>
      <Head>
        <title>The Language Mirror — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div style={{ background: NAVY, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 34, color: '#fff', lineHeight: 1 }}>
            Curio<span style={{ color: TEAL }}>.</span>
          </span>
          <div>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#A7F3D0' }}>MindPrint&trade; Language Tools</div>
            <div style={{ fontFamily: "'Caveat', cursive", fontWeight: 600, fontSize: 20, color: '#fff' }}>The Language Mirror</div>
          </div>
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: '#94A3B8' }}>Private preview</span>
      </div>

      <div style={{ padding: '12px 24px', background: SOFT, borderBottom: `1px solid ${ACCENT}` }}>
        <span style={{ fontSize: 12.5 }}>Your writing carries a signature: the orientations you spend words on, and the one you quietly skip. Paste a sample of your own writing and see what it suggests. A read of your words is a hypothesis; the MindPrint&trade; assessment is the answer.</span>
      </div>

      <div style={{ maxWidth: 768, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ borderRadius: 12, background: '#fff', border: `1px solid ${RULE}`, padding: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: EMERALD, marginBottom: 4 }}>A sample of your writing</div>
          <textarea rows={9} value={sample}
            placeholder="Paste something you wrote: an email, a project update, a proposal section. The more natural the better, a few paragraphs is plenty."
            onChange={(e) => setSample(e.target.value)}
            style={{ width: '100%', borderRadius: 8, padding: 12, fontSize: '0.875rem', outline: 'none', resize: 'vertical', border: `1px solid ${RULE}`, background: '#FCFCFB', lineHeight: 1.5, fontFamily: 'inherit' }} />

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 12, cursor: 'pointer' }}>
            <input type="checkbox" checked={isMine} onChange={(e) => setIsMine(e.target.checked)} style={{ marginTop: 3 }} />
            <span style={{ fontSize: 12 }}>This is my own writing.</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 3 }} />
            <span style={{ fontSize: 12, color: '#475569' }}>Optional: Curio may keep this sample to improve how MindPrint&trade; reads language.</span>
          </label>

          <button onClick={run} disabled={busy}
            style={{ borderRadius: 8, padding: '10px 20px', fontWeight: 600, color: '#fff', fontSize: '0.875rem', border: 'none', cursor: 'pointer', marginTop: 16, background: busy ? '#94A3B8' : DEEP }}>
            {busy ? 'Reading...' : 'Read my writing'}
          </button>
          {err && <p style={{ marginTop: 12, fontSize: '0.875rem', color: '#B91C1C' }}>{err}</p>}
        </div>

        {output && (
          <div style={{ borderRadius: 12, marginTop: 20, padding: 20, background: SOFT, border: `1px solid ${ACCENT}` }}>
            <span style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 22, color: NAVY }}>What your words suggest</span>
            <MD text={output} />
            <div style={{ borderRadius: 8, marginTop: 20, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, background: NAVY }}>
              <div>
                <div style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 20, color: '#fff' }}>Curious if the read matches your wiring?</div>
                <div style={{ fontSize: 11.5, color: '#CBD5E1' }}>Writing is shaped by role and audience. The MindPrint&trade; assessment reads the wiring itself.</div>
              </div>
              <a href="https://choosecurio.com/buy"
                style={{ borderRadius: 8, padding: '10px 20px', fontWeight: 600, fontSize: '0.875rem', background: TEAL, color: NAVY, textDecoration: 'none' }}>
                Take the assessment
              </a>
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 10, color: '#94A3B8' }}>
        MindPrint&trade; Language Framework v1.0 &middot; A read of writing is a hypothesis, not a diagnosis &middot; choosecurio.com
      </div>
    </div>
  );
}
