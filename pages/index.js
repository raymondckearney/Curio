import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import Layout from '../components/Layout';

function MandalaCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const S = 480;
    el.width = S * dpr;
    el.height = S * dpr;
    el.style.width = S + 'px';
    el.style.height = S + 'px';
    const ctx = el.getContext('2d');
    ctx.scale(dpr, dpr);
    const cx = S / 2, cy = S / 2;
    const PI = Math.PI, PI3 = PI / 3;
    const CFG = [
      [{ r: 30, o: 0 }, { r: 68, o: 0 }, { r: 110, o: 0 }, { r: 152, o: 0 }, { r: 194, o: 0 }, { r: 232, o: 0 }],
      [{ r: 34, o: 0 }, { r: 72, o: PI / 18 }, { r: 110, o: 0 }, { r: 150, o: -PI / 18 }, { r: 192, o: 0 }, { r: 230, o: PI / 18 }],
      [{ r: 28, o: 0 }, { r: 66, o: 0 }, { r: 108, o: PI / 6 }, { r: 152, o: 0 }, { r: 196, o: PI / 6 }, { r: 234, o: 0 }],
      [{ r: 32, o: 0 }, { r: 70, o: -PI / 12 }, { r: 112, o: PI / 12 }, { r: 154, o: -PI / 12 }, { r: 196, o: PI / 12 }, { r: 232, o: 0 }],
    ];
    let rot = 0, morph = 0, cfgA = 0;
    const jx = [], jy = [];
    for (let k = 0; k < 36; k++) { jx.push((Math.random() - 0.5) * 3); jy.push((Math.random() - 0.5) * 3); }

    let mx = -9999, my = -9999;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      mx = (e.clientX - r.left) * (S / r.width);
      my = (e.clientY - r.top) * (S / r.height);
    };
    const onLeave = () => { mx = -9999; my = -9999; };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);

    function lerp(a, b, t) { return a + (b - a) * t; }
    function ease(t) { return t * t * (3 - 2 * t); }
    function repel(px, py) {
      const dx = px - mx, dy = py - my;
      const d2 = dx * dx + dy * dy, R = 88;
      if (d2 < R * R && d2 > 0.1) {
        const d = Math.sqrt(d2);
        const f = (1 - d / R) * (1 - d / R) * 58;
        return [px + (dx / d) * f, py + (dy / d) * f];
      }
      return [px, py];
    }
    function hexPts(r, xo, ri) {
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const a = PI3 * i + rot + xo;
        const b = (ri || 0) * 6 + i;
        const p = repel(cx + r * Math.cos(a) + (jx[b] || 0), cy + r * Math.sin(a) + (jy[b] || 0));
        pts.push(p);
      }
      return pts;
    }
    function rings() {
      const c1 = CFG[cfgA], c2 = CFG[(cfgA + 1) % 4], e = ease(morph);
      return c1.map((r, i) => ({ r: Math.max(8, lerp(r.r, c2[i].r, e)), o: lerp(r.o, c2[i].o, e) }));
    }

    let rafId;
    function draw() {
      ctx.clearRect(0, 0, S, S);
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      const rs = rings();
      const all = rs.map((r, ri) => hexPts(r.r, r.o, ri));
      const n = all.length;
      for (let ri = 0; ri < n - 1; ri++) {
        const p1 = all[ri], p2 = all[ri + 1];
        for (let i = 0; i < 6; i++) {
          const j = (i + 1) % 6;
          ctx.beginPath();
          ctx.moveTo(p1[i][0], p1[i][1]);
          ctx.lineTo(p2[i][0], p2[i][1]);
          ctx.lineTo(p2[j][0], p2[j][1]);
          ctx.lineTo(p1[j][0], p1[j][1]);
          ctx.closePath();
          ctx.fillStyle = ri % 2 === 0
            ? 'rgba(30,30,40,' + (0.025 + ri * 0.006) + ')'
            : 'rgba(5,150,105,' + (0.018 + ri * 0.004) + ')';
          ctx.fill();
        }
      }
      for (let ri = 0; ri < n - 1; ri++) {
        const p1 = all[ri], p2 = all[ri + 1];
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.moveTo(p1[i][0], p1[i][1]);
          ctx.lineTo(p2[i][0], p2[i][1]);
          ctx.strokeStyle = 'rgba(30,30,40,' + (0.10 + (n - 1 - ri) * 0.03) + ')';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
      for (let ri = n - 1; ri >= 0; ri--) {
        const pts = all[ri];
        ctx.beginPath();
        for (let i = 0; i < 6; i++) { i === 0 ? ctx.moveTo(pts[i][0], pts[i][1]) : ctx.lineTo(pts[i][0], pts[i][1]); }
        ctx.closePath();
        if (ri === 0) {
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rs[0].r * 1.1);
          g.addColorStop(0, 'rgba(5,150,105,0.12)');
          g.addColorStop(0.6, 'rgba(5,150,105,0.06)');
          g.addColorStop(1, 'rgba(5,150,105,0)');
          ctx.fillStyle = g; ctx.fill();
          ctx.strokeStyle = 'rgba(5,150,105,0.65)'; ctx.lineWidth = 2.5;
        } else {
          ctx.strokeStyle = 'rgba(30,30,40,' + Math.max(0.07, 0.40 - ri * 0.06) + ')';
          ctx.lineWidth = ri < 2 ? 2.2 : 1.8;
        }
        ctx.stroke();
      }
      all.forEach((pts, ri) => {
        const dr = ri === 0 ? 3 : ri === 1 ? 2 : 1.5;
        const a = Math.max(0.15, 0.7 - ri * 0.1);
        const clr = ri === 0 ? 'rgba(5,150,105,' + a + ')' : 'rgba(30,30,40,' + a + ')';
        pts.forEach((p) => {
          ctx.beginPath(); ctx.arc(p[0], p[1], dr, 0, PI * 2);
          ctx.fillStyle = clr; ctx.fill();
        });
      });
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, rs[0].r * 4);
      cg.addColorStop(0, 'rgba(5,150,105,0.08)');
      cg.addColorStop(1, 'rgba(5,150,105,0)');
      ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, rs[0].r * 4, 0, PI * 2); ctx.fill();
      [0.35, 0.7, 1.05, 1.4].forEach((m) => {
        ctx.beginPath(); ctx.arc(cx, cy, rs[n - 1].r * m, 0, PI * 2);
        ctx.strokeStyle = 'rgba(30,30,40,0.04)'; ctx.lineWidth = 0.5; ctx.stroke();
      });
      rot += 0.003; morph += 0.0025;
      if (morph >= 1) { morph = 0; cfgA = (cfgA + 1) % 4; }
      rafId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="mandala"
      className="concin-mandala"
      width={960}
      height={960}
      style={{ width: 480, height: 480 }}
    />
  );
}

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>Curio — Unlock Your Team&apos;s Potential</title>
        <meta name="description" content="Curio helps leaders unlock the hidden dynamics of how their teams think through the MindPrint™ Framework — transforming how teams work, innovate, and grow." />
      </Head>

      {/* HERO */}
      <section id="hero">
        <div className="hero-aura"></div>
        <div className="concin-layout container">
          <div className="concin-left">
            <h1 className="concin-word">stra·te·gic<br />har·mo·ny</h1>
            <div className="concin-pron">/strəˈtē·jik ˈhär·mə·nē/ &nbsp;·&nbsp; NOUN PHRASE</div>
            <hr className="concin-rule" />
            <p className="concin-def">a state where an organization delivers more output with less friction and people are aligned to work that energizes and fulfills them</p>
            <hr className="concin-rule" />
            <p className="concin-pitch">Most organizations have the strategy. Few have the harmony.<br /><strong className="concin-pitch-bold">We build the difference.</strong></p>
            <div className="concin-ctas">
              <a href="#why-curio" className="btn btn-gold hide-mobile">Discover how</a>
            </div>
          </div>
          <div className="concin-right">
            <MandalaCanvas />
          </div>
        </div>
      </section>

      {/* WHY CURIO */}
      <section id="why-curio">
        <div className="container">
          <h2 className="wc-section-title reveal">We solve problems across many domains.</h2>
          <div className="scenario-row">
            <div className="scenario-item reveal">
              <div className="sc-label">Leadership Development</div>
              <div className="sc-head">When performance gaps defy explanation.</div>
              <p className="sc-body">A high-performing SVP just received a poor review for the first time in her career. Her skip-level reviews are glowing. Her direct reports describe the team as "directionless." Nobody can explain the gap.</p>
            </div>
            <div className="scenario-item reveal reveal-d1">
              <div className="sc-label">Change Management</div>
              <div className="sc-head">When the org changes but behavior doesn&apos;t.</div>
              <p className="sc-body">A COO pushed through a new operating model in 90 days. The org charts changed. The actual behavior didn&apos;t. She&apos;s now on her fourth all-hands trying to explain why this matters.</p>
            </div>
            <div className="scenario-item reveal reveal-d2">
              <div className="sc-label">Cross-Functional Collaboration</div>
              <div className="sc-head">When brilliant people can&apos;t find common ground.</div>
              <p className="sc-body">The product and engineering leads have clashed on every initiative for two years. Both are exceptional performers. HR has run three team-building sessions. Nothing has changed.</p>
            </div>
          </div>
          <div className="wc-footer reveal">
            <h2>You have great people. The question is whether they&apos;re doing the right work.</h2>
            <p className="wc-sub">Curio is a strategic consultancy that helps executive teams build the conditions for strategic harmony: more output, less friction, higher employee happiness and fulfillment, and a team that genuinely thrives. We close the gap between individual potential and collective performance. We leverage our MindPrint™ Framework to map how people actually think and align them to work that they naturally excel at and that energizes them.</p>
          </div>
        </div>
      </section>

      {/* MINDPRINT INTRO */}
      <section id="mindprint-intro">
        <div className="container">
          <div className="mp-intro-grid">
            <div className="mp-intro-text reveal">
              <p className="mp-intro-lead">Achieving strategic harmony on a team starts with understanding how each member is wired to solve problems — their MindPrint™.</p>
              <p className="mp-intro-body">Everyone draws on three cognitive orientations when tackling complex challenges: <strong className="mp-orient">WHY</strong> (purpose), <strong className="mp-orient">WHAT</strong> (progress), and <strong className="mp-orient">HOW</strong> (precision). Each person has a natural hierarchy among the three. Their primary orientation is where they thrive, it energizes them. Their secondary is functional and comfortable. Their tertiary is where thinking becomes a drain.</p>
              <p className="mp-intro-body">Strategic harmony happens when people are aligned to work that plays to their primary and secondary, and shielded, where possible, from sustained work in their tertiary.</p>
              <div className="mp-intro-btns">
                <Link href="/framework/" className="btn btn-gold">Explore MindPrint™ Framework</Link>
                {/* QUIZ BUTTON — uncomment to re-enable: <Link href="/quiz" className="btn btn-outline">Take MindPrint™ Quiz</Link> */}
              </div>
            </div>
            <div className="mp-intro-img reveal reveal-d1">
              <img src="/images/tertiary-boulder.png" alt="The MindPrint Energy Model — primary, secondary, tertiary" />
            </div>
          </div>
        </div>
      </section>

      {/* APPLICATIONS */}
      <section id="applications">
        <div className="container">
          <div className="app-header reveal">
            <div><h2>Where we can help.</h2></div>
            <p className="app-header-right">There are opportunities wherever cognitive misalignment creates friction. Following are some common opportunities we see — each with a distinct set of challenges we work with you to optimize.</p>
          </div>
          <div className="app-grid">
            {[
              ['Hiring & Talent Acquisition', 'Most hiring optimizes for skills and experience but ignores cognitive fit — how someone thinks about problems relative to the role\'s actual demands.'],
              ['Team Composition & Design', 'Most teams are assembled by availability and seniority, not cognitive coverage. Predictable blind spots go unaddressed because nobody can name them.'],
              ['Leadership Development', 'Leaders typically develop in areas that come naturally to them, deepening strengths while blind spots grow larger and more consequential.'],
              ['Organizational Design & Restructuring', 'Org structures create invisible cognitive taxes — systematically under-briefing some types and draining others until they leave.'],
              ['Strategic Planning & Problem Assignment', 'Companies routinely assign the wrong types to the wrong problems — not because of bad judgment, but because they have no vocabulary for the cognitive demands of different problem types.'],
              ['Cross-Functional Collaboration', 'Most cross-functional friction isn\'t personality conflict — it\'s cognitive style collision. The framework gives teams a language for it.'],
              ['Meeting Design & Facilitation', 'Most meetings are implicitly designed for one brain type. A visioning session with no structure frustrates HOWs. A status update with no strategic context frustrates WHYs.'],
              ['Performance Management & Development', 'Performance problems are often type-role mismatches, not capability deficits. The right diagnosis changes everything.'],
              ['Innovation & New Product Development', 'Innovation processes fail in predictable ways depending on which brain type is running them — vision without execution, speed without depth, or rigor without momentum.'],
              ['Culture Building & Retention', 'People leave when their primary orientation is chronically suppressed. Culture is often the cause, and the framework makes it visible.'],
              ['Change Management', 'Change initiatives fail because the rollout ignores how different types experience change. WHYs need purpose. WHATs need to move. HOWs need to understand before they trust.'],
              ['Client Relationship Management', 'Client relationships break down when account teams sell and service in their own cognitive style rather than the client\'s.'],
            ].map(([title, desc]) => (
              <div key={title} className="app-card">
                <div className="app-card-title">{title}</div>
                <div className="app-card-desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APPROACH */}
      <section id="approach">
        <div className="container">
          <div className="approach-lead reveal">
            <h2>How we work with you.</h2>
            <p>We work with leadership teams to map cognitive orientations, redesign how work is assigned, and build the conditions where every person operates from their primary — generating the energy that drives exceptional output.</p>
          </div>
          <div className="phases-visual reveal">
            <div className="pv-card" tabIndex={0}>
              <div className="pv-label">Discovery</div>
              <div className="pv-title">Learning About Your Team</div>
              <div className="pv-hint">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                Hover to explore
              </div>
              <div className="pv-detail">
                <p className="pv-desc">Before we can help your team evolve, we need to understand it deeply. We gather rich data about how each person naturally approaches problems and how your team&apos;s work is currently structured.</p>
                <ul className="pv-list">
                  <li>Individual MindPrint™ assessment for each team member</li>
                  <li>Leadership consultation on team dynamics and work types</li>
                  <li>Identification of energy patterns and misalignments</li>
                  <li>Analysis of the problem types your team regularly faces</li>
                </ul>
              </div>
            </div>
            <div className="pv-card" tabIndex={0}>
              <div className="pv-label">Alignment</div>
              <div className="pv-title">Establishing a Common Language</div>
              <div className="pv-hint">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                Hover to explore
              </div>
              <div className="pv-detail">
                <p className="pv-desc">We bring the team together in a transformative workshop that gives everyone a shared framework for understanding how they — and their colleagues — think. What was invisible becomes visible and actionable.</p>
                <ul className="pv-list">
                  <li>Immersive team workshop</li>
                  <li>Problem-solving theory and typology</li>
                  <li>The six thinking profiles revealed</li>
                  <li>The Energy Model — understanding your team&apos;s fuel</li>
                  <li>Strategies for working across thinking styles</li>
                  <li>Team purpose and optimization planning</li>
                </ul>
              </div>
            </div>
            <div className="pv-card" tabIndex={0}>
              <div className="pv-label">Optimization</div>
              <div className="pv-title">A New Way to Look at Work</div>
              <div className="pv-hint">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                Hover to explore
              </div>
              <div className="pv-detail">
                <p className="pv-desc">We work closely with leadership to translate insights into actionable strategy — customized specifically to your team&apos;s composition and the challenges you face.</p>
                <ul className="pv-list">
                  <li>Customized recommendations report for your team</li>
                  <li>Focused leadership strategy sessions</li>
                  <li>Organizational structure recommendations</li>
                  <li>Meeting and communication strategy</li>
                  <li>Working strategies for key thinking-style combinations</li>
                  <li>Reporting and collaboration structure guidance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta">
        <div className="container">
          <div className="label label--center reveal">Get Started</div>
          <h2 className="reveal">Ready to unlock your<br />team&apos;s full potential?</h2>
          <p className="reveal reveal-d1">Let&apos;s start with a conversation about your team, your challenges, and how Curio can transform the way you work.</p>
          <div className="cta-btns reveal reveal-d2">
            <a href="mailto:hello@choosecurio.com" className="btn btn-outline">Schedule a Conversation</a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
