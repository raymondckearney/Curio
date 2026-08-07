import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { QUESTIONS, TIE_BREAKERS, OPENER_TEXT } from '../lib/quiz-data';
import { seededShuffle, calculateScores, getTieBreaker } from '../lib/quiz-scoring';
import QuizSetup from '../components/quiz/QuizSetup';
import QuizQuestion from '../components/quiz/QuizQuestion';
import QuizProgress from '../components/quiz/QuizProgress';

// Native replacement for the Typeform-embedded assessment at /assessment.
// On completion this hands off directly to /results/[type]?token=&name=,
// the same page/params the Typeform flow eventually lands on (via its own
// /results/pending polling step) — so everything past that point
// (token/signup gating, portal dashboard, profile display) is unchanged.
// See pages/assessment/index.js for the flow this mirrors.

export default function QuizPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState(null);

  const [phase, setPhase] = useState('setup'); // setup | questions | tiebreaker | submitting
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [sessionSeed, setSessionSeed] = useState(null);

  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [tiebreakerAnswer, setTiebreakerAnswer] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!router.isReady) return;
    const { token: t, name: n, email: e, role: r } = router.query;
    setToken(t || null);
    if (n) setName(String(n));
    if (e) setEmail(String(e));
    if (r) setRole(String(r));
    setSessionSeed(t ? String(t) : `${Date.now()}-${Math.random()}`);
    setReady(true);
  }, [router.isReady, router.query]);

  // Warn on unload while progress could be lost.
  useEffect(() => {
    if (phase !== 'questions' && phase !== 'tiebreaker') return;
    const handler = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [phase]);

  const shuffledOptions = useMemo(() => {
    if (!sessionSeed) return {};
    const map = {};
    for (const q of QUESTIONS) {
      map[q.id] = seededShuffle(q.options, `${sessionSeed}-${q.id}`);
    }
    return map;
  }, [sessionSeed]);

  function beginAssessment() {
    setPhase('questions');
  }

  function selectAnswer(option) {
    const q = QUESTIONS[qIndex];
    const nextAnswers = { ...answers, [q.id]: option.orientation };
    setAnswers(nextAnswers);

    if (qIndex < QUESTIONS.length - 1) {
      setTimeout(() => setQIndex(qIndex + 1), 300);
      return;
    }

    // Last question: only auto-advance if a tie-breaker is needed — that's
    // another question, not the end. Otherwise this was the final answer,
    // so stay here and let the respondent hit Submit rather than ending
    // the assessment on the same tap that picked their answer.
    const scores = calculateScores(nextAnswers);
    if (getTieBreaker(scores)) {
      setTimeout(() => setPhase('tiebreaker'), 300);
    }
  }

  function goBack() {
    if (qIndex === 0) return;
    setQIndex(qIndex - 1);
  }

  function selectTiebreaker(tbKey, option) {
    setTiebreakerAnswer(option.orientation);
  }

  async function submit(finalAnswers, tiebreakerType, tbAnswer) {
    setPhase('submitting');
    setError('');
    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          name: name.trim(),
          email: email.trim(),
          company: company.trim(),
          role: role.trim(),
          answers: finalAnswers,
          tiebreakerType,
          tiebreakerAnswer: tbAnswer,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || 'Something went wrong submitting your assessment.');

      // Go straight to the results page rather than through /results/pending —
      // that page exists only to paper over Typeform's async webhook delay
      // (it polls for a row to show up). Our submit is synchronous and
      // already returns the resolved type, and pending.js has no fallback
      // when there's no token (as when testing the quiz without one), so
      // routing through it can strand a respondent on its timeout screen.
      const qs = new URLSearchParams();
      if (token) qs.set('token', token);
      if (name.trim()) qs.set('name', name.trim());
      window.location.href = `/results/${data.type}?${qs.toString()}`;
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
      // Return to the phase the respondent was in so their answers aren't lost.
      setPhase(tiebreakerType ? 'tiebreaker' : (qIndex >= QUESTIONS.length - 1 ? 'questions' : 'questions'));
    }
  }

  if (!ready) return null;

  const q = QUESTIONS[qIndex];
  const options = shuffledOptions[q?.id] || [];
  const selectedForCurrent = answers[q?.id] || null;

  let tbKey = null, tbData = null;
  if (phase === 'tiebreaker') {
    tbKey = getTieBreaker(calculateScores(answers));
    tbData = tbKey ? TIE_BREAKERS[tbKey] : null;
  }

  // The very last selection (the final question when no tie-breaker is
  // needed, or the tie-breaker itself) requires an explicit Submit tap
  // rather than auto-advancing, so a fast/final tap can't end the
  // assessment by accident.
  const isLastQuestion = qIndex === QUESTIONS.length - 1;
  const lastQuestionAnswered = isLastQuestion && !!selectedForCurrent;
  const tieNeededAtEnd = lastQuestionAnswered ? getTieBreaker(calculateScores(answers)) : null;
  const showQuestionsSubmit = phase === 'questions' && lastQuestionAnswered && !tieNeededAtEnd;
  const showTiebreakerSubmit = phase === 'tiebreaker' && !!tiebreakerAnswer;

  function handleFinalSubmit() {
    if (phase === 'tiebreaker') {
      submit(answers, tbKey, tiebreakerAnswer);
    } else {
      submit(answers, null, null);
    }
  }

  const head = (
    <Head>
      <title>MindPrint™ Assessment — Curio</title>
      <meta name="robots" content="noindex, nofollow" />
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
    </Head>
  );

  if (phase === 'setup') {
    return (
      <>
        {head}
        <div style={s.page}>
          <div style={s.setupHero}>
            <img src="/images/brain-fingerprint-watermark.webp" alt="" aria-hidden="true" style={s.setupHeroWatermark} />
            <div style={s.setupHeroInner}>
              <div style={s.heroLogo}>Curio<span style={s.dot}>.</span></div>
              <div style={s.heroSubLockup}>MindPrint™</div>
              <div style={s.opener}>
                {OPENER_TEXT.map((p, i) => (
                  <p key={i} style={{ ...s.openerP, whiteSpace: 'pre-line' }}>{p}</p>
                ))}
              </div>
            </div>
          </div>
          <div style={s.container}>
            {error && <div style={s.errorBox}>{error}</div>}
            <QuizSetup
              name={name}
              email={email}
              company={company}
              role={role}
              onNameChange={setName}
              onEmailChange={setEmail}
              onCompanyChange={setCompany}
              onRoleChange={setRole}
              onBegin={beginAssessment}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {head}
      <div style={s.page}>
        <div style={s.container}>
          <div style={s.logo}>Curio<span style={s.dot}>.</span></div>

          {error && <div style={s.errorBox}>{error}</div>}

          {phase === 'questions' && q && (
            <>
              <QuizProgress current={qIndex + 1} total={QUESTIONS.length} />
              <QuizQuestion
                text={q.text}
                options={options}
                selected={selectedForCurrent}
                onSelect={selectAnswer}
                onBack={goBack}
                showBack={qIndex > 0}
              />
              {showQuestionsSubmit && (
                <button type="button" style={s.submitBtn} onClick={handleFinalSubmit}>
                  Submit →
                </button>
              )}
            </>
          )}

          {phase === 'tiebreaker' && tbData && (
            <>
              <QuizQuestion
                text={tbData.text}
                options={tbData.options}
                selected={tiebreakerAnswer}
                onSelect={(opt) => selectTiebreaker(tbKey, opt)}
                showBack={false}
              />
              {showTiebreakerSubmit && (
                <button type="button" style={s.submitBtn} onClick={handleFinalSubmit}>
                  Submit →
                </button>
              )}
            </>
          )}

          {phase === 'submitting' && (
            <div style={s.submitting}>
              <div style={s.spinner} />
              <p style={s.submittingText}>Calculating your profile…</p>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes quiz-spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#fff', fontFamily: "'DM Sans', sans-serif" },
  container: { maxWidth: 640, margin: '0 auto', padding: '56px clamp(24px,5vw,48px) 100px' },
  logo: { fontFamily: "'Caveat', cursive", fontSize: '1.6rem', fontWeight: 700, color: '#1C1917', marginBottom: 40 },
  dot: { color: '#059669' },
  errorBox: { background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 10, padding: '14px 18px', color: '#be123c', fontSize: '0.9rem', marginBottom: 24 },
  submitting: { textAlign: 'center', padding: '80px 0' },
  spinner: { width: 36, height: 36, borderRadius: '50%', border: '3px solid #E7E5E4', borderTopColor: '#059669', animation: 'quiz-spin 0.8s linear infinite', margin: '0 auto 20px' },
  submittingText: { fontSize: '0.95rem', color: '#78716C' },
  submitBtn: {
    width: '100%', padding: '16px 24px', marginTop: 28, background: '#059669', border: 'none', borderRadius: 99,
    color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.04em',
    cursor: 'pointer', transition: 'background 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  // Intro-screen hero band — same faint-watermark, clipped-corner treatment
  // as the profile hero on pages/portal/dashboard.js, inverted to white
  // since the source mark is black line-art and this band is navy.
  setupHero: {
    background: '#0F172A', position: 'relative', overflow: 'hidden',
    minHeight: '46vh', display: 'flex', alignItems: 'center',
    padding: '64px clamp(24px,5vw,48px)',
  },
  setupHeroWatermark: {
    position: 'absolute', top: -180, right: -220,
    width: 760, maxWidth: 'none', opacity: 0.08, filter: 'invert(1)', pointerEvents: 'none', zIndex: 0,
  },
  setupHeroInner: { position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto', width: '100%' },
  heroLogo: { fontFamily: "'Caveat', cursive", fontSize: '2.4rem', fontWeight: 700, color: '#fff', marginBottom: 4 },
  heroSubLockup: { fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#059669', marginBottom: 32 },
  opener: { display: 'flex', flexDirection: 'column', gap: 18 },
  openerP: { fontSize: '0.95rem', color: '#CBD5E1', lineHeight: 1.8, margin: 0 },
};
