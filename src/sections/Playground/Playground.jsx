/* ============================================
   FALLEN HAIR — Playground Section
   Experimental work, posters, photography,
   unused concepts. Intentionally different
   layout from Selected Work.
   ============================================ */

import styles from './Playground.module.css';

const playgroundItems = [
  { id: 'pg-01', label: 'Poster Series', type: 'Visual', ratio: 'portrait' },
  { id: 'pg-02', label: 'Untitled Frames', type: 'Photography', ratio: 'landscape' },
  { id: 'pg-03', label: 'Type Experiment', type: 'Typography', ratio: 'square' },
  { id: 'pg-04', label: 'Unused Concept', type: 'Concept', ratio: 'landscape' },
  { id: 'pg-05', label: 'Colour Study', type: 'Exploration', ratio: 'portrait' },
  { id: 'pg-06', label: 'Motion Test', type: 'Motion', ratio: 'square' },
];

function PlaygroundItem({ item }) {
  return (
    <div className={`${styles.item} ${styles[item.ratio]}`}>
      <div className={styles.itemInner}>
        <span className={styles.itemLabel}>{item.label}</span>
        <span className={styles.itemType}>{item.type}</span>
      </div>
    </div>
  );
}

export function Playground() {
  return (
    <section className={styles.playground} aria-label="Playground">
      <div className={styles.container}>

        <div className={styles.sectionHeader}>
          <span className={styles.label}>Playground</span>
          <p className={styles.note}>
            Experiments, fragments, things that didn't fit anywhere else.
          </p>
        </div>

        <div className={styles.grid}>
          {playgroundItems.map((item) => (
            <PlaygroundItem key={item.id} item={item} />
          ))}
        </div>

      </div>
    </section>
  );
}
