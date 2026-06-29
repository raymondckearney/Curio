import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Academic() {
  return (
    <Layout>
      <Head>
        <title>Curio for Business Schools — MindPrint™ for Academic Programs</title>
        <meta name="description" content="MindPrint™ gives business school students a precise language for how they think and work — transforming career outcomes, team dynamics, and classroom engagement." />
      </Head>

      <style>{`
        /* ── ACADEMIC PAGE STYLES ── */

        /* Hero */
        #ac-hero {
          padding: calc(var(--nav-h) + 80px) 0 90px;
          background: #0F172A;
          overflow: hidden;
          position: relative;
        }
        .ac-hero-aura {
          position: absolute;
          top: -120px; left: 50%;
          transform: translateX(-30%);
          width: 800px; height: 800px;
          background: radial-gradient(circle, rgba(5,150,105,0.18) 0%, transparent 70%);
          pointer-events: none;
        }
        .ac-hero-inner {
          position: relative;
          max-width: 860px;
        }
        .ac-hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--gold-light);
          margin-bottom: 28px;
        }
        .ac-hero-eyebrow::before {
          content: '';
          display: block;
          width: 28px; height: 2px;
          background: var(--gold-light);
          border-radius: 2px;
        }
        #ac-hero h1 {
          font-size: clamp(2.6rem, 5.5vw, 4.6rem);
          color: #fff;
          line-height: 1.08;
          margin-bottom: 28px;
        }
        #ac-hero h1 em {
          font-style: normal;
          color: var(--gold-light);
        }
        .ac-hero-sub {
          font-size: clamp(1rem, 1.8vw, 1.2rem);
          color: rgba(255,255,255,0.72);
          line-height: 1.72;
          max-width: 640px;
          margin-bottom: 44px;
        }
        .ac-hero-btns {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        /* Stats bar */
        #ac-stats {
          background: var(--gold);
          padding: 52px 0;
        }
        .ac-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
        }
        .ac-stat {
          padding: 0 40px;
          text-align: center;
          border-right: 1px solid rgba(255,255,255,0.25);
        }
        .ac-stat:last-child { border-right: none; }
        .ac-stat-num {
          font-family: var(--font-display);
          font-size: clamp(2.6rem, 4vw, 3.8rem);
          font-weight: 900;
          color: #fff;
          line-height: 1;
          margin-bottom: 10px;
        }
        .ac-stat-desc {
          font-size: 0.92rem;
          color: rgba(255,255,255,0.88);
          line-height: 1.55;
        }
        .ac-stat-source {
          font-size: 0.68rem;
          color: rgba(255,255,255,0.55);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-top: 10px;
        }
        @media (max-width: 720px) {
          .ac-stats-grid {
            grid-template-columns: 1fr;
            gap: 36px;
          }
          .ac-stat { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.2); padding: 0 0 36px; }
          .ac-stat:last-child { border-bottom: none; padding-bottom: 0; }
        }

        /* Problem */
        #ac-problem {
          padding: var(--section-y) 0;
          background: var(--paper);
        }
        .ac-problem-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 72px;
          align-items: center;
        }
        .ac-problem-quote {
          font-family: var(--font-display);
          font-size: clamp(1.5rem, 2.5vw, 2.2rem);
          color: var(--ink);
          line-height: 1.25;
          font-style: italic;
          margin-bottom: 16px;
        }
        .ac-problem-attr {
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--gold);
        }
        .ac-problem-right p {
          font-size: 1.05rem;
          color: var(--ink-soft);
          line-height: 1.78;
          margin-bottom: 20px;
        }
        .ac-problem-right p:last-child { margin-bottom: 0; }
        .ac-problem-right strong { color: var(--ink); }
        @media (max-width: 840px) {
          .ac-problem-grid { grid-template-columns: 1fr; gap: 40px; }
        }

        /* Framework */
        #ac-framework {
          padding: var(--section-y) 0;
          background: var(--paper-warm);
        }
        .ac-framework-intro {
          max-width: 680px;
          margin-bottom: 56px;
        }
        .ac-framework-intro p {
          font-size: 1.05rem;
          color: var(--ink-soft);
          line-height: 1.78;
          margin-top: 18px;
        }
        .ac-lenses {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .ac-lens {
          background: var(--paper);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-card);
          padding: 36px 32px;
          transition: all 0.3s var(--ease);
        }
        .ac-lens:hover {
          border-color: var(--gold);
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }
        .ac-lens-tag {
          display: inline-block;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          background: var(--gold-pale);
          color: var(--gold);
          padding: 4px 12px;
          border-radius: 100px;
          margin-bottom: 18px;
        }
        .ac-lens h3 {
          font-size: 1.45rem;
          color: var(--ink);
          margin-bottom: 14px;
        }
        .ac-lens p {
          font-size: 0.95rem;
          color: var(--ink-soft);
          line-height: 1.7;
        }
        @media (max-width: 840px) {
          .ac-lenses { grid-template-columns: 1fr; }
        }

        /* Audiences */
        #ac-audiences {
          padding: var(--section-y) 0;
          background: var(--paper);
        }
        .ac-audiences-intro {
          max-width: 640px;
          margin-bottom: 64px;
        }
        .ac-audiences-intro p {
          font-size: 1.05rem;
          color: var(--ink-soft);
          line-height: 1.78;
          margin-top: 18px;
        }
        .ac-audiences-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }
        .ac-audience-card {
          border: 1.5px solid var(--border);
          border-radius: var(--radius-card);
          overflow: hidden;
        }
        .ac-audience-card-header {
          padding: 32px 36px 28px;
          background: #0F172A;
        }
        .ac-audience-card-header .ac-hero-eyebrow {
          margin-bottom: 14px;
          font-size: 0.68rem;
        }
        .ac-audience-card-header h3 {
          font-size: clamp(1.4rem, 2vw, 1.75rem);
          color: #fff;
          line-height: 1.2;
        }
        .ac-audience-card-body {
          padding: 32px 36px 36px;
          background: var(--paper);
        }
        .ac-audience-card-body p {
          font-size: 0.98rem;
          color: var(--ink-soft);
          line-height: 1.72;
          margin-bottom: 28px;
        }
        .ac-benefit-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .ac-benefit-list li {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          font-size: 0.95rem;
          color: var(--ink-soft);
          line-height: 1.55;
        }
        .ac-benefit-list li::before {
          content: '';
          flex-shrink: 0;
          width: 8px; height: 8px;
          border-radius: 50%;
          background: var(--gold);
          margin-top: 6px;
        }
        .ac-benefit-list strong { color: var(--ink); }
        @media (max-width: 840px) {
          .ac-audiences-grid { grid-template-columns: 1fr; }
        }

        /* Syllabus fit */
        #ac-syllabus {
          padding: var(--section-y) 0;
          background: var(--cream);
        }
        .ac-syllabus-intro {
          max-width: 640px;
          margin-bottom: 56px;
        }
        .ac-syllabus-intro p {
          font-size: 1.05rem;
          color: var(--ink-soft);
          line-height: 1.78;
          margin-top: 18px;
        }
        .ac-syllabus-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .ac-syllabus-card {
          background: var(--paper);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-card);
          padding: 30px 28px;
          transition: all 0.3s var(--ease);
        }
        .ac-syllabus-card:hover {
          border-color: var(--gold);
          box-shadow: var(--shadow);
          transform: translateY(-3px);
        }
        .ac-syllabus-num {
          font-family: var(--font-display);
          font-size: 2.2rem;
          font-weight: 900;
          color: var(--gold);
          line-height: 1;
          margin-bottom: 12px;
        }
        .ac-syllabus-card h3 {
          font-size: 1rem;
          font-weight: 700;
          font-family: var(--font-body);
          color: var(--ink);
          margin-bottom: 12px;
        }
        .ac-syllabus-card p {
          font-size: 0.88rem;
          color: var(--ink-soft);
          line-height: 1.65;
        }
        @media (max-width: 1080px) {
          .ac-syllabus-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .ac-syllabus-grid { grid-template-columns: 1fr; }
        }

        /* Outcomes */
        #ac-outcomes {
          padding: var(--section-y) 0;
          background: var(--paper);
        }
        .ac-outcomes-intro {
          max-width: 640px;
          margin-bottom: 56px;
        }
        .ac-outcomes-intro p {
          font-size: 1.05rem;
          color: var(--ink-soft);
          line-height: 1.78;
          margin-top: 18px;
        }
        .ac-outcomes-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        .ac-outcome-card {
          background: var(--paper-warm);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-card);
          padding: 32px 36px;
          display: grid;
          grid-template-columns: 64px 1fr;
          gap: 20px;
          align-items: flex-start;
          transition: all 0.3s var(--ease);
        }
        .ac-outcome-card:hover {
          border-color: var(--gold);
          background: var(--paper);
          box-shadow: var(--shadow);
        }
        .ac-outcome-num {
          font-family: var(--font-display);
          font-size: 2.8rem;
          font-weight: 900;
          color: var(--gold);
          line-height: 1;
          opacity: 0.55;
        }
        .ac-outcome-card h3 {
          font-size: 1.05rem;
          font-family: var(--font-body);
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 10px;
        }
        .ac-outcome-card p {
          font-size: 0.92rem;
          color: var(--ink-soft);
          line-height: 1.68;
        }
        @media (max-width: 720px) {
          .ac-outcomes-grid { grid-template-columns: 1fr; }
          .ac-outcome-card { grid-template-columns: 48px 1fr; }
        }

        /* Partnership tiers */
        #ac-tiers {
          padding: var(--section-y) 0;
          background: #0F172A;
        }
        #ac-tiers .label { color: var(--gold-light); }
        #ac-tiers .label::before { background: var(--gold-light); }
        #ac-tiers h2 { color: #fff; }
        .ac-tiers-sub {
          font-size: 1.05rem;
          color: rgba(255,255,255,0.62);
          line-height: 1.72;
          max-width: 580px;
          margin-top: 18px;
          margin-bottom: 56px;
        }
        .ac-tiers-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .ac-tier-card {
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: var(--radius-card);
          padding: 36px 32px;
          transition: all 0.3s var(--ease);
          display: flex;
          flex-direction: column;
        }
        .ac-tier-card:hover {
          background: rgba(255,255,255,0.08);
          border-color: var(--gold-light);
          transform: translateY(-4px);
        }
        .ac-tier-step {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold-light);
          margin-bottom: 16px;
        }
        .ac-tier-card h3 {
          font-size: 1.6rem;
          color: #fff;
          margin-bottom: 16px;
        }
        .ac-tier-card p {
          font-size: 0.94rem;
          color: rgba(255,255,255,0.62);
          line-height: 1.72;
          flex: 1;
          margin-bottom: 28px;
        }
        .ac-tier-pricing {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--gold-light);
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.12);
        }
        @media (max-width: 840px) {
          .ac-tiers-grid { grid-template-columns: 1fr; }
        }

        /* How we work (faculty process) */
        #ac-process {
          padding: var(--section-y) 0;
          background: var(--paper-warm);
        }
        .ac-process-intro {
          max-width: 640px;
          margin-bottom: 56px;
        }
        .ac-process-intro p {
          font-size: 1.05rem;
          color: var(--ink-soft);
          line-height: 1.78;
          margin-top: 18px;
        }
        .ac-process-steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .ac-step {
          background: var(--paper);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-card);
          padding: 32px 28px;
          transition: all 0.3s var(--ease);
        }
        .ac-step:hover {
          border-color: var(--gold);
          box-shadow: var(--shadow);
          transform: translateY(-3px);
        }
        .ac-step-num {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 900;
          color: var(--gold);
          opacity: 0.4;
          line-height: 1;
          margin-bottom: 14px;
        }
        .ac-step h3 {
          font-size: 1rem;
          font-family: var(--font-body);
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 10px;
        }
        .ac-step p {
          font-size: 0.88rem;
          color: var(--ink-soft);
          line-height: 1.68;
        }
        @media (max-width: 1080px) {
          .ac-process-steps { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .ac-process-steps { grid-template-columns: 1fr; }
        }

        /* CTA */
        #ac-cta {
          padding: var(--section-y) 0;
          background: #065F46;
          text-align: center;
        }
        #ac-cta .label { color: var(--gold-light); justify-content: center; }
        #ac-cta .label::before { display: none; }
        #ac-cta h2 {
          color: #fff;
          max-width: 700px;
          margin: 0 auto 24px;
        }
        .ac-cta-sub {
          font-size: 1.05rem;
          color: rgba(255,255,255,0.72);
          line-height: 1.72;
          max-width: 520px;
          margin: 0 auto 44px;
        }
        .ac-cta-btns {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .ac-cta-fine {
          margin-top: 28px;
          font-size: 0.88rem;
          color: rgba(255,255,255,0.5);
        }
      `}</style>

      {/* ── HERO ── */}
      <section id="ac-hero">
        <div className="ac-hero-aura" />
        <div className="container">
          <div className="ac-hero-inner reveal">
            <div className="ac-hero-eyebrow">For Business Schools</div>
            <h1>
              Your students leave with a degree.<br />
              Do they leave knowing <em>how they think</em>?
            </h1>
            <p className="ac-hero-sub">
              MindPrint™ gives business school students a precise, portable understanding of how they approach complex problems — and how to work with people who approach them differently. Better career outcomes, richer team dynamics, more substantive advising conversations.
            </p>
            <div className="ac-hero-btns">
              <a href="mailto:hello@choosecurio.com" className="btn btn-gold">Schedule a Conversation</a>
              <a href="#ac-audiences" className="btn btn-ghost">See How It Works</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section id="ac-stats">
        <div className="container">
          <div className="ac-stats-grid">
            <div className="ac-stat reveal">
              <div className="ac-stat-num">72%</div>
              <div className="ac-stat-desc">of workers experience "Shift Shock" — realizing too late the role wasn't what they expected</div>
              <div className="ac-stat-source">The Muse — 2,500 workers surveyed</div>
            </div>
            <div className="ac-stat reveal reveal-d1">
              <div className="ac-stat-num">$8.9T</div>
              <div className="ac-stat-desc">lost annually to low employee engagement — roughly 9% of global GDP</div>
              <div className="ac-stat-source">Gallup State of the Global Workplace, 2024</div>
            </div>
            <div className="ac-stat reveal reveal-d2">
              <div className="ac-stat-num">1 in 2</div>
              <div className="ac-stat-desc">recent graduates say they didn't receive enough guidance when choosing their career path</div>
              <div className="ac-stat-source">Hult / Workplace Intelligence, 2024</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section id="ac-problem">
        <div className="container">
          <div className="ac-problem-grid">
            <div className="reveal">
              <p className="ac-problem-quote">"Someone starts a new job and realizes with surprise or regret, this isn't what I expected."</p>
              <p className="ac-problem-attr">Kathryn Minshew, CEO & Co-Founder, The Muse — Yahoo Finance, 2022</p>
            </div>
            <div className="reveal reveal-d1">
              <p>Career advisors hear this constantly. The tools to prevent it — self-assessments, personality inventories, strengths surveys — describe <strong>who students are</strong>, not how they think and work.</p>
              <p>Every year, smart students take the wrong job. Not because they lack skills. Not because they interviewed poorly. Because they chose based on brand, salary, and gut feel — without a real picture of how they think, what work energizes them, and what environment they need to thrive.</p>
              <p><strong>MindPrint™ closes that gap</strong> with a framework built specifically for problem-solving and role fit.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FRAMEWORK ── */}
      <section id="ac-framework">
        <div className="container">
          <div className="ac-framework-intro reveal">
            <div className="label">The MindPrint™ Framework</div>
            <h2>A shared language for how people actually think.</h2>
            <p>Every person has a dominant problem-solving orientation — a mode that energizes them and one that drains them over time. MindPrint™ makes that visible. Three orientations combine into six distinct profiles, giving your entire cohort a common vocabulary from day one.</p>
          </div>
          <div className="ac-lenses">
            <div className="ac-lens reveal">
              <div className="ac-lens-tag">WHY</div>
              <h3>Purpose-Driven</h3>
              <p>Anchors to meaning and direction. Energized by asking the right questions, understanding the reason behind the work, and orienting teams toward a clear purpose.</p>
            </div>
            <div className="ac-lens reveal reveal-d1">
              <div className="ac-lens-tag">WHAT</div>
              <h3>Progress-Driven</h3>
              <p>Action-oriented and milestone-focused. Energized by momentum and tangible outcomes. Moves fast, rallies others, and thrives in roles that reward visible progress.</p>
            </div>
            <div className="ac-lens reveal reveal-d2">
              <div className="ac-lens-tag">HOW</div>
              <h3>Precision-Driven</h3>
              <p>Detail-oriented and systems-aware. Energized by deep understanding and structured execution. Builds what others can't and surfaces what others overlook.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TWO AUDIENCES ── */}
      <section id="ac-audiences">
        <div className="container">
          <div className="ac-audiences-intro reveal">
            <div className="label">Who We Work With</div>
            <h2>Built for your whole program.</h2>
            <p>MindPrint™ serves two distinct audiences within your institution — and the impact compounds when both are aligned.</p>
          </div>
          <div className="ac-audiences-grid">
            {/* Career Services */}
            <div className="ac-audience-card reveal">
              <div className="ac-audience-card-header">
                <div className="ac-hero-eyebrow">Career Services & Professional Development</div>
                <h3>Help students land the right role — not just a role.</h3>
              </div>
              <div className="ac-audience-card-body">
                <p>MindPrint™ integrates directly into advising sessions, giving students a cognitive vocabulary before they walk in the door — and giving advisors a shared framework that makes every conversation more substantive.</p>
                <ul className="ac-benefit-list">
                  <li><strong>Durable self-awareness</strong> — students leave with a portable understanding of how they think and work, a foundation for every career decision after graduation</li>
                  <li><strong>Better role alignment</strong> — students evaluate opportunities through a cognitive-energy lens: will this work sustain me, or will I be grinding against my grain?</li>
                  <li><strong>More informed advising</strong> — advisors gain a common framework that accelerates and deepens every student conversation</li>
                  <li><strong>Stronger placement outcomes</strong> — students who understand their cognitive fit land roles they stay in and thrive in</li>
                </ul>
              </div>
            </div>
            {/* Faculty */}
            <div className="ac-audience-card reveal reveal-d1">
              <div className="ac-audience-card-header">
                <div className="ac-hero-eyebrow">Faculty — OB, Leadership & Career Development</div>
                <h3>A teaching tool students actually carry into their careers.</h3>
              </div>
              <div className="ac-audience-card-body">
                <p>MindPrint™ isn't a personality test — it's a problem-solving framework. That distinction is what makes it teachable in a business context and gives students tools that will serve them long after the term ends.</p>
                <ul className="ac-benefit-list">
                  <li><strong>Problem-solving, not personality</strong> — built around how people approach ambiguous problems, directly relevant to case method and team projects</li>
                  <li><strong>Maps to real team dynamics</strong> — includes a problem-type composition model students apply directly to their own project teams</li>
                  <li><strong>Generates discussion immediately</strong> — students recognize themselves and teammates within minutes; the energy model produces honest, high-engagement conversation</li>
                  <li><strong>Ties to real outcomes</strong> — self-awareness, collaboration, and fit-based job selection are all areas MindPrint™ directly addresses</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SYLLABUS FIT ── */}
      <section id="ac-syllabus">
        <div className="container">
          <div className="ac-syllabus-intro reveal">
            <div className="label">Where It Fits</div>
            <h2>Modular by design.</h2>
            <p>MindPrint™ is modular — a single session, a thread across a term, or a throughline from orientation to capstone. It slots into your existing syllabus without displacing what's already working.</p>
          </div>
          <div className="ac-syllabus-grid">
            <div className="ac-syllabus-card reveal">
              <div className="ac-syllabus-num">01</div>
              <h3>Organizational Behavior</h3>
              <p>Team-dynamics module. Students map their project team's collective composition and use the problem-type model to assign roles and predict friction before it happens.</p>
            </div>
            <div className="ac-syllabus-card reveal reveal-d1">
              <div className="ac-syllabus-num">02</div>
              <h3>Leadership Development</h3>
              <p>Anchor self-awareness work. Students examine how their profile shapes their leadership instincts and where it creates blind spots with people who think differently.</p>
            </div>
            <div className="ac-syllabus-card reveal reveal-d2">
              <div className="ac-syllabus-num">03</div>
              <h3>Career Development</h3>
              <p>Pair with Curio's Career Path Guide so students evaluate role fit through a cognitive-energy lens and prepare differentiated interview narratives that stand out.</p>
            </div>
            <div className="ac-syllabus-card reveal reveal-d3">
              <div className="ac-syllabus-num">04</div>
              <h3>Capstone / Practicum</h3>
              <p>Team formation by cognitive profile. Teams assign roles by strength, anticipate friction early, and build a working agreement they can hold each other to.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── STUDENT OUTCOMES ── */}
      <section id="ac-outcomes">
        <div className="container">
          <div className="ac-outcomes-intro reveal">
            <div className="label">What Your Students Leave With</div>
            <h2>Outcomes that enhance your program.</h2>
            <p>The MindPrint™ assessment and framework give students something tangible — a durable artifact and a shared language they'll draw on in every role, team, and career decision after they graduate.</p>
          </div>
          <div className="ac-outcomes-grid">
            <div className="ac-outcome-card reveal">
              <div className="ac-outcome-num">01</div>
              <div>
                <h3>A durable self-awareness</h3>
                <p>Students leave with a precise, portable understanding of how they think and work — a foundation they'll draw on in every role, team, and career decision after graduation.</p>
              </div>
            </div>
            <div className="ac-outcome-card reveal reveal-d1">
              <div className="ac-outcome-num">02</div>
              <div>
                <h3>Better role alignment</h3>
                <p>Students evaluate opportunities through a cognitive-energy lens: will this work sustain me, or will I be grinding against my own grain? They land a better fit out of the program.</p>
              </div>
            </div>
            <div className="ac-outcome-card reveal reveal-d2">
              <div className="ac-outcome-num">03</div>
              <div>
                <h3>More informed advising</h3>
                <p>MindPrint™ gives advisors a shared language with students — faster, more substantive conversations about fit, direction, and what to look for in an opportunity.</p>
              </div>
            </div>
            <div className="ac-outcome-card reveal reveal-d3">
              <div className="ac-outcome-num">04</div>
              <div>
                <h3>Collaboration prowess</h3>
                <p>Students understand cognitive diversity before projects start, so friction gets named and addressed — preparing them for the real-world business environment from day one.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TIERS ── */}
      <section id="ac-tiers">
        <div className="container">
          <div className="label reveal">How We Partner</div>
          <h2 className="reveal">Built around your workflow.<br />Not another thing to manage.</h2>
          <p className="ac-tiers-sub reveal reveal-d1">We meet your program where it is. Start simple and expand as you see results.</p>
          <div className="ac-tiers-grid">
            <div className="ac-tier-card reveal">
              <div className="ac-tier-step">Start Here</div>
              <h3>Advising Tool</h3>
              <p>Cohort-wide assessment and individual profile reports. Integrates directly into advising sessions. Students arrive with a vocabulary. Advisors gain a common framework.</p>
              <div className="ac-tier-pricing">Per-Student · Plug-In Ready</div>
            </div>
            <div className="ac-tier-card reveal reveal-d1">
              <div className="ac-tier-step">Add Impact</div>
              <h3>Live Workshop</h3>
              <p>Half-day MindPrint Live™ session: profile discovery, career mapping, interview prep, and team dynamics. Facilitated and delivered by Curio. High signal for your cohort.</p>
              <div className="ac-tier-pricing">Per-Cohort · We Deliver</div>
            </div>
            <div className="ac-tier-card reveal reveal-d2">
              <div className="ac-tier-step">Go Deep</div>
              <h3>Program Partner</h3>
              <p>MindPrint™ as a program-wide thread — from orientation to placement. Co-developed curriculum, outcomes data, and a case study that sets your program apart.</p>
              <div className="ac-tier-pricing">Annual Pricing · Full Integration</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FACULTY PROCESS ── */}
      <section id="ac-process">
        <div className="container">
          <div className="ac-process-intro reveal">
            <div className="label">Our Process</div>
            <h2>How we work with faculty.</h2>
            <p>This is a partnership. The goal is to augment your curriculum and better prepare students for the business world — not to hand you a tool and walk away.</p>
          </div>
          <div className="ac-process-steps">
            <div className="ac-step reveal">
              <div className="ac-step-num">01</div>
              <h3>Profile Discovery</h3>
              <p>We provide access for each student to take the MindPrint assessment and discover their profile, including natural alignment to types of work and roles in the business world.</p>
            </div>
            <div className="ac-step reveal reveal-d1">
              <div className="ac-step-num">02</div>
              <h3>MindPrint Live</h3>
              <p>We facilitate an interactive session to ground students in the framework and give them a shared language to start seeing how they and their peers think differently — and what that means for work.</p>
            </div>
            <div className="ac-step reveal reveal-d2">
              <div className="ac-step-num">03</div>
              <h3>Contextual Applications</h3>
              <p>We work with you to understand the makeup of your class and co-create activities and exercises to run throughout the semester — adding a new layer to your existing curriculum.</p>
            </div>
            <div className="ac-step reveal reveal-d3">
              <div className="ac-step-num">04</div>
              <h3>Build the Evidence Together</h3>
              <p>Co-develop teaching notes and an outcomes study. Your classroom becomes the proof and foundation. We iterate with you to continue producing results in future classes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="ac-cta">
        <div className="container">
          <div className="label reveal">Get Started</div>
          <h2 className="reveal">Pilot it with one cohort<br />this semester.</h2>
          <p className="ac-cta-sub reveal reveal-d1">
            We design the pilot for your program, deliver it, and hand you the outcomes data. Low lift for your team. High signal for everyone — especially the students whose success you're invested in.
          </p>
          <div className="ac-cta-btns reveal reveal-d2">
            <a href="mailto:hello@choosecurio.com" className="btn btn-outline" style={{ background: 'transparent', color: '#fff', borderColor: '#fff' }}>
              Schedule a Conversation
            </a>
            <a href="https://choosecurio.com" className="btn btn-gold">
              choosecurio.com
            </a>
          </div>
          <p className="ac-cta-fine reveal reveal-d3">hello@choosecurio.com</p>
        </div>
      </section>
    </Layout>
  );
}
