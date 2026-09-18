/* ============================================
   FALLEN HAIR — useGsap Hook
   Custom hook for GSAP animations with automatic cleanup.
   ============================================ */

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsapConfig';

/**
 * Custom hook for GSAP animations with automatic cleanup.
 * Wraps animations in a GSAP context tied to a container ref,
 * ensuring all animations are killed when the component unmounts.
 *
 * @param {Function} callback - Animation setup function. Receives the container element.
 * @param {Array} deps - Dependency array (same as useEffect).
 * @returns {React.RefObject} - Ref to attach to the container element.
 *
 * @example
 * function MyComponent() {
 *   const containerRef = useGsap((container) => {
 *     gsap.from(container.querySelectorAll('.item'), {
 *       y: 40,
 *       opacity: 0,
 *       stagger: 0.1,
 *     });
 *   }, []);
 *
 *   return <div ref={containerRef}>...</div>;
 * }
 */
export function useGsap(callback, deps = []) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      callback(containerRef.current);
    }, containerRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return containerRef;
}
