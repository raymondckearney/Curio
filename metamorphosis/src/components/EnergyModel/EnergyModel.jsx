import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import './EnergyModel.css'

const bars = [
  { label: 'Primary', width: '100%', color: 'var(--why-glow)', caption: 'Energizing — you\'re in flow' },
  { label: 'Secondary', width: '52%', color: 'var(--ink-muted)', caption: 'Neutral — comfortable but not charged' },
  { label: 'Tertiary', width: '18%', color: 'var(--accent)', caption: 'Draining — costly if sustained' },
]

function EnergyBar({ bar, i }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <div ref={ref} className="ebar">
      <div className="ebar__meta">
        <span className="ebar__label">{bar.label}</span>
        <span className="ebar__caption">{bar.caption}</span>
      </div>
      <div className="ebar__track">
        <motion.div className="ebar__fill"
          style={{ background: bar.color }}
          initial={{ width: 0 }}
          animate={{ width: inView ? bar.width : 0 }}
          transition={{ duration: 1, delay: i * 0.2, ease: [0.4, 0, 0.2, 1] }} />
      </div>
    </div>
  )
}

export default function EnergyModel() {
  return (
    <section id="energy" className="energy">
      <div className="container energy__inner">
        <motion.div className="energy__left"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }} viewport={{ once: true }}>
          <div className="section-label">The Energy Model</div>
          <h2 className="energy__headline">The hidden cost no one is measuring</h2>
          <p>Solving problems takes energy. When you work in your <strong>primary orientation</strong> — the cognitive mode that comes most naturally — it gives you energy. You're in flow. Time disappears.</p>
          <p>Your <strong>secondary orientation</strong> is neutral. You can operate there comfortably. It neither fills you up nor drains you.</p>
          <p>But your <strong>tertiary orientation</strong> — the mode furthest from your natural wiring — quietly takes energy. Not because the work is beyond you. Because you're running against your own grain.</p>
          <p>Most teams are unknowingly asking people to spend hours in their tertiary. Then wondering why everyone seems tired.</p>
        </motion.div>
        <motion.div className="energy__right"
          initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }} viewport={{ once: true }}>
          <div className="energy__bars">
            {bars.map((bar, i) => <EnergyBar key={bar.label} bar={bar} i={i} />)}
          </div>
        </motion.div>
      </div>
      <motion.blockquote className="energy__pullquote"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }} viewport={{ once: true }}>
        "The question isn't whether your team is working hard enough. It's whether they're working in their grain."
      </motion.blockquote>
    </section>
  )
}
