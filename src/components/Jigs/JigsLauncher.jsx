/* ============================================
   FALLEN HAIR — Global JIGS Floating Launcher
   Persistent studio assistant trigger mounted at viewport bottom-right.
   Follows Fallen Hair editorial design language.
   ============================================ */

import { useRef, useState, useEffect } from 'react';
import { useJigsModal } from './context/JigsModalContext';
import styles from './JigsLauncher.module.css';

export function JigsLauncher() {
  const { isOpen, openJigs, isIntroComplete } = useJigsModal();
  const buttonRef = useRef(null);
  const hasAnimatedRef = useRef(isIntroComplete);

  // Phases: 'hidden' -> 'fading-in' -> 'floating'
  const [phase, setPhase] = useState(() => (isIntroComplete ? 'floating' : 'hidden'));

  useEffect(() => {
    if (!isIntroComplete) {
      setPhase('hidden');
      hasAnimatedRef.current = false;
      return;
    }

    if (hasAnimatedRef.current) {
      setPhase('floating');
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      hasAnimatedRef.current = true;
      setPhase('floating');
      return;
    }

    hasAnimatedRef.current = true;
    let floatTimer = null;

    // 1. Quiet breathing space of ~1.4s (1400ms) after actual intro completion
    const quietHoldTimer = setTimeout(() => {
      setPhase('fading-in');

      // 2. 600ms opacity fade-in before floating animation begins
      floatTimer = setTimeout(() => {
        setPhase('floating');
      }, 600);
    }, 1400);

    return () => {
      clearTimeout(quietHoldTimer);
      if (floatTimer) clearTimeout(floatTimer);
    };
  }, [isIntroComplete]);

  const handleClick = () => {
    openJigs(buttonRef.current);
  };

  const getPhaseClass = () => {
    switch (phase) {
      case 'hidden':
        return styles.hiddenPreIntro;
      case 'fading-in':
        return styles.fadingIn;
      case 'floating':
      default:
        return styles.floating;
    }
  };

  const isHidden = phase === 'hidden';

  return (
    <div
      className={`${styles.launcherWrapper} ${getPhaseClass()} ${isOpen ? styles.modalOpen : ''}`}
      aria-hidden={isHidden}
    >
      <button
        ref={buttonRef}
        type="button"
        className={styles.launcher}
        onClick={handleClick}
        aria-label="Open JIGS Studio Assistant"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        tabIndex={isHidden || isOpen ? -1 : 0}
      >
        <span className={styles.statusDot} aria-hidden="true" />
        <span className={styles.launcherTitle}>JIGS</span>
        <span className={styles.launcherSub}>// STUDIO ASSISTANT</span>
      </button>
    </div>
  );
}
