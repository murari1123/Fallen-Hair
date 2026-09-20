/* ============================================
   FALLEN HAIR — Photography Page
   Curated visual gallery showcasing photography works
   prominently with authentic aspect ratios,
   editorial composition, and minimal metadata.
   ============================================ */

import { useGsap } from '@/hooks/useGsap';
import { gsap } from '@/lib/gsapConfig';
import { photographyWorks } from '@/data/photography';
import styles from './Photography.module.css';

export function Photography() {
  const containerRef = useGsap((container) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Header reveal
    const header = container.querySelector(`.${styles.header}`);
    if (header) {
      const meta = header.querySelector(`.${styles.headerMeta}`);
      const title = header.querySelector(`.${styles.title}`);
      const sub = header.querySelector(`.${styles.subtitle}`);

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      if (meta) tl.fromTo(meta, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6 });
      if (title) tl.fromTo(title, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.75 }, '-=0.35');
      if (sub) tl.fromTo(sub, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.65 }, '-=0.35');
    }

    // Gallery item reveals (scale 1.04 -> 1, opacity 0.85 -> 1)
    const items = container.querySelectorAll(`.${styles.item}`);
    items.forEach((item) => {
      const img = item.querySelector(`.${styles.image}`);
      const meta = item.querySelector(`.${styles.meta}`);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });

      if (img) {
        tl.fromTo(
          img,
          { opacity: 0.85, scale: 1.02 },
          { opacity: 1, scale: 1, duration: 0.85, ease: 'power2.out' }
        );
      }

      if (meta) {
        tl.fromTo(
          meta,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
          '-=0.4'
        );
      }
    });
  }, []);

  return (
    <div ref={containerRef} className={styles.page}>
      <div className={styles.container}>

        {/* Editorial Page Header */}
        <header className={styles.header}>
          <div className={styles.headerMeta}>
            <span className={styles.label}>Photography</span>
            <span className={styles.count}>03 Frames</span>
          </div>
          <h1 className={styles.title}>
            Moments, Light &amp; Documented Realities
          </h1>
          <p className={styles.subtitle}>
            A curated visual archive capturing landscapes, live stages, and
            documentary gatherings.
          </p>
        </header>

        {/* Curated Editorial Gallery */}
        <div className={styles.gallery}>
          {photographyWorks.map((work) => (
            <article
              key={work.id}
              className={`${styles.item} ${styles[work.orientation]}`}
            >
              {/* Image Presentation */}
              <div
                className={styles.imageFrame}
                style={{ aspectRatio: work.aspectRatio }}
              >
                <img
                  src={work.src}
                  alt={work.alt}
                  className={styles.image}
                  loading="lazy"
                />
              </div>

              {/* Minimal Editorial Metadata */}
              <div className={styles.meta}>
                <span className={styles.number}>{work.number}</span>
                <span className={styles.category}>{work.category}</span>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Editorial Closing */}
        <div className={styles.closing}>
          <span className={styles.closingNote}>
            All photographs captured and processed by Murari · Fallen Hair
          </span>
        </div>

      </div>
    </div>
  );
}
