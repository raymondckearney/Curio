import { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'curio-assistant-v1';
const STARTERS = [
  "I'm preparing for a tough 1:1",
  'My team meetings run long',
  "What's my tertiary orientation?",
  "I'm onboarding a new hire",
];
const KIND_LABEL = { tool: 'Tool', resource: 'Resource', field_guide: 'Field guide', article: 'Article' };
const LOCK_TEXT = {
  license: 'Not included in your account yet.',
  team: 'Available on team accounts.',
  role: 'For account owners and managers.',
  profile: 'Complete your MindPrint assessment to unlock this.',
};

const CSS = `
  .ca-fab{position:fixed;right:20px;bottom:20px;z-index:300;display:flex;align-items:center;gap:8px;background:#FCD34D;color:#111827;border:none;border-radius:999px;padding:13px 20px;font-family:'DM Sans',sans-serif;font-size:0.95rem;font-weight:700;cursor:pointer;box-shadow:0 6px 24px rgba(15,23,42,0.28);transition:transform 0.15s ease,box-shadow 0.15s ease;}
  .ca-fab:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(15,23,42,0.32);}
  .ca-fab:focus-visible{outline:3px solid #111827;outline-offset:3px;}
  .ca-fab-icon{width:18px;height:18px;flex-shrink:0;}
  .ca-fab-pulse::after{content:'';position:absolute;inset:0;border-radius:999px;box-shadow:0 0 0 0 rgba(252,211,77,0.75);animation:ca-pulse 1.8s ease-out 0.6s 3;pointer-events:none;}
  @keyframes ca-pulse{0%{box-shadow:0 0 0 0 rgba(252,211,77,0.75);}100%{box-shadow:0 0 0 16px rgba(252,211,77,0);}}
  .ca-hint{position:fixed;right:20px;bottom:84px;z-index:300;width:264px;background:#fff;border:1px solid #E2E8F0;border-radius:14px;box-shadow:0 10px 32px rgba(15,23,42,0.22);font-family:'DM Sans',sans-serif;animation:ca-hint-in 0.3s ease-out;}
  .ca-hint::after{content:'';position:absolute;right:40px;bottom:-7px;width:12px;height:12px;background:#fff;border-right:1px solid #E2E8F0;border-bottom:1px solid #E2E8F0;transform:rotate(45deg);}
  .ca-hint-body{display:block;width:100%;text-align:left;background:none;border:none;padding:14px 34px 14px 16px;cursor:pointer;font-family:inherit;color:#0F172A;border-radius:14px;}
  .ca-hint-body strong{display:block;font-size:0.92rem;margin-bottom:3px;}
  .ca-hint-body span{display:block;font-size:0.8rem;color:#475569;line-height:1.45;}
  .ca-hint-close{position:absolute;top:6px;right:6px;background:none;border:none;color:#94A3B8;cursor:pointer;font-size:0.8rem;padding:4px 6px;font-family:inherit;}
  .ca-hint-close:hover{color:#0F172A;}
  @keyframes ca-hint-in{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}
  @media (max-width:768px){.ca-hint{right:14px;bottom:76px;}}
  @media (prefers-reduced-motion:reduce){.ca-fab-pulse::after{animation:none;}.ca-fab{transition:none;}.ca-fab:hover{transform:none;}.ca-hint{animation:none;}}
  .ca-panel{position:fixed;right:20px;bottom:20px;z-index:301;width:390px;height:min(620px,calc(100vh - 40px));display:flex;flex-direction:column;background:#fff;border:1px solid #E2E8F0;border-radius:16px;box-shadow:0 12px 48px rgba(15,23,42,0.25);font-family:'DM Sans',sans-serif;color:#0F172A;overflow:hidden;}
  @media (max-width:768px){.ca-panel{inset:0;width:auto;height:auto;border-radius:0;border:none;}.ca-fab{right:14px;bottom:14px;}}
  .ca-head{background:#0F172A;color:#fff;padding:16px 18px;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;}
  .ca-title{font-family:'Caveat',cursive;font-size:1.55rem;font-weight:700;line-height:1.1;margin:0;}
  .ca-sub{margin:4px 0 0;color:#A7F3D0;font-size:0.8rem;}
  .ca-iconbtn{background:none;border:none;color:rgba(255,255,255,0.7);cursor:pointer;font-size:0.78rem;font-family:inherit;padding:4px 6px;}
  .ca-iconbtn:hover{color:#fff;}
  .ca-body{flex:1;overflow-y:auto;padding:16px;background:#F8FAFC;position:relative;}
  .ca-starters{display:flex;flex-direction:column;gap:8px;}
  .ca-starter{text-align:left;background:#fff;border:1px solid #E2E8F0;border-radius:10px;padding:10px 12px;font-family:inherit;font-size:0.86rem;color:#0F172A;cursor:pointer;}
  .ca-starter:hover{border-color:#059669;}
  .ca-intro{font-size:0.86rem;color:#475569;margin:0 0 12px;line-height:1.5;}
  .ca-user{margin:0 0 10px auto;max-width:85%;background:#059669;color:#fff;border-radius:12px 12px 2px 12px;padding:9px 12px;font-size:0.88rem;line-height:1.45;width:fit-content;}
  .ca-answer{background:#fff;border:1px solid #E2E8F0;border-radius:12px 12px 12px 2px;padding:10px 12px;font-size:0.88rem;line-height:1.55;margin:0 0 10px;}
  .ca-card{background:#fff;border:1px solid #E2E8F0;border-radius:10px;padding:10px 12px;margin:0 0 8px;}
  .ca-kind{display:inline-block;font-size:0.66rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#111827;background:#FCD34D;border-radius:999px;padding:2px 8px;margin-bottom:6px;}
  .ca-name{font-weight:600;font-size:0.9rem;margin:0 0 3px;}
  .ca-why{font-size:0.82rem;color:#475569;margin:0 0 8px;line-height:1.45;}
  .ca-lock{font-size:0.78rem;color:#92400E;margin:0 0 8px;}
  .ca-btn{display:inline-block;font-family:inherit;font-size:0.8rem;font-weight:600;border-radius:7px;padding:7px 12px;cursor:pointer;text-decoration:none;border:none;}
  .ca-open{background:#059669;color:#fff;}
  .ca-request{background:#FEF3C7;color:#92400E;}
  .ca-request:disabled{opacity:0.6;cursor:default;}
  .ca-done{font-size:0.8rem;color:#065F46;font-weight:600;}
  .ca-error{font-size:0.84rem;color:#991B1B;background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:8px 10px;margin:0 0 10px;}
  .ca-typing{font-size:0.84rem;color:#94A3B8;margin:0 0 10px;}
  .ca-form{display:flex;gap:8px;padding:12px;border-top:1px solid #E2E8F0;background:#fff;}
  .ca-input{flex:1;min-width:0;padding:10px 12px;border:1px solid #E2E8F0;border-radius:10px;font-family:inherit;font-size:0.9rem;color:#0F172A;}
  .ca-input:focus{outline:none;border-color:#059669;}
  .ca-send{background:#059669;color:#fff;border:none;border-radius:10px;padding:0 16px;font-family:inherit;font-weight:600;font-size:0.88rem;cursor:pointer;}
  .ca-send:disabled{opacity:0.5;cursor:default;}
  .ca-foot{font-size:0.7rem;color:#94A3B8;text-align:center;padding:0 12px 10px;background:#fff;}
`;

function loadSaved(key) {
  try { return JSON.parse(sessionStorage.getItem(key)) || null; } catch { return null; }
}

export default function CurioAssistant({ userId }) {
  const storageKey = `${STORAGE_KEY}:${userId || 'anon'}`;
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bodyRef = useRef(null);
  const lastTurnRef = useRef(null);
  const inputRef = useRef(null);

  // The sidebar (and this widget with it) remounts on every page change, so
  // the conversation is kept for the browser tab's session. Nothing is saved
  // until the saved copy has been restored, or the empty initial state would
  // overwrite it.
  const [restored, setRestored] = useState(false);
  // One-time intro bubble, remembered per person on this device. It counts
  // as seen once they close it, open the assistant, or it has been on
  // screen for 12 seconds, so leaving the page instantly doesn't use it up.
  const hintKey = `${STORAGE_KEY}:hint-seen:${userId || 'anon'}`;
  const [hint, setHint] = useState(false);
  function dismissHint() {
    setHint(false);
    try { localStorage.setItem(hintKey, '1'); } catch {}
  }
  useEffect(() => {
    let seen = true;
    try { seen = !!localStorage.getItem(hintKey); } catch {}
    if (seen || !restored || open) return;
    const show = setTimeout(() => setHint(true), 1200);
    const hide = setTimeout(dismissHint, 1200 + 12000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [hintKey, restored, open]);

  // Pulse the button the first time it appears in a browser session only,
  // not again on every page change.
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    try {
      if (!sessionStorage.getItem(`${STORAGE_KEY}:pulsed`)) {
        sessionStorage.setItem(`${STORAGE_KEY}:pulsed`, '1');
        setPulse(true);
      }
    } catch {}
  }, []);
  useEffect(() => {
    const saved = loadSaved(storageKey);
    if (saved) { setTurns((saved.turns || []).filter(t => !t.pending)); setOpen(!!saved.open); }
    setRestored(true);
  }, [storageKey]);
  useEffect(() => {
    if (!restored) return;
    try { sessionStorage.setItem(storageKey, JSON.stringify({ turns: turns.filter(t => !t.pending), open })); } catch {}
  }, [turns, open, storageKey, restored]);
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);
  // While waiting, show the "Thinking…" line at the bottom. Once the answer
  // arrives, scroll so the question and the start of its answer sit at the
  // top, rather than landing on the last card. Keyed on the turn count and
  // pending state only, so clicking Request access doesn't move the view.
  const lastPending = !!turns[turns.length - 1]?.pending;
  useEffect(() => {
    const body = bodyRef.current;
    if (!body || !turns.length) return;
    if (lastPending) body.scrollTo({ top: body.scrollHeight, behavior: 'smooth' });
    else if (lastTurnRef.current) body.scrollTo({ top: lastTurnRef.current.offsetTop - 12, behavior: 'smooth' });
  }, [turns.length, lastPending, open]);
  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  async function ask(text) {
    const q = text.trim();
    if (!q || loading) return;
    setInput(''); setError(''); setLoading(true);
    const history = turns.slice(-3).flatMap(t => [{ role: 'user', content: t.query }, { role: 'assistant', content: t.answer }]);
    setTurns(ts => [...ts, { query: q, pending: true }]);
    try {
      const res = await fetch('/api/portal/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, history }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      setTurns(ts => [...ts.slice(0, -1), { query: q, answer: data.answer, recommendations: data.recommendations || [] }]);
    } catch (e) {
      setTurns(ts => ts.slice(0, -1));
      setError(e.message);
      setInput(q);
    } finally {
      setLoading(false);
    }
  }

  async function requestAccess(turnIdx, recId, query) {
    const update = patch => setTurns(ts => ts.map((t, i) => i !== turnIdx ? t : {
      ...t, recommendations: t.recommendations.map(r => r.id === recId ? { ...r, ...patch } : r),
    }));
    update({ requesting: true });
    try {
      const res = await fetch('/api/portal/assistant/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: recId, query }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not send the request.');
      update({ requesting: false, requested: true });
    } catch (e) {
      update({ requesting: false, requestError: e.message });
    }
  }

  if (!open) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {hint && (
          <div className="ca-hint" role="status">
            <button className="ca-hint-body" onClick={() => { dismissHint(); setOpen(true); }}>
              <strong>Need help finding something?</strong>
              <span>Tell Curio what you&apos;re working on and it&apos;ll point you to the right tool.</span>
            </button>
            <button className="ca-hint-close" onClick={dismissHint} aria-label="Dismiss">✕</button>
          </div>
        )}
        <button className={`ca-fab${pulse ? ' ca-fab-pulse' : ''}`} onClick={() => { dismissHint(); setOpen(true); }} aria-label="Open the Curio Assistant">
          <svg className="ca-fab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z" />
            <path d="M9 11.5h.01M12 11.5h.01M15 11.5h.01" strokeWidth="3" />
          </svg>
          Ask Curio
        </button>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ca-panel" role="dialog" aria-label="Curio Assistant">
        <div className="ca-head">
          <div>
            <p className="ca-title">How can Curio help you today?</p>
            <p className="ca-sub">Tell me what you&apos;re working on and I&apos;ll point you to the right tool.</p>
          </div>
          <div style={{ display: 'flex', flexShrink: 0 }}>
            {turns.length > 0 && <button className="ca-iconbtn" onClick={() => { setTurns([]); setError(''); }}>Clear</button>}
            <button className="ca-iconbtn" onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </div>
        </div>

        <div className="ca-body" ref={bodyRef}>
          {turns.length === 0 && (
            <>
              <p className="ca-intro">Ask about a challenge, a task, or MindPrint itself. Try one of these:</p>
              <div className="ca-starters">
                {STARTERS.map(sq => <button key={sq} className="ca-starter" onClick={() => ask(sq)}>{sq}</button>)}
              </div>
            </>
          )}

          {turns.map((t, ti) => (
            <div key={ti} ref={ti === turns.length - 1 ? lastTurnRef : null}>
              <div className="ca-user">{t.query}</div>
              {t.pending ? <p className="ca-typing">Thinking…</p> : (
                <>
                  {t.answer && <div className="ca-answer">{t.answer}</div>}
                  {(t.recommendations || []).map(r => (
                    <div className="ca-card" key={r.id}>
                      <span className="ca-kind">{KIND_LABEL[r.kind] || 'Resource'}</span>
                      <p className="ca-name">{r.name}</p>
                      {r.why && <p className="ca-why">{r.why}</p>}
                      {!r.lock && <a className="ca-btn ca-open" href={r.url}>Open</a>}
                      {r.lock === 'profile' && (
                        <>
                          <p className="ca-lock">{LOCK_TEXT.profile}</p>
                          <a className="ca-btn ca-open" href="/portal/dashboard">Go to My Profile</a>
                        </>
                      )}
                      {r.lock && r.lock !== 'profile' && (
                        <>
                          <p className="ca-lock">{LOCK_TEXT[r.lock]}</p>
                          {r.requested ? (
                            <span className="ca-done">✓ Access requested. Curio will follow up.</span>
                          ) : (
                            <button className="ca-btn ca-request" disabled={r.requesting} onClick={() => requestAccess(ti, r.id, t.query)}>
                              {r.requesting ? 'Sending…' : 'Request access'}
                            </button>
                          )}
                          {r.requestError && <p className="ca-lock" style={{ marginTop: 6 }}>{r.requestError}</p>}
                        </>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          ))}
          {error && <div className="ca-error">{error}</div>}
        </div>

        <form className="ca-form" onSubmit={e => { e.preventDefault(); ask(input); }}>
          <input
            ref={inputRef}
            className="ca-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="What are you working on?"
            maxLength={500}
            aria-label="Ask the Curio Assistant"
          />
          <button className="ca-send" type="submit" disabled={loading || !input.trim()}>Ask</button>
        </form>
        <p className="ca-foot">Answers come from Curio&apos;s MindPrint materials and tools.</p>
      </div>
    </>
  );
}
