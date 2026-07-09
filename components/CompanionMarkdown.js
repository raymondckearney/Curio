// Shared tiny markdown renderer for Companion / Translator output panels.
// Fixed brand colors (not per-tool accent) - matches the look across all
// four AI tools.

const EMERALD = '#059669';
const DEEP = '#065F46';
const RULE = '#E2E8F0';

function inline(t, keyBase) {
  return t.split(/(\*\*[^*]+\*\*)/g).map((seg, i) =>
    seg.startsWith('**') && seg.endsWith('**')
      ? <b key={keyBase + '-' + i} style={{ color: DEEP, fontWeight: 600 }}>{seg.slice(2, -2)}</b>
      : <span key={keyBase + '-' + i}>{seg}</span>
  );
}

export default function MD({ text }) {
  const out = [];
  text.split('\n').forEach((line, i) => {
    const l = line.trim();
    if (!l) return;
    if (l.startsWith('## ')) out.push(
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: i === 0 ? 0 : 16, marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: EMERALD }}>{l.slice(3)}</span>
        <span style={{ flex: 1, height: 1, background: RULE }} />
      </div>);
    else if (l.startsWith('- [ ]')) out.push(
      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '4px 0' }}>
        <span style={{ marginTop: 2, display: 'inline-block', width: 14, height: 14, borderRadius: 2, border: `2px solid ${EMERALD}`, flexShrink: 0 }} />
        <span style={{ fontSize: 13, lineHeight: 1.55 }}>{inline(l.slice(5).trim(), i)}</span>
      </div>);
    else if (/^[-•]\s/.test(l)) out.push(
      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '2px 0' }}>
        <span style={{ color: DEEP, fontWeight: 700 }}>·</span>
        <span style={{ fontSize: 13, lineHeight: 1.55 }}>{inline(l.replace(/^[-•]\s/, ''), i)}</span>
      </div>);
    else if (/^\d+\.\s/.test(l)) out.push(
      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline', padding: '2px 0' }}>
        <span style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 17, color: DEEP, minWidth: 16 }}>{l.match(/^\d+/)[0]}</span>
        <span style={{ fontSize: 13, lineHeight: 1.55 }}>{inline(l.replace(/^\d+\.\s/, ''), i)}</span>
      </div>);
    else out.push(<p key={i} style={{ fontSize: 13, lineHeight: 1.6, margin: '4px 0' }}>{inline(l, i)}</p>);
  });
  return <div>{out}</div>;
}
