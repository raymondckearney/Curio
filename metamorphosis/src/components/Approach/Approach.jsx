import { motion } from 'framer-motion'
import './Approach.css'

const phases = [
  {
    num: '1',
    label: 'Learn',
    title: 'We assess how each person on your team naturally thinks — and map the types of problems your team is built to solve.',
    items: ['Individual Three Brains assessment for each team member', 'Leadership profile and problem-type mapping', 'Synthesis of overall team composition and gaps'],
  },
  {
    num: '2',
    label: 'Align',
    title: 'We give the team a shared language — a vocabulary for work that was previously invisible to everyone.',
    items: ['2-day immersive team workshop', 'Problem-solving theory and the six profiles', 'Communication strategies across types'],
  },
  {
    num: '3',
    label: 'Optimize',
    title: 'We build a custom playbook for leadership — specific strategies based on who is on the team and what they need to solve.',
    items: ['Customized team structure recommendations', 'Meeting, reporting, and communication design', 'Follow-up coaching sessions'],
  },
]

export default function Approach() {
  return (
    <section id="approach" className="approach">
      <div className="container">
        <motion.div className="approach__intro"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }} viewport={{ once: true }}>
          <div className="section-label">Our Approach</div>
          <h2 className="approach__headline">Three phases. One transformation.</h2>
        </motion.div>
        <div className="approach__phases">
          {phases.map((phase, i) => (
            <motion.div key={phase.num} className="phase-card"
              initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.15 }} viewport={{ once: true }}>
              <div className="phase-card__watermark">{phase.num}</div>
              <div className="phase-card__label">{phase.label}</div>
              <p className="phase-card__title">{phase.title}</p>
              <ul className="phase-card__list">
                {phase.items.map(item => <li key={item}>{item}</li>)}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
