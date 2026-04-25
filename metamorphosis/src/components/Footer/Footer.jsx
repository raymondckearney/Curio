import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">Metamorphosis<span className="footer__dot">.</span></div>
          <p className="footer__tagline">Unlocking human potential through better problem solving.</p>
        </div>
        <nav className="footer__nav">
          <a href="#framework">The Framework</a>
          <a href="#energy">The Energy Model</a>
          <a href="#types">The Six Types</a>
          <a href="#approach">Our Approach</a>
          <a href="#assessment">Take the Assessment</a>
        </nav>
        <p className="footer__copy">© {new Date().getFullYear()} Metamorphosis. All rights reserved.</p>
      </div>
    </footer>
  )
}
