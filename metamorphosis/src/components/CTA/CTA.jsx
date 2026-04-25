import { motion } from 'framer-motion'
import './CTA.css'

export default function CTA() {
  return (
    <section id="assessment" className="cta-section">
      <div className="container cta-section__inner">
        <motion.h2 className="cta-section__headline"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }} viewport={{ once: true }}>
          Find out how your team is wired to think.
        </motion.h2>
        <motion.p className="cta-section__sub"
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }} viewport={{ once: true }}>
          Start with the assessment. It takes 8 minutes. The clarity lasts a lot longer.
        </motion.p>
        <motion.div className="cta-section__btns"
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }} viewport={{ once: true }}>
          <a href="#assessment" className="btn btn-primary">Take the Free Assessment</a>
          <a href="#contact" className="btn btn-ghost-light">Schedule a Conversation</a>
        </motion.div>
      </div>
    </section>
  )
}
