import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [year, setYear] = useState('');
  useEffect(() => setYear(new Date().getFullYear().toString()), []);

  return (
    <footer>
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" className="nav-logo">Curio<span className="dot">.</span></Link>
            <p>Curio is the consulting practice behind the MindPrint Framework™ — helping leaders and teams unlock existing potential and optimize work for innovation, happiness, and growth.</p>
          </div>
          <div className="footer-col">
            <h5>The Framework</h5>
            <ul>
              <li><Link href="/framework/">The Three Orientations</Link></li>
              <li><Link href="/framework/#energy">The Energy Model</Link></li>
              <li><Link href="/types/">The Six Types</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>How We Work</h5>
            <ul>
              <li><Link href="/#approach">Discovery</Link></li>
              <li><Link href="/#approach">Alignment</Link></li>
              <li><Link href="/#approach">Optimization</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Connect</h5>
            <ul>
              <li><Link href="/#cta">Work With Us</Link></li>
              <li><a href="mailto:hello@curio.com">hello@curio.com</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {year} Curio. All rights reserved.</p>
          <p>The MindPrint Framework™</p>
        </div>
      </div>
    </footer>
  );
}
