/* ============================================
   FALLEN HAIR — Selected Work Section
   Editorial project listing featuring the cinematic
   video showcase for TIRANGA YATRA 2026.
   ============================================ */

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
  return (
    <section className={styles.selectedWork} aria-label="Selected Work">
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
