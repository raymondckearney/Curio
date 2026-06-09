import Head from 'next/head';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useTokenGate } from '../hooks/useTokenGate';

// ─── Shared constants (mirrors /fit) ─────────────────────────────────────────

const TYPES = [
  { id: "WHY-WHAT", label: "WHY – WHAT", tagline: "Purpose-driven, progress-oriented",   primary: "WHY",  secondary: "WHAT" },
  { id: "WHY-HOW",  label: "WHY – HOW",  tagline: "Purpose-driven, precision-oriented",  primary: "WHY",  secondary: "HOW"  },
  { id: "WHAT-WHY", label: "WHAT – WHY", tagline: "Progress-driven, purpose-oriented",   primary: "WHAT", secondary: "WHY"  },
  { id: "WHAT-HOW", label: "WHAT – HOW", tagline: "Progress-driven, precision-oriented", primary: "WHAT", secondary: "HOW"  },
  { id: "HOW-WHY",  label: "HOW – WHY",  tagline: "Precision-driven, purpose-oriented",  primary: "HOW",  secondary: "WHY"  },
  { id: "HOW-WHAT", label: "HOW – WHAT", tagline: "Precision-driven, progress-oriented", primary: "HOW",  secondary: "WHAT" },
];

// WHY = emerald (#10B981 family), WHAT = blue (#3B82F6 family), HOW = amber (#D97706 family)
// Matches the design system: globals.css t-bar--why (rgba(52,211,153)), t-bar--what (rgba(96,165,250)), t-bar--how (rgba(251,191,36))
const DEMAND_COLORS = {
  WHY:  '#10B981',
  WHAT: '#3B82F6',
  HOW:  '#D97706',
};

const CACHE_VERSION = 'v1';
function normalizeJD(text) { return text.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 400); }
function getCacheKey(n) { return `curio-jd-${CACHE_VERSION}-${n}`; }
function getSplitKey(n) { return `curio-jd-split-${CACHE_VERSION}-${n}`; }

// Identical scoring formula to /fit — deterministic, no AI variance
function calcScore(demandSplit, typeId) {
  const type = TYPES.find(t => t.id === typeId);
  const tertiary = ["WHY","WHAT","HOW"].find(b => b !== type.primary && b !== type.secondary);
  const dp = demandSplit[type.primary.toLowerCase()] || 0;
  const ds = demandSplit[type.secondary.toLowerCase()] || 0;
  const dt = demandSplit[tertiary.toLowerCase()] || 0;
  const rawScore = dp * 1.25 + ds * 0.8 + dt * (-1.5);
  const linear = Math.max(0, Math.min(1, (rawScore + 150) / 275));
  return Math.round(Math.pow(linear, 1.5) * 100);
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function ScoreRing({ score, size = 120 }) {
  const r = size <= 88 ? 32 : 48;
  const circ = 2 * Math.PI * r;
  const pct = Math.round(score);
  const dash = (pct / 100) * circ;
  const color = pct >= 75 ? "#059669" : pct >= 60 ? "#34D399" : pct >= 40 ? "#F59E0B" : "#EF4444";
  const label = pct >= 75 ? "Strong fit" : pct >= 60 ? "Good fit" : pct >= 40 ? "Partial fit" : pct >= 20 ? "Poor fit" : "Severe mismatch";
  const labelBg = pct >= 75 ? "rgba(5,150,105,0.08)" : pct >= 60 ? "rgba(52,211,153,0.08)" : pct >= 40 ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)";
  const labelBorder = pct >= 75 ? "rgba(5,150,105,0.3)" : pct >= 60 ? "rgba(52,211,153,0.3)" : pct >= 40 ? "rgba(245,158,11,0.3)" : "rgba(239,68,68,0.3)";
  const cx = size / 2;
  return (
    <div className="score-ring-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#E7E5E4" strokeWidth={size <= 88 ? 6 : 8} />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={size <= 88 ? 6 : 8}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cx})`}
          style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }}
        />
        <text x={cx} y={cx - 4} textAnchor="middle" fontSize={size <= 88 ? 16 : 24} fontWeight="700" fill={color} fontFamily="Caveat, cursive">{pct}%</text>
        <text x={cx} y={cx + (size <= 88 ? 9 : 11)} textAnchor="middle" fontSize={size <= 88 ? 7 : 10} fill="#A8A29E" fontFamily="DM Sans, sans-serif" letterSpacing="0.08em">MATCH</text>
      </svg>
      <span className="score-fit-label" style={{ color, background: labelBg, border: `1px solid ${labelBorder}` }}>{label}</span>
    </div>
  );
}

function BulletList({ items, muted }) {
  return (
    <div className="bullet-list">
      {(items || []).map((item, i) => (
        <div key={i} className="bullet-item">
          <span className={`bullet-dot${muted ? " bullet-dot--muted" : ""}`} />
          <span className="bullet-text">{item}</span>
        </div>
      ))}
    </div>
  );
}

function DemandBar({ demandSplit }) {
  const { why, what, how } = demandSplit;
  const segments = [
    { key: 'why', val: why, color: DEMAND_COLORS.WHY, label: 'WHY', sub: 'Direction & vision', radius: '6px 0 0 6px' },
    { key: 'what', val: what, color: DEMAND_COLORS.WHAT, label: 'WHAT', sub: 'Execution & delivery', radius: '0' },
    { key: 'how', val: how, color: DEMAND_COLORS.HOW, label: 'HOW', sub: 'Process & precision', radius: '0 6px 6px 0' },
  ];
  return (
    <div className="demand-wrap">
      <div className="demand-track">
        {segments.map(seg => (
          <div key={seg.key} style={{ width: `${seg.val}%`, background: seg.color, borderRadius: seg.radius, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'width 0.8s cubic-bezier(.4,0,.2,1)' }}>
            {seg.val >= 12 && <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.04em' }}>{seg.val}%</span>}
          </div>
        ))}
      </div>
      <div className="demand-legend">
        {segments.map(seg => (
          <div key={seg.key} className="demand-legend-item">
            <span className="demand-dot" style={{ background: seg.color }} />
            <div>
              <span className="demand-legend-name" style={{ color: seg.color }}>{seg.label} {seg.val}%</span>
              <span className="demand-legend-sub">{seg.sub}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileCard({ typeId, score, analysis, variant, rank }) {
  const [expanded, setExpanded] = useState(false);
  const type = TYPES.find(t => t.id === typeId);
  const isFull = variant === 'full';
  const showDetail = isFull || expanded;

  return (
    <div className={`profile-card${isFull ? ' profile-card--full' : ' profile-card--compact'}`}>
      <div className="profile-card-header">
        <div className="profile-card-meta">
          {isFull && (
            <div className="best-match-badge">{rank === 1 ? '★ Best Match' : '★ Strong Match'}</div>
          )}
          <div className="profile-combo">{type.label}</div>
          <div className="profile-tagline">{type.tagline}</div>
          {isFull && analysis.rationale && (
            <p className="profile-rationale">{analysis.rationale}</p>
          )}
        </div>
        <ScoreRing score={score} size={isFull ? 120 : 88} />
      </div>

      {showDetail && (
        <div className="profile-detail">
          {!isFull && analysis.rationale && (
            <p className="profile-rationale" style={{ marginBottom: 16 }}>{analysis.rationale}</p>
          )}
          <div className="detail-grid">
            <div className="result-card result-card--accent">
              <div className="result-card-label">Likely succeeds &amp; enjoys</div>
              <BulletList items={analysis.succeedEnjoy} />
            </div>
            <div className="result-card">
              <div className="result-card-label">May struggle with</div>
              <BulletList items={analysis.challenges} muted />
            </div>
          </div>
          <div className="result-card result-card--recs">
            <div className="result-card-label">How to help them succeed</div>
            <div className="recs-list">
              {(analysis.recommendations || []).map((rec, i) => (
                <div key={i} className="rec-item">
                  <span className="rec-num">{i + 1}</span>
                  <span className="bullet-text">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!isFull && (
        <button className="expand-btn" onClick={() => setExpanded(e => !e)}>
          {expanded ? 'Hide details ↑' : 'Show details ↓'}
        </button>
      )}
    </div>
  );
}

// ─── Main analyzer component ──────────────────────────────────────────────────

function JDAnalyzer({ consume, hasToken, onConsumed }) {
  const [inputMode, setInputMode] = useState('text');
  const [jdText, setJdText] = useState('');
  const [jdUrl, setJdUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [resultFromCache, setResultFromCache] = useState(false);
  const resultRef = useRef(null);
  const consumedRef = useRef(false);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  async function readStream(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '', text = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') continue;
        try {
          const evt = JSON.parse(payload);
          if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') text += evt.delta.text;
        } catch {}
      }
    }
    return text;
  }

  async function callAPI(system, userContent, maxTokens, model = 'claude-haiku-4-5-20251001') {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature: 0,
        top_k: 1,
        system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: userContent }],
      }),
    });
    const ct = response.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || data.error);
      return data.content?.[0]?.text || '';
    }
    return await readStream(response);
  }

  async function analyze() {
    setError('');
    setResult(null);
    setResultFromCache(false);

    let text = jdText.trim();

    if (inputMode === 'url') {
      if (!jdUrl.trim()) return setError('Enter a URL to continue');
      setLoading(true);
      setLoadingStep('Fetching job description…');
      try {
        const r = await fetch('/api/jd/fetch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: jdUrl.trim() }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Failed to fetch URL');
        text = d.text;
      } catch (e) {
        setError(e.message);
        setLoading(false);
        return;
      }
    } else {
      if (!text || text.length < 50) return setError('Paste a job description (at least a few sentences)');
      setLoading(true);
    }

    const normalizedJD = normalizeJD(text);
    const cacheKey = getCacheKey(normalizedJD);
    const splitKey = getSplitKey(normalizedJD);

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setResult(JSON.parse(cached));
        setResultFromCache(true);
        setLoading(false);
        return;
      }
    } catch {}

    const splitSystem = `You analyze job descriptions for the MindPrint Framework and estimate their absolute cognitive demand profile.

The MindPrint Framework defines three cognitive orientations:

- WHY: The work of choosing direction and defining purpose. WHY asks "what should we pursue and why does it matter?" It applies when a role decides what problem to solve, what to build, what to say, or what strategy to pursue — not just executes a known direction.

- WHAT: The work of execution and momentum. WHAT asks "how do we move this forward?" It drives progress, manages relationships, coordinates people, and delivers outcomes. Measured by milestones hit and progress made.

- HOW: The work of correctness and completeness. HOW asks "is this right and does it hold up?" It covers process design, precision, analysis, documentation, systems, quality, and operational management. Measured by accuracy, completeness, and reliability.

CLASSIFICATION GUIDE:
WHY work: setting strategy, defining brand positioning, deciding roadmap priorities, framing user problems, establishing creative direction, choosing what to build.
WHAT work: project delivery, client relationship management, sales, recruiting, team coordination, stakeholder communication, driving alignment.
HOW work: software engineering, data analysis, financial modeling, QA, process design, scheduling, documentation, spec writing, risk management, compliance.

CALIBRATION:
- CEO / Founder: WHY 40-50%
- Brand/Creative/Strategy leads: WHY 35-50%
- Product Manager: WHY 25-35%, WHAT 35-45%, HOW 20-30%
- UX Designer: WHY 20-30%, HOW 45-55%, WHAT 15-25%
- Marketing Manager: WHY 20-30%, WHAT 45-55%, HOW 15-25%
- Program/Project Manager: WHY 5-15%, WHAT 40-50%, HOW 40-50%
- Engineer / Analyst / QA: WHY <10%, HOW dominant 55-70%
- Sales / Recruiter / Account Manager: WHY <10%, WHAT dominant 55-70%

Read the job description and estimate what percentage of this role's core work demands each orientation. Must sum to exactly 100.

Steps:
1. Identify 5-7 activities that consume the majority of this role's time
2. Classify each as WHY / WHAT / HOW
3. Estimate the percentage split

Return ONLY valid JSON, no markdown:
{ "why": <integer>, "what": <integer>, "how": <integer> }`;

    const qualSystem = `You are a deterministic analyst for the MindPrint Framework. Given a job description and its WHY/WHAT/HOW cognitive demand split, produce a detailed analysis of how all 6 MindPrint profiles fit this specific role.

The MindPrint Framework:
- WHY Brain: Vision-oriented, purpose-driven, big-picture thinker, questions assumptions, defines direction
- WHAT Brain: Action-oriented, momentum-driven, milestone-focused, values progress, drives outcomes
- HOW Brain: Detail-oriented, process-focused, precision-driven, systematic, ensures correctness

The 6 profiles (primary – secondary):
- WHY-WHAT: Visionary executor — purpose first, drives it forward
- WHY-HOW: Systems strategist — vision grounded in precise structure
- WHAT-WHY: Momentum leader — drives progress, rallies around purpose
- WHAT-HOW: Operational driver — executes with detail and reliability
- HOW-WHY: Insight engineer — deep systems understanding, improves from roots
- HOW-WHAT: Process builder — designs operations, manages complexity

RULES:
1. Every item must be specific to the actual job description content and the demand percentages
2. "succeedEnjoy": where this profile's primary/secondary strengths match the role's dominant demands
3. "challenges": where this profile's tertiary orientation is demanded, or where their primary is underused
4. "recommendations": specific things a manager or team can do to help THIS profile succeed in THIS role
5. No generic statements — everything must be grounded in the job description

Return ONLY valid JSON, no markdown:
{
  "summary": "<2-3 sentences describing what cognitive work this role primarily demands and what kind of thinker thrives here>",
  "profiles": {
    "WHY-WHAT": {
      "rationale": "<1-2 sentences: how WHY-WHAT's primary/secondary align with this role's demand split>",
      "succeedEnjoy": ["<role-specific>", "<role-specific>", "<role-specific>"],
      "challenges": ["<role-specific>", "<role-specific>", "<role-specific>"],
      "recommendations": ["<concrete action for manager/team>", "<concrete action>", "<concrete action>"]
    },
    "WHY-HOW":  { "rationale": "...", "succeedEnjoy": [...], "challenges": [...], "recommendations": [...] },
    "WHAT-WHY": { "rationale": "...", "succeedEnjoy": [...], "challenges": [...], "recommendations": [...] },
    "WHAT-HOW": { "rationale": "...", "succeedEnjoy": [...], "challenges": [...], "recommendations": [...] },
    "HOW-WHY":  { "rationale": "...", "succeedEnjoy": [...], "challenges": [...], "recommendations": [...] },
    "HOW-WHAT": { "rationale": "...", "succeedEnjoy": [...], "challenges": [...], "recommendations": [...] }
  }
}

COUNTS per profile (do not deviate): succeedEnjoy: exactly 3, challenges: exactly 3, recommendations: exactly 3.`;

    try {
      setLoadingStep('Analyzing cognitive demands…');

      let demandSplit;
      try {
        const cachedSplit = localStorage.getItem(splitKey);
        if (cachedSplit) demandSplit = JSON.parse(cachedSplit);
      } catch {}

      if (!demandSplit) {
        const jdPrompt = `Job Description:\n\n${text.slice(0, 4000)}`;
        const raws = await Promise.all([
          callAPI(splitSystem, jdPrompt, 600),
          callAPI(splitSystem, jdPrompt, 600),
          callAPI(splitSystem, jdPrompt, 600),
          callAPI(splitSystem, jdPrompt, 600),
          callAPI(splitSystem, jdPrompt, 600),
        ]);

        function parseSplit(raw) {
          const m = raw.match(/\{[\s\S]*?\}/);
          if (!m) return null;
          try {
            const s = JSON.parse(m[0]);
            return typeof s.why === 'number' && typeof s.what === 'number' && typeof s.how === 'number' ? s : null;
          } catch { return null; }
        }

        const splits = raws.map(parseSplit).filter(Boolean);
        if (!splits.length) throw new Error('Could not parse demand split');

        const avg = {
          why:  splits.reduce((s, x) => s + x.why, 0) / splits.length,
          what: splits.reduce((s, x) => s + x.what, 0) / splits.length,
          how:  splits.reduce((s, x) => s + x.how, 0) / splits.length,
        };
        demandSplit = { why: Math.round(avg.why), what: Math.round(avg.what), how: Math.round(avg.how) };
        const off = 100 - (demandSplit.why + demandSplit.what + demandSplit.how);
        if (off !== 0) {
          const largest = Object.entries(demandSplit).sort((a, b) => b[1] - a[1])[0][0];
          demandSplit[largest] += off;
        }
        try { localStorage.setItem(splitKey, JSON.stringify(demandSplit)); } catch {}
      }

      const scores = {};
      TYPES.forEach(t => { scores[t.id] = calcScore(demandSplit, t.id); });

      setLoadingStep('Building profile analyses…');

      const qualUser = `Job Description:\n\n${text.slice(0, 4500)}\n\nEstablished cognitive demand split:\n- WHY (direction, vision, strategy): ${demandSplit.why}%\n- WHAT (execution, coordination, delivery): ${demandSplit.what}%\n- HOW (process, precision, analysis, systems): ${demandSplit.how}%`;

      const SONNET = 'claude-sonnet-4-6';
      const qualRaws = await Promise.all([
        callAPI(qualSystem, qualUser, 4500, SONNET),
        callAPI(qualSystem, qualUser, 4500, SONNET),
        callAPI(qualSystem, qualUser, 4500, SONNET),
      ]);

      function parseQual(raw) {
        const m = raw.match(/\{[\s\S]*\}/);
        if (!m) return null;
        try { return JSON.parse(m[0]); } catch { return null; }
      }

      function consensusScore(candidate, others) {
        const texts = Object.values(candidate.profiles || {}).flatMap(p => [
          ...(p.succeedEnjoy || []),
          ...(p.challenges || []),
          ...(p.recommendations || []),
        ]);
        let score = 0;
        for (const other of others) {
          const otherText = Object.values(other.profiles || {}).flatMap(p => [
            ...(p.succeedEnjoy || []),
            ...(p.challenges || []),
            ...(p.recommendations || []),
          ]).join(' ').toLowerCase();
          for (const t of texts) {
            const words = t.toLowerCase().split(/\s+/).filter(w => w.length > 4);
            const matched = words.filter(w => otherText.includes(w));
            if (matched.length >= Math.max(1, Math.floor(words.length * 0.5))) score++;
          }
        }
        return score;
      }

      const candidates = qualRaws.map(parseQual).filter(Boolean);
      if (!candidates.length) throw new Error('No valid analysis returned');

      const qual = candidates.length === 1
        ? candidates[0]
        : candidates
            .map((c, i) => ({ c, s: consensusScore(c, candidates.filter((_, j) => j !== i)) }))
            .sort((a, b) => b.s - a.s)[0].c;

      const fullResult = { demandSplit, scores, summary: qual.summary || '', profiles: qual.profiles || {} };
      setResult(fullResult);
      try { localStorage.setItem(cacheKey, JSON.stringify(fullResult)); } catch {}

      // Consume token on first successful analysis
      if (hasToken && !consumedRef.current && consume) {
        consumedRef.current = true;
        consume({ tool: 'jd' }).catch(() => {});
        if (onConsumed) onConsumed();
      }
    } catch (e) {
      setError('Error: ' + (e.message || 'Something went wrong'));
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  }

  const sortedProfiles = result
    ? [...TYPES]
        .map(t => ({ ...t, score: result.scores[t.id] || 0, analysis: result.profiles[t.id] || {} }))
        .sort((a, b) => b.score - a.score)
    : [];

  const topProfiles = sortedProfiles.slice(0, 2);
  const otherProfiles = sortedProfiles.slice(2);

  return (
    <div className="page">
      <div className="page-label">Job Description Analyzer</div>
      <h1 className="page-title">Which MindPrint profiles<br />fit this role?</h1>
      <p className="page-subtitle">Paste a job description or drop in a URL. Get the cognitive demand breakdown and a ranked analysis of how every MindPrint profile fits — including where they'll thrive, where they'll struggle, and how to set them up for success.</p>
      <div className="page-rule" />

      <div className="input-tabs">
        <button className={`input-tab${inputMode === 'text' ? ' input-tab--active' : ''}`} onClick={() => setInputMode('text')}>Paste text</button>
        <button className={`input-tab${inputMode === 'url' ? ' input-tab--active' : ''}`} onClick={() => setInputMode('url')}>Enter URL</button>
      </div>

      {inputMode === 'text' ? (
        <textarea className="jd-input" value={jdText} onChange={e => setJdText(e.target.value)} rows={12} placeholder="Paste the full job description here…" />
      ) : (
        <input className="url-input" type="url" value={jdUrl} onChange={e => setJdUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && analyze()} placeholder="https://company.com/jobs/role" />
      )}

      {error && <div className="error-box">{error}</div>}

      <button className="analyze-btn" onClick={analyze} disabled={loading}>
        {loading ? (loadingStep || 'Analyzing…') : 'Analyze job description'}
      </button>

      {result && (
        <div ref={resultRef}>
          <div className="results-rule" />

          {resultFromCache && (
            <div className="cache-badge">
              Cached result —{' '}
              <button className="cache-badge-clear" onClick={() => {
                try { localStorage.removeItem(getCacheKey(normalizeJD(jdText.trim() || jdUrl.trim()))); } catch {}
                setResult(null);
                setResultFromCache(false);
                analyze();
              }}>re-run fresh ×</button>
            </div>
          )}

          {result.summary && <p className="jd-summary">{result.summary}</p>}

          <DemandBar demandSplit={result.demandSplit} />

          <div className="section-header">
            <div className="section-label">Best Match Profiles</div>
            <p className="section-sub">These profiles are most naturally aligned with how this role demands people to think and work.</p>
          </div>

          {topProfiles.map((p, i) => (
            <ProfileCard key={p.id} typeId={p.id} score={p.score} analysis={p.analysis} variant="full" rank={i + 1} />
          ))}

          <div className="section-header" style={{ marginTop: 56 }}>
            <div className="section-label">All Other Profiles</div>
            <p className="section-sub">Every profile can succeed in the right conditions. Expand any card to see where they'll thrive, where they'll need support, and how to help them.</p>
          </div>

          <div className="other-grid">
            {otherProfiles.map((p, i) => (
              <ProfileCard key={p.id} typeId={p.id} score={p.score} analysis={p.analysis} variant="compact" rank={i + 3} />
            ))}
          </div>

          <button className="reset-btn" onClick={() => { setResult(null); setJdText(''); setJdUrl(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            ← Analyze a different role
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Token gate messages ──────────────────────────────────────────────────────

const TOKEN_MESSAGES = {
  used:      { title: "This link has already been used.", body: "JD Analyzer links are single-use. Please contact your Curio coordinator for a new link." },
  expired:   { title: "This link has expired.",           body: "Please contact your Curio coordinator for a new link." },
  not_found: { title: "This link is invalid.",            body: "The link you followed doesn't exist. Please check the URL or contact your Curio coordinator." },
};

// ─── Page shell (handles token gate, nav, head) ───────────────────────────────

export default function JDPage() {
  const { status, token, consume } = useTokenGate('jd');
  const [completedThisSession, setCompletedThisSession] = useState(false);

  const blocked = !completedThisSession
    && status !== 'loading'
    && status !== 'no_token'
    && status !== 'valid'
    && TOKEN_MESSAGES[status];

  return (
    <>
      <Head>
        <title>JD Analyzer — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <style>{css}</style>
      </Head>

      <nav className="nav">
        <Link href="/" className="nav-logo">Curio<span>.</span></Link>
        <Link href="/" className="nav-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back to site
        </Link>
      </nav>

      {blocked ? (
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '80px clamp(24px,5vw,72px)' }}>
          <div style={{ background: '#FAFAF9', border: '1px solid #E7E5E4', borderLeft: '3px solid #059669', borderRadius: 8, padding: '40px 48px', maxWidth: 520 }}>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: '1.5rem', fontWeight: 700, color: '#1C1917', marginBottom: 12 }}>{blocked.title}</div>
            <p style={{ fontSize: '0.95rem', color: '#78716C', lineHeight: 1.75 }}>{blocked.body}</p>
          </div>
        </div>
      ) : (
        <JDAnalyzer
          consume={consume}
          hasToken={!!token}
          onConsumed={() => setCompletedThisSession(true)}
        />
      )}
    </>
  );
}

const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { font-size: 16px; -webkit-font-smoothing: antialiased; }
  body { background: #fff; color: #1C1917; font-family: 'DM Sans', system-ui, sans-serif; line-height: 1.6; min-height: 100vh; }

  .nav { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,0.96); backdrop-filter: blur(12px); border-bottom: 1px solid #E7E5E4; padding: 0 clamp(24px,5vw,72px); height: 72px; display: flex; align-items: center; justify-content: space-between; }
  .nav-logo { font-family: 'Caveat', cursive; font-size: 1.6rem; font-weight: 700; color: #1C1917; text-decoration: none; }
  .nav-logo span { color: #059669; }
  .nav-back { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #78716C; text-decoration: none; transition: color 0.2s; }
  .nav-back:hover { color: #059669; }
  .nav-back svg { width: 14px; height: 14px; }

  .page { max-width: 860px; margin: 0 auto; padding: 64px clamp(24px,5vw,72px) 100px; }

  .page-label { display: inline-flex; align-items: center; gap: 12px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.17em; text-transform: uppercase; color: #059669; margin-bottom: 20px; }
  .page-label::before { content: ''; display: block; width: 36px; height: 1px; background: #059669; flex-shrink: 0; }
  .page-title { font-family: 'Caveat', cursive; font-size: clamp(2.2rem, 4vw, 3.2rem); font-weight: 700; color: #1C1917; line-height: 1.12; margin-bottom: 16px; }
  .page-subtitle { font-size: 1rem; color: #78716C; max-width: 580px; line-height: 1.75; margin-bottom: 48px; }
  .page-rule { width: 100%; height: 1px; background: #E7E5E4; margin-bottom: 40px; }

  .input-tabs { display: flex; margin-bottom: 12px; border-bottom: 1px solid #E7E5E4; }
  .input-tab { padding: 10px 20px; background: none; border: none; border-bottom: 2px solid transparent; font-family: 'DM Sans', sans-serif; font-size: 0.875rem; font-weight: 500; color: #78716C; cursor: pointer; margin-bottom: -1px; transition: all 0.15s; }
  .input-tab--active { color: #059669; border-bottom-color: #059669; font-weight: 600; }

  .jd-input { width: 100%; padding: 16px 20px; background: #FAFAF9; border: 1px solid #E7E5E4; border-radius: 6px; color: #1C1917; font-family: 'DM Sans', sans-serif; font-size: 0.92rem; line-height: 1.7; resize: vertical; outline: none; transition: border-color 0.18s; }
  .jd-input::placeholder { color: #A8A29E; }
  .jd-input:focus { border-color: #059669; }

  .url-input { width: 100%; padding: 16px 20px; background: #FAFAF9; border: 1px solid #E7E5E4; border-radius: 6px; color: #1C1917; font-family: 'DM Sans', sans-serif; font-size: 0.95rem; outline: none; transition: border-color 0.18s; }
  .url-input::placeholder { color: #A8A29E; }
  .url-input:focus { border-color: #059669; }

  .error-box { background: rgba(244,63,94,0.05); border: 1px solid rgba(244,63,94,0.2); border-radius: 6px; padding: 14px 18px; color: #be123c; font-size: 0.9rem; margin-top: 12px; }

  .analyze-btn { width: 100%; margin-top: 16px; padding: 18px 32px; background: #059669; border: none; border-radius: 6px; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: all 0.18s ease; }
  .analyze-btn:hover:not(:disabled) { background: #047857; }
  .analyze-btn:disabled { background: #E7E5E4; color: #A8A29E; cursor: not-allowed; }

  .results-rule { width: 100%; height: 1px; background: #E7E5E4; margin: 56px 0 40px; }

  .cache-badge { display: inline-flex; align-items: center; gap: 8px; font-size: 0.75rem; color: #78716C; background: #F5F5F4; border: 1px solid #E7E5E4; border-radius: 99px; padding: 4px 12px; margin-bottom: 24px; }
  .cache-badge-clear { background: none; border: none; cursor: pointer; color: #059669; font-size: 0.75rem; font-weight: 600; padding: 0; font-family: inherit; }
  .cache-badge-clear:hover { text-decoration: underline; }

  .jd-summary { font-size: 1rem; color: #57534E; line-height: 1.8; margin-bottom: 32px; max-width: 680px; }

  .demand-wrap { margin-bottom: 48px; }
  .demand-track { display: flex; height: 40px; border-radius: 6px; overflow: hidden; gap: 2px; }
  .demand-legend { display: flex; gap: 32px; margin-top: 16px; flex-wrap: wrap; }
  .demand-legend-item { display: flex; align-items: flex-start; gap: 10px; }
  .demand-dot { width: 10px; height: 10px; border-radius: 2px; margin-top: 4px; flex-shrink: 0; }
  .demand-legend-name { display: block; font-size: 0.875rem; font-weight: 700; }
  .demand-legend-sub { display: block; font-size: 0.78rem; color: #A8A29E; margin-top: 1px; }

  .section-header { margin-bottom: 24px; }
  .section-label { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.17em; text-transform: uppercase; color: #059669; margin-bottom: 8px; display: flex; align-items: center; gap: 10px; }
  .section-label::before { content: ''; display: block; width: 24px; height: 1px; background: #059669; }
  .section-sub { font-size: 0.875rem; color: #78716C; line-height: 1.7; max-width: 580px; }

  .score-ring-wrap { display: flex; flex-direction: column; align-items: center; gap: 8px; flex-shrink: 0; }
  .score-fit-label { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 10px; border-radius: 100px; white-space: nowrap; }

  .profile-card--full { background: #FAFAF9; border: 1px solid #E7E5E4; border-left: 3px solid #059669; border-radius: 8px; padding: 32px; margin-bottom: 20px; }
  .profile-card-header { display: flex; gap: 32px; align-items: flex-start; margin-bottom: 28px; }
  .profile-card-meta { flex: 1; }
  .best-match-badge { display: inline-block; background: rgba(5,150,105,0.1); color: #047857; border: 1px solid rgba(5,150,105,0.3); border-radius: 99px; padding: 3px 12px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px; }
  .profile-combo { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #059669; margin-bottom: 4px; }
  .profile-tagline { font-family: 'Caveat', cursive; font-size: 1.5rem; font-weight: 700; color: #1C1917; margin-bottom: 14px; line-height: 1.2; }
  .profile-rationale { font-size: 0.92rem; color: #57534E; line-height: 1.75; }

  .other-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .profile-card--compact { background: #FAFAF9; border: 1px solid #E7E5E4; border-radius: 8px; padding: 24px; }
  .profile-card--compact .profile-card-header { margin-bottom: 0; gap: 20px; }
  .profile-card--compact .profile-tagline { font-size: 1.2rem; margin-bottom: 8px; }

  .profile-detail { margin-top: 8px; }
  .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
  .result-card { background: #fff; border: 1px solid #E7E5E4; border-radius: 6px; padding: 22px; }
  .result-card--accent { border-left: 2px solid #059669; }
  .result-card--recs { }
  .result-card-label { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #059669; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  .result-card-label::before { content: ''; display: block; width: 14px; height: 1px; background: #059669; }

  .bullet-list { display: flex; flex-direction: column; gap: 9px; }
  .bullet-item { display: flex; gap: 11px; align-items: flex-start; }
  .bullet-dot { width: 4px; height: 4px; border-radius: 50%; background: #059669; margin-top: 8px; flex-shrink: 0; }
  .bullet-dot--muted { background: #A8A29E; }
  .bullet-text { font-size: 0.875rem; color: #57534E; line-height: 1.65; }

  .recs-list { display: flex; flex-direction: column; gap: 12px; }
  .rec-item { display: flex; gap: 12px; align-items: flex-start; }
  .rec-num { width: 20px; height: 20px; border-radius: 50%; background: rgba(5,150,105,0.12); color: #059669; font-size: 0.7rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }

  .expand-btn { margin-top: 16px; padding: 7px 0; background: none; border: none; font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 600; color: #059669; cursor: pointer; transition: opacity 0.15s; }
  .expand-btn:hover { opacity: 0.7; }

  .reset-btn { width: 100%; padding: 16px 24px; margin-top: 40px; background: transparent; border: 1px solid #E7E5E4; border-radius: 6px; color: #A8A29E; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; cursor: pointer; transition: all 0.18s ease; }
  .reset-btn:hover { border-color: #A8A29E; color: #1C1917; }

  @media (max-width: 680px) {
    .other-grid { grid-template-columns: 1fr; }
    .detail-grid { grid-template-columns: 1fr; }
    .profile-card-header { flex-direction: column-reverse; align-items: flex-start; gap: 16px; }
    .demand-legend { gap: 16px; }
  }
`;
