/* ============================================
   FALLEN HAIR — useAnimeWordReveal Hook
   Custom hook that attaches an Anime.js word reveal animation
   to any element ref, triggered strictly on scroll via GSAP ScrollTrigger.
   ============================================ */

import { useEffect, useRef } from 'react';
import { animate, splitText, stagger, set } from 'animejs';
import { ScrollTrigger } from '@/lib/gsapConfig';

export function useAnimeWordReveal({
  triggerStart = 'top 80%',
  duration = 750,
  staggerDelay = 50,
  delay = 0,
} = {}) {
  const elementRef = useRef(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // 1. Split words with clip wrap
    const splitter = splitText(el, {
      words: {
        wrap: 'clip',
      },
    });

    const words = splitter.words;
    if (!words || !words.length) return;

    // Ensure display inline-block on wrappers and words
    words.forEach((w) => {
      w.style.display = 'inline-block';
      w.style.willChange = 'transform';
      if (w.parentElement) {
        w.parentElement.style.display = 'inline-block';
        w.parentElement.style.verticalAlign = 'top';
        w.parentElement.style.marginRight = '0.28em';
        w.parentElement.style.paddingBottom = '0.08em';
        w.parentElement.style.overflow = 'clip';
      }
    });

    // Set initial position: 100% (hidden)
    set(words, {
      y: '100%',
    });

    let animationInstance = null;

    // 2. ScrollTrigger activation
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

    return () => {
      if (st) st.kill();
      if (animationInstance && animationInstance.pause) {
        animationInstance.pause();
      }
      splitter.revert();
    };
  }, [triggerStart, duration, staggerDelay, delay]);

  return elementRef;
}
