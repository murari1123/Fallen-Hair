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
  const portraitRef = useRef(null);

  // Subtle, sophisticated editorial entrance animations
  const containerRef = useGsap((container) => {
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

    const s1 = container.querySelector(`.${styles.s1}`);
    const s2 = container.querySelector(`.${styles.s2}`);
    const s3 = container.querySelector(`.${styles.s3}`);
    const s4 = container.querySelector(`.${styles.s4}`);
    const s5 = container.querySelector(`.${styles.s5}`);
    const signatureStrokes = [s1, s2, s3, s4, s5];

    if (prefersReducedMotion) {
      signatureStrokes.forEach((stroke) => {
        if (stroke) {
          gsap.set(stroke, { strokeDashoffset: 0 });
        }
      });
      return;
    }

    // Set initial dasharray and offset to exact path length for progressive handwriting reveal
    signatureStrokes.forEach((stroke) => {
      if (stroke) {
        const length = Math.ceil(stroke.getTotalLength());
        gsap.set(stroke, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
      }
    });

    const eyebrow = container.querySelector(`.${styles.eyebrowRow}`);
    const heading = container.querySelector(`.${styles.heading}`);
    const paragraphs = container.querySelectorAll(`.${styles.bodyParagraph}`);
    const creedLines = container.querySelectorAll(`.${styles.creedLine}`);
    const finalStatement = container.querySelector(`.${styles.finalStatement}`);
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
      { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' },
      0.75
    )
    .fromTo(
      metaBar,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.8 },
      1.0
    );

    // Sequential handwriting stroke-by-stroke animation
    // Final quote finishes at 0.75 + 0.75 = 1.50s.
    // Breath of ~120ms (100–150ms) -> writing starts at 1.62s.
    const startSign = 1.62;

    // Stroke 1: 0.00s – 0.28s (First curved stroke)
    if (s1) {
      tl.to(
        s1,
        {
          strokeDashoffset: 0,
          duration: 0.28,
          ease: 'power1.inOut',
        },
        startSign
      );
    }

    // Stroke 2: 0.28s – 0.65s (Second major curved stroke, continuous flow)
    if (s2) {
      tl.to(
        s2,
        {
          strokeDashoffset: 0,
          duration: 0.38,
          ease: 'power1.inOut',
        },
        startSign + 0.27
      );
    }

    // Stroke 3: 0.65s – 1.05s (Internal signature strokes, faster rhythm)
    if (s3) {
      tl.to(
        s3,
        {
          strokeDashoffset: 0,
          duration: 0.40,
          ease: 'power1.inOut',
        },
        startSign + 0.64
      );
    }

    // Stroke 4: 1.05s – 1.35s (Tall vertical finishing stroke, swift and confident)
    if (s4) {
      tl.to(
        s4,
        {
          strokeDashoffset: 0,
          duration: 0.30,
          ease: 'power2.out',
        },
        startSign + 1.03
      );
    }

    // Stroke 5: 1.35s – 1.75s (Long diagonal finishing sweep drawn LAST, accelerating)
    if (s5) {
      tl.to(
        s5,
        {
          strokeDashoffset: 0,
          duration: 0.42,
          ease: 'power2.out',
        },
        startSign + 1.32
      );
    }
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
            <div
              className={styles.signature}
              aria-label="Murari handwritten signature"
            >
              <svg
                viewBox="120 0 1745 700"
                className={styles.signatureSvg}
                role="img"
                aria-label="Murari handwritten signature"
              >
                <g>
                  <path
                    className={`${styles.signatureStroke} ${styles.s1}`}
                    d="M 170 330 C 155 285 170 220 225 170 C 285 115 355 95 395 125 C 430 152 435 205 432 275 C 430 325 427 365 430 405"
                  />
                  <path
                    className={`${styles.signatureStroke} ${styles.s2}`}
                    d="M 430 405 C 432 320 425 245 455 170 C 495 70 565 20 625 32 C 680 42 690 105 690 175 C 690 260 675 345 650 425 C 625 500 570 575 510 665"
                  />
                  <path
                    className={`${styles.signatureStroke} ${styles.s3}`}
                    d="M 510 665 C 560 570 625 455 715 350 L 770 285 L 780 450 L 870 325 L 925 255 L 935 425 C 990 410 1040 365 1085 275 L 1120 205"
                  />
                  <path
                    className={`${styles.signatureStroke} ${styles.s4}`}
                    d="M 1120 205 L 1118 430"
                  />
                  <path
                    className={`${styles.signatureStroke} ${styles.s5}`}
                    d="M 805 555 C 910 505 1015 460 1120 410 C 1300 320 1510 205 1745 70"
                  />
                </g>
              </svg>
            </div>

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
