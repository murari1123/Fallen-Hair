/* ============================================
   FALLEN HAIR — Photography Data
   Curated photography portfolio works.
   ============================================ */

import sunsetRiver from '@/assets/photography/sunset-river.jpg';
import livePerformance from '@/assets/photography/live-performance.jpg';
import tirangaYatra from '@/assets/photography/tiranga-yatra.jpg';

export const photographyWorks = [
  {
    id: 'sunset-river',
    number: '01',
    category: 'LANDSCAPE / MOMENTS',
    title: 'River at Sunset',
    src: sunsetRiver,
    alt: 'River at sunset — Landscape and moments photography by Fallen Hair / Murari',
    orientation: 'landscape',
    aspectRatio: '4 / 3',
  },
  {
    id: 'live-performance',
    number: '02',
    category: 'EVENTS / LIVE',
    title: 'Stage in Blue',
    src: livePerformance,
    alt: 'Blue-lit live performance — Events and live photography by Fallen Hair / Murari',
    orientation: 'portrait',
    aspectRatio: '3 / 4',
  },
  {
    id: 'tiranga-yatra',
    number: '03',
    category: 'DOCUMENTARY / EVENTS',
    title: 'Tiranga Yatra Procession',
    src: tirangaYatra,
    alt: 'Tiranga Yatra flag procession — Documentary photography by Fallen Hair / Murari',
    orientation: 'panoramic',
    aspectRatio: '1024 / 536',
  },
];
