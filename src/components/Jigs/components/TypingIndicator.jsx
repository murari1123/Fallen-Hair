/* ============================================
   JIGS V3 — Typing Indicator
   Three-dot animation while waiting for AI.
   ============================================ */

import styles from '../Jigs.module.css';

export function TypingIndicator() {
  return (
    <div className={`${styles.messageBlock} ${styles.jigsBlock}`}>
      <div className={styles.jigsMessageGroup}>
        <span className={styles.jigsLabel}>JIGS</span>
        <div className={styles.typingIndicator} aria-label="JIGS is thinking">
          <span className={styles.typingDot} />
          <span className={styles.typingDot} />
          <span className={styles.typingDot} />
        </div>
      </div>
    </div>
  );
}
