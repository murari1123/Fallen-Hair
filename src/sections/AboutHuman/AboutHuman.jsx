/* ============================================
   FALLEN HAIR — About The Human
   Editorial portraiture and personal introduction
   featuring Murari (aka Pandu / Fallen Hair).
   Fixed static asymmetric composition.
   ============================================ */

import { useEffect, useRef } from 'react';
import { WordReveal } from '@/components/WordReveal/WordReveal';
import { gsap } from '@/lib/gsapConfig';

import photoCamera from '@/assets/about/murari-camera.jpg';
import photoOutdoor from '@/assets/about/murari-outdoor.jpg';
import photoMirror from '@/assets/about/murari-mirror.jpg';

import styles from './AboutHuman.module.css';

export function AboutHuman() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      // Staggered scroll reveal for elements
      const revealElements = container.querySelectorAll('[data-reveal]');
      revealElements.forEach((el) => {
        gsap.fromTo(
          el,
          {
            opacity: 0,
            y: 35,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              once: true,
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className={styles.about} aria-label="About Murari">
      <div className={styles.container}>

        {/* 1. Eyebrow Header */}
        <div className={styles.eyebrowWrapper} data-reveal>
          <span className={styles.eyebrow}>ABOUT / THE HUMAN BEHIND FALLEN HAIR</span>
          <span className={styles.indexNum}>01 // IDENTITY</span>
        </div>

        {/* 2. Large Editorial Headline */}
        <div className={styles.headlineBlock}>
          <WordReveal
            as="h1"
            className={styles.headline}
            triggerStart="top 85%"
            staggerDelay={45}
            duration={800}
          >
            BEHIND THE LENS, BEYOND THE FRAME.
          </WordReveal>
        </div>

        {/* 3. Personal Introduction with Bright Red Highlight */}
        <div className={styles.introWrapper} data-reveal>
          <p className={styles.introParagraph}>
            I’m <span className={styles.nameHighlight}>Murari</span>, a photographer
            and editor drawn to moments, people, light and everything that exists
            between them. I like creating visuals that feel honest, cinematic and
            worth looking at twice.
          </p>

          <div className={styles.roleTags}>
            <span className={styles.tagItem}>MURARI</span>
            <span className={styles.tagDivider}>/</span>
            <span className={styles.tagItem}>PHOTOGRAPHER &amp; EDITOR</span>
            <span className={styles.tagDivider}>/</span>
            <span className={styles.tagItem}>MEDIA HEAD — SPIRIT 2026</span>
            <span className={styles.tagDivider}>/</span>
            <span className={styles.tagItem}>FALLEN HAIR</span>
          </div>
        </div>

        {/* 4 & 5. Fixed Asymmetrical Editorial Photo Composition */}
        <div className={styles.editorialCollage}>

          {/* Primary Large Image — Murari with Camera */}
          <div className={styles.primaryImageCard} data-reveal>
            <div className={styles.imageFramePrimary}>
              <img
                src={photoCamera}
                alt="Murari focusing with Canon camera"
                className={styles.image}
                loading="eager"
              />
            </div>
            <div className={styles.captionRow}>
              <div className={styles.captionLeft}>
                <span className={styles.captionNumber}>01</span>
                <span className={styles.captionTitle}>THE CRAFT // IN FOCUS</span>
              </div>
              <span className={styles.captionMeta}>MURARI · CANON EOS</span>
            </div>
          </div>

          {/* Secondary & Supporting Images Layout */}
          <div className={styles.secondaryGroup}>

            {/* Outdoor Portrait */}
            <div className={styles.secondaryImageCard} data-reveal>
              <div className={styles.imageFrameSecondary}>
                <img
                  src={photoOutdoor}
                  alt="Murari sitting outdoors"
                  className={styles.image}
                  loading="lazy"
                />
              </div>
              <div className={styles.captionRow}>
                <div className={styles.captionLeft}>
                  <span className={styles.captionNumber}>02</span>
                  <span className={styles.captionTitle}>PERSPECTIVE</span>
                </div>
                <span className={styles.captionMeta}>NATURAL LIGHT</span>
              </div>
            </div>

            {/* Close-Up Mirror Portrait */}
            <div className={styles.tertiaryImageCard} data-reveal>
              <div className={styles.imageFrameTertiary}>
                <img
                  src={photoMirror}
                  alt="Murari close-up mirror portrait"
                  className={styles.image}
                  loading="lazy"
                />
              </div>
              <div className={styles.captionRow}>
                <div className={styles.captionLeft}>
                  <span className={styles.captionNumber}>03</span>
                  <span className={styles.captionTitle}>RAW FRAMES</span>
                </div>
                <span className={styles.captionMeta}>UNFILTERED</span>
              </div>
            </div>

          </div>

        </div>

        {/* 6. Philosophy, Identity & Details Breakdown */}
        <div className={styles.narrativeSection} data-reveal>

          <div className={styles.narrativeLeft}>
            <div className={styles.nameReveal}>
              <p className={styles.nameRevealLine}>Hi, I'm Murari.</p>
              <p className={styles.nameRevealMuted}>Also known as Pandu.</p>
              <p className={styles.nameRevealEmphasis}>And sometimes, Fallen Hair.</p>
            </div>

            <div className={styles.credentialsList}>
              <div className={styles.credItem}>
                <span className={styles.credLabel}>Role</span>
                <span className={styles.credValue}>Media Head — SPIRIT 2026</span>
              </div>
              <div className={styles.credItem}>
                <span className={styles.credLabel}>Mediums</span>
                <span className={styles.credValue}>Digital Photography, Editorial Color, Visual Identity</span>
              </div>
              <div className={styles.credItem}>
                <span className={styles.credLabel}>Location</span>
                <span className={styles.credValue}>India · Available Worldwide</span>
              </div>
              <div className={styles.credItem}>
                <span className={styles.credLabel}>Status</span>
                <span className={styles.credValue}>Open for Projects &amp; Commissions</span>
              </div>
            </div>
          </div>

          <div className={styles.narrativeRight}>
            <p className={styles.philosophyLead}>
              "I make things — sometimes with a camera, sometimes with a
              timeline, sometimes with nothing more than an idea that refuses to
              leave. I believe in work that feels honest, craft that respects
              the details, and the kind of design that doesn't need to explain
              itself."
            </p>
            <p className={styles.philosophyBody}>
              I’m not building a commercial template. I’m building a body of work
              grounded in authentic atmosphere. Whether behind the lens at a
              large-scale cultural procession, grading color for cinematic
              video, or framing an intimate portrait, every frame is an attempt to
              capture what felt real.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
