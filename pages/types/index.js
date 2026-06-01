import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';
import Layout from '../../components/Layout';

export default function Types() {
  useEffect(() => {
    (function () {
      'use strict';

      var TYPES = [
        { label: 'HOW – WHAT', primary: 'HOW', secondary: 'WHAT', color: '#D97706', tagline: 'Precision-driven, progress-oriented', summary: 'They see how systems will break before they break, and build things that hold.', signal: '"This works for now, but we need a real process here in order to scale."' },
        { label: 'HOW – WHY', primary: 'HOW', secondary: 'WHY', color: '#D97706', tagline: 'Precision-driven, purpose-oriented', summary: 'They understand how things work so deeply that they always find a better way.', signal: '"Wait — before we move on, what happens when X breaks? Because it will."' },
        { label: 'WHAT – HOW', primary: 'WHAT', secondary: 'HOW', color: '#2563EB', tagline: 'Progress-driven, precision-oriented', summary: 'They move with urgency, course-correct in real time, and refuse to stand still.', signal: '"Before we leave this room, I need owners and a deadline on each of these."' },
        { label: 'WHAT – WHY', primary: 'WHAT', secondary: 'WHY', color: '#2563EB', tagline: 'Progress-driven, purpose-oriented', summary: "They move toward goals with conviction — fast, direct, without waiting for perfect information.", signal: '"We\'ve been talking about this for 45 minutes. Can we just pick something and move?"' },
        { label: 'WHY – HOW', primary: 'WHY', secondary: 'HOW', color: '#059669', tagline: 'Purpose-driven, precision-oriented', summary: "They hold the deepest question and the finest detail simultaneously, and won't let go of either.", signal: '"I want to understand the whole picture before we commit to this direction."' },
        { label: 'WHY – WHAT', primary: 'WHY', secondary: 'WHAT', color: '#059669', tagline: 'Purpose-driven, progress-oriented', summary: "They can't commit to a direction they don't believe in — and once they do, they move.", signal: '"Before we go further — are we solving the right problem here?"' },
      ];

      var CX = 250, CY = 250, R_OUT = 196, R_IN = 116;
      var R_MID = (R_OUT + R_IN) / 2;
      var ARC1 = R_IN + (R_OUT - R_IN) * 0.33;
      var ARC2 = R_IN + (R_OUT - R_IN) * 0.67;

      function toRad(d) { return d * Math.PI / 180; }
      function pt(deg, r) { return [CX + r * Math.cos(toRad(deg)), CY + r * Math.sin(toRad(deg))]; }
      function f(n) { return n.toFixed(2); }

      function segPath(i) {
        var a1 = -90 + i * 60, a2 = a1 + 60;
        var o1 = pt(a1, R_OUT), o2 = pt(a2, R_OUT);
        var i1 = pt(a1, R_IN), i2 = pt(a2, R_IN);
        return 'M' + f(i1[0]) + ',' + f(i1[1]) + ' L' + f(o1[0]) + ',' + f(o1[1]) + ' A' + R_OUT + ',' + R_OUT + ',0,0,1,' + f(o2[0]) + ',' + f(o2[1]) + ' L' + f(i2[0]) + ',' + f(i2[1]) + ' A' + R_IN + ',' + R_IN + ',0,0,0,' + f(i1[0]) + ',' + f(i1[1]) + 'Z';
      }
      function arcPath(i, r) {
        var a1 = -90 + i * 60 + 1.5, a2 = -90 + (i + 1) * 60 - 1.5;
        var p1 = pt(a1, r), p2 = pt(a2, r);
        return 'M' + f(p1[0]) + ',' + f(p1[1]) + ' A' + r + ',' + r + ',0,0,1,' + f(p2[0]) + ',' + f(p2[1]);
      }
      function svgEl(tag, attrs) {
        var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        if (attrs) Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
        return el;
      }

      var svg = document.getElementById('typeWheel');
      if (!svg) return;

      var defs = svgEl('defs');
      function makeGrad(id, color) {
        var g = svgEl('radialGradient', { id: id, cx: '250', cy: '250', r: '' + R_OUT, gradientUnits: 'userSpaceOnUse' });
        g.appendChild(svgEl('stop', { offset: '0%', 'stop-color': color, 'stop-opacity': '0.04' }));
        g.appendChild(svgEl('stop', { offset: '55%', 'stop-color': color, 'stop-opacity': '0.22' }));
        g.appendChild(svgEl('stop', { offset: '100%', 'stop-color': color, 'stop-opacity': '0.68' }));
        return g;
      }
      defs.appendChild(makeGrad('gHOW', '#D97706'));
      defs.appendChild(makeGrad('gWHAT', '#2563EB'));
      defs.appendChild(makeGrad('gWHY', '#059669'));
      var cGrad = svgEl('radialGradient', { id: 'cGrad', cx: '38%', cy: '38%', r: '62%' });
      cGrad.appendChild(svgEl('stop', { offset: '0%', 'stop-color': '#ffffff' }));
      cGrad.appendChild(svgEl('stop', { offset: '100%', 'stop-color': '#f3f4f6' }));
      defs.appendChild(cGrad);
      var haloF = svgEl('filter', { id: 'haloBlur', x: '-40%', y: '-40%', width: '180%', height: '180%' });
      haloF.appendChild(svgEl('feGaussianBlur', { stdDeviation: '9', 'color-interpolation-filters': 'sRGB' }));
      defs.appendChild(haloF);
      svg.appendChild(defs);

      svg.appendChild(svgEl('circle', { cx: CX, cy: CY, r: 207, fill: 'none', stroke: '#C7C9CC', 'stroke-width': '0.8', 'stroke-dasharray': '3 5', class: 'outer-ring' }));

      var gradMap = { HOW: 'url(#gHOW)', WHAT: 'url(#gWHAT)', WHY: 'url(#gWHY)' };
      var groups = [];

      TYPES.forEach(function (type, i) {
        var midDeg = -90 + i * 60 + 30;
        var midPt = pt(midDeg, R_MID);
        var pushX = +(Math.cos(toRad(midDeg)) * 11).toFixed(1);
        var pushY = +(Math.sin(toRad(midDeg)) * 11).toFixed(1);

        var g = svgEl('g', { class: 'seg-group', tabindex: '0', role: 'button', 'aria-label': type.label + ' — ' + type.tagline });
        g.style.setProperty('--push-x', pushX + 'px');
        g.style.setProperty('--push-y', pushY + 'px');

        g.appendChild(svgEl('path', { d: segPath(i), fill: type.color, class: 'seg-halo' }));
        g.appendChild(svgEl('path', { d: segPath(i), fill: gradMap[type.primary], class: 'seg-path' }));

        var numRays = 18, rA1 = -90 + i * 60 + 2.5, rA2 = -90 + (i + 1) * 60 - 2.5;
        for (var rn = 0; rn < numRays; rn++) {
          var rDeg = rA1 + (rA2 - rA1) * (rn / (numRays - 1));
          var rPtIn = pt(rDeg, R_IN + 4), rPtOut = pt(rDeg, R_OUT - 4);
          g.appendChild(svgEl('line', { x1: f(rPtIn[0]), y1: f(rPtIn[1]), x2: f(rPtOut[0]), y2: f(rPtOut[1]), stroke: type.color, 'stroke-width': '0.45', class: 'seg-ray' }));
        }
        g.appendChild(svgEl('path', { d: arcPath(i, R_OUT - 2), stroke: '#ffffff', 'stroke-width': '1.5', 'stroke-linecap': 'round', class: 'seg-rim' }));

        var t1 = svgEl('text', { x: f(midPt[0]), y: f(midPt[1] - 13), 'text-anchor': 'middle', 'dominant-baseline': 'middle', 'font-family': 'Caveat, cursive', 'font-size': '14', 'font-weight': '700', fill: type.color, class: 'seg-t1' });
        t1.textContent = type.primary;
        g.appendChild(t1);

        var t2 = svgEl('text', { x: f(midPt[0]), y: f(midPt[1] + 13), 'text-anchor': 'middle', 'dominant-baseline': 'middle', 'font-family': 'Caveat, cursive', 'font-size': '14', 'font-weight': '700', fill: type.color, class: 'seg-t2' });
        t2.textContent = type.secondary;
        g.appendChild(t2);

        svg.appendChild(g);
        groups.push(g);
      });

      var innerCircle = svgEl('circle', { cx: CX, cy: CY, r: R_IN - 1, fill: 'url(#cGrad)', stroke: '#E2E4E7', 'stroke-width': '1.2' });
      svg.appendChild(innerCircle);

      var wcoDefault = document.getElementById('wcoDefault');
      var wcoDetail = document.getElementById('wcoDetail');
      var wcoLabel = document.getElementById('wcoLabel');
      var wcoTagline = document.getElementById('wcoTagline');
      var wcoSummary = document.getElementById('wcoSummary');
      var wcoSignal = document.getElementById('wcoSignal');

      function showType(type) {
        wcoLabel.textContent = type.label;
        wcoLabel.style.color = type.color;
        wcoTagline.textContent = type.tagline;
        wcoSummary.textContent = type.summary;
        wcoSignal.textContent = type.signal;
        wcoSignal.style.color = type.color;
        wcoDefault.classList.add('hidden');
        wcoDetail.classList.add('visible');
      }
      function reset() {
        wcoDefault.classList.remove('hidden');
        wcoDetail.classList.remove('visible');
        groups.forEach(function (g) { g.classList.remove('is-active', 'is-dimmed'); });
      }

      groups.forEach(function (g, i) {
        function activate() {
          groups.forEach(function (el) { el.classList.remove('is-active'); el.classList.add('is-dimmed'); });
          g.classList.remove('is-dimmed');
          g.classList.add('is-active');
          showType(TYPES[i]);
        }
        g.addEventListener('mouseenter', activate);
        g.addEventListener('focus', activate);
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
        g.addEventListener('touchend', function (e) { e.preventDefault(); if (g.classList.contains('is-active')) { reset(); } else { activate(); } });
      });

      svg.addEventListener('mouseleave', reset);
      innerCircle.addEventListener('mouseenter', reset);

      var grid = document.getElementById('typesMobileGrid');
      if (grid) {
        TYPES.forEach(function (type) {
          var card = document.createElement('div');
          card.className = 'tmg-card';
          card.style.borderLeftColor = type.color;
          card.innerHTML = '<div class="tmg-label" style="color:' + type.color + '">' + type.label + '</div><div class="tmg-tagline">' + type.tagline + '</div><hr class="tmg-rule"><p class="tmg-summary">' + type.summary + '</p><p class="tmg-signal" style="color:' + type.color + '">' + type.signal + '</p>';
          grid.appendChild(card);
        });
      }
    }());
  }, []);

  return (
    <Layout>
      <Head>
        <title>The Six Types — Curio</title>
        <meta name="description" content="The six cognitive profiles of the Three Brains Framework." />
        <style>{`
          #types-hero { padding: calc(var(--nav-h) + 72px) 0 56px; }
          .types-header { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: start; }
          .types-header h2 { color: var(--ink); font-weight: 900; }
          .types-header-desc { color: var(--ink-soft); font-size: 1rem; font-weight: 500; line-height: 1.85; }
          #types-wheel { padding: 0 0 var(--section-y); }
          .wheel-stage { position: relative; max-width: 960px; margin: 0 auto; }
          #typeWheel { display: block; width: 100%; height: auto; overflow: visible; }
          .seg-group { cursor: pointer; transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); transform-box: fill-box; }
          .seg-group:focus { outline: none; }
          .seg-path { stroke: #ffffff; stroke-width: 3; fill-opacity: 0.65; transition: fill-opacity 0.3s ease; }
          .seg-group.is-active { transform: translate(var(--push-x), var(--push-y)); }
          .seg-group.is-active .seg-path { fill-opacity: 1; }
          .seg-group.is-dimmed .seg-path { fill-opacity: 0.18; }
          .seg-group.is-dimmed .seg-t1, .seg-group.is-dimmed .seg-t2 { opacity: 0.2; }
          .seg-halo { fill-opacity: 0; pointer-events: none; filter: url(#haloBlur); transition: fill-opacity 0.4s ease; }
          .seg-group.is-active .seg-halo { fill-opacity: 0.40; }
          .seg-group.is-dimmed .seg-halo { fill-opacity: 0; }
          .seg-ray { fill: none; stroke-width: 0.45; opacity: 0.13; transition: opacity 0.3s ease; pointer-events: none; }
          .seg-group.is-active .seg-ray { opacity: 0.32; }
          .seg-group.is-dimmed .seg-ray { opacity: 0.02; }
          .seg-rim { fill: none; stroke-width: 1.5; opacity: 0.20; transition: opacity 0.3s ease; pointer-events: none; }
          .seg-group.is-active .seg-rim { opacity: 0.62; }
          .seg-group.is-dimmed .seg-rim { opacity: 0.04; }
          .seg-t1, .seg-t2 { font-family: 'Caveat', cursive; font-size: 14px; font-weight: 700; transition: opacity 0.3s ease; pointer-events: none; }
          .outer-ring { transform-origin: 250px 250px; animation: ringRotate 90s linear infinite; }
          @keyframes ringRotate { to { transform: rotate(360deg); } }
          .wheel-center-overlay { position: absolute; left: 27%; top: 27%; width: 46%; height: 46%; display: flex; align-items: center; justify-content: center; pointer-events: none; }
          .wco-state { position: absolute; inset: 6%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; transition: opacity 0.35s ease, transform 0.35s ease; }
          .wco-default { opacity: 1; transform: scale(1); }
          .wco-default.hidden { opacity: 0; transform: scale(0.88); }
          .wco-detail { opacity: 0; transform: scale(0.92); }
          .wco-detail.visible { opacity: 1; transform: scale(1); }
          .wco-brand { font-family: 'Caveat', cursive; font-size: clamp(1.5rem, 4.4vw, 2.5rem); font-weight: 700; color: var(--ink); line-height: 1.1; }
          .wco-brand-sub { font-size: clamp(0.58rem, 1.4vw, 0.82rem); font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-muted); margin-top: 6px; }
          .wco-hint { font-size: clamp(0.52rem, 1.2vw, 0.70rem); color: var(--ink-muted); margin-top: 12px; letter-spacing: 0.04em; animation: hintPulse 2.8s ease-in-out infinite; }
          @keyframes hintPulse { 0%,100% { opacity: 0.35; } 50% { opacity: 0.8; } }
          .wco-d-label { font-family: 'Caveat', cursive; font-size: clamp(1.3rem, 3.8vw, 2.1rem); font-weight: 700; line-height: 1.1; margin-bottom: 4px; }
          .wco-d-tagline { font-size: clamp(0.56rem, 1.35vw, 0.80rem); font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-muted); line-height: 1.5; }
          .wco-d-rule { width: 28px; height: 1px; background: var(--rule); margin: 8px auto; flex-shrink: 0; }
          .wco-d-summary { font-size: clamp(0.76rem, 1.75vw, 1.02rem); color: var(--ink-soft); line-height: 1.65; margin: 0 0 6px; }
          .wco-d-signal { font-size: clamp(0.70rem, 1.5vw, 0.90rem); font-style: italic; font-weight: 600; line-height: 1.5; margin: 0; }
          .types-mobile-grid { display: none; grid-template-columns: 1fr 1fr; gap: 12px; }
          .tmg-card { border: 1.5px solid var(--rule); border-left-width: 3px; border-radius: 16px; padding: 18px; background: var(--white); }
          .tmg-label { font-family: 'Caveat', cursive; font-size: 1.1rem; font-weight: 700; margin-bottom: 3px; }
          .tmg-tagline { font-size: 0.63rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-muted); margin-bottom: 10px; }
          .tmg-rule { border: none; border-top: 1px solid var(--rule); margin: 10px 0; }
          .tmg-summary { font-size: 0.8rem; color: var(--ink-soft); line-height: 1.6; margin: 0 0 8px; }
          .tmg-signal { font-size: 0.73rem; font-style: italic; font-weight: 600; line-height: 1.55; margin: 0; }
          @media (max-width: 700px) { .types-header { grid-template-columns: 1fr; gap: 24px; } }
          @media (max-width: 600px) { .wheel-stage { display: none; } .types-mobile-grid { display: grid; } }
          @media (max-width: 400px) { .types-mobile-grid { grid-template-columns: 1fr; } }
        `}</style>
      </Head>

      {/* PAGE HEADER */}
      <section id="types-hero">
        <div className="container">
          <div className="types-header reveal">
            <h2>Primary and secondary orientations combine into six distinct profiles.</h2>
            <p className="types-header-desc">Each person&apos;s primary orientation defines how they draw energy and where they add the most natural value. Their secondary shapes how that value is expressed — producing six profiles, each with a distinct operating signature.</p>
          </div>
        </div>
      </section>

      {/* WHEEL */}
      <section id="types-wheel">
        <div className="container">
          <div className="wheel-stage reveal">
            <svg id="typeWheel" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Six Types interactive wheel"></svg>
            <div className="wheel-center-overlay">
              <div className="wco-state wco-default" id="wcoDefault">
                <div className="wco-brand">MindPrint™</div>
                <div className="wco-brand-sub">Framework™</div>
                <div className="wco-hint">hover to explore</div>
              </div>
              <div className="wco-state wco-detail" id="wcoDetail">
                <div className="wco-d-label" id="wcoLabel"></div>
                <div className="wco-d-tagline" id="wcoTagline"></div>
                <div className="wco-d-rule"></div>
                <p className="wco-d-summary" id="wcoSummary"></p>
                <p className="wco-d-signal" id="wcoSignal"></p>
              </div>
            </div>
          </div>
          <div className="types-mobile-grid" id="typesMobileGrid"></div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta">
        <div className="container">
          <div className="label label--center reveal">Get Started</div>
          <h2 className="reveal">Discover your profile.</h2>
          <p className="reveal reveal-d1">Take the assessment and discover your primary and secondary orientation — and how to build a team around it.</p>
          <div className="cta-btns reveal reveal-d2">
            {/* QUIZ BUTTON — uncomment to re-enable: <Link href="/assessment/intro" className="btn btn-gold">Take MindPrint™ Quiz</Link> */}
            <a href="mailto:raymondckearney@gmail.com" className="btn btn-ghost">Schedule a Conversation</a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
