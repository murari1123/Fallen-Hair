/* ============================================
   FALLEN HAIR — Hero Section
   Art-directed editorial hero with line-by-line mask entrance,
   damped ghost watermark parallax, and quiet scroll indicator.
   ============================================ */

import { useEffect, useRef, useState } from 'react';
import { useGsap } from '@/hooks/useGsap';
import { gsap } from '@/lib/gsapConfig';
import { useJigsModal } from '@/components/Jigs/context/JigsModalContext';
import styles from './Hero.module.css';

export function Hero() {
  const { markIntroComplete } = useJigsModal();
  const titleLine1Ref = useRef(null);
  const titleLine2Ref = useRef(null);
  const dotRef = useRef(null);
  const watermarkRef = useRef(null);
  const watermarkInnerRef = useRef(null);
  const [scrolledPast, setScrolledPast] = useState(false);

  // Ensure JIGS is marked ready if hero unmounts
  useEffect(() => {
    return () => {
      markIntroComplete();
    };
  }, [markIntroComplete]);

  // 1. Refined Phase-Based Entrance Sequence
  const containerRef = useGsap((container) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      markIntroComplete();
      return;
    }

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        markIntroComplete();
      },
    });

    const metadataMarks = container.querySelectorAll(`.${styles.editorialMark}`);
    const overline = container.querySelector(`.${styles.overline}`);
    const titleLine1 = titleLine1Ref.current;
    const titleLine2 = titleLine2Ref.current;
    const dot = dotRef.current;
    const subtitle = container.querySelector(`.${styles.subtitle}`);
    const divider = container.querySelector(`.${styles.divider}`);
    const tagline = container.querySelector(`.${styles.tagline}`);
    const scrollIndicator = container.querySelector(`.${styles.scrollIndicator}`);

    // Phase 1: Small metadata & overline fade/reveal in
    tl.fromTo(
      metadataMarks,
      { opacity: 0, y: 10 },
      { opacity: 0.55, y: 0, duration: 0.7, stagger: 0.08, ease: 'power2.out' },
      0.15
    )
    .fromTo(
      overline,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' },
      0.25
    )
    // Phase 2: FALLEN line reveals upward through clip mask
    .fromTo(
      titleLine1,
      { y: '105%' },
      { y: '0%', duration: 0.85, ease: 'power3.out' },
      0.4
    )
    // Phase 3: HAIR line reveals upward through clip mask
    .fromTo(
      titleLine2,
      { y: '105%' },
      { y: '0%', duration: 0.85, ease: 'power3.out' },
      0.55
    )
    // Phase 4: The rosewood "." appears subtly after the title
    .fromTo(
      dot,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.8)' },
      1.15
    )
    // Phase 5: MURARI — PANDU and discipline line fade/reveal in
    .fromTo(
      subtitle,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out' },
      1.2
    )
    .fromTo(
      divider,
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 0.6, ease: 'power2.inOut' },
      1.28
    )
    .fromTo(
      tagline,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out' },
      1.35
    )
    .fromTo(
      scrollIndicator,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      1.5
    );

    // Scroll-Linked Depth
    gsap.to(container.querySelector(`.${styles.content}`), {
      y: -50,
      scale: 0.98,
      opacity: 0.4,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    gsap.to(watermarkRef.current, {
      y: 90,
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

  // 2. Damped Ghost Watermark Mouse Parallax (Slow & Damped, No Title Movement)
  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const isMobile = window.innerWidth <= 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouch || isMobile || prefersReducedMotion) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = null;

    let isRunning = false;

    const startLoop = () => {
      if (!isRunning) {
        isRunning = true;
        rafId = requestAnimationFrame(updateLoop);
      }
    };

    const onPointerMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const xNorm = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const yNorm = (e.clientY / innerHeight - 0.5) * 2;

      // Restrained shift: 8-12px max
      targetX = xNorm * 11;
      targetY = yNorm * 9;
      startLoop();
    };

    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
      startLoop();
    };

    const updateLoop = () => {
      const dx = targetX - currentX;
      const dy = targetY - currentY;

      if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
        currentX += dx * 0.07;
        currentY += dy * 0.07;

        if (watermarkInnerRef.current) {
          watermarkInnerRef.current.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
        }
        rafId = requestAnimationFrame(updateLoop);
      } else {
        currentX = targetX;
        currentY = targetY;
        if (watermarkInnerRef.current) {
          watermarkInnerRef.current.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
        }
        isRunning = false;
      }
    };

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

  // 3. Scroll Indicator Fade Out on Scroll
  useEffect(() => {
    let triggered = false;
    const handleScroll = () => {
      if (!triggered && window.scrollY > 20) {
        triggered = true;
        setScrolledPast(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={containerRef} className={styles.hero} aria-label="Introduction">
      {/* Visual Atmosphere Background Layers */}
      <div className={styles.ambientGlow} aria-hidden="true">
        <div className={styles.glowCore} />
        <div className={styles.glowRedAccent} />
      </div>

      {/* Massive Background Ghost Watermark */}
      <div ref={watermarkRef} className={styles.ghostWatermark} aria-hidden="true">
        <span ref={watermarkInnerRef}>FALLEN</span>
      </div>

      {/* Subtle Editorial Grid & Coordinate Marks */}
      <div className={styles.editorialGrid} aria-hidden="true">
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

        <div className={styles.guideLineHoriz} />
        <div className={styles.guideLineVert} />
      </div>

      {/* Main Content Block */}
      <div className={styles.content}>
        <div className={styles.overlineContainer}>
          <p className={styles.overline}>Creative Studio / Visual Direction</p>
        </div>

        <h1 className={styles.title}>
          <span className={styles.titleLineMask}>
            <span ref={titleLine1Ref} className={styles.titleLineText}>
              FALLEN
            </span>
          </span>
          <span className={styles.titleLineMask}>
            <span ref={titleLine2Ref} className={styles.titleLineText}>
              HAIR
              <span ref={dotRef} className={styles.accentDot} aria-hidden="true">
                .
              </span>
            </span>
          </span>
        </h1>

        <p className={styles.subtitle}>MURARI — PANDU</p>

        <div className={styles.divider} aria-hidden="true" />

        <p className={styles.tagline}>
          <span>Editing</span>
          <span className={styles.dot}>·</span>
          <span>Motion</span>
          <span className={styles.dot}>·</span>
          <span>Visual Storytelling</span>
        </p>
      </div>

      {/* Editorial Scroll Indicator */}
      <div
        className={`${styles.scrollIndicator} ${scrolledPast ? styles.scrollHidden : ''}`}
        aria-hidden="true"
      >
        <span className={styles.scrollText}>SCROLL</span>
        <span className={styles.scrollArrow}>↓</span>
      </div>
    </section>
  );
}
