/* ============================================
   FALLEN HAIR — About Page
   High-End Editorial Portfolio Canvas
   Primary Discipline: Video Editor
   Warm Ivory Canvas (#F1ECE6) · Clean Rectangular Portrait
   Natural Pen Signature · Conversational Narrative
   ============================================ */

import { useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import { gsap } from '@/lib/gsapConfig';
import styles from './About.module.css';

import portraitImg from '@/assets/about/murari-editorial-portrait.jpg';

export function About() {
  const containerRef = useRef(null);
  const portraitRef = useRef(null);

  // Subtle, sophisticated editorial entrance animations
  useGsap((container) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Portrait clean rectangular reveal
    if (portraitRef.current && !prefersReducedMotion) {
      gsap.fromTo(
        portraitRef.current,
        {
          opacity: 0,
          y: 20,
          scale: 1.015,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.4,
          ease: 'power2.out',
          delay: 0.15,
          clearProps: 'transform', // Remains completely still and stable once animation finishes
        }
      );
    }

    if (prefersReducedMotion) return;

    const eyebrow = container.querySelector(`.${styles.eyebrowRow}`);
    const heading = container.querySelector(`.${styles.heading}`);
    const paragraphs = container.querySelectorAll(`.${styles.bodyParagraph}`);
    const creedLines = container.querySelectorAll(`.${styles.creedLine}`);
    const finalStatement = container.querySelector(`.${styles.finalStatement}`);
    const signature = container.querySelector(`.${styles.signature}`);
    const metaBar = container.querySelector(`.${styles.metaBar}`);

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(
      eyebrow,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.8 },
      0.05
    )
    .fromTo(
      heading,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.9 },
      0.15
    )
    .fromTo(
      paragraphs,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.85, stagger: 0.1 },
      0.3
    )
    .fromTo(
      creedLines,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.75, stagger: 0.08 },
      0.55
    )
    .fromTo(
      finalStatement,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.85 },
      0.75
    )
    .fromTo(
      signature,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out' },
      0.95
    )
    .fromTo(
      metaBar,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.8 },
      1.1
    );
  }, []);

  return (
    <div ref={containerRef} className={styles.aboutPage}>
      <div className={styles.container}>

        {/* Top Eyebrow & Archival Metadata */}
        <div className={styles.eyebrowRow}>
          <div className={styles.eyebrowLeft}>
            <span className={styles.plusMark}>+</span>
            <span className={styles.eyebrowText}>ABOUT / CREATIVE IDENTITY</span>
          </div>
          <div className={styles.eyebrowRight}>
            <span className={styles.archivalCode}>24°53'N 84°58'E // 2026</span>
          </div>
        </div>

        {/* Main Editorial Two-Column Spread */}
        <div className={styles.editorialSpread}>

          {/* Left Column: Personal Narrative & Philosophy */}
          <div className={styles.textColumn}>

            {/* Main Heading: Exact "I'M MURARI." with burgundy period */}
            <h1 className={styles.heading}>
              I'M MURARI<span className={styles.accentDot}>.</span>
            </h1>

            {/* Intro Paragraph */}
            <p className={`${styles.bodyParagraph} ${styles.introParagraph}`}>
              I'm a video editor who enjoys turning raw footage into visuals that have a sense of rhythm, emotion and purpose.
            </p>

            {/* Second Paragraph */}
            <p className={`${styles.bodyParagraph} ${styles.secondaryParagraph}`}>
              Video is where most of my work lives, but my process is influenced by design and photography. I have an interest in how visuals are composed, how typography works, how a frame feels, and how small details can change the way a story is experienced.
            </p>

            {/* Third Paragraph */}
            <p className={`${styles.bodyParagraph} ${styles.tertiaryParagraph}`}>
              I'm still exploring those disciplines, learning as I go and bringing what I learn back into editing.
            </p>

            {/* Short Closing Statements */}
            <div className={styles.creedBlock}>
              <div className={styles.creedLine}>Video is how I tell stories.</div>
              <div className={styles.creedLine}>Design helps me shape them.</div>
              <div className={styles.creedLine}>Photography helps me see them.</div>
            </div>

            {/* Final Statement */}
            <div className={styles.finalStatement}>
              <p className={styles.finalStatementText}>
                I'm still figuring things out, but I'm always looking for a better way to tell the story.
              </p>
            </div>

            {/* Personal Handwritten Pen Signature */}
            <div className={styles.signature}>Murari</div>

          </div>

          {/* Right Column: Clean Rectangular Editorial Portrait */}
          <div className={styles.portraitColumn}>
            <div ref={portraitRef} className={styles.portraitContainer}>
              <img
                src={portraitImg}
                alt="Murari"
                className={styles.portraitImage}
                loading="eager"
              />
            </div>
          </div>

        </div>

        {/* Bottom Editorial Metadata Footer Bar */}
        <div className={styles.metaBar}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>PRIMARY DISCIPLINE</span>
            <span className={styles.metaValue}>VIDEO EDITING</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>SUPPORTING CRAFT</span>
            <span className={styles.metaValue}>VISUAL DESIGN · PHOTOGRAPHY</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>LOCATION // STATUS</span>
            <span className={styles.metaValue}>INDIA // AVAILABLE FOR COLLABORATION</span>
          </div>
        </div>

      </div>
    </div>
  );
}
