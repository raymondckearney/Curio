import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { loadCompanionProps } from '../../../lib/companionAuth';
import { TERTIARY_BY_PROFILE } from '../../../lib/tertiary';
import MD from '../../../components/CompanionMarkdown';
import PortalSidebar from '../../../components/PortalSidebar';

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
  return {
    props: {
      initialProfile: result.profile,
      me: result.me,
      licenses: result.licenses,
      isIndividual: result.isIndividual,
    },
  };
}

export default function LanguageToolsPage({ initialProfile, me, licenses, isIndividual }) {
  const router = useRouter();
  // People translate to others, not to themselves: their own profile is a
  // valid choice, but listed last rather than defaulted or up front.
  const profileOptions = initialProfile
    ? [...ALL_PROFILES.filter(p => p !== initialProfile), initialProfile]
    : ALL_PROFILES;

  const [tool, setTool] = useState('translate'); // 'translate' | 'detect'

  // Translator state
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('WHAT');
  const [useProfile, setUseProfile] = useState(false);
  const [targetProfile, setTargetProfile] = useState('');
  const [context, setContext] = useState('');

  // Detector state
  const [samples, setSamples] = useState('');
  const [dContext, setDContext] = useState('');
  const [ownWriting, setOwnWriting] = useState('mine'); // 'mine' | 'other'
  const [actualProfile, setActualProfile] = useState('');
  const [fbSent, setFbSent] = useState(false);
  const [fbBusy, setFbBusy] = useState(false);
  const [fbErr, setFbErr] = useState('');

  // Shared
  const [convo, setConvo] = useState([]);
  const [output, setOutput] = useState('');
  const [followup, setFollowup] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);

  const effectiveTarget = useProfile && targetProfile
    ? `${targetProfile.split('-')[0]} (the primary orientation of a ${targetProfile} profile)`
    : target;

  // Switching modes clears state rather than reloading the page.
  const switchTool = (t) => {
    setTool(t); setConvo([]); setOutput(''); setErr('');
    setFollowup(''); setFbSent(false); setFbErr(''); setActualProfile('');
  };

  async function llm(toolName, mode, messages) {
    const res = await fetch('/api/portal/companion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: toolName, mode, messages }),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'Request failed');
    return data.text;
  }

  const runTranslate = async () => {
    if (!source.trim()) { setErr('Paste the message to translate first.'); return; }
    if (useProfile && !targetProfile) { setErr("Choose a person's profile, or pick a register instead."); return; }
    setBusy(true); setErr(''); setOutput('');
    const body = `Translate this message.\n\nTarget: ${effectiveTarget}\n${context ? `Context: ${context}\n` : ''}\nSource message:\n${source}`;
    const msgs = [{ role: 'user', content: body }];
    try {
      const text = await llm('translator', 'translate', msgs);
      setConvo([...msgs, { role: 'assistant', content: text }]);
      setOutput(text);
    } catch (e) { setErr("The request didn't go through. " + e.message); }
    setBusy(false);
  };

  const runDetect = async () => {
    if (!samples.trim() || samples.trim().length < 200) {
      setErr('Paste at least a few paragraphs. One short message is weak evidence; two or three samples from the same writer read far better.');
      return;
    }
    setBusy(true); setErr(''); setOutput(''); setFbSent(false);
    const body = `Read these writing sample(s) from one writer and offer a profile hypothesis.\n\nWriter: ${ownWriting === 'mine' ? 'the samples are my own writing' : 'the samples are from someone I work with (coaching context)'}\n${dContext ? `Context (genre, role, audience): ${dContext}\n` : ''}\nSamples:\n${samples}`;
    const msgs = [{ role: 'user', content: body }];
    try {
      const text = await llm('detector', 'detect', msgs);
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
      const text = await llm(tool === 'translate' ? 'translator' : 'detector', tool === 'translate' ? 'translate' : 'detect', msgs);
      setConvo([...msgs, { role: 'assistant', content: text }]);
      setOutput(text); setFollowup('');
    } catch (e) { setErr("The request didn't go through. " + e.message); }
    setBusy(false);
  };

  const copy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  const submitFeedback = async (profileToSubmit) => {
    if (!profileToSubmit || fbBusy) return;
    setFbBusy(true); setFbErr('');
    try {
      const res = await fetch('/api/portal/detection-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          samples,
          ownWriting: ownWriting === 'mine',
          context: dContext,
          hypothesisRaw: output,
          actualProfile: profileToSubmit,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Request failed');
      setFbSent(true);
    } catch (e) { setFbErr("Couldn't record that. " + e.message); }
    setFbBusy(false);
  };

  const chip = (active) => ({
    borderRadius: 9999, padding: '6px 16px', cursor: 'pointer',
    fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
    background: active ? NAVY : '#fff',
    color: active ? '#fff' : INK,
    border: `1px solid ${active ? NAVY : RULE}`,
  });

  async function logout() {
    await fetch('/api/portal/logout', { method: 'POST' });
    router.push('/portal/login');
  }

  const showMineButton = tool === 'detect' && ownWriting === 'mine' && !!initialProfile;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FAFAF8', fontFamily: "'DM Sans', sans-serif", color: INK }}>
      <Head>
        <title>MindPrint Language Tools — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <PortalSidebar me={me} onLogout={logout} active="translator" licenses={licenses} isIndividual={isIndividual} />

      <main style={{ marginLeft: 220, flex: 1, minHeight: '100vh' }}>

      <div style={{ background: NAVY, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 34, color: '#fff', lineHeight: 1 }}>
            Curio<span style={{ color: TEAL }}>.</span>
          </span>
          <div>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#A7F3D0' }}>MindPrint&trade; Language Tools</div>
            <div style={{ fontFamily: "'Caveat', cursive", fontWeight: 600, fontSize: 20, color: '#fff' }}>
              {tool === 'translate' ? 'Orientation Translator' : 'Profile Detector'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', borderRadius: 9999, padding: 4, background: '#1E293B' }}>
          {[['translate', 'Translate'], ['detect', 'Detect']].map(([k, label]) => (
            <button key={k} onClick={() => switchTool(k)}
              style={{
                borderRadius: 9999, padding: '6px 16px', fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer',
                background: tool === k ? TEAL : 'transparent', color: tool === k ? NAVY : '#CBD5E1',
              }}>
              {label}{k === 'detect' ? ' · beta' : ''}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', background: SOFT, borderBottom: `1px solid ${ACCENT}` }}>
        {tool === 'detect' ? (
          <span style={{ borderRadius: 9999, padding: '4px 12px', fontSize: 9, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', background: '#FEF3C7', border: '1px solid #FCD34D', color: '#92400E' }}>
            Beta &middot; Hypothesis Engine
          </span>
        ) : (
          <span style={{ borderRadius: 9999, padding: '4px 12px', fontSize: 9, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', border: `1px solid ${ACCENT}`, color: ACCENT_TEXT }}>Universal &middot; All Six Profiles</span>
        )}
        <span style={{ fontSize: 12.5 }}>
          {tool === 'translate'
            ? "Same facts, re-answered for the reader's signature question. People wired differently talk past each other; this closes the gap."
            : 'Writing carries a signature: two orientations spent, one quietly skipped. The Detector reads it and offers a hypothesis. Your confirmations are what teach it.'}
        </span>
      </div>

      <div style={{ maxWidth: 768, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ borderRadius: 12, background: '#fff', border: `1px solid ${RULE}`, padding: 20 }}>
          {tool === 'translate' ? (
            <div>
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

              <button onClick={runTranslate} disabled={busy}
                style={{ borderRadius: 8, padding: '10px 20px', fontWeight: 600, color: '#fff', fontSize: '0.875rem', border: 'none', cursor: 'pointer', marginTop: 16, background: busy ? '#94A3B8' : DEEP }}>
                {busy && !output ? 'Translating...' : 'Translate'}
              </button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: EMERALD, marginBottom: 4 }}>Writing samples (one writer)</div>
              <textarea rows={9} value={samples}
                placeholder="Paste two or three samples from the same writer, separated by a blank line. Emails, updates, doc sections. More samples and mixed genres read far better than one message."
                onChange={(e) => setSamples(e.target.value)}
                style={{ width: '100%', borderRadius: 8, padding: 12, fontSize: '0.875rem', outline: 'none', resize: 'vertical', border: `1px solid ${RULE}`, background: '#FCFCFB', lineHeight: 1.5, fontFamily: 'inherit' }} />

              <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: EMERALD }}>Whose writing</span>
                <button onClick={() => setOwnWriting('mine')} style={chip(ownWriting === 'mine')}>My own</button>
                <button onClick={() => setOwnWriting('other')} style={chip(ownWriting === 'other')}>Someone I work with</button>
              </div>

              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: EMERALD, margin: '12px 0 4px' }}>Context (recommended)</div>
              <input value={dContext} placeholder="Genre, role, audience. e.g. weekly status updates from an engineering manager to leadership."
                onChange={(e) => setDContext(e.target.value)}
                style={{ width: '100%', borderRadius: 8, padding: '8px 12px', fontSize: '0.875rem', outline: 'none', border: `1px solid ${RULE}`, background: '#FCFCFB' }} />

              <button onClick={runDetect} disabled={busy}
                style={{ borderRadius: 8, padding: '10px 20px', fontWeight: 600, color: '#fff', fontSize: '0.875rem', border: 'none', cursor: 'pointer', marginTop: 16, background: busy ? '#94A3B8' : DEEP }}>
                {busy && !output ? 'Reading...' : 'Offer a hypothesis'}
              </button>
              <p style={{ fontSize: 10.5, color: '#64748B', marginTop: 10 }}>
                A coaching and communication tool. Not for hiring, screening, or evaluation decisions, and it will decline those uses.
              </p>
            </div>
          )}
          {err && <p style={{ marginTop: 12, fontSize: '0.875rem', color: '#B91C1C' }}>{err}</p>}
        </div>

        {output && (
          <div style={{ borderRadius: 12, marginTop: 20, padding: 20, background: SOFT, border: `1px solid ${ACCENT}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 22, color: NAVY }}>
                {tool === 'translate' ? "Ready to send, once you've judged it" : 'The hypothesis'}
              </span>
              <button onClick={copy}
                style={{ borderRadius: 6, padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, background: '#fff', border: `1px solid ${RULE}`, color: DEEP, cursor: 'pointer' }}>
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <MD text={output} />

            {tool === 'detect' && (
              <div style={{ borderRadius: 8, marginTop: 16, padding: 14, background: '#fff', border: `1px solid ${RULE}` }}>
                <div style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 18, color: NAVY }}>Know the writer's actual profile?</div>
                <p style={{ fontSize: 11, color: '#475569', margin: '3px 0 8px' }}>Every confirmation or correction is what turns this beta into a validated tool.</p>
                {fbSent ? (
                  <p style={{ fontSize: 12, fontWeight: 600, color: DEEP }}>Recorded, thank you. This is exactly the data that improves the Detector.</p>
                ) : (
                  <div>
                    {showMineButton && (
                      <button onClick={() => submitFeedback(initialProfile)} disabled={fbBusy}
                        style={{ borderRadius: 8, padding: '8px 14px', fontSize: '0.8rem', fontWeight: 600, color: '#fff', border: 'none', cursor: 'pointer', marginBottom: 8, background: fbBusy ? '#94A3B8' : EMERALD }}>
                        {fbBusy ? '...' : `That's me, use my profile (${initialProfile})`}
                      </button>
                    )}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <select value={actualProfile} onChange={(e) => setActualProfile(e.target.value)}
                        style={{ borderRadius: 6, padding: '6px 8px', fontSize: '0.875rem', fontWeight: 500, outline: 'none', border: `1px solid ${RULE}` }}>
                        <option value="">actual profile...</option>
                        {ALL_PROFILES.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <button onClick={() => submitFeedback(actualProfile)} disabled={!actualProfile || fbBusy}
                        style={{ borderRadius: 8, padding: '8px 16px', fontSize: '0.875rem', fontWeight: 600, color: '#fff', border: 'none', cursor: 'pointer', background: actualProfile && !fbBusy ? EMERALD : '#94A3B8' }}>
                        {fbBusy ? '...' : 'Submit'}
                      </button>
                    </div>
                    {fbErr && <p style={{ fontSize: 11, color: '#B91C1C', marginTop: 6 }}>{fbErr}</p>}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <input value={followup} placeholder={tool === 'translate' ? 'Refine: shorter, warmer, different channel, push the caveats down...' : "Push back: here's more context, re-read with this in mind..."}
                onChange={(e) => setFollowup(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !busy && refine()}
                style={{ flex: 1, borderRadius: 8, padding: '8px 12px', fontSize: '0.875rem', outline: 'none', border: `1px solid ${RULE}`, background: '#fff' }} />
              <button onClick={refine} disabled={busy}
                style={{ borderRadius: 8, padding: '8px 16px', fontSize: '0.875rem', fontWeight: 600, color: '#fff', border: 'none', cursor: 'pointer', background: busy ? '#94A3B8' : EMERALD }}>
                {busy ? '...' : tool === 'translate' ? 'Refine' : 'Re-read'}
              </button>
            </div>
            <p style={{ fontSize: 10.5, color: ACCENT_TEXT, marginTop: 10 }}>
              {tool === 'translate'
                ? 'Anything marked (proposed) was added to serve the target register and was not in your original, confirm it before sending. Register reads are hypotheses, not diagnoses.'
                : 'A hypothesis from writing, not a diagnosis of a person. Role, audience, and genre shape language as much as wiring; the assessment reads the wiring itself.'}
            </p>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 10, color: '#94A3B8' }}>
        MindPrint&trade; Language Framework v1.0 &middot; choosecurio.com
      </div>

      </main>
    </div>
  );
}
