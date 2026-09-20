/* ============================================
   FALLEN HAIR — Home Page
   Landing experience with continuous full-page
   textured background and cinematic atmosphere.
   ============================================ */

import { Hero } from '@/sections/Hero/Hero';
import { Identity } from '@/sections/Identity/Identity';
import styles from './Home.module.css';

export function Home() {
  return (
    <div className={styles.home}>
      {/* Continuous Full-Page Atmosphere */}
      <div className={styles.pageAtmosphere} aria-hidden="true">
        <div className={styles.ambientLighting} />
      </div>

      <div className={styles.homeContent}>
        <Hero />
        <Identity />
      </div>
    </div>
  );
}
