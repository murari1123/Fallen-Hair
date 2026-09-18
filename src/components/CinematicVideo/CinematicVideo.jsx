/* ============================================
   FALLEN HAIR — Cinematic Video Player
   Custom editorial video player with cleanly separated
   controls, volume slider, fullscreen, and options menu.
   ============================================ */

import { useEffect, useRef, useState } from 'react';
import styles from './CinematicVideo.module.css';

export function CinematicVideo({
  src,
  poster,
  title = 'Featured Video',
  context = 'Part of SPIRIT 2026',
  role = 'MEDIA HEAD',
  discipline = 'VIDEO EDITING · CREATIVE DIRECTION',
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const optionsRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // 1. Viewport-aware autoplay / pause
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.muted = isMuted;
            video
              .play()
              .then(() => setIsPlaying(true))
              .catch(() => {
                video.muted = true;
                setIsMuted(true);
                video.play().catch(() => {});
              });
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [isMuted]);

  // 2. Video event listeners for progress & duration
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => setDuration(video.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      if (!isLooping) setIsPlaying(false);
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
    };
  }, [isLooping]);

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setShowOptionsMenu(false);
      }
    };

    if (showOptionsMenu) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showOptionsMenu]);

  // Fullscreen change detection
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Format MM:SS
  const formatTime = (secs) => {
    if (isNaN(secs) || secs === 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Play / Pause Toggle
  const togglePlay = (e) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    setHasInteracted(true);

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Mute / Unmute Toggle
  const toggleMute = (e) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    setHasInteracted(true);

    if (isMuted) {
      video.muted = false;
      setIsMuted(false);
      if (volume === 0) {
        setVolume(1);
        video.volume = 1;
      }
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  // Volume Slider Change
  const handleVolumeChange = (e) => {
    e.stopPropagation();
    const newVol = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;

    setVolume(newVol);
    video.volume = newVol;
    if (newVol === 0) {
      video.muted = true;
      setIsMuted(true);
    } else {
      video.muted = false;
      setIsMuted(false);
    }
  };

  // Timeline Scrubber
  const handleSeek = (e) => {
    e.stopPropagation();
    const seekTime = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  // Fullscreen Toggle
  const toggleFullscreen = (e) => {
    e?.stopPropagation();
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // Options Menu Toggle
  const toggleOptionsMenu = (e) => {
    e.stopPropagation();
    setShowOptionsMenu((prev) => !prev);
  };

  // Change Playback Speed
  const handleSpeedChange = (speed) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    setPlaybackRate(speed);
    setShowOptionsMenu(false);
  };

  // Picture in Picture
  const handlePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    setShowOptionsMenu(false);

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('Picture in Picture failed', err);
    }
  };

  // Toggle Loop
  const toggleLoop = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextLoop = !isLooping;
    video.loop = nextLoop;
    setIsLooping(nextLoop);
    setShowOptionsMenu(false);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={styles.videoWrapper}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowOptionsMenu(false);
      }}
      onClick={togglePlay}
      role="region"
      aria-label={`${title} Video Showcase`}
    >
      <div className={styles.frame}>
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className={styles.video}
          playsInline
          muted={isMuted}
          loop={isLooping}
          preload="metadata"
        />

        {/* Ambient Top HUD */}
        <div className={styles.topHud}>
          <div className={styles.statusBadge}>
            <span className={`${styles.statusDot} ${isPlaying ? styles.statusDotActive : ''}`} />
            {isPlaying ? (isMuted ? 'AMBIENT PREVIEW' : 'PLAYING') : 'PAUSED'}
          </div>

          <span className={styles.roleTag}>
            {role} // {discipline}
          </span>
        </div>

        {/* Big Center Play Indicator on Hover when Paused */}
        {!isPlaying && hasInteracted && (
          <div className={styles.centerPlayButton} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
              <polygon points="6,3 20,12 6,21" />
            </svg>
          </div>
        )}

        {/* Custom Video Control Bar */}
        <div
          className={`${styles.controlsBar} ${isHovered || !isPlaying || !isMuted ? styles.controlsVisible : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress Timeline Scrubber */}
          <div className={styles.progressContainer}>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className={styles.progressBar}
              aria-label="Video timeline scrubber"
              style={{
                background: `linear-gradient(to right, var(--rosewood) 0%, var(--rosewood) ${progressPercent}%, rgba(241, 236, 230, 0.2) ${progressPercent}%, rgba(241, 236, 230, 0.2) 100%)`,
              }}
            />
          </div>

          <div className={styles.controlsRow}>
            {/* Left Controls: Play/Pause & Time */}
            <div className={styles.controlsLeft}>
              <button
                type="button"
                className={styles.controlButton}
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <rect x="5" y="4" width="4" height="16" />
                    <rect x="15" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <polygon points="6,4 19,12 6,20" />
                  </svg>
                )}
              </button>

              <div className={styles.timeDisplay}>
                <span className={styles.timeCurrent}>{formatTime(currentTime)}</span>
                <span className={styles.timeDivider}>/</span>
                <span className={styles.timeDuration}>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Controls: Volume + Fullscreen + Three-Dot Menu (Cleanly Separated) */}
            <div className={styles.controlsRight}>

              {/* Control 1: Volume / Mute with Slider */}
              <div className={styles.volumeControlGroup}>
                <button
                  type="button"
                  className={`${styles.controlButton} ${!isMuted ? styles.controlButtonActive : ''}`}
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    /* Muted Icon */
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                  ) : (
                    /* Sound Icon */
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                  )}
                </button>

                <div className={styles.volumeSliderWrapper}>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className={styles.volumeSlider}
                    aria-label="Volume level"
                    style={{
                      background: `linear-gradient(to right, var(--alabaster) 0%, var(--alabaster) ${(isMuted ? 0 : volume) * 100}%, rgba(241, 236, 230, 0.2) ${(isMuted ? 0 : volume) * 100}%, rgba(241, 236, 230, 0.2) 100%)`,
                    }}
                  />
                </div>
              </div>

              {/* Control 2: Fullscreen Button */}
              <button
                type="button"
                className={styles.controlButton}
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 14 10 14 10 20" />
                    <polyline points="20 10 14 10 14 4" />
                    <line x1="14" y1="10" x2="21" y2="3" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                )}
              </button>

              {/* Control 3: Three-Dot Options Menu Button (Separate & Isolated) */}
              <div ref={optionsRef} className={styles.optionsWrapper}>
                <button
                  type="button"
                  className={`${styles.controlButton} ${showOptionsMenu ? styles.controlButtonActive : ''}`}
                  onClick={toggleOptionsMenu}
                  aria-label="Video options menu"
                  aria-expanded={showOptionsMenu}
                  title="More options"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                  </svg>
                </button>

                {/* Options Popup Dropdown */}
                {showOptionsMenu && (
                  <div className={styles.optionsDropdown} role="menu">
                    <div className={styles.menuHeader}>
                      <span className={styles.menuTitle}>PLAYBACK OPTIONS</span>
                    </div>

                    <div className={styles.menuSection}>
                      <span className={styles.menuSectionLabel}>Speed:</span>
                      <div className={styles.speedButtonsRow}>
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                          <button
                            key={s}
                            type="button"
                            className={`${styles.speedBtn} ${playbackRate === s ? styles.speedBtnActive : ''}`}
                            onClick={() => handleSpeedChange(s)}
                          >
                            {s}x
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className={styles.menuDivider} />

                    <button
                      type="button"
                      className={styles.menuItem}
                      onClick={toggleLoop}
                      role="menuitem"
                    >
                      <span>Loop Video</span>
                      <span className={styles.menuItemStatus}>
                        {isLooping ? 'ON' : 'OFF'}
                      </span>
                    </button>

                    {document.pictureInPictureEnabled && (
                      <button
                        type="button"
                        className={styles.menuItem}
                        onClick={handlePiP}
                        role="menuitem"
                      >
                        <span>Picture in Picture</span>
                        <span className={styles.menuItemIcon}>⧉</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
