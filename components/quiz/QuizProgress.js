export default function QuizProgress({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div style={s.wrap}>
      <div style={s.label}>Question {current} of {total}</div>
      <div style={s.track}>
        <div style={{ ...s.fill, width: `${pct}%` }} />
      </div>
    </div>
  );
}

const s = {
  wrap: { marginBottom: 32 },
  label: { fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#059669', marginBottom: 10 },
  track: { width: '100%', height: 4, background: '#E7E5E4', borderRadius: 99, overflow: 'hidden' },
  fill: { height: '100%', background: '#059669', borderRadius: 99, transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' },
};
