import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { QUESTIONS, TIE_BREAKERS } from '../lib/quiz-data';
import { seededShuffle, calculateScores, getTieBreaker } from '../lib/quiz-scoring';
import QuizSetup from '../components/quiz/QuizSetup';
import QuizQuestion from '../components/quiz/QuizQuestion';
import QuizProgress from '../components/quiz/QuizProgress';

// Native replacement for the Typeform-embedded assessment at /assessment.
// On completion this hands off to the exact same downstream flow Typeform
// currently does — /results/pending?token=&name= — so everything past that
// point (token/signup gating, portal dashboard, profile display) is
// unchanged. See pages/assessment/index.js for the flow this mirrors.

export default function QuizPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState(null);

  const [phase, setPhase] = useState('setup'); // setup | questions | tiebreaker | submitting
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sessionSeed, setSessionSeed] = useState(null);

  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [tiebreakerAnswer, setTiebreakerAnswer] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!router.isReady) return;
    const { token: t, name: n, email: e } = router.query;
    setToken(t || null);
    if (n) setName(String(n));
    if (e) setEmail(String(e));
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
    setTimeout(() => {
      if (qIndex < QUESTIONS.length - 1) {
        setQIndex(qIndex + 1);
        return;
      }
      const scores = calculateScores(nextAnswers);
      const tb = getTieBreaker(scores);
      if (tb) {
        setPhase('tiebreaker');
      } else {
        submit(nextAnswers, null, null);
      }
    }, 300);
  }

  function goBack() {
    if (qIndex === 0) return;
    setQIndex(qIndex - 1);
  }

  function selectTiebreaker(tbKey, option) {
    setTiebreakerAnswer(option.orientation);
    setTimeout(() => submit(answers, tbKey, option.orientation), 300);
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
          answers: finalAnswers,
          tiebreakerType,
          tiebreakerAnswer: tbAnswer,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || 'Something went wrong submitting your assessment.');

      const qs = new URLSearchParams();
      if (token) qs.set('token', token);
      if (name.trim()) qs.set('name', name.trim());
      window.location.href = `/results/pending?${qs.toString()}`;
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

  return (
    <>
      <Head>
        <title>MindPrint™ Assessment — Curio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
      </Head>
      <div style={s.page}>
        <div style={s.container}>
          <div style={s.logo}>Curio<span style={s.dot}>.</span></div>

          {error && <div style={s.errorBox}>{error}</div>}

          {phase === 'setup' && (
            <QuizSetup
              name={name}
              email={email}
              onNameChange={setName}
              onEmailChange={setEmail}
              onBegin={beginAssessment}
            />
          )}

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
            </>
          )}

          {phase === 'tiebreaker' && tbData && (
            <QuizQuestion
              text={tbData.text}
              options={tbData.options}
              selected={tiebreakerAnswer}
              onSelect={(opt) => selectTiebreaker(tbKey, opt)}
              showBack={false}
            />
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
};
