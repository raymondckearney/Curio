import { useState, useEffect } from 'react'
import './Nav.css'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const close = () => setOpen(false)

  return (
    <>
      <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
        <div className="nav__inner container">
          <a href="#" className="nav__logo">Metamorphosis<span className="nav__dot">.</span></a>
          <ul className="nav__links">
            <li><a href="#framework" onClick={close}>The Framework</a></li>
            <li><a href="#energy" onClick={close}>The Energy Model</a></li>
            <li><a href="#types" onClick={close}>The Six Types</a></li>
            <li><a href="#approach" onClick={close}>Our Approach</a></li>
          </ul>
          <a href="#assessment" className="btn btn-primary nav__cta">Take the Assessment</a>
          <button className={`nav__hamburger ${open ? 'open' : ''}`} onClick={() => setOpen(!open)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {open && (
        <div className="mobile-nav">
          <a href="#framework" onClick={close}>The Framework</a>
          <a href="#energy" onClick={close}>The Energy Model</a>
          <a href="#types" onClick={close}>The Six Types</a>
          <a href="#approach" onClick={close}>Our Approach</a>
          <a href="#assessment" className="btn btn-primary" onClick={close}>Take the Assessment</a>
        </div>
      )}
    </>
  )
}
