/* ============================================
   FALLEN HAIR — Selected Work Section
   Editorial project listing featuring the cinematic
   video showcase for TIRANGA YATRA 2026.
   ============================================ */

import { useGsap } from '@/hooks/useGsap';
import { gsap } from '@/lib/gsapConfig';
import { projects } from '@/data/projects';
import { CinematicVideo } from '@/components/CinematicVideo/CinematicVideo';
import styles from './SelectedWork.module.css';

function ProjectEntry({ project, isLast }) {
  const isVideoProject = Boolean(project.videoSrc);

  return (
    <article
      className={`${styles.project} ${isLast ? '' : styles.projectBorder}`}
      aria-label={project.title}
    >
      <div className={styles.projectHeader}>
        <div className={styles.projectHeaderLeft}>
          <span className={styles.projectNumber}>{project.number}</span>
          <span className={styles.projectContext}>{project.context || 'SELECTED WORK'}</span>
        </div>

        <div className={styles.projectInfo}>
          <span className={styles.projectRole}>{project.role}</span>
          <span className={styles.divider}>/</span>
          <span className={styles.projectCategory}>{project.category}</span>
          <span className={styles.divider}>/</span>
          <span className={styles.projectYear}>{project.year}</span>
        </div>
      </div>

      {/* Large Featured Media */}
      <div className={styles.projectMedia}>
        {isVideoProject ? (
          <CinematicVideo
            src={project.videoSrc}
            title={project.title}
            context={project.context}
            role={project.role}
            discipline={project.discipline}
          />
        ) : (
          <div className={styles.mediaPlaceholder}>
            <span className={styles.mediaLabel}>
              {project.title} — {project.discipline || 'Media'}
            </span>
          </div>
        )}
      </div>

      <div className={styles.projectFooter}>
        <div className={styles.footerLeft}>
          <h3 className={styles.projectTitle}>{project.title}</h3>
          <span className={styles.disciplineBadge}>{project.discipline}</span>
        </div>

        <p className={styles.projectDescription}>{project.description}</p>
      </div>
    </article>
  );
}

export function SelectedWork() {
  const containerRef = useGsap((container) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Header reveal
    const header = container.querySelector(`.${styles.sectionHeader}`);
    if (header) {
      gsap.fromTo(
        header,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: header,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    }

    // Projects grouped reveal
    const projectElements = container.querySelectorAll(`.${styles.project}`);
    projectElements.forEach((projectEl) => {
      const headerEl = projectEl.querySelector(`.${styles.projectHeader}`);
      const mediaEl = projectEl.querySelector(`.${styles.projectMedia}`);
      const footerEl = projectEl.querySelector(`.${styles.projectFooter}`);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: projectEl,
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      });

      if (headerEl) {
        tl.fromTo(
          headerEl,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
        );
      }

      if (mediaEl) {
        tl.fromTo(
          mediaEl,
          { opacity: 0.85, scale: 1.02 },
          { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' },
          '-=0.3'
        );
      }

      if (footerEl) {
        const titleEl = footerEl.querySelector(`.${styles.footerLeft}`);
        const descEl = footerEl.querySelector(`.${styles.projectDescription}`);

        if (titleEl) {
          tl.fromTo(
            titleEl,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
            '-=0.4'
          );
        }

        if (descEl) {
          tl.fromTo(
            descEl,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out' },
            '-=0.35'
          );
        }
      }
    });
  }, []);

  return (
    <section ref={containerRef} className={styles.selectedWork} aria-label="Selected Work">
      <div className={styles.container}>

        <div className={styles.sectionHeader}>
          <span className={styles.label}>Selected Work</span>
          <p className={styles.count}>{String(projects.length).padStart(2, '0')} Projects</p>
        </div>

        <div className={styles.projectList}>
          {projects.map((project, i) => (
            <ProjectEntry
              key={project.id}
              project={project}
              isLast={i === projects.length - 1}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
