import Head from 'next/head';
import Layout from '../components/Layout';

export default function Academic() {
  return (
    <Layout>
      <Head>
        <title>Curio for Business Schools — MindPrint™</title>
        <meta name="description" content="MindPrint™ gives business school students a precise, lasting framework for how they think and work — improving career outcomes, team effectiveness, and classroom engagement." />
      </Head>

      <style>{`
        /* ── ACADEMIC PAGE ── */

        /* Hero */
        #ac-hero {
          padding: calc(var(--nav-h) + 90px) 0 100px;
          background: #0F172A;
          position: relative;
          overflow: hidden;
        }
        .ac-aura {
          position: absolute;
          top: -160px; right: -100px;
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(5,150,105,0.16) 0%, transparent 68%);
          pointer-events: none;
        }
        .ac-hero-inner { position: relative; max-width: 820px; }
        .ac-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold-light);
          margin-bottom: 28px;
        }
        .ac-eyebrow::before {
          content: '';
          width: 24px; height: 2px;
          background: var(--gold-light);
          border-radius: 2px;
          flex-shrink: 0;
        }
        #ac-hero h1 {
          font-size: clamp(2.8rem, 5.5vw, 4.8rem);
          color: #fff;
          line-height: 1.07;
          margin-bottom: 26px;
        }
        #ac-hero h1 em {
          font-style: normal;
          color: var(--gold-light);
        }
        .ac-hero-body {
          font-size: clamp(1rem, 1.6vw, 1.15rem);
          color: rgba(255,255,255,0.65);
          line-height: 1.75;
          max-width: 600px;
          margin-bottom: 44px;
        }
        .ac-hero-btns { display: flex; gap: 14px; flex-wrap: wrap; }

        /* Stats */
        #ac-stats { background: var(--gold); padding: 54px 0; }
        .ac-stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
        }
        .ac-stat {
          padding: 0 44px;
          text-align: center;
          border-right: 1px solid rgba(255,255,255,0.22);
        }
        .ac-stat:last-child { border-right: none; }
        .ac-stat-num {
          font-family: var(--font-display);
          font-size: clamp(2.8rem, 4.5vw, 4rem);
          font-weight: 900;
          color: #fff;
          line-height: 1;
          margin-bottom: 10px;
        }
        .ac-stat-text {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.85);
          line-height: 1.55;
          margin-bottom: 8px;
        }
        .ac-stat-source {
          font-size: 0.67rem;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.48);
        }
        @media (max-width: 680px) {
          .ac-stats-row { grid-template-columns: 1fr; gap: 36px; }
          .ac-stat { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.18); padding: 0 0 36px; }
          .ac-stat:last-child { border-bottom: none; padding-bottom: 0; }
        }

        /* Problem */
        #ac-problem { padding: var(--section-y) 0; background: var(--paper); }
        .ac-problem-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        .ac-pull {
          font-family: var(--font-display);
          font-size: clamp(1.6rem, 2.8vw, 2.4rem);
          font-style: italic;
          color: var(--ink);
          line-height: 1.22;
          margin-bottom: 18px;
        }
        .ac-attr {
          font-size: 0.74rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--gold);
        }
        .ac-problem-right p {
          font-size: 1.02rem;
          color: var(--ink-soft);
          line-height: 1.8;
          margin-bottom: 18px;
        }
        .ac-problem-right p:last-child { margin-bottom: 0; }
        .ac-problem-right strong { color: var(--ink); }
        @media (max-width: 800px) {
          .ac-problem-grid { grid-template-columns: 1fr; gap: 40px; }
        }

        /* Framework */
        #ac-framework { padding: var(--section-y) 0; background: var(--paper-warm); }
        .ac-section-intro { max-width: 620px; margin-bottom: 52px; }
        .ac-section-intro p {
          font-size: 1.02rem;
          color: var(--ink-soft);
          line-height: 1.78;
          margin-top: 16px;
        }
        .ac-lenses {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .ac-lens {
          background: var(--paper);
          border: 1.5px solid var(--border);
          border-top: 3px solid var(--gold);
          border-radius: var(--radius-card);
          padding: 32px 30px 34px;
          transition: all 0.28s var(--ease);
        }
        .ac-lens:hover {
          border-top-color: var(--gold);
          box-shadow: var(--shadow-lg);
          transform: translateY(-4px);
        }
        .ac-lens-tag {
          font-size: 0.66rem;
          font-weight: 800;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 12px;
        }
        .ac-lens h3 {
          font-size: 1.4rem;
          color: var(--ink);
          margin-bottom: 12px;
        }
        .ac-lens p { font-size: 0.93rem; color: var(--ink-soft); line-height: 1.7; }
        @media (max-width: 800px) { .ac-lenses { grid-template-columns: 1fr; } }

        /* Who We Work With */
        #ac-who { padding: var(--section-y) 0; background: var(--paper); }
        .ac-who-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
          margin-top: 52px;
        }
        .ac-who-card {
          border: 1.5px solid var(--border);
          border-radius: var(--radius-card);
          padding: 44px 40px;
          transition: all 0.28s var(--ease);
          position: relative;
          overflow: hidden;
        }
        .ac-who-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--gold);
          opacity: 0;
          transition: opacity 0.28s var(--ease);
        }
        .ac-who-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-3px); border-color: transparent; }
        .ac-who-card:hover::before { opacity: 1; }
        .ac-who-card .ac-eyebrow { color: var(--gold); margin-bottom: 14px; }
        .ac-who-card .ac-eyebrow::before { background: var(--gold); }
        .ac-who-card h3 {
          font-size: clamp(1.3rem, 2vw, 1.65rem);
          color: var(--ink);
          line-height: 1.2;
          margin-bottom: 16px;
        }
        .ac-who-card > p {
          font-size: 0.97rem;
          color: var(--ink-soft);
          line-height: 1.75;
          margin-bottom: 28px;
          padding-bottom: 28px;
          border-bottom: 1px solid var(--border);
        }
        .ac-who-list { list-style: none; display: flex; flex-direction: column; gap: 13px; }
        .ac-who-list li {
          display: flex;
          gap: 13px;
          align-items: flex-start;
          font-size: 0.93rem;
          color: var(--ink-soft);
          line-height: 1.55;
        }
        .ac-who-list li::before {
          content: '';
          flex-shrink: 0;
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--gold);
          margin-top: 7px;
        }
        .ac-who-list strong { color: var(--ink); font-weight: 600; }
        @media (max-width: 800px) { .ac-who-grid { grid-template-columns: 1fr; } }

        /* Outcomes */
        #ac-outcomes { padding: var(--section-y) 0; background: var(--cream); }
        .ac-outcomes-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-top: 52px;
        }
        .ac-outcome {
          background: var(--paper);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-card);
          padding: 34px 32px;
          transition: all 0.28s var(--ease);
        }
        .ac-outcome:hover {
          border-color: var(--gold);
          box-shadow: var(--shadow);
          transform: translateY(-3px);
        }
        .ac-outcome-num {
          font-family: var(--font-display);
          font-size: 2.4rem;
          font-weight: 900;
          color: var(--gold);
          opacity: 0.35;
          line-height: 1;
          margin-bottom: 14px;
        }
        .ac-outcome h3 {
          font-size: 1.02rem;
          font-family: var(--font-body);
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 10px;
        }
        .ac-outcome p {
          font-size: 0.91rem;
          color: var(--ink-soft);
          line-height: 1.7;
          margin-bottom: 20px;
        }
        .ac-outcome-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .ac-outcome-tag {
          font-size: 0.66rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: var(--gold-pale);
          color: var(--gold);
          padding: 4px 10px;
          border-radius: 100px;
          border: 1px solid rgba(5,150,105,0.2);
        }
        @media (max-width: 680px) { .ac-outcomes-grid { grid-template-columns: 1fr; } }

        /* How We Partner */
        #ac-partner { padding: var(--section-y) 0; background: #0F172A; }
        #ac-partner .label { color: var(--gold-light); }
        #ac-partner .label::before { background: var(--gold-light); }
        #ac-partner h2 { color: #fff; }
        .ac-partner-sub {
          font-size: 1.02rem;
          color: rgba(255,255,255,0.58);
          line-height: 1.75;
          max-width: 560px;
          margin-top: 16px;
          margin-bottom: 56px;
        }
        .ac-partner-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .ac-partner-card {
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: var(--radius-card);
          padding: 36px 30px;
          display: flex;
          flex-direction: column;
          transition: all 0.28s var(--ease);
        }
        .ac-partner-card:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(52,211,153,0.4);
          transform: translateY(-4px);
        }
        .ac-partner-step {
          font-size: 0.66rem;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold-light);
          margin-bottom: 16px;
        }
        .ac-partner-card h3 {
          font-size: 1.55rem;
          color: #fff;
          margin-bottom: 14px;
        }
        .ac-partner-card p {
          font-size: 0.92rem;
          color: rgba(255,255,255,0.58);
          line-height: 1.72;
          flex: 1;
          margin-bottom: 28px;
        }
        .ac-partner-pricing {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(52,211,153,0.75);
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        @media (max-width: 800px) { .ac-partner-grid { grid-template-columns: 1fr; } }

        /* CTA */
        #ac-cta {
          padding: var(--section-y) 0;
          background: #065F46;
          text-align: center;
        }
        #ac-cta .label { justify-content: center; color: var(--gold-light); }
        #ac-cta .label::before { display: none; }
        #ac-cta h2 { color: #fff; max-width: 640px; margin: 0 auto 22px; }
        .ac-cta-body {
          font-size: 1.05rem;
          color: rgba(255,255,255,0.65);
          line-height: 1.75;
          max-width: 500px;
          margin: 0 auto 44px;
        }
        .ac-cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
        .ac-cta-contact {
          margin-top: 28px;
          font-size: 0.88rem;
          color: rgba(255,255,255,0.42);
        }
      `}</style>

      {/* ── HERO ── */}
      <section id="ac-hero">
        <div className="ac-aura" />
        <div className="container">
          <div className="ac-hero-inner reveal">
            <div className="ac-eyebrow">Curio for Business Schools</div>
            <h1>
              Give your students a language<br />
              for <em>how they think</em> —<br />
              not just what they know.
            </h1>
            <p className="ac-hero-body">
              MindPrint™ is a cognitive framework that helps business school students understand how they approach complex problems, what work energizes them, and how to collaborate with people who think differently. The result is better career decisions, stronger team dynamics, and students who know how to articulate their value.
            </p>
            <div className="ac-hero-btns">
              <a href="mailto:hello@choosecurio.com" className="btn btn-gold">Schedule a Conversation</a>
              <a href="#ac-who" className="btn btn-ghost">Learn More</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section id="ac-stats">
        <div className="container">
          <div className="ac-stats-row">
            <div className="ac-stat reveal">
              <div className="ac-stat-num">72%</div>
              <div className="ac-stat-text">of new employees experience "Shift Shock" — realizing too late the role wasn't what they expected</div>
              <div className="ac-stat-source">The Muse</div>
            </div>
            <div className="ac-stat reveal reveal-d1">
              <div className="ac-stat-num">$8.9T</div>
              <div className="ac-stat-text">lost annually to low employee engagement — roughly 9% of global GDP</div>
              <div className="ac-stat-source">Gallup State of the Global Workplace, 2024</div>
            </div>
            <div className="ac-stat reveal reveal-d2">
              <div className="ac-stat-num">1 in 2</div>
              <div className="ac-stat-text">recent graduates say they didn't receive enough guidance when choosing their career path</div>
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
              <p className="ac-pull">"Someone starts a new job and realizes with surprise or regret — this isn't what I expected."</p>
              <p className="ac-attr">Kathryn Minshew, CEO, The Muse</p>
            </div>
            <div className="reveal reveal-d1">
              <p>The tools most programs use to prepare students for careers — personality assessments, strengths inventories, self-reflection exercises — describe <strong>who someone is</strong>. They rarely address how someone thinks when the work gets hard, what environments sustain them, or where they'll hit a wall.</p>
              <p>MindPrint™ fills that gap. It's a problem-solving framework, not a personality test — built specifically to help people understand their cognitive orientation and use it to make smarter decisions about their careers and teams.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FRAMEWORK ── */}
      <section id="ac-framework">
        <div className="container">
          <div className="ac-section-intro reveal">
            <div className="label">The MindPrint™ Framework</div>
            <h2>A shared language for how people solve problems.</h2>
            <p>Everyone draws on three cognitive orientations when tackling complex challenges. Each person has a natural hierarchy among them — their primary orientation is where they thrive and find energy, their tertiary is where thinking becomes a drain. MindPrint™ makes that hierarchy visible and actionable.</p>
          </div>
          <div className="ac-lenses">
            <div className="ac-lens reveal">
              <div className="ac-lens-tag">WHY · Purpose-Driven</div>
              <h3>Meaning & Direction</h3>
              <p>Anchored to purpose. Energized by framing the right questions, understanding why the work matters, and orienting groups toward a shared goal.</p>
            </div>
            <div className="ac-lens reveal reveal-d1">
              <div className="ac-lens-tag">WHAT · Progress-Driven</div>
              <h3>Momentum & Outcomes</h3>
              <p>Action-oriented and milestone-focused. Energized by moving fast, rallying others, and delivering visible results. Thrives in roles that reward execution.</p>
            </div>
            <div className="ac-lens reveal reveal-d2">
              <div className="ac-lens-tag">HOW · Precision-Driven</div>
              <h3>Depth & Rigor</h3>
              <p>Detail-oriented and systems-aware. Energized by deep understanding and structured execution. Builds what others can't and catches what others miss.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHO WE WORK WITH ── */}
      <section id="ac-who">
        <div className="container">
          <div className="ac-section-intro reveal">
            <div className="label">Who We Work With</div>
            <h2>Built for your whole program.</h2>
            <p>MindPrint™ serves two distinct audiences within a business school — and the impact compounds when both are aligned around the same framework.</p>
          </div>
          <div className="ac-who-grid">
            <div className="ac-who-card reveal">
              <div className="ac-eyebrow">Career Services & Professional Development</div>
              <h3>Help students land the right role — not just a role.</h3>
              <p>MindPrint™ gives students a cognitive vocabulary before they ever sit down with an advisor — and gives your office a shared framework that makes every conversation faster and more substantive.</p>
              <ul className="ac-who-list">
                <li><strong>Stronger self-awareness</strong> — students arrive at advising sessions with a precise, portable understanding of how they work and what they need to thrive</li>
                <li><strong>Better role alignment</strong> — students evaluate opportunities through a cognitive-energy lens, not just salary and brand</li>
                <li><strong>Differentiated interview narratives</strong> — students can articulate how they think, not just what they've done</li>
                <li><strong>Improved placement outcomes</strong> — students who understand their cognitive fit land roles they stay in and grow in</li>
              </ul>
            </div>
            <div className="ac-who-card reveal reveal-d1">
              <div className="ac-eyebrow">Faculty — OB, Leadership & Career Development</div>
              <h3>A teaching tool students carry into their careers.</h3>
              <p>MindPrint™ isn't a personality test — it's a problem-solving framework. That distinction is what makes it teachable in a business context and ensures students find it useful long after the term ends.</p>
              <ul className="ac-who-list">
                <li><strong>Avoids the "horoscope" skepticism</strong> — built around how people approach ambiguous problems, not traits or archetypes</li>
                <li><strong>Maps directly to team dynamics</strong> — students apply a problem-type composition model to their own project teams from day one</li>
                <li><strong>Generates immediate discussion</strong> — students recognize themselves and teammates within minutes; the energy model produces honest, high-engagement conversation</li>
                <li><strong>Ties to real outcomes</strong> — collaboration, leadership development, and career fit are all areas MindPrint™ directly addresses</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── OUTCOMES ── */}
      <section id="ac-outcomes">
        <div className="container">
          <div className="ac-section-intro reveal">
            <div className="label">What Students Leave With</div>
            <h2>Outcomes that outlast the program.</h2>
            <p>MindPrint™ gives students something most assessments don't: a durable framework they'll reference throughout their career — not a result they look at once and forget.</p>
          </div>
          <div className="ac-outcomes-grid">
            <div className="ac-outcome reveal">
              <div className="ac-outcome-num">01</div>
              <h3>A precise self-awareness</h3>
              <p>Students leave with a clear, portable understanding of how they think and work — a foundation for every role, team, and career decision after graduation. Not a personality label, but an actionable model.</p>
              <div className="ac-outcome-tags">
                <span className="ac-outcome-tag">Career Development</span>
                <span className="ac-outcome-tag">Leadership</span>
              </div>
            </div>
            <div className="ac-outcome reveal reveal-d1">
              <div className="ac-outcome-num">02</div>
              <h3>Smarter career decisions</h3>
              <p>Students learn to evaluate opportunities through a cognitive-energy lens — asking not just whether they can do the work, but whether the work will sustain them. They make choices they can stand behind.</p>
              <div className="ac-outcome-tags">
                <span className="ac-outcome-tag">Career Development</span>
                <span className="ac-outcome-tag">Advising</span>
              </div>
            </div>
            <div className="ac-outcome reveal reveal-d2">
              <div className="ac-outcome-num">03</div>
              <h3>Real collaboration skills</h3>
              <p>Students understand cognitive diversity before projects begin, so friction gets named and addressed rather than ignored. They enter team environments with a vocabulary for difference and a strategy for navigating it.</p>
              <div className="ac-outcome-tags">
                <span className="ac-outcome-tag">Organizational Behavior</span>
                <span className="ac-outcome-tag">Capstone</span>
              </div>
            </div>
            <div className="ac-outcome reveal reveal-d3">
              <div className="ac-outcome-num">04</div>
              <h3>A standout professional narrative</h3>
              <p>Students who understand how they think can articulate it — in interviews, in leadership conversations, in team settings. MindPrint™ gives them language that's specific, grounded, and hard to fake.</p>
              <div className="ac-outcome-tags">
                <span className="ac-outcome-tag">Career Development</span>
                <span className="ac-outcome-tag">Leadership</span>
                <span className="ac-outcome-tag">Capstone</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW WE PARTNER ── */}
      <section id="ac-partner">
        <div className="container">
          <div className="label reveal">How We Partner</div>
          <h2 className="reveal">Built around your program.<br />Not another thing to manage.</h2>
          <p className="ac-partner-sub reveal reveal-d1">We meet you where you are. Start with a single cohort and expand as you see results — or go deep from day one.</p>
          <div className="ac-partner-grid">
            <div className="ac-partner-card reveal">
              <div className="ac-partner-step">Start Here</div>
              <h3>Assessment & Profiles</h3>
              <p>Cohort-wide access to the MindPrint™ assessment with individual profile reports for every student. Plug directly into existing programming — orientation, advising, career prep, or team formation — with minimal lift on your end.</p>
              <div className="ac-partner-pricing">Per-Student · Plug-In Ready</div>
            </div>
            <div className="ac-partner-card reveal reveal-d1">
              <div className="ac-partner-step">Add Impact</div>
              <h3>MindPrint Live™</h3>
              <p>A facilitated half-day session delivered by Curio — covering profile discovery, the energy model, team dynamics, and career application. Students leave with a shared vocabulary and an immediate sense of how to use it.</p>
              <div className="ac-partner-pricing">Per-Cohort · We Deliver</div>
            </div>
            <div className="ac-partner-card reveal reveal-d2">
              <div className="ac-partner-step">Go Deep</div>
              <h3>Program Partner</h3>
              <p>MindPrint™ woven through your entire program — from orientation through placement. Co-developed curriculum, contextual exercises, outcomes data, and a partnership that compounds in value every term.</p>
              <div className="ac-partner-pricing">Annual Pricing · Full Integration</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="ac-cta">
        <div className="container">
          <div className="label reveal">Get Started</div>
          <h2 className="reveal">Pilot it with one cohort<br />this semester.</h2>
          <p className="ac-cta-body reveal reveal-d1">
            We design the pilot around your program, deliver it, and hand you the outcomes data. Low lift for your team. High signal for your students.
          </p>
          <div className="ac-cta-btns reveal reveal-d2">
            <a
              href="mailto:hello@choosecurio.com"
              className="btn btn-outline"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)' }}
            >
              Schedule a Conversation
            </a>
          </div>
          <p className="ac-cta-contact reveal reveal-d3">hello@choosecurio.com</p>
        </div>
      </section>
    </Layout>
  );
}
