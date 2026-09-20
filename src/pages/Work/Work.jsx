/* ============================================
   FALLEN HAIR — Work Page
   Dedicated page showcasing selected projects,
   experimental visual playground, and 3D Workspace.
   ============================================ */

import { useGsap } from '@/hooks/useGsap';
import { gsap } from '@/lib/gsapConfig';
import { SelectedWork } from '@/sections/SelectedWork/SelectedWork';
import { Playground } from '@/sections/Playground/Playground';
import styles from './Work.module.css';

export function Work() {
  const containerRef = useGsap((container) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Header reveal
    const header = container.querySelector(`.${styles.header}`);
    if (header) {
      const label = header.querySelector(`.${styles.label}`);
      const title = header.querySelector(`.${styles.title}`);
      const subtitle = header.querySelector(`.${styles.subtitle}`);

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      if (label) tl.fromTo(label, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6 }, 0.05);
      if (title) tl.fromTo(title, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8 }, 0.15);
      if (subtitle) tl.fromTo(subtitle, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.7 }, 0.3);
    }

    // 3D Workspace entry card reveal
    const workspaceCard = container.querySelector(`.${styles.workspaceCard}`);
    if (workspaceCard) {
      gsap.fromTo(
        workspaceCard,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: workspaceCard,
            start: 'top 85%',
            once: true,
          },
        }
      );
    }
  }, []);

  return (
    <div ref={containerRef} className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.label}>Selected Work</span>
          <h1 className={styles.title}>Selected Work &amp; Experiments</h1>
          <p className={styles.subtitle}>
            A curated showcase of design systems, brand identities, editorial
            campaigns, visual explorations, and spatial 3D studies.
          </p>
        </header>
      </div>

      <SelectedWork />
      <Playground />

      {/* 3D Workspace Experimental Entrypoint */}
      <section className={styles.workspaceSection} aria-label="3D Workspace Entry">
        <div className={styles.container}>
          <a href="/workspace" className={styles.workspaceCard}>
            <div className={styles.workspaceCardGlow} aria-hidden="true" />
            
            <div className={styles.workspaceCardHeader}>
              <div className={styles.workspaceBadge}>
                <span className={styles.badgeDot} />
                <span className={styles.badgeLabel}>LAB // 001</span>
              </div>
              <span className={styles.workspaceStatus}>EXPERIMENTAL / BETA</span>
            </div>

            <div className={styles.workspaceCardBody}>
              <div className={styles.workspaceInfo}>
                <h2 className={styles.workspaceTitle}>
                  3D WORKSPACE<span className={styles.period}>.</span>
                </h2>
                <p className={styles.workspaceDescription}>
                  Step into the experimental digital laboratory for real-time WebGL,
                  spatial typography, and interactive 3D simulations.
                </p>
              </div>

              <div className={styles.workspaceAction}>
                <span className={styles.actionText}>ENTER LAB</span>
                <span className={styles.actionArrow}>→</span>
              </div>
            </div>
          </a>
        </div>
      </section>
    </div>
  );
}
