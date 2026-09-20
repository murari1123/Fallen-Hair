/* ============================================
   FALLEN HAIR — Navbar
   Quiet editorial navigation system.
   Transparent at top · Subtly docked on scroll · Clean underline reveals.
   ============================================ */

import { useEffect, useState } from 'react';
import { useGsap } from '@/hooks/useGsap';
import { gsap } from '@/lib/gsapConfig';
import { normalizeRoute } from '@/lib/navigation';
import styles from './Navbar.module.css';

export function Navbar() {
  const [currentPath, setCurrentPath] = useState(() => normalizeRoute(window.location.pathname));
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleLocation = () => {
      setCurrentPath(normalizeRoute(window.location.pathname));
    };

    window.addEventListener('popstate', handleLocation);
    return () => window.removeEventListener('popstate', handleLocation);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 24;
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navRef = useGsap((container) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    gsap.from(container, {
      y: -12,
      opacity: 0,
      duration: 0.8,
      delay: 0.15,
      ease: 'power3.out',
    });
  }, []);

  return (
    <header
      ref={navRef}
      className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}
      role="banner"
    >
      <div className={styles.inner}>
        <a
          href="/"
          className={`${styles.wordmark} ${currentPath === '/' ? styles.activeWordmark : ''}`}
          aria-label="FALLEN HAIR — Home"
        >
          FALLEN HAIR<span className={styles.dot}>.</span>
        </a>

        <nav className={styles.nav} role="navigation" aria-label="Main navigation">
          <ul className={styles.links}>
            <li>
              <a
                href="/work"
                className={`${styles.link} ${currentPath === '/work' || currentPath === '/workspace' ? styles.activeLink : ''}`}
              >
                Work
              </a>
            </li>
            <li>
              <a
                href="/photography"
                className={`${styles.link} ${currentPath === '/photography' ? styles.activeLink : ''}`}
              >
                Photography
              </a>
            </li>
            <li>
              <a
                href="/about"
                className={`${styles.link} ${currentPath === '/about' ? styles.activeLink : ''}`}
              >
                About
              </a>
            </li>
            <li>
              <a
                href="/contact"
                className={`${styles.link} ${currentPath === '/contact' ? styles.activeLink : ''}`}
              >
                Contact
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
