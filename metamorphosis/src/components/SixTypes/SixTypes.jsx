import { motion } from 'framer-motion'
import './SixTypes.css'

const profiles = [
  { num: '01', combo: 'WHY · WHAT', name: 'The Visionary Strategist', colors: ['var(--why)', 'var(--what)'], desc: 'Spots opportunities others miss and charts the path to reach them. Gets the lay of the land fast, visualizes the ideal state, and rallies others around the direction.' },
  { num: '02', combo: 'WHY · HOW', name: 'The Systems Architect', colors: ['var(--why)', 'var(--how)'], desc: 'Holds the big picture and the fine details simultaneously. Builds the architecture that makes the vision real — always connecting outcomes to the actions that drive them.' },
  { num: '03', combo: 'WHAT · WHY', name: 'The Purposeful Activator', colors: ['var(--what)', 'var(--why)'], desc: 'Drives action with clarity of goal. Equally focused on the journey and the destination — a natural motivator who keeps teams moving toward what matters.' },
  { num: '04', combo: 'WHAT · HOW', name: 'The Iterative Executor', colors: ['var(--what)', 'var(--how)'], desc: 'Moves fast, dives deep, and adjusts as they go. Won\'t leave a conversation without a clear owner and a next step on the table.' },
  { num: '05', combo: 'HOW · WHY', name: 'The Innovative Improver', colors: ['var(--how)', 'var(--why)'], desc: 'Makes what others call impossible happen. Deeply understands how systems work — and is constantly imagining better ways to use time, space, energy, and structure.' },
  { num: '06', combo: 'HOW · WHAT', name: 'The Process Architect', colors: ['var(--how)', 'var(--what)'], desc: 'Organizes complexity and keeps things moving. Can visualize a system, predict where it will break, and fix it before it does.' },
]

export default function SixTypes() {
  return (
    <section id="types" className="sixtypes">
      <div className="container">
        <motion.div className="sixtypes__intro"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }} viewport={{ once: true }}>
          <div className="section-label">The Six Types</div>
          <h2 className="sixtypes__headline">Every combination creates a distinct way of seeing the world</h2>
          <p className="sixtypes__lead">Your primary and secondary orientations combine to create one of six problem-solving profiles. Knowing your profile — and your team's — is where alignment begins.</p>
        </motion.div>
        <div className="sixtypes__grid">
          {profiles.map((p, i) => (
            <motion.div key={p.num} className="profile-card"
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }} viewport={{ once: true }}>
              <div className="profile-card__num">{p.num}</div>
              <div className="profile-card__combo">{p.combo}</div>
              <h3 className="profile-card__name">{p.name}</h3>
              <p className="profile-card__desc">{p.desc}</p>
              <div className="profile-card__badges">
                {p.combo.split(' · ').map((label, j) => (
                  <span key={label} className="profile-card__badge" style={{ background: p.colors[j] }}>{label}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div className="sixtypes__cta"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }} viewport={{ once: true }}>
          <p className="sixtypes__nudge">Which one are you?</p>
          <a href="#assessment" className="btn btn-primary">Take the Assessment</a>
        </motion.div>
      </div>
    </section>
  )
}
