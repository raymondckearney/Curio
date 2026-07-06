import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { PortalNav } from '../dashboard';
import profiles from '../../../lib/profiles';

const CAREER_LEVELS = ['Student', 'Early Career', 'Mid Career', 'Senior or Executive'];
const ORIENTATIONS = ['Individual Contributor', 'Management', 'Open to Both'];
const RISK_ENVS = ['High-growth / startup', 'Established company', 'Large institution / government'];
const COMP_PRIORITIES = ['Primary', 'Balanced', 'Secondary'];

const SYSTEM_PROMPT = `You are the MindPrint™ Career Guidance Tool. Generate a personalized career guidance report based on the person's MindPrint™ cognitive profile and the inputs provided.

LANGUAGE RULES — enforced in every sentence:
- Use "energizing" never "strength" or "natural talent"
- Use "draining" / "what drains them" never "weakness" or "area for improvement"
- Use "watch for" never "weakness" or "blind spot" in negative framing
- Use "cognitive orientation" never "cognitive style" or "personality type"
- Profile notation: WHY-WHAT, HOW-WHY (hyphen, full caps only)
- Never call MindPrint™ a personality assessment or style assessment
- Never suggest someone's primary orientation should be dialed back
- Never frame a drain as a growth area that resolves with effort or maturity

OUTPUT STRUCTURE — generate in this exact order:

**BLOCK 1: PROFILE SUMMARY**
A brief summary box with profile, inputs, and alignment signal.

Include:
- Profile and tagline
- Career level, orientation, industry, environment (each on its own line)
- Alignment signal label (STRONG SIGNAL / GOOD SIGNAL / CONDITIONAL) with one-sentence rationale
- 3 energizers specific to the profile and inputs (⚡ format)
- 2 watch-fors (◆ format)
- Count of roles identified

**BLOCK 2: ROLE DEEP-DIVES (5–7 roles)**
For each role generate four sections exactly:
1. Why This Role Is a Strong Match (3–4 paragraphs, specific to profile and career level)
2. What You Will Find Energizing and Excel At (4–5 labeled sub-items with 2–4 sentences each)
3. What Will Still Be Challenging (3–4 labeled sub-items with 2–4 sentences each)
4. Strategies to Bring Into This Role (4–5 labeled, actionable strategies specific to this profile in this role)

**BLOCK 3: CLOSING**
1. A Note on Environment (2–3 paragraphs on evaluating any role for this profile)
2. What To Do Next (3–4 bullet points — profile-specific, not generic career advice)

Every claim must be specific to the exact profile and inputs provided. No generic career advice. Every energizing claim must trace to primary or secondary orientation. Every drain/challenge must trace to tertiary orientation or known cross-profile friction.`;

function renderMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/^## (.+)$/gm, '<h2 style="font-family:\'Caveat\',cursive;font-size:1.6rem;font-weight:700;color:#0F172A;margin:32px 0 12px">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:0.8rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#64748B;margin:24px 0 10px">$1</h3>')
    .replace(/^\*\*(.+?)\*\*/gm, '<strong>$1</strong>')
    .replace(/^⚡ (.+)$/gm, '<div style="display:flex;gap:10px;margin:6px 0"><span style="font-size:1rem;flex-shrink:0">⚡</span><span>$1</span></div>')
    .replace(/^◆ (.+)$/gm, '<div style="display:flex;gap:10px;margin:6px 0"><span style="color:#64748B;flex-shrink:0">◆</span><span>$1</span></div>')
    .replace(/^- (.+)$/gm, '<div style="display:flex;gap:10px;margin:6px 0"><span style="color:#059669;flex-shrink:0">→</span><span>$1</span></div>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p style="font-size:0.95rem;color:#374151;line-height:1.8;margin:0 0 12px">')
    .replace(/^(?!<[h23d])(.+)$/gm, (m) => m.startsWith('<') ? m : `<p style="font-size:0.95rem;color:#374151;line-height:1.8;margin:0 0 12px">${m}</p>`);
}

export default function CareerGuidance() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [profileType, setProfileType] = useState('');
  const [careerLevel, setCareerLevel] = useState('');
  const [orientation, setOrientation] = useState('');
  const [industry, setIndustry] = useState('');
  const [riskEnv, setRiskEnv] = useState('');
  const [values, setValues] = useState('');
  const [compPriority, setCompPriority] = useState('');
  const [otherAssessments, setOtherAssessments] = useState('');

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const resultRef = useRef(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/portal/me').then(r => r.ok ? r.json() : Promise.reject()),
      fetch('/api/portal/dashboard').then(r => r.ok ? r.json() : null),
    ])
      .then(([meData, dashData]) => {
        setMe(meData);
        setDash(dashData);
        // Auto-select profile for individual users
        if (dashData?.myAssessment?.type) {
          setProfileType(dashData.myAssessment.type.toUpperCase());
        }
      })
      .catch(() => router.replace('/portal/login'))
      .finally(() => setLoading(false));
  }, [router]);

  async function logout() {
    await fetch('/api/portal/logout', { method: 'POST' });
    router.push('/portal/login');
  }

  async function generate() {
    if (!profileType) return setError('Profile type is required');
    setError('');
    setResult('');
    setGenerating(true);

    const inputLines = [
      `PROFILE: ${profileType}`,
      careerLevel ? `CAREER_LEVEL: ${careerLevel}` : '',
      orientation ? `ROLE_ORIENTATION: ${orientation}` : '',
      industry ? `INDUSTRY: ${industry}` : '',
      riskEnv ? `RISK_ENVIRONMENT: ${riskEnv}` : '',
      values ? `VALUES_ORIENTATION: ${values}` : '',
      compPriority ? `COMPENSATION_PRIORITY: ${compPriority}` : '',
      otherAssessments ? `OTHER_ASSESSMENTS: ${otherAssessments}` : '',
    ].filter(Boolean).join('\n');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-opus-4-8',
          max_tokens: 8000,
          system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
          messages: [{ role: 'user', content: `Generate a career guidance report for this person:\n\n${inputLines}` }],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Generation failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '', text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n'); buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') continue;
          try {
            const evt = JSON.parse(payload);
            if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
              text += evt.delta.text;
              setResult(text);
            }
          } catch {}
        }
      }

      // Log session
      fetch('/api/portal/sessions/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'career_guidance', completed: true, result: profileType, metadata: { profileType, careerLevel, industry } }),
      }).catch(() => {});

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return <div style={s.loading}>Loading…</div>;
  if (!me) return null;

  const profileKey = profileType?.toLowerCase().replace('–', '-').replace('—', '-');
  const profile = profiles[profileKey];
  const isIndividual = !!dash?.myAssessment;

  return (
    <>
      <Head>
        <title>Career Guidance — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div style={s.layout}>
        <PortalNav me={me} onLogout={logout} active="career" licenses={dash?.licenses} isIndividual={isIndividual} />
        <main style={s.main}>
          <div style={s.pageHeader}>
            <h1 style={s.title}>Career Guidance</h1>
            <p style={s.sub}>Generate a personalized career report based on your MindPrint™ profile.</p>
          </div>

          <div style={s.formCard}>
            {/* Profile */}
            <div style={s.fieldGroup}>
              <label style={s.label}>MindPrint™ Profile <span style={s.required}>*</span></label>
              {isIndividual ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700, fontFamily: "'Caveat', cursive", color: '#059669' }}>{profileType}</span>
                  {profile && <span style={{ fontSize: '0.875rem', color: '#64748B' }}>{profile.tagline}</span>}
                </div>
              ) : (
                <select style={s.select} value={profileType} onChange={e => setProfileType(e.target.value)}>
                  <option value="">Select a profile…</option>
                  {['WHY-WHAT','WHY-HOW','WHAT-WHY','WHAT-HOW','HOW-WHY','HOW-WHAT'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              )}
            </div>

            <div style={s.twoCol}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Career Level</label>
                <select style={s.select} value={careerLevel} onChange={e => setCareerLevel(e.target.value)}>
                  <option value="">Not specified</option>
                  {CAREER_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Role Orientation</label>
                <select style={s.select} value={orientation} onChange={e => setOrientation(e.target.value)}>
                  <option value="">Not specified</option>
                  {ORIENTATIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div style={s.twoCol}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Industry <span style={s.optional}>(optional)</span></label>
                <input style={s.input} value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. technology, healthcare, finance" />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Environment Preference</label>
                <select style={s.select} value={riskEnv} onChange={e => setRiskEnv(e.target.value)}>
                  <option value="">Not specified</option>
                  {RISK_ENVS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div style={s.fieldGroup}>
              <label style={s.label}>Values Orientation <span style={s.optional}>(optional)</span></label>
              <input style={s.input} value={values} onChange={e => setValues(e.target.value)} placeholder="e.g. mission-driven work, high autonomy, impact, high compensation" />
            </div>

            <div style={s.twoCol}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Compensation Priority</label>
                <select style={s.select} value={compPriority} onChange={e => setCompPriority(e.target.value)}>
                  <option value="">Not specified</option>
                  {COMP_PRIORITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Other Assessments <span style={s.optional}>(optional)</span></label>
                <input style={s.input} value={otherAssessments} onChange={e => setOtherAssessments(e.target.value)} placeholder="e.g. DiSC: D, StrengthsFinder: Achiever" />
              </div>
            </div>

            {error && <p style={s.error}>{error}</p>}
            <button style={s.btn} onClick={generate} disabled={generating || !profileType}>
              {generating ? 'Generating report…' : 'Generate Career Report'}
            </button>
            {generating && <p style={s.genNote}>This takes 30–60 seconds. Your report is being personalized to your profile.</p>}
          </div>

          {result && (
            <div ref={resultRef} style={s.resultCard}>
              <div
                style={s.resultContent}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(result) }}
              />
            </div>
          )}
        </main>
      </div>
    </>
  );
}

const s = {
  layout: { display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif", color: '#0F172A' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#94A3B8', fontFamily: 'sans-serif' },
  main: { marginLeft: 220, flex: 1, padding: '40px 48px 80px', maxWidth: 900 },
  pageHeader: { marginBottom: 28 },
  title: { fontFamily: "'Caveat', cursive", fontSize: '2rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 },
  sub: { fontSize: '0.9rem', color: '#64748B', margin: 0 },
  formCard: { background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, padding: '32px 36px', marginBottom: 32, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  fieldGroup: { marginBottom: 20 },
  label: { display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.03em' },
  required: { color: '#EF4444' },
  optional: { color: '#94A3B8', fontWeight: 400, fontSize: '0.78rem' },
  select: { width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', background: '#fff', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236B7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '18px' },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', boxSizing: 'border-box' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' },
  btn: { display: 'inline-block', padding: '12px 28px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.925rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginTop: 8 },
  genNote: { fontSize: '0.8rem', color: '#94A3B8', marginTop: 10 },
  error: { color: '#EF4444', fontSize: '0.875rem', marginTop: 8 },
  resultCard: { background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, padding: '40px 44px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  resultContent: { fontSize: '0.95rem', color: '#374151', lineHeight: 1.8 },
};
