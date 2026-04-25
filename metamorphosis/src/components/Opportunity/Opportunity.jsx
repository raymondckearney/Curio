import { motion } from 'framer-motion'
import './Opportunity.css'

const outcomes = [
  'Higher output with less collective energy spent',
  'Stronger innovation from purposefully-assembled problem-solving teams',
  'Reduced burnout and disengagement',
  'Faster decisions because the right voices are in the right rooms',
  'A common language that changes how work gets discussed, assigned, and executed',
  'Leaders who finally understand why certain people thrive on certain problems',
]

export default function Opportunity() {
  return (
    <section className="opportunity">
      <div className="container opportunity__inner">
        <motion.div className="opportunity__left"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }} viewport={{ once: true }}>
          <div className="section-label">The Opportunity</div>
          <h2 className="opportunity__headline">When alignment happens, everything changes</h2>
          <p>Imagine a team where each person is spending the majority of their time in the work that genuinely energizes them. Where the right problems find the right minds. Where collaboration doesn't create friction — it creates momentum.</p>
          <p>That's not a fantasy. It's an engineering problem. And The Three Brains Framework gives leaders the tools to solve it.</p>
        </motion.div>
        <div className="opportunity__right">
          {outcomes.map((item, i) => (
            <motion.div key={i} className="outcome"
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }} viewport={{ once: true }}>
              <span className="outcome__arrow">→</span>
              <span>{item}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
