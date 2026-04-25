import { motion } from 'framer-motion'
import './Framework.css'

const brains = [
  {
    key: 'why',
    letter: 'W',
    tag: 'Primary · Secondary',
    name: 'WHY Brain',
    subtitle: 'The Visionary Lens',
    color: 'var(--why)',
    light: 'var(--why-light)',
    glow: 'var(--why-glow)',
    desc: 'Sees the big picture before the details. Driven by purpose — always asking whether we\'re solving the right problem, and what the future looks like if we get it right. Organizes by goal-setting and thinks in possibilities.',
    traits: ['Big picture', 'Purpose-driven', 'Possibility thinking', 'Vision', 'Questions the status quo'],
  },
  {
    key: 'what',
    letter: 'W',
    tag: 'Primary · Secondary',
    name: 'WHAT Brain',
    subtitle: 'The Momentum Lens',
    color: 'var(--what)',
    light: 'var(--what-light)',
    glow: 'var(--what-glow)',
    desc: 'Action-oriented and progress-hungry. Thinks in milestones — always asking what\'s next and how to keep things moving. Trusts gut over perfect plan and prefers iteration over perfection.',
    traits: ['Action-oriented', 'Milestone-driven', 'Intuitive', 'Iterative', 'Forward motion'],
  },
  {
    key: 'how',
    letter: 'H',
    tag: 'Primary · Secondary',
    name: 'HOW Brain',
    subtitle: 'The Execution Lens',
    color: 'var(--how)',
    light: 'var(--how-light)',
    glow: 'var(--how-glow)',
    desc: 'Detail-oriented and systems-thinking. Sees all the moving parts and how they connect. Organizes by tasks, thrives in complexity, and brings the precision that turns ideas into reality.',
    traits: ['Detail-oriented', 'Process-driven', 'Systems thinking', 'Precision', 'Completionist'],
  },
]

export default function Framework() {
  return (
    <section id="framework" className="framework">
      <div className="container">
        <motion.div className="framework__intro"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }} viewport={{ once: true }}>
          <div className="section-label">The Framework</div>
          <h2 className="framework__headline">Three ways the human mind approaches every problem</h2>
          <p className="framework__lead">
            Every complex challenge requires three things: understanding why it matters, deciding what to do about it, and figuring out how to make it happen. Most people do all three — but not equally. Each of us has a natural orientation that energizes us, and one that quietly exhausts us.
          </p>
        </motion.div>
        <div className="framework__grid">
          {brains.map((brain, i) => (
            <motion.div key={brain.key} className="brain-card"
              style={{ '--brain-color': brain.color, '--brain-light': brain.light, '--brain-glow': brain.glow }}
              initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.15 }} viewport={{ once: true }}>
              <div className="brain-card__watermark">{brain.letter}</div>
              <div className="brain-card__top-border" />
              <div className="brain-card__tag">{brain.tag}</div>
              <h3 className="brain-card__name">{brain.name}</h3>
              <div className="brain-card__subtitle">{brain.subtitle}</div>
              <p className="brain-card__desc">{brain.desc}</p>
              <div className="brain-card__traits">
                {brain.traits.map(t => (
                  <span key={t} className="brain-card__chip">{t}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
