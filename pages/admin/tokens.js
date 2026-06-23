import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminTokens() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState('tokens');

  useEffect(() => {
    fetch('/api/admin/me')
      .then(r => r.ok ? setAuthed(true) : router.replace('/admin/login'))
      .catch(() => router.replace('/admin/login'));
  }, [router]);

  if (!authed) return null;
  return (
    <>
      <Head>
        <title>Token Manager — Curio Admin</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Caveat:wght@700&display=swap" rel="stylesheet" />
      </Head>
      <div style={s.page}>
        <header style={s.header}>
          <span style={s.logo}>Curio<span style={s.dot}>.</span></span>
          <span style={s.headerTitle}>Admin</span>
          <button style={s.signOut} onClick={() => fetch('/api/admin/logout', { method: 'POST' }).then(() => router.push('/admin/login'))}>Sign out</button>
        </header>

        <div style={s.tabBar}>
          <button
            style={activeTab === 'tokens' ? { ...s.tab, ...s.tabActive } : s.tab}
            onClick={() => setActiveTab('tokens')}
          >
            Tokens
          </button>
          <button
            style={activeTab === 'assessments' ? { ...s.tab, ...s.tabActive } : s.tab}
            onClick={() => setActiveTab('assessments')}
          >
            Assessments
          </button>
        </div>

        <main style={s.main}>
          {activeTab === 'tokens' ? (
            <>
              <GeneratePanel />
              <StatusPanel />
            </>
          ) : (
            <AssessmentsPanel />
          )}
        </main>
      </div>
    </>
  );
}

// ─── Shared: Send Link inline panel ──────────────────────────────────────────

function buildDefaultMessage(name, tokenUrl) {
  return `Hi ${name},

I'd like to invite you to take the MindPrint™ Assessment — a short exercise that identifies how you're naturally wired to think through and solve problems.

Your personal link: ${tokenUrl}

This link is unique to you and can only be used once. It will take approximately 10 minutes to complete.

Looking forward to sharing the results with you.

Ray Kearney
Curio`;
}

function SendLinkPanel({ token, participantName, participantEmail, tokenUrl, onClose, onSent }) {
  const [to, setTo] = useState(participantEmail || '');
  const [subject, setSubject] = useState("You're invited to take the MindPrint™ Assessment");
  const [message, setMessage] = useState(buildDefaultMessage(participantName || 'there', tokenUrl));
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function send() {
    if (!to.trim()) return setError('Recipient email is required');
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/email/send-token-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, to: to.trim(), subject, message, participantEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      onSent();
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={s.sendPanel}>
      <div style={s.sendPanelGrid}>
        <div style={s.sendField}>
          <label style={s.sendLabel}>To</label>
          <input style={s.sendInput} value={to} onChange={e => setTo(e.target.value)} placeholder="recipient@example.com" />
        </div>
        <div style={s.sendField}>
          <label style={s.sendLabel}>Subject</label>
          <input style={s.sendInput} value={subject} onChange={e => setSubject(e.target.value)} />
        </div>
        <div style={{ ...s.sendField, gridColumn: '1 / -1' }}>
          <label style={s.sendLabel}>Message</label>
          <textarea style={s.sendTextarea} rows={8} value={message} onChange={e => setMessage(e.target.value)} />
        </div>
      </div>
      {error && <p style={s.error}>{error}</p>}
      <div style={s.sendActions}>
        <button style={s.btn} onClick={send} disabled={sending}>
          {sending ? 'Sending…' : 'Send'}
        </button>
        <button style={s.btnSecondary} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

// ─── Generate Panel ───────────────────────────────────────────────────────────

function GeneratePanel() {
  const [purpose, setPurpose] = useState('assessment');
  const [engagementId, setEngagementId] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [participantText, setParticipantText] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openSendLink, setOpenSendLink] = useState(null);
  const [sentLinks, setSentLinks] = useState(new Set());

  async function generate() {
    setError('');
    setResults(null);
    setOpenSendLink(null);
    setSentLinks(new Set());
    const lines = participantText.trim().split('\n').filter(Boolean);
    const participants = lines.map(line => {
      const [name, email, company, role] = line.split(',').map(s => s.trim());
      return { name: name || '', email: email || '', company: company || '', role: role || '' };
    }).filter(p => p.name);

    if (!participants.length) return setError('Enter at least one participant (Name required, email optional)');
    if (!engagementId.trim()) return setError('Engagement ID is required');

    setLoading(true);
    try {
      const res = await fetch('/api/tokens/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participants,
          purpose,
          engagement_id: engagementId.trim(),
          expires_at: expiresAt || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setResults(data.tokens);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function copyAll() {
    const text = results.map(r => `${r.name}\t${r.email}\t${r.url}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section style={s.panel}>
      <h2 style={s.panelTitle}>Generate Tokens</h2>
      <div style={s.fieldGroup}>
        <label style={s.label}>Purpose</label>
        <select style={s.select} value={purpose} onChange={e => setPurpose(e.target.value)}>
          <option value="assessment">Assessment</option>
          <option value="fit">Role Analyzer</option>
          <option value="jd">JD Analyzer</option>
        </select>
      </div>
      <div style={s.fieldGroup}>
        <label style={s.label}>Engagement ID</label>
        <input style={s.input} value={engagementId} onChange={e => setEngagementId(e.target.value)} placeholder="e.g. acme-2026-q1" />
      </div>
      <div style={s.fieldGroup}>
        <label style={s.label}>Expiry Date (optional)</label>
        <input style={s.input} type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
      </div>
      <div style={s.fieldGroup}>
        <label style={s.label}>Participants — one per line: <code style={s.code}>Name, email, Company, Role</code> (email, Company, Role all optional)</label>
        <textarea
          style={s.textarea}
          value={participantText}
          onChange={e => setParticipantText(e.target.value)}
          placeholder={"Alex Smith, alex@example.com, Acme Corp, Engineer\nJordan Lee, jordan@example.com\nSam Taylor"}
          rows={6}
        />
      </div>
      {error && <p style={s.error}>{error}</p>}
      <button style={s.btn} onClick={generate} disabled={loading}>
        {loading ? 'Generating…' : 'Generate Tokens'}
      </button>

      {results && (
        <div style={{ marginTop: 24 }}>
          <div style={s.resultsHeader}>
            <span style={s.resultsCount}>{results.length} token{results.length !== 1 ? 's' : ''} created</span>
            <button style={s.btnSecondary} onClick={copyAll}>
              {copied ? 'Copied!' : 'Copy all URLs'}
            </button>
          </div>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Name', 'Email', 'Company', 'Role', 'URL', 'Copy', 'Send Link'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.flatMap((r, i) => {
                  const rows = [
                    <tr key={r.token} style={i % 2 === 0 ? s.trEven : {}}>
                      <td style={s.td}>{r.name}</td>
                      <td style={s.td}>{r.email || '—'}</td>
                      <td style={s.td}>{r.company || '—'}</td>
                      <td style={s.td}>{r.role || '—'}</td>
                      <td style={{ ...s.td, ...s.urlCell }}>{r.url}</td>
                      <td style={s.td}>
                        <button style={s.copyBtn} onClick={() => navigator.clipboard.writeText(r.url)}>Copy</button>
                      </td>
                      <td style={s.td}>
                        {sentLinks.has(r.token) ? (
                          <span style={s.sentBadge}>Sent ✓</span>
                        ) : (
                          <button
                            style={openSendLink === r.token ? s.sendLinkBtnActive : s.sendLinkBtn}
                            onClick={() => setOpenSendLink(openSendLink === r.token ? null : r.token)}
                          >
                            Send Link
                          </button>
                        )}
                      </td>
                    </tr>,
                  ];
                  if (openSendLink === r.token) {
                    rows.push(
                      <tr key={`${r.token}-panel`}>
                        <td colSpan={7} style={{ padding: 0, borderBottom: '1px solid #E2E8F0' }}>
                          <SendLinkPanel
                            token={r.token}
                            participantName={r.name}
                            participantEmail={r.email}
                            tokenUrl={r.url}
                            onClose={() => setOpenSendLink(null)}
                            onSent={() => {
                              setSentLinks(prev => new Set([...prev, r.token]));
                              setOpenSendLink(null);
                            }}
                          />
                        </td>
                      </tr>
                    );
                  }
                  return rows;
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Status Panel ─────────────────────────────────────────────────────────────

function StatusPanel() {
  const [engagementId, setEngagementId] = useState('');
  const [tokens, setTokens] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [openSendLink, setOpenSendLink] = useState(null);
  const [sentLinks, setSentLinks] = useState(new Set());
  const [sentProfiles, setSentProfiles] = useState(new Set());
  const [sendingProfile, setSendingProfile] = useState(null);

  async function load() {
    setError('');
    setTokens(null);
    setOpenSendLink(null);
    setSentLinks(new Set());
    setSentProfiles(new Set());
    if (!engagementId.trim()) return setError('Enter an Engagement ID');
    setLoading(true);
    try {
      const res = await fetch(`/api/tokens/status?engagement_id=${encodeURIComponent(engagementId.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setTokens(data.tokens);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function sendProfile(t) {
    const profileRaw = typeof t.result_payload === 'object' ? t.result_payload?.type : t.result_payload;
    const profile = profileRaw ? String(profileRaw).toUpperCase() : null;
    if (!profile || !t.email) return;

    setSendingProfile(t.token);
    try {
      const res = await fetch('/api/email/send-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant_name: t.name,
          participant_email: t.email,
          profile,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setSentProfiles(prev => new Set([...prev, t.token]));
    } catch (e) {
      alert(`Failed to send profile: ${e.message}`);
    } finally {
      setSendingProfile(null);
    }
  }

  const used = tokens?.filter(t => t.used).length ?? 0;

  return (
    <section style={s.panel}>
      <h2 style={s.panelTitle}>Engagement Status</h2>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={s.label}>Engagement ID</label>
          <input
            style={s.input}
            value={engagementId}
            onChange={e => setEngagementId(e.target.value)}
            placeholder="e.g. acme-2026-q1"
            onKeyDown={e => e.key === 'Enter' && load()}
          />
        </div>
        <button style={s.btn} onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Load'}</button>
      </div>
      {error && <p style={s.error}>{error}</p>}

      {tokens && (
        <div style={{ marginTop: 24 }}>
          <p style={s.summary}>
            <strong>{used}</strong> of <strong>{tokens.length}</strong> completed
          </p>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Name', 'Email', 'Company', 'Role', 'Status', 'Link', 'Used At', 'Result', 'Actions'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tokens.flatMap((t, i) => {
                  const profileRaw = typeof t.result_payload === 'object' ? t.result_payload?.type : t.result_payload;
                  const profile = profileRaw ? String(profileRaw).toUpperCase() : null;
                  const canSendProfile = t.used && profile && t.email;
                  const tokenUrl = `https://www.choosecurio.com/go/${t.token}`;

                  const mainRow = (
                    <tr key={t.token} style={i % 2 === 0 ? s.trEven : {}}>
                      <td style={s.td}>{t.name}</td>
                      <td style={s.td}>{t.email || '—'}</td>
                      <td style={s.td}>{t.company || '—'}</td>
                      <td style={s.td}>{t.role || '—'}</td>
                      <td style={s.td}>
                        <span style={t.used ? s.badgeUsed : s.badgePending}>
                          {t.used ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                      <td style={s.td}>
                        {(t.link_sent_at || sentLinks.has(t.token)) ? (
                          <span style={s.badgeLinkSent}>Link Sent</span>
                        ) : '—'}
                      </td>
                      <td style={s.td}>{t.used_at ? new Date(t.used_at).toLocaleString() : '—'}</td>
                      <td style={s.td}>
                        {profile ? (
                          <span style={s.badgeType}>{profile}</span>
                        ) : '—'}
                      </td>
                      <td style={{ ...s.td, whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {sentLinks.has(t.token) ? (
                            <span style={s.sentBadge}>Sent ✓</span>
                          ) : (
                            <button
                              style={openSendLink === t.token ? s.sendLinkBtnActive : s.sendLinkBtn}
                              onClick={() => setOpenSendLink(openSendLink === t.token ? null : t.token)}
                            >
                              Send Link
                            </button>
                          )}
                          {canSendProfile && (
                            sentProfiles.has(t.token) ? (
                              <span style={s.sentBadge}>Profile Sent ✓</span>
                            ) : (
                              <button
                                style={s.sendProfileBtn}
                                onClick={() => sendProfile(t)}
                                disabled={sendingProfile === t.token}
                              >
                                {sendingProfile === t.token ? 'Sending…' : 'Send Profile'}
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );

                  if (openSendLink !== t.token) return [mainRow];

                  return [
                    mainRow,
                    <tr key={`${t.token}-panel`}>
                      <td colSpan={9} style={{ padding: 0, borderBottom: '1px solid #E2E8F0' }}>
                        <SendLinkPanel
                          token={t.token}
                          participantName={t.name}
                          participantEmail={t.email}
                          tokenUrl={tokenUrl}
                          onClose={() => setOpenSendLink(null)}
                          onSent={() => {
                            setSentLinks(prev => new Set([...prev, t.token]));
                            setTokens(prev => prev.map(tok =>
                              tok.token === t.token
                                ? { ...tok, link_sent_at: new Date().toISOString() }
                                : tok
                            ));
                            setOpenSendLink(null);
                          }}
                        />
                      </td>
                    </tr>,
                  ];
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Fit Analysis constants ───────────────────────────────────────────────────

const FIT_TYPES = [
  { id: "WHY-WHAT", label: "WHY – WHAT", tagline: "Purpose-driven, progress-oriented",   primary: "WHY",  secondary: "WHAT" },
  { id: "WHY-HOW",  label: "WHY – HOW",  tagline: "Purpose-driven, precision-oriented",  primary: "WHY",  secondary: "HOW"  },
  { id: "WHAT-WHY", label: "WHAT – WHY", tagline: "Progress-driven, purpose-oriented",   primary: "WHAT", secondary: "WHY"  },
  { id: "WHAT-HOW", label: "WHAT – HOW", tagline: "Progress-driven, precision-oriented", primary: "WHAT", secondary: "HOW"  },
  { id: "HOW-WHY",  label: "HOW – WHY",  tagline: "Precision-driven, purpose-oriented",  primary: "HOW",  secondary: "WHY"  },
  { id: "HOW-WHAT", label: "HOW – WHAT", tagline: "Precision-driven, progress-oriented", primary: "HOW",  secondary: "WHAT" },
];

const FIT_TYPE_DETAILS = {
  "WHY-WHAT": {
    strengths: ["Strategic vision and big-picture thinking","Identifying opportunities and gaps","Setting direction and goals","Pitching and narrative building","Questioning the status quo","High-level roadmap planning"],
    drains: ["Granular execution and task management","Following detailed processes","Documentation and administrative work","Repetitive or routine tasks","Working in the weeds for extended periods"],
  },
  "WHY-HOW": {
    strengths: ["Systems thinking and framework design","Research synthesis and distilling insights","Diagnosing root causes","Writing thought leadership","Building comprehensive strategies","Connecting vision to execution detail"],
    drains: ["Fast-paced iteration without analysis","Rushing to launch before it feels right","Pure action without sufficient grounding","Communicating to WHAT-dominant audiences"],
  },
  "WHAT-WHY": {
    strengths: ["Building and maintaining momentum","Rallying teams around shared goals","Fast decision-making under ambiguity","Client-facing discovery and pitching","Running high-energy team sessions","Milestone-oriented project leadership"],
    drains: ["Detailed process design and documentation","Administrative and compliance work","Deep analytical research","Managing granular task execution","Precision-oriented work for extended periods"],
  },
  "WHAT-HOW": {
    strengths: ["Detailed project planning and management","Breaking initiatives into actionable steps","Building metrics and dashboards","Managing cross-functional execution","Running agile and iterative processes","Operationalizing workflows and processes"],
    drains: ["Open-ended visioning without clear milestones","Work lacking defined next steps","Pure strategy without implementation path","Extended ambiguity about direction or goals"],
  },
  "HOW-WHY": {
    strengths: ["Deep analytical work and root cause analysis","Process auditing and redesign","Synthesizing complex data into insights","Testing and validating approaches rigorously","Spotting inefficiencies","Mentoring on methodology and best practices"],
    drains: ["Launching before full analysis is complete","High-velocity action-oriented environments","Communicating findings to non-technical audiences","Prioritizing when everything feels equally important"],
  },
  "HOW-WHAT": {
    strengths: ["Designing operational processes end-to-end","Building organizational structures and operating models","Creating SOPs, playbooks, and documentation","Implementing systems and managing change","Identifying and resolving bottlenecks","Managing multi-workstream complexity"],
    drains: ["Ambiguous open-ended creative work","Vision-setting without clear parameters","Work requiring frequent pivots without structure","Communication of 'why' to stakeholders"],
  },
};

// ─── Fit Analysis Panel ───────────────────────────────────────────────────────

function FitAnalysisPanel({ assessment, onClose }) {
  const profileType = (assessment.type || '').toUpperCase().replace(/_/g, '-');
  const [role, setRole] = useState(assessment.role || '');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const type = FIT_TYPES.find(t => t.id === profileType);
  const details = FIT_TYPE_DETAILS[profileType];
  const tertiary = type ? ['WHY','WHAT','HOW'].find(b => b !== type.primary && b !== type.secondary) : null;

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

  async function analyze() {
    if (!role.trim() || !type) return;
    setLoading(true);
    setLoadingStep('Analyzing role demands…');
    setError('');
    setResult(null);

    // The split system prompt (same as /fit)
    const splitSystem = `You analyze job roles for the MindPrint Framework and estimate their absolute cognitive demand profile.

The MindPrint Framework defines three cognitive orientations:
- WHY: The work of choosing direction and defining purpose. WHY asks "what should we pursue and why does it matter?"
- WHAT: The work of execution and momentum. WHAT asks "how do we move this forward?" It drives progress, manages relationships, coordinates people.
- HOW: The work of correctness and completeness. HOW asks "is this right and does it hold up?" It covers process design, precision, analysis, documentation, systems, quality.

CALIBRATION:
- CEO / Founder: WHY 40-50%
- Brand/Creative/Strategy leads: WHY 35-50%
- Product Manager: WHY 25-35%, WHAT 35-45%, HOW 20-30%
- UX Designer: WHY 20-30%, HOW 45-55%, WHAT 15-25%
- Marketing Manager: WHY 20-30%, WHAT 45-55%, HOW 15-25%
- Program/Project Manager: WHY 5-15%, WHAT 40-50%, HOW 40-50%
- Engineer / Analyst / QA: WHY <10%, HOW dominant (55-70%)
- Sales / Recruiter / Account Manager: WHY <10%, WHAT dominant (55-70%)

Estimate what percentage of this role's core work demands each orientation. Must sum to exactly 100.
Return ONLY valid JSON: { "why": <integer>, "what": <integer>, "how": <integer> }`;

    const qualSystem = `You are a deterministic analyst for the MindPrint Framework. Given a cognitive profile and a role's demand split, produce a role alignment analysis.

The MindPrint Framework defines three cognitive orientations:
- WHY Brain: Vision-oriented, purpose-driven, big-picture thinker, questions assumptions
- WHAT Brain: Action-oriented, momentum-driven, milestone-focused, values progress
- HOW Brain: Detail-oriented, process-focused, precision-driven, systematic

RULES:
1. Every item must be specific to this exact role and profile combination
2. Ground every item in the demand split percentages
3. Recommendations must be actionable and role-specific
4. partnerTypes must complement the gaps this profile has in this role

Return ONLY valid JSON:
{
  "scoreRationale": "<exactly 2-3 sentences about fit>",
  "enjoys": ["<role-specific>", "<role-specific>", "<role-specific>", "<role-specific>"],
  "excels": ["<role-specific>", "<role-specific>", "<role-specific>", "<role-specific>"],
  "dislikes": ["<role-specific>", "<role-specific>", "<role-specific>"],
  "struggles": ["<role-specific>", "<role-specific>", "<role-specific>"],
  "recommendations": [
    { "category": "<Focus|Delegation|Workflow|Communication|Structure>", "action": "<concrete action>", "rationale": "<1-2 sentences>" },
    { "category": "<label>", "action": "<concrete action>", "rationale": "<1-2 sentences>" },
    { "category": "<label>", "action": "<concrete action>", "rationale": "<1-2 sentences>" },
    { "category": "<label>", "action": "<concrete action>", "rationale": "<1-2 sentences>" }
  ],
  "partnerTypes": [
    { "type": "<WHY-WHAT|WHY-HOW|WHAT-WHY|WHAT-HOW|HOW-WHY|HOW-WHAT>", "reason": "<1 sentence>" },
    { "type": "<one of the above>", "reason": "<1 sentence>" }
  ]
}
Counts: enjoys=4, excels=4, dislikes=3, struggles=3, recommendations=4, partnerTypes=2`;

    function parseSplit(raw) {
      const m = raw.match(/\{[\s\S]*?\}/);
      if (!m) return null;
      try {
        const s = JSON.parse(m[0]);
        return typeof s.why === 'number' && typeof s.what === 'number' && typeof s.how === 'number' ? s : null;
      } catch { return null; }
    }

    function parseQual(raw) {
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) return null;
      try { return JSON.parse(m[0]); } catch { return null; }
    }

    try {
      const rolePrompt = `Role: "${role.trim()}"`;
      const splitRaws = await Promise.all([
        callAPI(splitSystem, rolePrompt, 600),
        callAPI(splitSystem, rolePrompt, 600),
        callAPI(splitSystem, rolePrompt, 600),
        callAPI(splitSystem, rolePrompt, 600),
        callAPI(splitSystem, rolePrompt, 600),
      ]);
      const splits = splitRaws.map(parseSplit).filter(Boolean);
      if (!splits.length) throw new Error('Could not parse demand split');

      const avg = {
        why:  splits.reduce((s, x) => s + x.why,  0) / splits.length,
        what: splits.reduce((s, x) => s + x.what, 0) / splits.length,
        how:  splits.reduce((s, x) => s + x.how,  0) / splits.length,
      };
      let demandSplit = { why: Math.round(avg.why), what: Math.round(avg.what), how: Math.round(avg.how) };
      const off = 100 - (demandSplit.why + demandSplit.what + demandSplit.how);
      if (off !== 0) {
        const largest = Object.entries(demandSplit).sort((a, b) => b[1] - a[1])[0][0];
        demandSplit[largest] += off;
      }

      const splitMap = { WHY: demandSplit.why, WHAT: demandSplit.what, HOW: demandSplit.how };
      const dp = splitMap[type.primary] || 0;
      const ds = splitMap[type.secondary] || 0;
      const dt = splitMap[tertiary] || 0;
      const rawScore = dp * 1.25 + ds * 0.8 + dt * (-1.5);
      const linear = Math.max(0, Math.min(1, (rawScore + 150) / 275));
      const score = Math.round(Math.pow(linear, 1.5) * 100);

      setLoadingStep('Building profile analysis…');

      const qualUser = `Profile: ${type.label} (${type.tagline})
Primary orientation: ${type.primary} — energizing
Secondary orientation: ${type.secondary} — comfortable
Tertiary orientation: ${tertiary} — draining

What energizes this type: ${details.strengths.join(', ')}
What drains this type: ${details.drains.join(', ')}

Role: "${role.trim()}"
Demand split: WHY ${demandSplit.why}%, WHAT ${demandSplit.what}%, HOW ${demandSplit.how}%

For this person: ${dp}% in ${type.primary} (energizing), ${ds}% in ${type.secondary} (neutral), ${dt}% in ${tertiary} (draining)`;

      const SONNET = 'claude-sonnet-4-6';
      const qualRaws = await Promise.all([
        callAPI(qualSystem, qualUser, 2000, SONNET),
        callAPI(qualSystem, qualUser, 2000, SONNET),
        callAPI(qualSystem, qualUser, 2000, SONNET),
      ]);

      const candidates = qualRaws.map(parseQual).filter(Boolean);
      if (!candidates.length) throw new Error('No analysis returned');

      function consensusScore(candidate, others) {
        const texts = [...(candidate.enjoys||[]),...(candidate.excels||[]),...(candidate.dislikes||[]),...(candidate.struggles||[]),...(candidate.recommendations||[]).map(r=>r.action||'')];
        let score = 0;
        for (const other of others) {
          const otherText = [...(other.enjoys||[]),...(other.excels||[]),...(other.dislikes||[]),...(other.struggles||[]),...(other.recommendations||[]).map(r=>r.action||'')].join(' ').toLowerCase();
          for (const t of texts) {
            const words = t.toLowerCase().split(/\s+/).filter(w=>w.length>4);
            const matched = words.filter(w=>otherText.includes(w));
            if (matched.length >= Math.max(1, Math.floor(words.length*0.5))) score++;
          }
        }
        return score;
      }

      const qual = candidates.length === 1 ? candidates[0]
        : candidates.map((c,i)=>({c,s:consensusScore(c,candidates.filter((_,j)=>j!==i))})).sort((a,b)=>b.s-a.s)[0].c;

      setResult({ ...qual, demandSplit, score });
    } catch (e) {
      setError('Error: ' + (e.message || 'Something went wrong'));
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  }

  async function sendEmail() {
    const email = assessment.email || assessment.reg_email;
    const name = assessment.name || assessment.reg_name;
    if (!email) return setError('No email address found for this participant');
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/email/send-fit-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant_name: name,
          participant_email: email,
          profile_type: profileType,
          role: role.trim(),
          result,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setSent(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  function downloadPDF() {
    const esc = v => String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const pct = Math.round(result.score);
    const color = pct>=75?'#059669':pct>=60?'#34D399':pct>=40?'#F59E0B':'#EF4444';
    const label = pct>=75?'Strong fit':pct>=60?'Good fit':pct>=40?'Partial fit':pct>=20?'Poor fit':'Severe mismatch';
    const labelBg = pct>=75?'rgba(5,150,105,0.08)':pct>=60?'rgba(52,211,153,0.08)':pct>=40?'rgba(245,158,11,0.08)':'rgba(239,68,68,0.08)';
    const labelBorder = pct>=75?'rgba(5,150,105,0.3)':pct>=60?'rgba(52,211,153,0.3)':pct>=40?'rgba(245,158,11,0.3)':'rgba(239,68,68,0.3)';
    const today = new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
    const r=36,circ=2*Math.PI*r,dash=(pct/100)*circ;
    const participantName = assessment.name || assessment.reg_name || '';
    const bullets = (items,dotColor) => items.map(i=>`<div class="bullet"><span class="dot" style="background:${dotColor}"></span><span class="btext">${esc(i)}</span></div>`).join('');

    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Role Alignment${participantName?' — '+esc(participantName):''} — ${esc(role)} — Curio</title><link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;color:#1C1917;font-size:8.5pt;line-height:1.5;background:#fff}.wrap{max-width:700px;margin:0 auto;padding:26px 30px}.hdr{display:flex;justify-content:space-between;align-items:center;border-bottom:2.5px solid #059669;padding-bottom:11px;margin-bottom:16px}.logo{font-family:'Caveat',cursive;font-size:21pt;font-weight:700}.logo em{color:#059669;font-style:normal}.hdr-right{text-align:right;font-size:7pt;color:#78716C}.hdr-right strong{display:block;font-size:8pt;color:#1C1917;margin-bottom:1px}.pname{font-family:'Caveat',cursive;font-size:26pt;font-weight:700;margin-bottom:10px}.score-row{display:flex;align-items:center;gap:18px;padding:13px 15px;background:#FAFAF9;border:1px solid #E7E5E4;border-radius:6px;margin-bottom:9px}.sinfo{flex:1}.tlabel{font-size:6.5pt;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#059669;margin-bottom:3px}.rname{font-family:'Caveat',cursive;font-size:17pt;font-weight:700;line-height:1.1;margin-bottom:6px}.rationale{font-size:7.5pt;color:#57534E;line-height:1.6}.sring{flex-shrink:0;text-align:center}.fit-lbl{font-size:6pt;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:2px 8px;border-radius:100px;display:inline-block;margin-top:4px}.g2{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:7px}.card{background:#FAFAF9;border:1px solid #E7E5E4;border-radius:5px;padding:11px 13px}.ca{border-left:2px solid #059669}.clabel{font-size:6pt;font-weight:700;letter-spacing:0.13em;text-transform:uppercase;color:#059669;margin-bottom:7px}.bullet{display:flex;gap:6px;align-items:flex-start;margin-bottom:3px}.dot{width:4px;height:4px;border-radius:50%;margin-top:5px;flex-shrink:0}.btext{font-size:7.5pt;color:#57534E;line-height:1.45}.rec{padding:6px 0;border-bottom:1px solid #E7E5E4}.rec:last-child{border-bottom:none;padding-bottom:0}.rcat{font-size:6pt;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#059669;margin-bottom:1px}.raction{font-family:'Caveat',cursive;font-size:10.5pt;line-height:1.2;margin-bottom:1px}.rrat{font-size:7pt;color:#78716C;line-height:1.45}.footer{margin-top:13px;padding-top:9px;border-top:1px solid #E7E5E4;display:flex;justify-content:space-between;font-size:6.5pt;color:#A8A29E}.flogo{font-family:'Caveat',cursive;font-size:13pt;font-weight:700}.flogo em{color:#059669;font-style:normal}.print-btn{display:block;width:100%;padding:14px;margin-bottom:16px;background:#059669;color:#fff;border:none;border-radius:6px;font-family:'DM Sans',sans-serif;font-size:10pt;font-weight:700;cursor:pointer}@media print{@page{margin:12mm 10mm;size:A4 portrait}.wrap{padding:0;max-width:100%}.print-btn{display:none!important}}</style></head><body><div class="wrap"><button class="print-btn" onclick="this.style.display='none';window.print()">Save as PDF</button><div class="hdr"><div class="logo">Curio<em>.</em></div><div class="hdr-right"><strong>Role Alignment Analysis</strong>${esc(today)}</div></div>${participantName?`<div class="pname">${esc(participantName)}</div>`:''}<div class="score-row"><div class="sinfo"><div class="tlabel">${esc(type.label)} &middot; ${esc(type.tagline)}</div><div class="rname">${esc(role)}</div><div class="rationale">${esc(result.scoreRationale||'')}</div></div><div class="sring"><svg width="86" height="86" viewBox="0 0 86 86"><circle cx="43" cy="43" r="${r}" fill="none" stroke="#E7E5E4" stroke-width="6"/><circle cx="43" cy="43" r="${r}" fill="none" stroke="${color}" stroke-width="6" stroke-dasharray="${dash.toFixed(1)} ${circ.toFixed(1)}" stroke-linecap="round" transform="rotate(-90 43 43)"/><text x="43" y="38" text-anchor="middle" font-size="19" font-weight="700" fill="${color}" font-family="Caveat,cursive">${pct}%</text><text x="43" y="52" text-anchor="middle" font-size="7" fill="#A8A29E" font-family="DM Sans,sans-serif" letter-spacing="1">MATCH</text></svg><div class="fit-lbl" style="color:${color};background:${labelBg};border:1px solid ${labelBorder}">${esc(label)}</div></div></div><div class="g2"><div class="card ca"><div class="clabel">Likely enjoys</div>${bullets(result.enjoys||[],'#059669')}</div><div class="card ca"><div class="clabel">Likely excels at</div>${bullets(result.excels||[],'#059669')}</div></div><div class="g2"><div class="card"><div class="clabel">Likely dislikes</div>${bullets(result.dislikes||[],'#A8A29E')}</div><div class="card"><div class="clabel">May struggle with</div>${bullets(result.struggles||[],'#A8A29E')}</div></div><div class="card" style="margin-bottom:7px"><div class="clabel">Recommendations</div>${(result.recommendations||[]).map(rec=>`<div class="rec"><div class="rcat">${esc(rec.category)}</div><div class="raction">${esc(rec.action)}</div><div class="rrat">${esc(rec.rationale)}</div></div>`).join('')}</div><div class="footer"><div><div class="flogo">Curio<em>.</em></div><div>MindPrint Framework™ &middot; Role Alignment Analysis</div></div><div>choosecurio.com &middot; Generated ${esc(today)}</div></div></div></body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  const pct = result ? Math.round(result.score) : 0;
  const scoreColor = pct>=75?'#059669':pct>=60?'#34D399':pct>=40?'#F59E0B':'#EF4444';
  const scoreLabel = pct>=75?'Strong fit':pct>=60?'Good fit':pct>=40?'Partial fit':pct>=20?'Poor fit':'Severe mismatch';

  return (
    <div style={s.sendPanel}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
          Role Fit Analysis — {profileType}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={s.sendLabel}>Role to analyze</label>
            <input
              style={s.sendInput}
              value={role}
              onChange={e => setRole(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && analyze()}
              placeholder="e.g. Senior Product Manager, VP of Sales…"
            />
          </div>
          <button style={s.btn} onClick={analyze} disabled={loading || !role.trim()}>
            {loading ? (loadingStep || 'Analyzing…') : 'Analyze'}
          </button>
          <button style={s.btnSecondary} onClick={onClose}>Close</button>
        </div>
      </div>

      {error && <p style={s.error}>{error}</p>}

      {result && (
        <div style={{ marginTop: 16, borderTop: '1px solid #E2E8F0', paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderLeft: `3px solid ${scoreColor}`, borderRadius: 6, padding: '12px 16px', flex: 1 }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: scoreColor, marginBottom: 4 }}>{profileType} &middot; {type?.tagline}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: scoreColor, fontFamily: "'Caveat', cursive" }}>{pct}% — {scoreLabel}</div>
              {result.scoreRationale && <div style={{ fontSize: '0.8rem', color: '#57534E', lineHeight: 1.6, marginTop: 6 }}>{result.scoreRationale}</div>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 5, padding: '10px 12px' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#059669', marginBottom: 6 }}>Likely enjoys</div>
              {(result.enjoys||[]).map((item,i) => <div key={i} style={{ fontSize: '0.78rem', color: '#374151', marginBottom: 3, paddingLeft: 10, position: 'relative' }}><span style={{ position:'absolute',left:0,top:5,width:4,height:4,borderRadius:'50%',background:'#059669',display:'block' }} />{item}</div>)}
            </div>
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 5, padding: '10px 12px' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#059669', marginBottom: 6 }}>Likely excels at</div>
              {(result.excels||[]).map((item,i) => <div key={i} style={{ fontSize: '0.78rem', color: '#374151', marginBottom: 3, paddingLeft: 10, position: 'relative' }}><span style={{ position:'absolute',left:0,top:5,width:4,height:4,borderRadius:'50%',background:'#059669',display:'block' }} />{item}</div>)}
            </div>
            <div style={{ background: '#FAFAF9', border: '1px solid #E2E8F0', borderRadius: 5, padding: '10px 12px' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#78716C', marginBottom: 6 }}>May struggle with</div>
              {(result.struggles||[]).map((item,i) => <div key={i} style={{ fontSize: '0.78rem', color: '#57534E', marginBottom: 3, paddingLeft: 10, position: 'relative' }}><span style={{ position:'absolute',left:0,top:5,width:4,height:4,borderRadius:'50%',background:'#A8A29E',display:'block' }} />{item}</div>)}
            </div>
            <div style={{ background: '#FAFAF9', border: '1px solid #E2E8F0', borderRadius: 5, padding: '10px 12px' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#78716C', marginBottom: 6 }}>Recommendations</div>
              {(result.recommendations||[]).map((rec,i) => <div key={i} style={{ fontSize: '0.75rem', color: '#374151', marginBottom: 5 }}><span style={{ fontSize:'0.6rem',fontWeight:700,color:'#059669',textTransform:'uppercase',letterSpacing:'0.1em' }}>{rec.category}: </span>{rec.action}</div>)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {sent ? (
              <span style={s.sentBadge}>Email Sent ✓</span>
            ) : (
              <button style={s.btn} onClick={sendEmail} disabled={sending || !(assessment.email || assessment.reg_email)}>
                {sending ? 'Sending…' : `Send to ${assessment.email || assessment.reg_email || '(no email)'}`}
              </button>
            )}
            <button style={s.btnSecondary} onClick={downloadPDF}>Download PDF</button>
          </div>
          {!assessment.email && !assessment.reg_email && (
            <p style={{ ...s.error, marginTop: 6 }}>No email address on record for this participant.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Assessments Panel ────────────────────────────────────────────────────────

function AssessmentsPanel() {
  const [assessments, setAssessments] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [openFitPanel, setOpenFitPanel] = useState(null);

  async function load() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/assessments');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setAssessments(data.assessments);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={s.panel}>
      <h2 style={s.panelTitle}>Assessment Submissions</h2>
      <button style={s.btn} onClick={load} disabled={loading}>
        {loading ? 'Loading…' : 'Load'}
      </button>
      {error && <p style={s.error}>{error}</p>}

      {assessments && (
        <div style={{ marginTop: 24 }}>
          <p style={s.summary}>
            <strong>{assessments.length}</strong> assessment{assessments.length !== 1 ? 's' : ''}
          </p>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Reg. Name', 'Reg. Email', 'Quiz Name', 'Quiz Email', 'Company', 'Role', 'Type', 'H Score', 'W Score', 'Y Score', 'Submitted At', 'Actions'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assessments.flatMap((a, i) => {
                  const mainRow = (
                    <tr key={a.id || i} style={i % 2 === 0 ? s.trEven : {}}>
                      <td style={s.td}>{a.reg_name || '—'}</td>
                      <td style={s.td}>{a.reg_email || '—'}</td>
                      <td style={s.td}>{a.name || '—'}</td>
                      <td style={s.td}>{a.email || '—'}</td>
                      <td style={s.td}>{a.company || '—'}</td>
                      <td style={s.td}>{a.role || '—'}</td>
                      <td style={s.td}>
                        {a.type ? (
                          <span style={s.badgeType}>{a.type.toUpperCase()}</span>
                        ) : '—'}
                      </td>
                      <td style={s.td}>{a.h_score ?? '—'}</td>
                      <td style={s.td}>{a.w_score ?? '—'}</td>
                      <td style={s.td}>{a.y_score ?? '—'}</td>
                      <td style={s.td}>{a.submitted_at ? new Date(a.submitted_at).toLocaleString() : '—'}</td>
                      <td style={s.td}>
                        {a.type ? (
                          <button
                            style={openFitPanel === (a.id || i) ? s.sendLinkBtnActive : s.sendLinkBtn}
                            onClick={() => setOpenFitPanel(openFitPanel === (a.id || i) ? null : (a.id || i))}
                          >
                            Role Fit
                          </button>
                        ) : '—'}
                      </td>
                    </tr>
                  );

                  if (openFitPanel !== (a.id || i)) return [mainRow];

                  return [
                    mainRow,
                    <tr key={`${a.id || i}-fit`}>
                      <td colSpan={12} style={{ padding: 0, borderBottom: '1px solid #E2E8F0' }}>
                        <FitAnalysisPanel
                          assessment={a}
                          onClose={() => setOpenFitPanel(null)}
                        />
                      </td>
                    </tr>,
                  ];
                })}
                {assessments.length === 0 && (
                  <tr>
                    <td colSpan={12} style={{ ...s.td, color: '#94A3B8', textAlign: 'center', padding: '24px 12px' }}>
                      No assessments yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  page: { minHeight: '100vh', background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif", color: '#0F172A' },
  header: {
    background: '#fff',
    borderBottom: '1px solid #E2E8F0',
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  logo: { fontFamily: "'Caveat', cursive", fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' },
  dot: { color: '#059669' },
  headerTitle: { fontSize: '0.9rem', color: '#64748B', flex: 1 },
  signOut: { background: 'none', border: '1px solid #E2E8F0', borderRadius: 6, padding: '6px 14px', fontSize: '0.875rem', cursor: 'pointer', color: '#64748B', fontFamily: "'DM Sans', sans-serif" },
  tabBar: {
    background: '#fff',
    borderBottom: '1px solid #E2E8F0',
    padding: '0 32px',
    display: 'flex',
    gap: 0,
  },
  tab: {
    padding: '14px 20px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#64748B',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: -1,
    transition: 'color 0.15s, border-color 0.15s',
  },
  tabActive: {
    color: '#059669',
    borderBottom: '2px solid #059669',
    fontWeight: 600,
  },
  main: { maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 32 },
  panel: { background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' },
  panelTitle: { fontSize: '1.1rem', fontWeight: 600, marginBottom: 24, marginTop: 0 },
  fieldGroup: { marginBottom: 16 },
  label: { display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 6, color: '#374151' },
  input: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', boxSizing: 'border-box' },
  select: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', background: '#fff', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', resize: 'vertical', boxSizing: 'border-box' },
  btn: { padding: '10px 20px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' },
  btnSecondary: { padding: '8px 16px', background: '#F1F5F9', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  error: { color: '#DC2626', fontSize: '0.875rem', margin: '8px 0 0' },
  code: { fontFamily: 'monospace', fontSize: '0.8rem', background: '#F1F5F9', padding: '2px 6px', borderRadius: 4 },
  resultsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  resultsCount: { fontSize: '0.9rem', fontWeight: 500, color: '#059669' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
  th: { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #E2E8F0', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' },
  td: { padding: '10px 12px', borderBottom: '1px solid #F1F5F9', verticalAlign: 'middle' },
  trEven: { background: '#FAFAFA' },
  urlCell: { fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748B', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  copyBtn: { padding: '4px 10px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  summary: { fontSize: '0.95rem', marginBottom: 12, color: '#374151' },
  badgeUsed: { background: '#D1FAE5', color: '#065F46', padding: '3px 10px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' },
  badgePending: { background: '#FEF3C7', color: '#92400E', padding: '3px 10px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' },
  badgeLinkSent: { background: '#EFF6FF', color: '#1D4ED8', padding: '3px 10px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' },
  badgeType: { background: '#EFF6FF', color: '#1D4ED8', padding: '3px 10px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, fontFamily: 'monospace', letterSpacing: '0.05em' },
  sentBadge: { color: '#059669', fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap' },
  sendLinkBtn: { padding: '4px 10px', background: '#F0FDF4', color: '#059669', border: '1px solid #BBF7D0', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' },
  sendLinkBtnActive: { padding: '4px 10px', background: '#059669', color: '#fff', border: '1px solid #059669', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' },
  sendProfileBtn: { padding: '4px 10px', background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' },
  // Send link panel
  sendPanel: { padding: '20px 24px', background: '#F8FAFC', borderTop: '2px solid #059669' },
  sendPanelGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', marginBottom: 12 },
  sendField: {},
  sendLabel: { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 },
  sendInput: { width: '100%', padding: '8px 12px', borderRadius: 6, border: '1.5px solid #E2E8F0', fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', boxSizing: 'border-box' },
  sendTextarea: { width: '100%', padding: '8px 12px', borderRadius: 6, border: '1.5px solid #E2E8F0', fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 },
  sendActions: { display: 'flex', gap: 8, marginTop: 4 },
};
