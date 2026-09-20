/* ============================================
   FALLEN HAIR — Contact / Final CTA
   Editorial closing section with floating JIGS dialogue.
   ============================================ */

import { useGsap } from '@/hooks/useGsap';
import { gsap } from '@/lib/gsapConfig';
import styles from './Contact.module.css';

export function Contact() {
  /* Grouped viewport reveal timeline */
  const containerRef = useGsap((container) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const label = container.querySelector(`.${styles.label}`);
    const headline = container.querySelector(`.${styles.headline}`);
    const subtext = container.querySelector(`.${styles.subtext}`);
    const actions = container.querySelector(`.${styles.actions}`);
    const details = container.querySelector(`.${styles.details}`);
    const availability = container.querySelector(`.${styles.availability}`);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top 85%',
        once: true,
      },
      defaults: { ease: 'power3.out' },
    });

    // Group 1: Eyebrow + Headline
    tl.fromTo(
      [label, headline],
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }
    )
    // Group 2: Subtext + Action Links
    .fromTo(
      [subtext, actions],
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.75, stagger: 0.1 },
      '-=0.45'
    )
    // Group 3: Details Grid + Availability Status
    .fromTo(
      [details, availability],
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 },
      '-=0.4'
    );
  }, []);

  return (
    <section ref={containerRef} className={styles.contact} aria-label="Contact">
      <div className={styles.container}>

        <div className={styles.content}>
          <span className={styles.label}>Get In Touch</span>

          <h2 className={styles.headline}>
            <span className={styles.headlineLine}>Got Something</span>
            <span className={styles.headlineLine}>Interesting?</span>
          </h2>

          <p className={styles.subtext}>
            Always open to meaningful projects, collaborations
            and conversations worth having.
          </p>

          <div className={styles.actions}>
            <a
              href="mailto:muraridamalapati@gmail.com"
              className={styles.actionLink}
            >
              Email Me
            </a>
            <a
              href="https://wa.me/918555041660"
              className={styles.actionLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp Me
            </a>
            <a
              href="https://www.instagram.com/fallen.hair/"
              className={styles.actionLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
          </div>

          <div className={styles.details}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Email</span>
              <a
                href="mailto:muraridamalapati@gmail.com"
                className={styles.detailValue}
              >
                muraridamalapati@gmail.com
              </a>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Phone</span>
              <a href="tel:+918555041660" className={styles.detailValue}>
                +91 85550 41660
              </a>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>WhatsApp</span>
              <a
                href="https://wa.me/918555041660"
                className={styles.detailValue}
                target="_blank"
                rel="noopener noreferrer"
              >
                @murari_1123
              </a>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Instagram</span>
              <a
                href="https://www.instagram.com/fallen.hair/"
                className={styles.detailValue}
                target="_blank"
                rel="noopener noreferrer"
              >
                @fallen.hair
              </a>
            </div>
          </div>

          <div className={styles.availability}>
            <span className={styles.statusDot} aria-hidden="true" />
            <span className={styles.statusText}>
              Available for work — 2026
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
