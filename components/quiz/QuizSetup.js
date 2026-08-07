export default function QuizSetup({ name, email, company, role, onNameChange, onEmailChange, onCompanyChange, onRoleChange, onBegin }) {
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canBegin = name.trim().length > 0 && emailValid && company.trim().length > 0 && role.trim().length > 0;

  return (
    <div style={s.wrap}>
      <div style={s.field}>
        <label style={s.label}>Name</label>
        <input
          style={s.input}
          value={name}
          onChange={e => onNameChange(e.target.value)}
          placeholder="e.g. Alex Johnson"
        />
      </div>

      <div style={s.field}>
        <label style={s.label}>Email Address</label>
        <input
          style={s.input}
          type="email"
          value={email}
          onChange={e => onEmailChange(e.target.value)}
          placeholder="you@company.com"
        />
      </div>

      <div style={s.field}>
        <label style={s.label}>Organization / Company</label>
        <input
          style={s.input}
          value={company}
          onChange={e => onCompanyChange(e.target.value)}
          placeholder="e.g. Curio"
        />
      </div>

      <div style={s.field}>
        <label style={s.label}>Current Role / Job Title</label>
        <input
          style={s.input}
          value={role}
          onChange={e => onRoleChange(e.target.value)}
          placeholder="e.g. VP of Product"
        />
      </div>

      <button
        type="button"
        style={{ ...s.btn, ...(canBegin ? {} : s.btnDisabled) }}
        disabled={!canBegin}
        onClick={onBegin}
      >
        Begin Assessment →
      </button>
    </div>
  );
}

const s = {
  wrap: { maxWidth: 560 },
  field: { marginBottom: 20 },
  label: { display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#78716C', marginBottom: 8 },
  input: {
    width: '100%', padding: '14px 16px', background: '#FAFAF9',
    borderWidth: '1.5px', borderStyle: 'solid', borderColor: '#E7E5E4', borderRadius: 10,
    fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', color: '#1C1917', outline: 'none', boxSizing: 'border-box',
  },
  btn: {
    width: '100%', padding: '16px 24px', marginTop: 12, background: '#059669', border: 'none', borderRadius: 99,
    color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.04em',
    cursor: 'pointer', transition: 'background 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  btnDisabled: { background: '#E7E5E4', color: '#A8A29E', cursor: 'not-allowed' },
};
