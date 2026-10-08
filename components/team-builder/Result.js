// Team Builder step 4: the result and the individual plan view. Rendered
// from the deterministic engine result straight away, with the templated
// copy; the AI narrative replaces the summary, friction steps, plan intros
// and expectations as it arrives (names already substituted for labels).
import { TAGS, MIT, primaryOf, tertiaryOf, orderedPhases, demand, overDrainBudget, drainShare } from '../../lib/team-builder/engine';
import { ENERGY_LABEL, GOTO, GUARDRAIL, DEFINITIONS, PROFILE_COLOR, headcountWhy, list, pct, H, weeksLabel } from '../../lib/team-builder/copy';
import { templatedSummary, frictionView, gapView, expectationFor, collaborators } from '../../lib/team-builder/view';
import { ToolChips, Pie, DemandBar } from './shared';


function PersonCard({ p, V, toolLinks, onOpen }) {
  const t = p.load || 1, dr = p.D / t;
  const by = role => p.items.filter(i => i.role === role).map(i => V.actName(i.act));
  const o = by('Owner'), c = by('Contributor'), v = by('Reviewer');
  const di = p.items.filter(i => i.energy === 'D');
  const tt = tertiaryOf(p.profile);
  return (
    <div className="card">
      <div className="small">{V.nameOf(p.key)}{V.R.engagementLead === p.key ? ' · Engagement lead' : ''}</div>
      <div className="prof">{p.profile}</div>
      <div style={{ fontWeight: 600, marginTop: 4 }}>{p.role}</div>
      <div className="small" style={{ marginTop: 6 }}>About {H(p.load)}, {pct(p.load / p.cap)} of available time</div>
      <div className="ebar" role="img" aria-label={`Energizing ${pct(p.E / t)}, neutral ${pct(p.N / t)}, draining ${pct(dr)}`}>
        <span className="e" style={{ width: `${p.E / t * 100}%` }} /><span className="n" style={{ width: `${p.N / t * 100}%` }} /><span className="d" style={{ width: `${dr * 100}%` }} />
      </div>
      <div className="small">Energizing {pct(p.E / t)} · Neutral {pct(p.N / t)} · Draining {pct(dr)}</div>
      {o.length > 0 && <div className="rl"><b>Owns</b><div>{list(o)}</div></div>}
      {c.length > 0 && <div className="rl"><b>Contributes to</b><div>{list(c)}</div></div>}
      {v.length > 0 && <div className="rl"><b>Reviews</b><div>{list(v)}</div></div>}
      <div className="rl"><b>Draining work</b><div>{di.length ? list(di.map(i => `${V.actName(i.act)} (${i.role.toLowerCase()})`)) : 'None. Nothing assigned sits in their tertiary orientation.'}</div></div>
      {overDrainBudget(p) && (
        <div className="flag" style={{ marginTop: 12 }}>
          <b>Over the drain budget.</b> {pct(drainShare(p))} of this workload is draining, against a 20% limit. {MIT[tt].text}
          <ToolChips ids={MIT[tt].tools} toolLinks={toolLinks} />
        </div>
      )}
      <div style={{ marginTop: 14 }}><button type="button" className="btn ghost small" onClick={() => onOpen(p.key)}>Open individual plan</button></div>
    </div>
  );
}

export function Result({ V, narrative, writing, narrativeError, toolLinks, onOpen, onRoster, onBrief, onPlans, pdfBusy }) {
  const { R, state } = V;
  const P = R.people;
  const seatCount = t => R.ideal.filter(s => s.profile === t).length;
  const lead = V.personByKey[R.engagementLead];
  const fr = R.friction.map(f => frictionView(V, f, narrative));

  return (
    <div className="stack" style={{ gap: 40 }}>
      <div className="sec">
        <div className="eyebrow">Summary</div>
        <h1>{R.usingRoster ? 'The recommended allocation' : 'The recommended team'}</h1>
        <p>{narrative?.summary || templatedSummary(V)}</p>
        {writing && <span className="writing" role="status">Writing the explanation…</span>}
        {!writing && narrativeError && <span className="small" role="status">{narrativeError}</span>}
        <div className="grid">
          <div className="card"><div className="small">Headcount range</div><div className="big">{R.headcount.lo} to {R.headcount.hi} people</div><div className="small" style={{ marginTop: 8 }}>{headcountWhy(R.headcount)}</div></div>
          <div className="card"><div className="small">Team structure</div>
            {lead && <div style={{ marginTop: 6 }}><b>Engagement lead:</b> {V.nameOf(lead.key)} ({lead.profile}). Owns the most direction-setting, planning and client-facing work, and is the client’s main contact.</div>}
            <ul className="plain">{R.phaseOwners.map(x => <li key={x.phase}><b>{V.phaseByKey[x.phase].name}</b> ({weeksLabel(V.phaseByKey[x.phase])}): {V.nameOf(x.person)} owns the most work</li>)}</ul>
          </div>
        </div>
      </div>

      <div className="navy">
        <h3>The shape of the work</h3>
        <div className="small">Share of total effort by the profile each activity calls for. The ideal team puts seats where the effort sits.</div>
        <div className="shape">
          <Pie byProfile={R.byProfile} />
          <div className="plegend">
            {TAGS.filter(t => R.byProfile[t] > 0).sort((a, b) => R.byProfile[b] - R.byProfile[a]).map(t => (
              <div key={t}><i style={{ background: PROFILE_COLOR[t] }} /><b>{t}</b><b>{pct(R.byProfile[t])}</b><span>{seatCount(t) ? `${seatCount(t)} seat${seatCount(t) > 1 ? 's' : ''} in the ideal team` : 'Covered by a contributor'}</span></div>
            ))}
          </div>
        </div>
      </div>

      <div className="navy">
        <h3>Energy demand map</h3>
        <div className="small">How the WHY, WHAT and HOW demand shifts across the project.</div>
        <div className="maprow"><div><b>All work combined</b><small>Every activity</small></div><DemandBar d={R.demand} /></div>
        {V.phasesWithWork.map(p => (
          <div key={p.key} className="maprow"><div><b>{p.name}</b><small>{p.ongoing ? 'Runs across all phases' : weeksLabel(p)}</small></div><DemandBar d={demand(state.acts.filter(a => a.phase === p.key))} /></div>
        ))}
        <div className="legend"><span><i style={{ background: 'var(--why)' }} />WHY · Purpose</span><span><i style={{ background: 'var(--what)' }} />WHAT · Progress</span><span><i style={{ background: 'var(--how)' }} />HOW · Precision</span></div>
        <div className="small" style={{ marginTop: 10 }}>Ongoing work, such as project management, runs alongside every phase. It has its own row so each phase shows only its own work.</div>
      </div>

      <div className="sec">
        <div className="eyebrow">Roles</div>
        <h2>Who carries what</h2>
        <p>Every activity has one owner. Depending on how it is delivered, it may also have contributors and a reviewer.</p>
        <div className="grid3">{DEFINITIONS.map(([t, b]) => <div key={t} className="card def"><b>{t}</b><p className="small">{b}</p></div>)}</div>
        <div className="grid">{P.map(p => <PersonCard key={p.key} p={p} V={V} toolLinks={toolLinks} onOpen={onOpen} />)}</div>
      </div>

      <div className="sec">
        <div className="eyebrow">Owner and contributor matrix</div>
        <h2>Every activity, every person</h2>
        <div className="row" style={{ gap: 8, alignItems: 'center' }}>
          <span className="badge E">{ENERGY_LABEL.E}</span><span className="badge N">{ENERGY_LABEL.N}</span><span className="badge D">{ENERGY_LABEL.D}</span>
          <span className="small">Color shows what the role costs that person.</span>
        </div>
        <div className="scroll">
          <table>
            <thead><tr><th>Activity</th><th>Delivery</th><th>Hours</th>{P.map(p => <th key={p.key}>{V.nameOf(p.key)}<br /><span style={{ fontWeight: 600, letterSpacing: 0 }}>{p.profile}</span></th>)}</tr></thead>
            <tbody>
              {R.rows.map((r, i) => {
                const a = V.actByKey[r.act];
                const newPhase = i === 0 || V.actByKey[R.rows[i - 1].act].phase !== a.phase;
                const ph = V.phaseOf(r.act);
                return [
                  newPhase && <tr key={`ph-${a.phase}`} className="phrow"><td colSpan={P.length + 3}>{ph.name} · {weeksLabel(ph)}</td></tr>,
                  <tr key={r.act}>
                    <td style={{ minWidth: 220 }}>{a.name}<div className="small">{a.tag}</div></td>
                    <td>{a.mode}</td>
                    <td className="small">{H(r.hours)}</td>
                    {P.map(p => {
                      const role = V.roleOf(r, p.key);
                      const item = role && p.items.find(x => x.act === r.act && x.role === role);
                      return <td key={p.key}>{role && <span className={`badge ${item?.energy || 'N'}`}>{role}</span>}</td>;
                    })}
                  </tr>,
                ];
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="sec">
        <div className="eyebrow">Coverage</div>
        <h2>Gaps to close</h2>
        {R.gaps.length ? R.gaps.map((g, i) => {
          const t = gapView(V, g);
          return <div key={i} className="flag"><b>{t.lead}</b> {t.body}{t.tools && <ToolChips ids={t.tools} toolLinks={toolLinks} />}</div>;
        }) : <div className="ok">Every orientation the work needs has a primary on the team, every activity has an owner who is energized or neutral doing it, and no one is over capacity.</div>}
        {R.usingRoster && <p className="small" style={{ maxWidth: 'none' }}>For comparison, the ideal shape for this work is {R.ideal.map(s => s.profile).join(', ')}.</p>}
      </div>

      <div className="sec">
        <div className="eyebrow">Friction forecast</div>
        <h2>Where the work will strain, and what to do</h2>
        {fr.length ? (
          <div className="grid">
            {fr.map(f => (
              <div key={f.id} className="card">
                <h3>{f.title}</h3>
                <div className="small" style={{ margin: '4px 0 10px' }}>{f.aName} ({f.aProfile}) and {f.bName} ({f.bProfile})</div>
                <p style={{ fontSize: 14 }}>{f.what}</p>
                <div className="rl"><b>Where it shows up</b><div>{f.where}</div></div>
                <div className="rl"><b>What to do</b></div>
                <ul className="plain">{f.steps.map((s, i) => <li key={i}>{s}</li>)}</ul>
                <ToolChips ids={f.tools} toolLinks={toolLinks} />
              </div>
            ))}
          </div>
        ) : <div className="ok">None of the recurring friction patterns applies to this mix of profiles.</div>}
      </div>

      <div className="actions">
        <button type="button" className="btn ghost" onClick={onRoster}>Change the roster</button>
        <div className="row" style={{ alignItems: 'center', gap: 10 }}>
          <button type="button" className="btn ghost" onClick={onBrief} disabled={!!pdfBusy}>{pdfBusy === 'brief' ? 'Building the PDF…' : 'Download team brief (PDF)'}</button>
          <button type="button" className="btn" onClick={onPlans} disabled={!!pdfBusy}>{pdfBusy === 'plans' ? 'Building the PDF…' : 'Download individual plans (PDF)'}</button>
        </div>
      </div>
      <div className="foot">{GUARDRAIL}</div>
    </div>
  );
}

export function PersonPlan({ V, p, narrative, toolLinks, onBack, onDownload, pdfBusy }) {
  const t = p.load || 1;
  const name = V.nameOf(p.key);
  const phases = orderedPhases(V.state.phases).filter(x => p.items.some(i => V.actByKey[i.act]?.phase === x.key));
  const di = p.items.filter(i => i.energy === 'D');
  const tt = tertiaryOf(p.profile);
  const count = role => p.items.filter(i => i.role === role).length;
  const intro = narrative?.people?.[p.key]?.planIntro;
  const coll = collaborators(V, p);

  return (
    <div className="stack" style={{ gap: 32 }}>
      <div className="actions">
        <button type="button" className="link" onClick={onBack}>Back to the full result</button>
        <button type="button" className="btn ghost small" onClick={onDownload} disabled={!!pdfBusy}>{pdfBusy === p.key ? 'Building the PDF…' : 'Download this plan (PDF)'}</button>
      </div>
      <div className="sec">
        <div className="eyebrow">Individual plan</div>
        <h1>{name}</h1>
        <div className="row" style={{ alignItems: 'center', gap: 12 }}>
          <span className="prof">{p.profile}</span><span style={{ fontWeight: 600 }}>{p.role}</span>
          {V.R.engagementLead === p.key && <span className="chip">Engagement lead</span>}
        </div>
        <p>About {H(p.load)} over {V.state.weeks || 12} weeks, {pct(p.load / p.cap)} of available time. Owns {count('Owner')} activities, contributes to {count('Contributor')} and reviews {count('Reviewer')}. Energizing {pct(p.E / t)}, neutral {pct(p.N / t)}, draining {pct(p.D / t)}.</p>
        {intro && <p>{intro}</p>}
      </div>

      <div className="sec">
        <h2>The work, phase by phase</h2>
        {phases.map(x => (
          <div key={x.key} className="card">
            <div className="eyebrow">{x.name} · {weeksLabel(x)}</div>
            {p.items.filter(i => V.actByKey[i.act]?.phase === x.key).map(i => {
              const r = V.rowByAct[i.act];
              const others = [r.owner, ...r.contribs, r.reviewer].filter(k => k && k !== p.key);
              const a = V.actByKey[i.act];
              return (
                <div key={`${i.act}|${i.role}`} className="item">
                  <div className="nm">{a.name}</div>
                  <div className="meta"><span className={`badge ${i.energy}`}>{i.role}</span><span className="small">{a.mode} · {H(i.hours)}</span></div>
                  <p>{expectationFor(V, p, i, narrative)}</p>
                  <p className="small">{others.length ? `Works with ${list(others.map(k => `${V.nameOf(k)} (${V.roleOf(r, k).toLowerCase()})`))}.` : 'Solo work.'} {ENERGY_LABEL[i.energy]} for {name}.</p>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="sec">
        <h2>Who to go to for what</h2>
        {coll.length ? (
          <div className="grid">
            {coll.map(c => {
              const x = V.personByKey[c.key];
              return (
                <div key={c.key} className="card">
                  <div className="small">{x.profile}</div>
                  <h3>{V.nameOf(c.key)}</h3>
                  <p style={{ marginTop: 6, fontSize: 14 }}>Go to {V.nameOf(c.key)} for {GOTO[primaryOf(x.profile)]}.</p>
                  <div className="rl"><b>Shared work</b><div>{list(c.acts)}</div></div>
                </div>
              );
            })}
          </div>
        ) : <p>No shared activities on this plan.</p>}
      </div>

      <div className="sec">
        <h2>Watch for</h2>
        {di.length ? (
          <div className="flag"><b>{list(di.map(i => V.actName(i.act)))}</b> {di.length > 1 ? 'sit' : 'sits'} in {tt}, {name}’s tertiary orientation, and will cost energy. {MIT[tt].text}<ToolChips ids={MIT[tt].tools} toolLinks={toolLinks} /></div>
        ) : <div className="ok">Nothing on this plan sits in {tt}, {name}’s tertiary orientation.</div>}
      </div>
      <div><button type="button" className="link" onClick={onBack}>Back to the full result</button></div>
      <div className="foot">{GUARDRAIL}</div>
    </div>
  );
}
