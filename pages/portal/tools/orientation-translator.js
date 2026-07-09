import { useState } from 'react';
import Head from 'next/head';
import { loadCompanionProps } from '../../../lib/companionAuth';
import { TERTIARY_BY_PROFILE } from '../../../lib/tertiary';
import MD from '../../../components/CompanionMarkdown';

const NAVY = '#0F172A';
const EMERALD = '#059669';
const DEEP = '#065F46';
const TEAL = '#14B8A6';
const INK = '#1E293B';
const RULE = '#E2E8F0';
const ACCENT = '#14B8A6';
const ACCENT_TEXT = '#0F766E';
const SOFT = 'rgba(20,184,166,0.12)';

const TARGETS = ['WHY', 'WHAT', 'HOW', 'All three'];
const ALL_PROFILES = Object.keys(TERTIARY_BY_PROFILE);

export async function getServerSideProps({ req }) {
  const result = await loadCompanionProps(req, 'orientation_translator');
  if (result.redirect) return { redirect: { destination: '/portal/login', permanent: false } };
  if (result.locked) return { redirect: { destination: '/portal/dashboard', permanent: false } };
  return { props: { initialProfile: result.profile } };
}

export default function OrientationTranslatorPage({ initialProfile }) {
  // People translate to others, not to themselves: their own profile is a
  // valid choice, but listed last rather than defaulted or up front.
  const profileOptions = initialProfile
    ? [...ALL_PROFILES.filter(p => p !== initialProfile), initialProfile]
    : ALL_PROFILES;

  const [source, setSource] = useState('');
  const [target, setTarget] = useState('WHAT');
  const [useProfile, setUseProfile] = useState(false);
  const [targetProfile, setTargetProfile] = useState('');
  const [context, setContext] = useState('');
  const [convo, setConvo] = useState([]);
  const [output, setOutput] = useState('');
  const [followup, setFollowup] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);

  const effectiveTarget = useProfile && targetProfile
    ? `${targetProfile.split('-')[0]} (the primary orientation of a ${targetProfile} profile)`
    : target;

  async function llm(messages) {
    const res = await fetch('/api/portal/companion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'translator', mode: 'translate', messages }),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'Request failed');
    return data.text;
  }

  const run = async () => {
    if (!source.trim()) { setErr('Paste the message to translate first.'); return; }
    if (useProfile && !targetProfile) { setErr("Choose a person's profile, or pick a register instead."); return; }
    setBusy(true); setErr(''); setOutput('');
    const body = `Translate this message.\n\nTarget: ${effectiveTarget}\n${context ? `Context: ${context}\n` : ''}\nSource message:\n${source}`;
    const msgs = [{ role: 'user', content: body }];
    try {
      const text = await llm(msgs);
      setConvo([...msgs, { role: 'assistant', content: text }]);
      setOutput(text);
    } catch (e) { setErr("The request didn't go through. " + e.message); }
    setBusy(false);
  };

  const refine = async () => {
    if (!followup.trim() || busy) return;
    setBusy(true); setErr('');
    const msgs = [...convo, { role: 'user', content: followup }];
    try {
      const text = await llm(msgs);
      setConvo([...msgs, { role: 'assistant', content: text }]);
      setOutput(text); setFollowup('');
    } catch (e) { setErr("The request didn't go through. " + e.message); }
    setBusy(false);
  };

  const copy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  const chip = (active) => ({
    borderRadius: 9999, padding: '6px 16px', cursor: 'pointer',
    fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
    background: active ? NAVY : '#fff',
    color: active ? '#fff' : INK,
    border: `1px solid ${active ? NAVY : RULE}`,
  });

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'DM Sans', sans-serif", color: INK }}>
      <Head>
        <title>Orientation Translator — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div style={{ background: NAVY, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 34, color: '#fff', lineHeight: 1 }}>
            Curio<span style={{ color: TEAL }}>.</span>
          </span>
          <div>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#A7F3D0' }}>MindPrint&trade; Language Tools</div>
            <div style={{ fontFamily: "'Caveat', cursive", fontWeight: 600, fontSize: 20, color: '#fff' }}>Orientation Translator</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', background: SOFT, borderBottom: `1px solid ${ACCENT}` }}>
        <span style={{ borderRadius: 9999, padding: '4px 12px', fontSize: 9, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', border: `1px solid ${ACCENT}`, color: ACCENT_TEXT }}>Universal · All Six Profiles</span>
        <span style={{ fontSize: 12.5 }}>Same facts, re-answered for the reader's signature question. People wired differently talk past each other; this closes the gap.</span>
      </div>

      <div style={{ maxWidth: 768, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ borderRadius: 12, background: '#fff', border: `1px solid ${RULE}`, padding: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: EMERALD, marginBottom: 4 }}>Your message</div>
          <textarea rows={8} value={source} placeholder="Paste the email, update, or doc you're about to send."
            onChange={(e) => setSource(e.target.value)}
            style={{ width: '100%', borderRadius: 8, padding: 12, fontSize: '0.875rem', outline: 'none', resize: 'vertical', border: `1px solid ${RULE}`, background: '#FCFCFB', lineHeight: 1.5, fontFamily: 'inherit' }} />

          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: EMERALD, margin: '12px 0 6px' }}>Translate for</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {TARGETS.map((t) => (
              <button key={t} onClick={() => { setTarget(t); setUseProfile(false); }} style={chip(!useProfile && target === t)}>
                {t === 'All three' ? t : `${t}-speak`}
              </button>
            ))}
            <span style={{ fontSize: 11, color: '#64748B' }}>or a person's profile:</span>
            <select value={useProfile ? targetProfile : ''}
              onChange={(e) => { if (e.target.value) { setTargetProfile(e.target.value); setUseProfile(true); } else { setUseProfile(false); setTargetProfile(''); } }}
              style={{ borderRadius: 6, padding: '6px 8px', fontSize: '0.875rem', fontWeight: 500, outline: 'none', border: `1px solid ${useProfile ? NAVY : RULE}`, background: useProfile ? NAVY : '#fff', color: useProfile ? '#fff' : INK }}>
              <option value="">choose...</option>
              {profileOptions.map((p) => <option key={p} value={p}>{p}{p === initialProfile ? ' (yours)' : ''}</option>)}
            </select>
          </div>

          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: EMERALD, margin: '12px 0 4px' }}>Context (optional)</div>
          <input value={context} placeholder="Channel, relationship, stakes. e.g. Slack to my manager, deadline is at risk."
            onChange={(e) => setContext(e.target.value)}
            style={{ width: '100%', borderRadius: 8, padding: '8px 12px', fontSize: '0.875rem', outline: 'none', border: `1px solid ${RULE}`, background: '#FCFCFB' }} />

          <button onClick={run} disabled={busy}
            style={{ borderRadius: 8, padding: '10px 20px', fontWeight: 600, color: '#fff', fontSize: '0.875rem', border: 'none', cursor: 'pointer', marginTop: 16, background: busy ? '#94A3B8' : DEEP }}>
            {busy && !output ? 'Translating...' : 'Translate'}
          </button>
          {err && <p style={{ marginTop: 12, fontSize: '0.875rem', color: '#B91C1C' }}>{err}</p>}
        </div>

        {output && (
          <div style={{ borderRadius: 12, marginTop: 20, padding: 20, background: SOFT, border: `1px solid ${ACCENT}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 22, color: NAVY }}>Ready to send, once you've judged it</span>
              <button onClick={copy}
                style={{ borderRadius: 6, padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, background: '#fff', border: `1px solid ${RULE}`, color: DEEP, cursor: 'pointer' }}>
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <MD text={output} />
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <input value={followup} placeholder="Refine: shorter, warmer, different channel, push the caveats down..."
                onChange={(e) => setFollowup(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !busy && refine()}
                style={{ flex: 1, borderRadius: 8, padding: '8px 12px', fontSize: '0.875rem', outline: 'none', border: `1px solid ${RULE}`, background: '#fff' }} />
              <button onClick={refine} disabled={busy}
                style={{ borderRadius: 8, padding: '8px 16px', fontSize: '0.875rem', fontWeight: 600, color: '#fff', border: 'none', cursor: 'pointer', background: busy ? '#94A3B8' : EMERALD }}>
                {busy ? '...' : 'Refine'}
              </button>
            </div>
            <p style={{ fontSize: 10.5, color: ACCENT_TEXT, marginTop: 10 }}>
              Anything marked (proposed) was added to serve the target register and was not in your original, confirm it before sending. Register reads are hypotheses, not diagnoses.
            </p>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 10, color: '#94A3B8' }}>
        MindPrint&trade; Language Framework v1.0 · choosecurio.com
      </div>
    </div>
  );
}
