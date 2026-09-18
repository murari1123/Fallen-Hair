/* ============================================
   FALLEN HAIR — WordReveal Component
   Scroll-triggered Anime.js word reveal animation.
   
   Architecture:
   - Anime.js handles text splitting (clip wrap) and word translation.
   - GSAP ScrollTrigger decides WHEN the animation starts (at start: 'top 80%').
   - Runs strictly ONCE when the element enters the viewport.
   - No looping, no premature animation on page load.
   ============================================ */

import { useEffect, useRef } from 'react';
import { animate, splitText, stagger, set } from 'animejs';
import { ScrollTrigger } from '@/lib/gsapConfig';
import styles from './WordReveal.module.css';

export function WordReveal({
  children,
  as: Component = 'h2',
  className = '',
  triggerStart = 'top 80%',
  duration = 750,
  staggerDelay = 50,
  delay = 0,
}) {
  const elementRef = useRef(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // 1. Split text into clipped word wrappers using Anime.js
    const splitter = splitText(el, {
      words: {
        wrap: 'clip',
        class: styles.wordInner,
      },
    });

    const words = splitter.words;
    if (!words || !words.length) return;

    // Set initial position: 100% (hidden below clip line)
    set(words, {
      y: '100%',
    });

    // 2. Create GSAP ScrollTrigger to trigger Anime.js only when element enters viewport
    let animationInstance = null;

    const st = ScrollTrigger.create({
      trigger: el,
      start: triggerStart,
      once: true,
      onEnter: () => {
        animationInstance = animate(words, {
          y: [{ to: '0%' }],
          duration: duration,
          ease: 'out(3)',
          delay: stagger(staggerDelay, { start: delay }),
        });
      },
    });

    // 3. Clean up on component unmount
    return () => {
      if (st) st.kill();
      if (animationInstance && animationInstance.pause) {
        animationInstance.pause();
      }
      splitter.revert();
    };
  }, [triggerStart, duration, staggerDelay, delay]);

  return (
    <Component ref={elementRef} className={`${styles.root} ${className}`}>
      {children}
    </Component>
  );
}
