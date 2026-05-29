import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';

export default function Framework() {
  return (
    <Layout>
      <Head>
        <title>The Framework — Curio</title>
        <meta name="description" content="The MindPrint™ Framework — three cognitive orientations and the energy model that powers them." />
        <style>{`
          #fw-hero { background: #0F172A; padding: calc(var(--nav-h) + 72px) 0 72px; }
          .fw-hero-top { display: grid; grid-template-columns: 22% 1fr auto; gap: 24px; align-items: center; margin-bottom: 32px; }
          .fw-page-title { font-family: var(--font-display); font-size: clamp(2.4rem, 4.5vw, 3.8rem); font-weight: 900; color: #fff; line-height: 1.05; margin: 0; }
          .fw-page-sub { font-size: clamp(1.05rem, 1.35vw, 1.2rem); font-weight: 500; color: rgba(255,255,255,0.80); line-height: 1.82; max-width: 800px; }
          .fw-hero-img { padding: 0; }
          .fw-hero-img img { width: 100%; height: auto; display: block; }
          .fw-hero-btn { flex-shrink: 0; }
          @media (max-width: 700px) {
            .fw-hero-top { grid-template-columns: 28% 1fr; grid-template-rows: auto auto; gap: 16px; }
            .fw-hero-img { grid-column: 1; grid-row: 1; }
            .fw-page-title { grid-column: 2; grid-row: 1; }
            .fw-hero-btn { grid-column: 1 / -1; grid-row: 2; justify-self: center; }
          }
        `}</style>
      </Head>

      {/* PAGE HEADER */}
      <section id="fw-hero">
        <div className="container">
          <div className="fw-hero-top reveal">
            <div className="fw-hero-img">
              <img src="/images/framework-hero.png" alt="MindPrint Framework" />
            </div>
            <h1 className="fw-page-title">MindPrint™<br />Framework</h1>
            <Link href="/assessment/" className="btn btn-gold fw-hero-btn">Take MindPrint™ Quiz</Link>
          </div>
          <p className="fw-page-sub reveal reveal-d1">Everyone solves problems differently. MindPrint™ reveals how by identifying each person&apos;s natural orientation across three dimensions: <strong style={{ color: '#fff', fontWeight: 700 }}>WHY</strong> (purpose), <strong style={{ color: '#fff', fontWeight: 700 }}>WHAT</strong> (progress), and <strong style={{ color: '#fff', fontWeight: 700 }}>HOW</strong> (precision). The order matters: primary energizes, secondary sustains, tertiary drains. Understanding that hierarchy is the key to productivity, happiness and fulfillment.</p>
        </div>
      </section>

      {/* THE THREE ORIENTATIONS */}
      <section id="framework">
        <div className="fw-glow"></div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="fw-header">
            <div className="reveal"><h2>Every person approaches problems through a combination of three cognitive orientations.</h2></div>
            <div className="fw-intro reveal reveal-d1">
              <p>Individuals have a natural orientation — a default mode for approaching complexity. These orientations are not personality types. They are <strong>cognitive operating modes.</strong></p>
              <p>Understanding which orientation a person leads with, and which they rely on secondarily or reluctantly, is the foundation for building teams that spend their energy on output rather than friction.</p>
            </div>
          </div>
          <div className="lenses">
            <div className="lens reveal">
              <div className="lens-img"><img src="/images/how-character.png" alt="HOW" /></div>
              <div className="lens-type">HOW</div>
              <div className="lens-name">PRECISION-DRIVEN</div>
              <hr className="lens-rule" />
              <p className="lens-italic">HOWs are oriented toward detail before execution. They need to know how all the parts fit together before they&apos;re comfortable moving. They are energized by complexity, by systems, by the satisfaction of making something work precisely and completely.</p>
              <span className="lens-quote">&ldquo;Have we accounted for everything?&rdquo;</span>
            </div>
            <div className="lens reveal reveal-d1">
              <div className="lens-img"><img src="/images/what-character.png" alt="WHAT" /></div>
              <div className="lens-type">WHAT</div>
              <div className="lens-name">PROGRESS-DRIVEN</div>
              <hr className="lens-rule" />
              <p className="lens-italic">WHATs are oriented toward momentum before perfection. They believe that the best way to solve a problem is to start solving it — that clarity emerges through action, not before it. They are energized by progress, by crossing things off, by the feeling that the team is moving.</p>
              <span className="lens-quote">&ldquo;What are the next steps?&rdquo;</span>
            </div>
            <div className="lens reveal reveal-d2">
              <div className="lens-img"><img src="/images/why-character.png" alt="WHY" /></div>
              <div className="lens-type">WHY</div>
              <div className="lens-name">PURPOSE-DRIVEN</div>
              <hr className="lens-rule" />
              <p className="lens-italic">WHYs are oriented toward meaning before movement. They cannot comfortably begin work until they understand the purpose of what they&apos;re doing and the goal to achieve. They are energized by possibility, vision, and asking the right questions to frame the problem.</p>
              <span className="lens-quote">&ldquo;Are we solving the right problem?&rdquo;</span>
            </div>
          </div>
        </div>
      </section>

      {/* ENERGY MODEL */}
      <section id="energy">
        <div className="container">
          <div className="energy-header reveal">
            <h2>Each person operates in all three orientations — but not equally.</h2>
            <p className="energy-subtext">A person&apos;s MindPrint™ Profile captures how they are naturally wired to solve problems, which orientation leads, which supports, and which drains them. Strategic harmony isn&apos;t just about skills; it&apos;s about energy and fit. When the right profiles are aligned to the right work, teams don&apos;t just perform better, they thrive. Results improve, outcomes sharpen, and people find genuine satisfaction in the work they do.</p>
          </div>
        </div>

        <div className="energy-ps-car-section">
          <div className="energy-ps-stack">
            <div className="energy-ps-item energy-ps-item--primary reveal">
              <div className="e-type">Primary</div>
              <div className="e-subtitle">Natural Inclination</div>
              <div className="e-badge">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                Energizing
              </div>
              <p>The primary orientation is a person&apos;s natural home base — the instinctive lens through which problems are approached without effort or deliberation. Thinking is faster here, engagement runs deeper, and output reflects genuine capability. Work that aligns with the primary orientation doesn&apos;t deplete energy; it generates it.</p>
            </div>
            <div className="energy-ps-item energy-ps-item--secondary reveal reveal-d1">
              <div className="e-type">Secondary</div>
              <div className="e-subtitle">Supporting Approach</div>
              <div className="e-badge">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14"/></svg>
                Neutral
              </div>
              <p>The secondary orientation is the space where the primary finds its character. Neither energizing nor draining, it functions as neutral ground — a comfortable range in which a person operates with competence and ease. More than a modifier, the secondary shapes how the primary manifests: two people with the same primary brain can think and work quite differently depending on their secondary.</p>
            </div>
          </div>
          <div className="energy-car-img reveal reveal-d1">
            <img src="/images/mindprint-car.png" alt="The MindPrint — Primary drives, Secondary influences" />
          </div>
        </div>

        <div className="energy-tertiary-section">
          <div className="energy-boulder-img reveal">
            <img src="/images/tertiary-boulder.png" alt="Tertiary — the draining weight" />
          </div>
          <div className="energy-tertiary-text reveal reveal-d1">
            <div className="e-type">Tertiary</div>
            <div className="e-subtitle">Unnatural Alignment</div>
            <div className="e-badge">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l-7 7 7 7"/></svg>
              Draining
            </div>
            <p>The tertiary orientation is where things break down. It is the mode of thinking that feels most unnatural, requires the most effort, and returns the least. Time spent here is genuinely draining — and because the tertiary doesn&apos;t come naturally, its value is often invisible to the person operating in it. They may not see why it matters, which compounds the drain.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta">
        <div className="container">
          <div className="label label--center reveal">Get Started</div>
          <h2 className="reveal">Discover your profile.</h2>
          <p className="reveal reveal-d1">Take the assessment and discover your team&apos;s cognitive composition — and what to build around it.</p>
          <div className="cta-btns reveal reveal-d2">
            <Link href="/assessment/" className="btn btn-gold">Take MindPrint™ Quiz</Link>
            <a href="mailto:hello@curio.com" className="btn btn-ghost">Schedule a Conversation</a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
