/* ============================================
   FALLEN HAIR — Photography Page
   Curated visual gallery showcasing photography works
   prominently with authentic aspect ratios,
   editorial composition, and minimal metadata.
   ============================================ */

import { photographyWorks } from '@/data/photography';
import styles from './Photography.module.css';

export function Photography() {
  return (
    <div className={styles.page}>
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
