import { motion } from 'framer-motion'
import './TensionBuilder.css'

const cards = [
  {
    title: 'The Endless Meeting',
    body: 'A visionary leader keeps asking "but what\'s the real goal here?" while the team just wants to move. The meeting ends without a decision. Again.',
  },
  {
    title: 'The Burned-Out Executor',
    body: 'Your most detail-oriented person is stuck in brainstorming sessions all day. They\'re exhausted, disengaged, and quietly updating their résumé.',
  },
  {
    title: 'The Stalled Project',
    body: 'Your action-oriented team lead keeps pushing forward while critical details fall through the cracks. Speed without alignment becomes rework.',
  },
]

export default function TensionBuilder() {
  return (
    <section className="tension">
      <div className="container">
        <motion.div className="tension__header"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }} viewport={{ once: true }}>
          <div className="section-label">The Problem</div>
          <h2 className="tension__headline">What misalignment looks like in practice</h2>
        </motion.div>
        <div className="tension__grid">
          {cards.map((card, i) => (
            <motion.div key={card.title} className="tension__card"
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: i * 0.15 }} viewport={{ once: true }}>
              <div className="tension__card-num">0{i + 1}</div>
              <h3 className="tension__card-title">{card.title}</h3>
              <p className="tension__card-body">{card.body}</p>
            </motion.div>
          ))}
        </div>
        <motion.p className="tension__kicker"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }} viewport={{ once: true }}>
          "It's not a people problem. It's a wiring problem."
        </motion.p>
      </div>
    </section>
  )
}
