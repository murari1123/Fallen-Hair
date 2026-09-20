/* ============================================
   FALLEN HAIR — 3D Spatial Workspace
   Full-page spatial portfolio prototype.
   The ENTIRE page is the 3D environment.
   Scroll drives camera progression through
   depth-layered HTML/CSS content sections.
   ============================================ */

import { useEffect, useRef, useState } from 'react';
import { SpatialAtmosphere } from './components/SpatialAtmosphere';
import styles from './Workspace.module.css';

import photoCamera from '@/assets/about/murari-camera.jpg';
import photoOutdoor from '@/assets/about/murari-outdoor.jpg';
import photoMirror from '@/assets/about/murari-mirror.jpg';
import photoTiranga from '@/assets/photography/tiranga-yatra.jpg';
import photoSunset from '@/assets/photography/sunset-river.jpg';
import photoPerformance from '@/assets/photography/live-performance.jpg';

export function Workspace() {
  const pageRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollRef = useRef(0);
  const smoothRef = useRef(0);
  const rafRef = useRef(null);

  // Smooth scroll tracking loop — only runs during active scroll interpolation
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let isRunning = false;

    const startScrollLoop = () => {
      if (!isRunning) {
        isRunning = true;
        rafRef.current = requestAnimationFrame(updateScroll);
      }
    };

    const onScroll = () => {
      const el = pageRef.current;
      if (!el) return;

      const scrollTop = window.scrollY;
      const docHeight = el.scrollHeight - window.innerHeight;
      const raw = docHeight > 0 ? scrollTop / docHeight : 0;
      scrollRef.current = Math.max(0, Math.min(1, raw));
      startScrollLoop();
    };

    const updateScroll = () => {
      const delta = scrollRef.current - smoothRef.current;
      const lerpFactor = prefersReduced ? 1 : 0.08;

      if (Math.abs(delta) > 0.0002) {
        smoothRef.current += delta * lerpFactor;
        setScrollProgress(smoothRef.current);
        rafRef.current = requestAnimationFrame(updateScroll);
      } else {
        smoothRef.current = scrollRef.current;
        setScrollProgress(smoothRef.current);
        isRunning = false;
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div ref={pageRef} className={styles.spatialPage}>
      {/* Fixed Three.js Atmospheric Background */}
      <SpatialAtmosphere scrollProgress={scrollProgress} />

      {/* Film Grain Overlay */}
      <div className={styles.grain} aria-hidden="true" />

      {/* Fixed Navigation Bar */}
      <nav className={styles.spatialNav}>
        <a href="/" className={styles.navWordmark}>FALLEN HAIR</a>
        <div className={styles.navLinks}>
          <a href="/work">Work</a>
          <a href="/photography">Photography</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </div>
        <div className={styles.navBadge}>
          <span className={styles.navDot} />
          <span>SPATIAL PROTOTYPE</span>
        </div>
      </nav>

      {/* The spatial perspective wrapper */}
      <div className={styles.perspectiveRoot}>

        {/* ================================================
            LAYER 1: HERO
            The entrance to the spatial portfolio
            ================================================ */}
        <section className={styles.heroLayer}>

          {/* Deep background — oversized ghost "FALLEN" */}
          <div className={styles.heroGhost} aria-hidden="true">
            FALLEN
          </div>

          {/* Middle depth — main title */}
          <div className={styles.heroCenter}>
            <div className={styles.heroOverline}>
              <span>STUDIO / CREATIVE IDENTITY</span>
              <span>24°53'N 84°58'E</span>
            </div>

            <h1 className={styles.heroTitle}>
              <span className={styles.heroLine1}>FALLEN</span>
              <span className={styles.heroLine2}>
                HAIR<span className={styles.heroDot}>.</span>
              </span>
            </h1>
          </div>

          {/* Foreground — subtitle info */}
          <div className={styles.heroForeground}>
            <div className={styles.heroSub}>
              <span className={styles.heroName}>MURARI — PANDU</span>
              <span className={styles.heroDivider}>/</span>
              <span className={styles.heroRole}>EDITING · MOTION · VISUAL STORYTELLING</span>
            </div>
            <div className={styles.scrollCue}>
              <span className={styles.scrollLine} />
              <span className={styles.scrollLabel}>SCROLL TO EXPLORE</span>
            </div>
          </div>
        </section>


        {/* ================================================
            LAYER 2: THE IDENTITY
            Storytelling and creative perspective
            ================================================ */}
        <section className={styles.identityLayer}>

          {/* Deep background — giant watermark */}
          <div className={styles.identityWatermark} aria-hidden="true">
            STORYTELLING
          </div>

          {/* Mid depth — section label */}
          <div className={styles.identityHeader}>
            <span className={styles.sectionLabel}>THE IDENTITY</span>
            <span className={styles.sectionCode}>01 // CREATIVE FRAMEWORK</span>
          </div>

          {/* Main identity statement */}
          <div className={styles.identityStatement}>
            <h2 className={styles.identityHeadline}>
              <span className={styles.idLine}>A <em>CREATIVE</em> mind working</span>
              <span className={styles.idLine2}>at the intersection of</span>
              <span className={styles.idLine3}>
                <span className={styles.wordOutline}>EDITING</span>,{' '}
                <em>MOTION</em> and{' '}
                <span className={styles.wordOutline}>VISUAL</span>
              </span>
              <span className={styles.idLine4}>
                STORYTELLING<span className={styles.heroDot}>.</span>
              </span>
            </h2>
          </div>

          {/* Foreground — perspective paragraph */}
          <div className={styles.identityBody}>
            <div className={styles.bodyAnchor}>
              <span className={styles.anchorMark}>+</span>
              <span className={styles.anchorLabel}>PERSPECTIVE // 2026</span>
            </div>
            <p className={styles.bodyParagraph}>
              Not defined by a single discipline. Not confined to a single medium.
              The work moves between design, photography, editing and editorial
              thinking — whatever the story demands. Every project is an
              opportunity to see something that wasn't visible before.
            </p>
          </div>

          {/* Identity metadata */}
          <div className={styles.identityMeta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Name</span>
              <span className={styles.metaValue}>Murari</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Alias</span>
              <span className={styles.metaValue}>Pandu</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Studio</span>
              <span className={styles.metaValue}>Fallen Hair</span>
            </div>
          </div>
        </section>


        {/* ================================================
            LAYER 3: WORK / PROJECTS
            Spatial project destinations
            ================================================ */}
        <section className={styles.workLayer}>

          <div className={styles.workHeader}>
            <span className={styles.sectionLabel}>SELECTED WORK</span>
            <span className={styles.sectionCode}>02 // DESTINATIONS</span>
          </div>

          <div className={styles.projectField}>

            {/* Project 01 — Left, deeper */}
            <div className={`${styles.projectCard} ${styles.projectLeft}`}>
              <div className={styles.projectImageWrap}>
                <img src={photoTiranga} alt="Tiranga Yatra 2026" className={styles.projectImage} />
              </div>
              <div className={styles.projectInfo}>
                <span className={styles.projectCode}>01</span>
                <h3 className={styles.projectTitle}>TIRANGA YATRA 2026</h3>
                <span className={styles.projectMeta}>MEDIA HEAD · VIDEO EDITING · CREATIVE DIRECTION</span>
              </div>
            </div>

            {/* Project 02 — Right, closer */}
            <div className={`${styles.projectCard} ${styles.projectRight}`}>
              <div className={styles.projectImageWrap}>
                <img src={photoCamera} alt="SPIRIT 2026" className={styles.projectImage} />
              </div>
              <div className={styles.projectInfo}>
                <span className={styles.projectCode}>02</span>
                <h3 className={styles.projectTitle}>SPIRIT 2026</h3>
                <span className={styles.projectMeta}>MEDIA HEAD · VISUAL IDENTITY · DIRECTION</span>
              </div>
            </div>

            {/* Project 03 — Center, deepest */}
            <div className={`${styles.projectCard} ${styles.projectCenter}`}>
              <div className={styles.projectImageWrap}>
                <img src={photoPerformance} alt="Live Performance" className={styles.projectImage} />
              </div>
              <div className={styles.projectInfo}>
                <span className={styles.projectCode}>03</span>
                <h3 className={styles.projectTitle}>CULTURAL DOCUMENTATION</h3>
                <span className={styles.projectMeta}>PHOTOGRAPHY · EDITORIAL · EVENTS</span>
              </div>
            </div>
          </div>
        </section>


        {/* ================================================
            LAYER 4: PHOTOGRAPHY
            Spatial depth gallery
            ================================================ */}
        <section className={styles.photoLayer}>

          <div className={styles.photoHeader}>
            <span className={styles.sectionLabel}>PHOTOGRAPHY</span>
            <span className={styles.sectionCode}>03 // VISUAL ARCHIVE</span>
          </div>

          <div className={styles.photoField}>
            <div className={`${styles.photoPlane} ${styles.photoPlane1}`}>
              <img src={photoOutdoor} alt="Murari in natural light" className={styles.photoImg} />
              <span className={styles.photoCaption}>NATURAL LIGHT — PERSPECTIVE</span>
            </div>
            <div className={`${styles.photoPlane} ${styles.photoPlane2}`}>
              <img src={photoSunset} alt="Sunset river tonal study" className={styles.photoImg} />
              <span className={styles.photoCaption}>SUNSET HORIZON — TONAL STUDY</span>
            </div>
            <div className={`${styles.photoPlane} ${styles.photoPlane3}`}>
              <img src={photoMirror} alt="Murari mirror portrait" className={styles.photoImg} />
              <span className={styles.photoCaption}>RAW FRAMES — UNFILTERED</span>
            </div>
          </div>
        </section>


        {/* ================================================
            LAYER 5: ABOUT
            Personal information
            ================================================ */}
        <section className={styles.aboutLayer}>
          <div className={styles.aboutGhost} aria-hidden="true">MURARI</div>

          <div className={styles.aboutContent}>
            <span className={styles.sectionLabel}>ABOUT // THE HUMAN</span>
            <h2 className={styles.aboutHeadline}>
              BEHIND THE LENS,<br />BEYOND THE FRAME<span className={styles.heroDot}>.</span>
            </h2>
            <p className={styles.aboutBody}>
              I'm Murari, a photographer and editor drawn to moments, people,
              light and everything that exists between them. I like creating
              visuals that feel honest, cinematic and worth looking at twice.
            </p>
            <div className={styles.aboutTags}>
              <span>MURARI</span>
              <span className={styles.tagDivider}>/</span>
              <span>PHOTOGRAPHER &amp; EDITOR</span>
              <span className={styles.tagDivider}>/</span>
              <span>MEDIA HEAD — SPIRIT 2026</span>
              <span className={styles.tagDivider}>/</span>
              <span>FALLEN HAIR</span>
            </div>
          </div>
        </section>


        {/* ================================================
            LAYER 6: CONTACT / END
            The spatial journey settles
            ================================================ */}
        <section className={styles.contactLayer}>

          <div className={styles.contactContent}>
            <span className={styles.sectionLabel}>CLOSING</span>

            <h2 className={styles.contactHeadline}>
              <span>Got Something</span>
              <span>Interesting<span className={styles.heroDot}>?</span></span>
            </h2>

            <p className={styles.contactSub}>
              Always open to meaningful projects, collaborations
              and conversations worth having.
            </p>

            <div className={styles.contactGrid}>
              <a href="mailto:muraridamalapati@gmail.com" className={styles.contactLink}>
                <span className={styles.contactLinkLabel}>Email</span>
                <span className={styles.contactLinkValue}>muraridamalapati@gmail.com</span>
              </a>
              <a href="https://wa.me/918555041660" className={styles.contactLink} target="_blank" rel="noopener noreferrer">
                <span className={styles.contactLinkLabel}>WhatsApp</span>
                <span className={styles.contactLinkValue}>@murari_1123</span>
              </a>
              <a href="https://www.instagram.com/fallen.hair/" className={styles.contactLink} target="_blank" rel="noopener noreferrer">
                <span className={styles.contactLinkLabel}>Instagram</span>
                <span className={styles.contactLinkValue}>@fallen.hair</span>
              </a>
              <a href="tel:+918555041660" className={styles.contactLink}>
                <span className={styles.contactLinkLabel}>Phone</span>
                <span className={styles.contactLinkValue}>+91 85550 41660</span>
              </a>
            </div>

            <div className={styles.endStamp}>
              <span className={styles.endDot} />
              <span>Available for work — 2026</span>
            </div>
          </div>

          <div className={styles.endMark}>
            FALLEN HAIR // 2026 // SPATIAL PROTOTYPE // END
          </div>
        </section>

      </div>
    </div>
  );
}
