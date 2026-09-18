/* ============================================
   FALLEN HAIR — Contact / Final CTA
   Editorial closing section with floating JIGS dialogue.
   ============================================ */

import { useRef, useEffect } from 'react';
import { useJigsModal } from '@/components/Jigs/context/JigsModalContext';
import styles from './Contact.module.css';

export function Contact() {
  const { isOpen: showJigs, openJigs } = useJigsModal();
  const triggerButtonRef = useRef(null);
  const prevShowJigsRef = useRef(false);

  /* Return focus to TALK TO JIGS trigger button when modal closes */
  useEffect(() => {
    if (prevShowJigsRef.current && !showJigs) {
      triggerButtonRef.current?.focus();
    }
    prevShowJigsRef.current = showJigs;
  }, [showJigs]);

  return (
    <section className={styles.contact} aria-label="Contact">
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
            <button
              ref={triggerButtonRef}
              className={`${styles.actionLink} ${styles.jigsButton}`}
              onClick={() => openJigs(triggerButtonRef.current)}
              aria-haspopup="dialog"
              aria-expanded={showJigs}
            >
              TALK TO JIGS
            </button>
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
