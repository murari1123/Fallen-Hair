/* ============================================
   FALLEN HAIR — Hero Section
   Cinematic typography hero with working interactive
   letter-by-letter cursor proximity and interactive dot.
   ============================================ */

import { useEffect, useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import { gsap } from '@/lib/gsapConfig';
import styles from './Hero.module.css';

export function Hero() {
  const containerRef = useRef(null);
  const titleLine1Ref = useRef(null);
  const titleLine2Ref = useRef(null);
  const bgGlowRef = useRef(null);
  const gridLayerRef = useRef(null);
  const watermarkRef = useRef(null);
  const dotRef = useRef(null);

  // 1. Initial Load GSAP Entrance & Scroll Depth
  useGsap((container) => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    const charsLine1 = container.querySelectorAll(`.${styles.char1}`);
    const charsLine2 = container.querySelectorAll(`.${styles.char2}`);
    const accentDot = container.querySelector(`.${styles.accentDot}`);

    tl.fromTo(
      container.querySelector(`.${styles.ambientGlow}`),
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 2, ease: 'power2.out' },
      0
    )
    .fromTo(
      container.querySelectorAll(`.${styles.editorialMark}`),
      { opacity: 0 },
      { opacity: 0.45, duration: 1.2, stagger: 0.1 },
      0.2
    )
    .fromTo(
      container.querySelector(`.${styles.overline}`),
      { y: 25, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9 },
      0.3
    )
    .fromTo(
      charsLine1,
      { y: '120%', opacity: 0, rotateX: 20 },
      { y: '0%', opacity: 1, rotateX: 0, duration: 1.2, stagger: 0.035 },
      0.4
    )
    .fromTo(
      charsLine2,
      { y: '120%', opacity: 0, rotateX: 20 },
      { y: '0%', opacity: 1, rotateX: 0, duration: 1.2, stagger: 0.035 },
      0.55
    )
    .fromTo(
      accentDot,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(2)' },
      1.1
    )
    .fromTo(
      container.querySelector(`.${styles.subtitle}`),
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8 },
      0.9
    )
    .fromTo(
      container.querySelector(`.${styles.divider}`),
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 0.9, ease: 'power2.inOut' },
      1.0
    )
    .fromTo(
      container.querySelector(`.${styles.tagline}`),
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8 },
      1.1
    )
    .fromTo(
      container.querySelector(`.${styles.scrollIndicator}`),
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.8 },
      1.3
    );

    // Scroll-Linked Depth
    gsap.to(container.querySelector(`.${styles.content}`), {
      y: -60,
      scale: 0.97,
      opacity: 0.35,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    gsap.to(watermarkRef.current, {
      y: 120,
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }, []);

  // 2. Continuous Real-Time Cursor Proximity Engine
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const charNodes = container.querySelectorAll('[data-char]');
    const dotNode = dotRef.current;

    const charData = Array.from(charNodes).map((node) => ({
      node,
      target: 0,
      current: 0,
    }));

    const dotData = {
      node: dotNode,
      target: 0, // 0 = Red, 1 = White
      current: 0,
    };

    let mouseX = -99999;
    let mouseY = -99999;
    let isTracking = false;
    let rafId = null;

    const PROXIMITY_RADIUS = 160; // Influence distance in pixels
    const DOT_RADIUS = 50; // Direct radius for dot interaction

    const onPointerMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isTracking = true;

      // Ambient Parallax
      const { innerWidth, innerHeight } = window;
      const xPercent = (mouseX / innerWidth - 0.5) * 2;
      const yPercent = (mouseY / innerHeight - 0.5) * 2;

      if (titleLine1Ref.current) {
        gsap.to(titleLine1Ref.current, {
          x: xPercent * 10,
          y: yPercent * 5,
          duration: 1.2,
          ease: 'power2.out',
        });
      }

      if (titleLine2Ref.current) {
        gsap.to(titleLine2Ref.current, {
          x: xPercent * 14,
          y: yPercent * 8,
          duration: 1.4,
          ease: 'power2.out',
        });
      }

      if (bgGlowRef.current) {
        gsap.to(bgGlowRef.current, {
          x: xPercent * 40,
          y: yPercent * 25,
          duration: 2.2,
          ease: 'power1.out',
        });
      }

      // Calculate proximity per letter
      charData.forEach((item) => {
        const rect = item.node.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = Math.hypot(mouseX - cx, mouseY - cy);

        if (dist < PROXIMITY_RADIUS) {
          const ratio = 1 - dist / PROXIMITY_RADIUS;
          item.target = Math.pow(ratio, 1.2); // Smooth non-linear activation
        } else {
          item.target = 0;
        }
      });

      // Calculate dot interaction (Inverts from Red to White)
      if (dotData.node) {
        const dRect = dotData.node.getBoundingClientRect();
        const dcx = dRect.left + dRect.width / 2;
        const dcy = dRect.top + dRect.height / 2;
        const dDist = Math.hypot(mouseX - dcx, mouseY - dcy);

        if (dDist < DOT_RADIUS) {
          const dRatio = 1 - dDist / DOT_RADIUS;
          dotData.target = Math.pow(dRatio, 1.2);
        } else {
          dotData.target = 0;
        }
      }
    };

    const onPointerLeave = () => {
      isTracking = false;
      mouseX = -99999;
      mouseY = -99999;
      charData.forEach((item) => {
        item.target = 0;
      });
      dotData.target = 0;
    };

    // 60FPS Render Loop
    const loop = () => {
      // Letters: Charcoal rgb(46, 46, 46) -> Rosewood rgb(125, 64, 71)
      charData.forEach((item) => {
        const diff = item.target - item.current;
        if (Math.abs(diff) > 0.002) {
          item.current += diff * 0.18; // Smooth LERP

          const val = Math.max(0, Math.min(1, item.current));
          const r = Math.round(46 + (125 - 46) * val);
          const g = Math.round(46 + (64 - 46) * val);
          const b = Math.round(46 + (71 - 46) * val);

          item.node.style.color = `rgb(${r}, ${g}, ${b})`;
          if (val > 0.03) {
            item.node.style.textShadow = `0 0 ${(val * 16).toFixed(1)}px rgba(125, 64, 71, ${(val * 0.5).toFixed(2)})`;
          } else {
            item.node.style.textShadow = 'none';
          }
        } else if (item.current !== item.target && item.target === 0) {
          item.current = 0;
          item.node.style.color = 'rgb(46, 46, 46)';
          item.node.style.textShadow = 'none';
        }
      });

      // Dot: Rosewood rgb(125, 64, 71) -> Charcoal rgb(46, 46, 46)
      if (dotData.node) {
        const dDiff = dotData.target - dotData.current;
        if (Math.abs(dDiff) > 0.002) {
          dotData.current += dDiff * 0.2;

          const dVal = Math.max(0, Math.min(1, dotData.current));
          const dr = Math.round(125 + (46 - 125) * dVal);
          const dg = Math.round(64 + (46 - 64) * dVal);
          const db = Math.round(71 + (46 - 71) * dVal);

          dotData.node.style.color = `rgb(${dr}, ${dg}, ${db})`;
          if (dVal > 0.4) {
            dotData.node.style.textShadow = `0 0 16px rgba(46, 46, 46, ${(dVal * 0.4).toFixed(2)})`;
          } else {
            dotData.node.style.textShadow = `0 0 16px rgba(125, 64, 71, ${((1 - dVal) * 0.45).toFixed(2)})`;
          }
        } else if (dotData.current !== dotData.target && dotData.target === 0) {
          dotData.current = 0;
          dotData.node.style.color = 'rgb(125, 64, 71)';
          dotData.node.style.textShadow = '0 0 16px rgba(125, 64, 71, 0.45)';
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('mouseleave', onPointerLeave);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('mouseleave', onPointerLeave);
    };
  }, []);

  const renderSplitLetters = (word, className) => {
    return word.split('').map((char, index) => (
      <span key={index} className={styles.charWrapper}>
        <span
          data-char
          className={`${styles.char} ${className}`}
        >
          {char}
        </span>
      </span>
    ));
  };

  return (
    <section ref={containerRef} className={styles.hero} aria-label="Introduction">
      {/* Visual Atmosphere Background Layers */}
      <div className={styles.filmGrain} aria-hidden="true" />

      <div ref={bgGlowRef} className={styles.ambientGlow} aria-hidden="true">
        <div className={styles.glowCore} />
        <div className={styles.glowRedAccent} />
      </div>

      {/* Massive Background Ghost Watermark */}
      <div ref={watermarkRef} className={styles.ghostWatermark} aria-hidden="true">
        <span>FALLEN</span>
      </div>

      {/* Subtle Editorial Grid & Coordinate Marks */}
      <div ref={gridLayerRef} className={styles.editorialGrid} aria-hidden="true">
        <div className={`${styles.editorialMark} ${styles.markTopLeft}`}>
          <span className={styles.markCode}>00 // 2026</span>
          <span className={styles.markLabel}>RAW ARCHIVE</span>
        </div>

        <div className={`${styles.editorialMark} ${styles.markTopRight}`}>
          <span className={styles.markCode}>24°53'N 84°58'E</span>
          <span className={styles.markLabel}>DISCIPLINE // VISUAL</span>
        </div>

        <div className={`${styles.editorialMark} ${styles.markBottomLeft}`}>
          <span className={styles.crosshair}>+</span>
          <span className={styles.markLabel}>STUDIO · IDENTITY</span>
        </div>

        <div className={`${styles.editorialMark} ${styles.markBottomRight}`}>
          <span className={styles.crosshair}>+</span>
          <span className={styles.markLabel}>CINEMATIC FRAME</span>
        </div>

        {/* Faint Horizontal & Vertical Rule Guides */}
        <div className={styles.guideLineHoriz} />
        <div className={styles.guideLineVert} />
      </div>

      {/* Main Content Block */}
      <div className={styles.content}>
        <div className={styles.overlineContainer}>
          <p className={styles.overline}>Creative Studio / Visual Direction</p>
        </div>

        <h1 className={styles.title}>
          <span ref={titleLine1Ref} className={styles.titleLine}>
            {renderSplitLetters('FALLEN', styles.char1)}
          </span>
          <span ref={titleLine2Ref} className={styles.titleLine}>
            {renderSplitLetters('HAIR', styles.char2)}
            <span
              ref={dotRef}
              className={styles.accentDot}
              aria-hidden="true"
            >
              .
            </span>
          </span>
        </h1>

        <p className={styles.subtitle}>MURARI — PANDU</p>

        <div className={styles.divider} aria-hidden="true" />

        <p className={styles.tagline}>
          Design · Editing · Photography
        </p>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator} aria-hidden="true">
        <span className={styles.scrollText}>Scroll</span>
        <span className={styles.scrollLine} />
      </div>
    </section>
  );
}
