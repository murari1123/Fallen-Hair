/* ============================================
   FALLEN HAIR — Identity / Intro Section
   Asymmetric creative editorial spread with
   restrained line entrance, background parallax drift,
   and accurate creative studio positioning.
   ============================================ */

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import { gsap } from '@/lib/gsapConfig';
import styles from './Identity.module.css';

export function Identity({ isFirstSection = false }) {
  const bgTextRef = useRef(null);

  const containerRef = useGsap((container) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lines = container.querySelectorAll(`.${styles.line}`);
    const bodyBlock = container.querySelector(`.${styles.body}`);
    const metaItems = container.querySelectorAll(`.${styles.metaItem}`);
    const microTags = container.querySelectorAll(`.${styles.microTag}`);

    // 1. Initial Scroll-Triggered Reveal Timeline (Grouped line reveal)
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: isFirstSection ? 'top 95%' : 'top 75%',
        once: true,
      },
    });

    // Eyebrow & micro tags
    tl.fromTo(
      [container.querySelector(`.${styles.label}`), ...microTags],
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out' }
    )
    // Headline lines sequence: crisp upward reveal, no jarring blur
    .fromTo(
      lines,
      {
        opacity: 0,
        y: 24,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out',
      },
      '-=0.3'
    )
    // Supporting paragraph block quietly fades in with small upward translation
    .fromTo(
      bodyBlock,
      {
        opacity: 0,
        y: 12,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: 'power3.out',
      },
      '-=0.25'
    )
    // Identity metadata row
    .fromTo(
      metaItems,
      {
        opacity: 0,
        y: 10,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: 'power3.out',
      },
      '-=0.3'
    );

    // 2. Subtle Background Typographic Element Parallax Drift
    if (bgTextRef.current) {
      gsap.fromTo(
        bgTextRef.current,
        { x: '0%' },
        {
          x: '-6%',
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        }
      );
    }
  }, [isFirstSection]);

  const sectionClasses = [
    styles.identity,
    isFirstSection ? styles.firstSection : '',
  ].filter(Boolean).join(' ');

  return (
    <section ref={containerRef} className={sectionClasses} aria-label="Identity">
      {/* Subtle Oversized Background Typographic Fragment */}
      <div ref={bgTextRef} className={styles.bgFragment} aria-hidden="true">
        <span>STORYTELLER // DISCIPLINE</span>
      </div>

      <div className={styles.container}>

        {/* Section Header & Micro Metadata */}
        <div className={styles.headerRow}>
          <span className={styles.label}>THE IDENTITY</span>
          <span className={`${styles.microTag} ${styles.monoCode}`}>01 // CREATIVE FRAMEWORK</span>
        </div>

        {/* Asymmetric Dominant Editorial Heading */}
        <div className={styles.statementWrapper}>
          <h2 className={styles.headline}>
            {/* Line 1 */}
            <span className={styles.lineWrap}>
              <span className={`${styles.line} ${styles.line1}`}>
                A <span className={styles.wordEmphasis}>CREATIVE</span> mind working
              </span>
            </span>

            {/* Line 2 — Subtle Asymmetric Offset */}
            <span className={styles.lineWrap}>
              <span className={`${styles.line} ${styles.line2}`}>
                at the intersection of
              </span>
            </span>

            {/* Line 3 — Accurate Positioning: EDITING, MOTION and VISUAL */}
            <span className={styles.lineWrap}>
              <span className={`${styles.line} ${styles.line3}`}>
                <span className={styles.wordOutline}>EDITING</span>,{' '}
                <span className={styles.wordEmphasis}>MOTION</span> and{' '}
                <span className={styles.wordOutline}>VISUAL</span>
              </span>
            </span>

            {/* Line 4 — Prominent display closure */}
            <span className={styles.lineWrap}>
              <span className={`${styles.line} ${styles.line4}`}>
                <span className={styles.wordDisplay}>STORYTELLING</span>
                <span className={styles.period}>.</span>
              </span>
            </span>
          </h2>
        </div>

        {/* Integrated Supporting Paragraph with Visual Anchor */}
        <div className={styles.body}>
          <div className={styles.bodyAnchor}>
            <span className={styles.anchorMark}>+</span>
            <span className={styles.anchorLabel}>PERSPECTIVE // 2026</span>
          </div>

          <p className={styles.paragraph}>
            Not defined by a single discipline. Not confined to a single medium.
            The work moves between design, photography, editing and editorial
            thinking — whatever the story demands. Every project is an
            opportunity to see something that wasn't visible before.
          </p>
        </div>

        {/* Horizontal Divider & Identity Metadata */}
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Name</span>
            <span className={styles.metaValue}>Murari</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Alias</span>
            <span className={styles.metaValue}>Pandu</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Studio</span>
            <span className={styles.metaValue}>Fallen Hair</span>
          </div>
        </div>

      </div>
    </section>
  );
}
