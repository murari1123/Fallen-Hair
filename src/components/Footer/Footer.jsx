/* ============================================
   FALLEN HAIR — Footer
   Minimal editorial footer with social links.
   ============================================ */

import styles from './Footer.module.css';

const socialLinks = [
  { id: 'email', label: 'Email', href: 'mailto:muraridamalapati@gmail.com' },
  { id: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/918555041660' },
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/fallen.hair/' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>

        <div className={styles.top}>
          <span className={styles.wordmark}>FALLEN HAIR</span>

          <nav className={styles.social} aria-label="Social links">
            <ul className={styles.socialList}>
              {socialLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    className={styles.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className={styles.bottom}>
          <span className={styles.copyright}>
            © {year} Fallen Hair. All rights reserved.
          </span>
          <a href="/privacy" className={styles.legalLink}>
            Privacy Policy
          </a>
          <span className={styles.credit}>
            Murari — Pandu
          </span>
        </div>

      </div>
    </footer>
  );
}
