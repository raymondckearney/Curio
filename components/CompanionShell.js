import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { COMPANIONS_UI } from '../lib/companion-ui';
import { TERTIARY_BY_PROFILE } from '../lib/tertiary';

const NAVY = '#0F172A';
const EMERALD = '#059669';
const DEEP = '#065F46';
const TEAL = '#14B8A6';
const INK = '#1E293B';
const RULE = '#E2E8F0';
const ALL_PROFILES = Object.keys(TERTIARY_BY_PROFILE);

function inline(t, keyBase) {
  return t.split(/(\*\*[^*]+\*\*)/g).map((seg, i) =>
    seg.startsWith('**') && seg.endsWith('**')
      ? <b key={keyBase + '-' + i} style={{ color: DEEP, fontWeight: 600 }}>{seg.slice(2, -2)}</b>
      : <span key={keyBase + '-' + i}>{seg}</span>
  );
}

function MD({ text }) {
  const out = [];
  text.split('\n').forEach((line, i) => {
    const l = line.trim();
    if (!l) return;
    if (l.startsWith('## ')) out.push(
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: i === 0 ? 0 : 16, marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: EMERALD }}>{l.slice(3)}</span>
        <span style={{ flex: 1, height: 1, background: RULE }} />
      </div>);
    else if (l.startsWith('- [ ]')) out.push(
      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '4px 0' }}>
        <span style={{ marginTop: 2, display: 'inline-block', width: 14, height: 14, borderRadius: 2, border: `2px solid ${EMERALD}`, flexShrink: 0 }} />
        <span style={{ fontSize: 13, lineHeight: 1.55 }}>{inline(l.slice(5).trim(), i)}</span>
      </div>);
    else if (/^[-•]\s/.test(l)) out.push(
      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '2px 0' }}>
        <span style={{ color: DEEP, fontWeight: 700 }}>·</span>
        <span style={{ fontSize: 13, lineHeight: 1.55 }}>{inline(l.replace(/^[-•]\s/, ''), i)}</span>
      </div>);
    else if (/^\d+\.\s/.test(l)) out.push(
      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline', padding: '2px 0' }}>
        <span style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 17, color: DEEP, minWidth: 16 }}>{l.match(/^\d+/)[0]}</span>
        <span style={{ fontSize: 13, lineHeight: 1.55 }}>{inline(l.replace(/^\d+\.\s/, ''), i)}</span>
      </div>);
    else out.push(<p key={i} style={{ fontSize: 13, lineHeight: 1.6, margin: '4px 0' }}>{inline(l, i)}</p>);
  });
  return <div>{out}</div>;
}

export default function CompanionShell({ companionKey, initialProfile, initialTertiary, isAdmin, hasProfile }) {
  const companion = COMPANIONS_UI[companionKey];
  const modeKeys = Object.keys(companion.modes);

  const [profile, setProfile] = useState(initialProfile || ALL_PROFILES[0]);
  const [mode, setMode] = useState(modeKeys[0]);
  const [fields, setFields] = useState({});
  const [convo, setConvo] = useState([]);
  const [output, setOutput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [followup, setFollowup] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current && bottomRef.current.scrollIntoView({ behavior: 'smooth' }); }, [convo]);

  const m = companion.modes[mode];
  const tertiary = TERTIARY_BY_PROFILE[profile] || initialTertiary;
  const { accent, accentText, soft } = companion.brand;

  const switchMode = (k) => { setMode(k); setFields({}); setConvo([]); setOutput(''); setErr(''); setChatInput(''); setFollowup(''); };

  async function llm(messages) {
    const res = await fetch('/api/portal/companion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: companionKey, mode, messages, profileOverride: isAdmin ? profile : undefined }),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'Request failed');
    return data.text;
  }

  const send = async (userText, priorConvo) => {
    setBusy(true); setErr('');
    const msgs = [...priorConvo, { role: 'user', content: userText }];
    setConvo(msgs);
    try {
      const text = await llm(msgs);
      setConvo([...msgs, { role: 'assistant', content: text }]);
      if (!m.chat) setOutput(text);
      return text;
    } catch (e) { setErr("The request didn't go through. " + e.message); }
    finally { setBusy(false); }
  };

  const startInterview = () => send('Begin the interview with question one.', []);
  const answer = () => { if (chatInput.trim() && !busy) { send(chatInput, convo); setChatInput(''); } };

  const run = async () => {
    const body = (m.fields || []).map((f) => fields[f.id] ? `${f.label}: ${fields[f.id]}` : null).filter(Boolean).join('\n\n');
    if (!body.trim()) { setErr('Fill in the fields above first.'); return; }
    setOutput('');
    if (m.chat) { send(body, []); return; }
    setBusy(true); setErr('');
    const msgs = [{ role: 'user', content: body }];
    try {
      const text = await llm(msgs);
      setConvo([...msgs, { role: 'assistant', content: text }]);
      setOutput(text);
    } catch (e) { setErr("The request didn't go through. " + e.message); }
    setBusy(false);
  };

  const refine = async () => {
    const followText = m.chat ? chatInput : followup;
    if (!followText.trim() || busy) return;
    setBusy(true); setErr('');
    const msgs = [...convo, { role: 'user', content: followText }];
    try {
      const text = await llm(msgs);
      setConvo([...msgs, { role: 'assistant', content: text }]);
      setOutput(text);
      if (m.chat) setChatInput(''); else setFollowup('');
    } catch (e) { setErr("The request didn't go through. " + e.message); }
    setBusy(false);
  };

  const copy = () => {
    const finalText = m.chat ? (convo.filter((c) => c.role === 'assistant').slice(-1)[0] || {}).content || '' : output;
    navigator.clipboard.writeText(finalText); setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  const visibleChat = convo.filter((c, i) => !(m.chat && i === 0));

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'DM Sans', sans-serif", color: INK }}>
      <Head>
        <title>{companion.label} — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div style={{ background: NAVY, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 34, color: '#fff', lineHeight: 1 }}>
            Curio<span style={{ color: TEAL }}>.</span>
          </span>
          <div>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#A7F3D0' }}>MindPrint&trade; AI Companion</div>
            <div style={{ fontFamily: "'Caveat', cursive", fontWeight: 600, fontSize: 20, color: '#fff' }}>{companion.label}</div>
          </div>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#94A3B8' }}>Profile override (admin)</span>
            <select value={profile} onChange={(e) => setProfile(e.target.value)}
              style={{ borderRadius: 6, padding: '6px 8px', fontSize: '0.875rem', fontWeight: 500, background: '#1E293B', color: '#fff', border: '1px solid #334155', outline: 'none' }}>
              {ALL_PROFILES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        )}
      </div>

      <div style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', background: soft, borderBottom: `1px solid ${accent}` }}>
        <span style={{ borderRadius: 9999, padding: '4px 12px', fontSize: 9, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', background: EMERALD, color: '#fff' }}>Replace</span>
        <span style={{ borderRadius: 9999, padding: '4px 12px', fontSize: 9, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', border: `1px solid ${accent}`, color: accentText }}>Supports Tertiary {companion.supports}</span>
        <span style={{ fontSize: 12.5 }}>{tertiary === companion.supports ? companion.banner.match : companion.banner.other}</span>
      </div>

      <div style={{ maxWidth: 768, margin: '0 auto', padding: '24px 16px' }}>
        {!hasProfile && !isAdmin ? (
          <div style={{ borderRadius: 12, background: '#fff', border: `1px solid ${RULE}`, padding: 32, textAlign: 'center' }}>
            <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.7 }}>
              Complete your MindPrint&trade; assessment to unlock your Companion. Check your email for the link, or contact your account manager.
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {modeKeys.map((k) => (
                <button key={k} onClick={() => switchMode(k)}
                  style={{
                    borderRadius: 9999, padding: '6px 16px', cursor: 'pointer',
                    fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
                    background: mode === k ? NAVY : '#fff',
                    color: mode === k ? '#fff' : INK,
                    border: `1px solid ${mode === k ? NAVY : RULE}`,
                  }}>{companion.modes[k].tab}</button>
              ))}
            </div>

            {m.chat ? (
              <div style={{ borderRadius: 12, background: '#fff', border: `1px solid ${RULE}`, padding: 20 }}>
                <div style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 26, color: NAVY }}>{m.tab}</div>
                <p style={{ fontSize: 12.5, color: '#475569', marginTop: 2, marginBottom: 14 }}>{m.desc}</p>
                {convo.length === 0 ? (
                  <button onClick={startInterview} disabled={busy}
                    style={{ borderRadius: 8, padding: '10px 20px', fontWeight: 600, color: '#fff', fontSize: '0.875rem', border: 'none', cursor: 'pointer', background: busy ? '#94A3B8' : DEEP }}>
                    {busy ? 'Working...' : 'Start the interview'}
                  </button>
                ) : (
                  <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 384, overflowY: 'auto', paddingRight: 4 }}>
                      {visibleChat.map((c, i) =>
                        c.role === 'assistant' ? (
                          <div key={i} style={{ borderRadius: 8, padding: 12, background: soft, border: `1px solid ${accent}` }}>
                            <MD text={c.content} />
                          </div>
                        ) : (
                          <div key={i} style={{ alignSelf: 'flex-end', borderRadius: 8, padding: '8px 12px', maxWidth: 448, background: NAVY, color: '#fff', fontSize: 13 }}>
                            {c.content}
                          </div>
                        )
                      )}
                      <div ref={bottomRef} />
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                      <input value={chatInput} placeholder="Your answer..."
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && answer()}
                        style={{ flex: 1, borderRadius: 8, padding: '8px 12px', fontSize: '0.875rem', outline: 'none', border: `1px solid ${RULE}`, background: '#FCFCFB' }} />
                      <button onClick={answer} disabled={busy}
                        style={{ borderRadius: 8, padding: '8px 16px', fontSize: '0.875rem', fontWeight: 600, color: '#fff', border: 'none', cursor: 'pointer', background: busy ? '#94A3B8' : EMERALD }}>
                        {busy ? '...' : 'Send'}
                      </button>
                      <button onClick={copy}
                        style={{ borderRadius: 8, padding: '8px 12px', fontSize: '0.75rem', fontWeight: 600, background: '#fff', border: `1px solid ${RULE}`, color: DEEP, cursor: 'pointer' }}>
                        {copied ? 'Copied' : 'Copy last'}
                      </button>
                    </div>
                  </div>
                )}
                {err && <p style={{ marginTop: 12, fontSize: '0.875rem', color: '#B91C1C' }}>{err}</p>}
              </div>
            ) : (
              <div>
                <div style={{ borderRadius: 12, background: '#fff', border: `1px solid ${RULE}`, padding: 20 }}>
                  <div style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 26, color: NAVY }}>{m.tab}</div>
                  <p style={{ fontSize: 12.5, color: '#475569', marginTop: 2, marginBottom: 14 }}>{m.desc}</p>
                  {(m.fields || []).map((f) => (
                    <div key={f.id} style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: EMERALD, marginBottom: 4 }}>{f.label}</div>
                      <textarea rows={f.rows} value={fields[f.id] || ''} placeholder={f.ph}
                        onChange={(e) => setFields({ ...fields, [f.id]: e.target.value })}
                        style={{ width: '100%', borderRadius: 8, padding: 12, fontSize: '0.875rem', outline: 'none', resize: 'vertical', border: `1px solid ${RULE}`, background: '#FCFCFB', lineHeight: 1.5, fontFamily: 'inherit' }} />
                    </div>
                  ))}
                  <button onClick={run} disabled={busy}
                    style={{ borderRadius: 8, padding: '10px 20px', fontWeight: 600, color: '#fff', fontSize: '0.875rem', border: 'none', cursor: 'pointer', background: busy ? '#94A3B8' : DEEP }}>
                    {busy && !output ? 'Working...' : m.verb}
                  </button>
                  {err && <p style={{ marginTop: 12, fontSize: '0.875rem', color: '#B91C1C' }}>{err}</p>}
                </div>

                {output && (
                  <div style={{ borderRadius: 12, marginTop: 20, padding: 20, background: soft, border: `1px solid ${accent}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 22, color: NAVY }}>Your draft to judge</span>
                      <button onClick={copy}
                        style={{ borderRadius: 6, padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, background: '#fff', border: `1px solid ${RULE}`, color: DEEP, cursor: 'pointer' }}>
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <MD text={output} />
                    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                      <input value={followup} placeholder="Refine it: add, remove, push deeper..."
                        onChange={(e) => setFollowup(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !busy && refine()}
                        style={{ flex: 1, borderRadius: 8, padding: '8px 12px', fontSize: '0.875rem', outline: 'none', border: `1px solid ${RULE}`, background: '#fff' }} />
                      <button onClick={refine} disabled={busy}
                        style={{ borderRadius: 8, padding: '8px 16px', fontSize: '0.875rem', fontWeight: 600, color: '#fff', border: 'none', cursor: 'pointer', background: busy ? '#94A3B8' : EMERALD }}>
                        {busy ? '...' : 'Refine'}
                      </button>
                    </div>
                    <p style={{ fontSize: 10.5, color: accentText, marginTop: 10 }}>
                      AI output is a strong first pass, not a finished fact. Edit before it ships; for high-stakes work, add a {companion.supports}-primary review.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 10, color: '#94A3B8' }}>
        MindPrint&trade; Tertiary Support Library · choosecurio.com
      </div>
    </div>
  );
}
