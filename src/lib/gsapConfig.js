/* ============================================
   FALLEN HAIR — GSAP Configuration
   Singleton registration of GSAP plugins.
   Import from this file instead of 'gsap' directly.
   ============================================ */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugins once at module level
gsap.registerPlugin(ScrollTrigger);

// Default configuration
gsap.defaults({
  ease: 'power3.out',
  duration: 0.8,
});

export { gsap, ScrollTrigger };
