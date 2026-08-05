export default function QuizQuestion({ text, options, onSelect, selected, onBack, showBack }) {
  return (
    <div style={s.wrap}>
      <h2 style={s.text}>{text}</h2>
      <div style={s.options}>
        {options.map((opt, i) => (
          <button
            key={i}
            type="button"
            style={{ ...s.option, ...(selected === opt.orientation ? s.optionSelected : {}) }}
            onClick={() => onSelect(opt)}
          >
            {opt.text}
          </button>
        ))}
      </div>
      {showBack && (
        <button type="button" style={s.backBtn} onClick={onBack}>← Back</button>
      )}
    </div>
  );
}

const s = {
  wrap: { marginBottom: 8 },
  text: { fontFamily: "'Caveat', cursive", fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: '#1C1917', lineHeight: 1.3, marginBottom: 28 },
  options: { display: 'flex', flexDirection: 'column', gap: 12 },
  option: {
    textAlign: 'left', padding: '18px 22px', background: '#FAFAF9',
    borderWidth: '1.5px', borderStyle: 'solid', borderColor: '#E7E5E4', borderRadius: 12,
    fontFamily: "'DM Sans', sans-serif", fontSize: '0.98rem', color: '#292524', cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', lineHeight: 1.55,
  },
  optionSelected: { background: 'rgba(5,150,105,0.08)', borderColor: '#059669' },
  backBtn: {
    marginTop: 24, background: 'none', border: 'none', padding: 0, color: '#A8A29E',
    fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
  },
};
