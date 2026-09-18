/* ============================================
   FALLEN HAIR — Identity / Intro Section
   Asymmetric creative editorial spread with
   line-by-line blur reveal, background parallax,
   and typographical nuances.
   ============================================ */

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import { gsap } from '@/lib/gsapConfig';
import styles from './Identity.module.css';

export function Identity({ isFirstSection = false }) {
  const containerRef = useRef(null);
  const bgTextRef = useRef(null);

  useGsap((container) => {
    const lines = container.querySelectorAll(`.${styles.line}`);
    const bodyBlock = container.querySelector(`.${styles.body}`);
    const metaItems = container.querySelectorAll(`.${styles.metaItem}`);
    const microTags = container.querySelectorAll(`.${styles.microTag}`);

    // 1. Initial Scroll-Triggered Reveal Timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: isFirstSection ? 'top 95%' : 'top 80%',
        once: true,
      },
    });

    // Eyebrow & micro tags
    tl.fromTo(
      [container.querySelector(`.${styles.label}`), ...microTags],
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' }
    )
    // Headline lines sequence with blur resolving into crisp white
    .fromTo(
      lines,
      {
        opacity: 0,
        y: 30,
        filter: 'blur(8px)',
      },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.1,
        stagger: 0.14,
        ease: 'power3.out',
      },
      '-=0.4'
    )
    // Supporting paragraph block quietly fades in with small upward translation
    .fromTo(
      bodyBlock,
      {
        opacity: 0,
        y: 16,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
      },
      '-=0.2'
    )
    // Identity metadata row
    .fromTo(
      metaItems,
      {
        opacity: 0,
        y: 15,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out',
      },
      '-=0.5'
    );

    // 2. Subtle Background Typographic Element Parallax Drift
    if (bgTextRef.current) {
      gsap.fromTo(
        bgTextRef.current,
        { x: '0%' },
        {
          x: '-8%',
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

            {/* Line 3 — Typographic nuances */}
            <span className={styles.lineWrap}>
              <span className={`${styles.line} ${styles.line3}`}>
                <span className={styles.wordOutline}>DESIGN</span>,{' '}
                <span className={styles.wordEmphasis}>EDITING</span> and{' '}
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
            <span className={styles.metaLabel}>Aka</span>
            <span className={styles.metaValue}>Pandu</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Screen Name</span>
            <span className={styles.metaValue}>Fallen Hair</span>
          </div>
        </div>

      </div>
    </section>
  );
}
