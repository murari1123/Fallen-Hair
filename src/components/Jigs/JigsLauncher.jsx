/* ============================================
   FALLEN HAIR — Global JIGS Floating Launcher
   Persistent studio assistant trigger mounted at viewport bottom-right.
   Follows Fallen Hair editorial design language.
   ============================================ */

import { useRef } from 'react';
import { useJigsModal } from './context/JigsModalContext';
import styles from './JigsLauncher.module.css';

export function JigsLauncher() {
  const { isOpen, openJigs } = useJigsModal();
  const buttonRef = useRef(null);

  const handleClick = () => {
    openJigs(buttonRef.current);
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`${styles.launcher} ${isOpen ? styles.hidden : ''}`}
      onClick={handleClick}
      aria-label="Open JIGS Studio Assistant"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-hidden={isOpen}
      tabIndex={isOpen ? -1 : 0}
    >
      <span className={styles.statusDot} aria-hidden="true" />
      <span className={styles.launcherTitle}>JIGS</span>
      <span className={styles.launcherSub}>// STUDIO ASSISTANT</span>
    </button>
  );
}
