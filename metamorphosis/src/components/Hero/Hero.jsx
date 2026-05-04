import { motion } from 'framer-motion'
import './Hero.css'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1], delay }
})

function VennDiagram() {
  return (
    <svg viewBox="0 0 400 400" className="hero__venn">
      <motion.circle cx="185" cy="155" r="120" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.7)" strokeWidth="2"
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.9, delay: 0.2 }} style={{ transformOrigin: '185px 155px' }} />
      <motion.circle cx="290" cy="275" r="120" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.7)" strokeWidth="2"
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.9, delay: 0.5 }} style={{ transformOrigin: '290px 275px' }} />
      <motion.circle cx="110" cy="275" r="120" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.7)" strokeWidth="2"
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.9, delay: 0.8 }} style={{ transformOrigin: '110px 275px' }} />
      {[['WHY', 185, 110], ['WHAT', 320, 310], ['HOW', 58, 310]].map(([label, x, y], i) => (
        <motion.text key={label} x={x} y={y} textAnchor="middle" fill="white" fontSize="13" fontFamily="Nunito" fontWeight="800" letterSpacing="3"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 + i * 0.15 }}>
          {label}
        </motion.text>
      ))}
    </svg>
  )
}

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__left">
        <div className="container hero__content">
          <motion.div className="section-label" {...fadeUp(0.1)}>The Three Brains Framework</motion.div>
          <motion.h1 className="hero__headline" {...fadeUp(0.3)}>
            Your team has everything it needs to do remarkable work.
          </motion.h1>
          <motion.p className="hero__subheadline" {...fadeUp(0.5)}>
            So why does it still feel harder than it should?
          </motion.p>
          <motion.p className="hero__body" {...fadeUp(0.7)}>
            Most leaders chase performance through more process, more tools, more pressure. But the real gap isn't effort — it's alignment. When people are working against their natural cognitive grain, energy drains, friction rises, and potential stays locked away.
          </motion.p>
          <motion.div className="hero__ctas" {...fadeUp(0.9)}>
            <a href="#assessment" className="btn btn-primary">Discover Your Thinking Profile</a>
            <a href="#framework" className="hero__text-link">See how it works →</a>
          </motion.div>
        </div>
      </div>
      <div className="hero__right">
        <VennDiagram />
      </div>
      <motion.div className="hero__scroll-hint"
        animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
      </motion.div>
    </section>
  )
}
