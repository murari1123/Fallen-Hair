/* ============================================
   FALLEN HAIR — Spatial Atmosphere
   Full-viewport Three.js atmospheric background
   Refined to Master Color Palette:
   Deep Espresso · Warm Greige · Rosewood
   ============================================ */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function SpatialAtmosphere({ scrollProgress = 0 }) {
  const mountRef = useRef(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let w = window.innerWidth;
    let h = window.innerHeight;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    camera.position.set(0, 0, 5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // Ambient atmospheric dust particles (Warm Greige / Alabaster nuance)
    const particleCount = 110;
    const positions = new Float32Array(particleCount * 3);
    const opacities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      opacities[i] = Math.random() * 0.25 + 0.05;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xDDD5CD, // Warm Greige
      size: 0.022,
      transparent: true,
      opacity: 0.1,
      sizeAttenuation: true,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Subtle Rosewood accent light that shifts with scroll
    const rosewoodLight = new THREE.PointLight(0x7D4047, 0.7, 25);
    rosewoodLight.position.set(3, -2, 2);
    scene.add(rosewoodLight);

    // Soft warm ambient
    const ambientLight = new THREE.AmbientLight(0x2E2A27, 0.35);
    scene.add(ambientLight);

    // Pointer parallax
    const mouseTarget = { x: 0, y: 0 };
    const mouseCurrent = { x: 0, y: 0 };

    const onPointerMove = (e) => {
      mouseTarget.x = (e.clientX / w - 0.5) * 2;
      mouseTarget.y = (e.clientY / h - 0.5) * 2;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // Resize
    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Reduced motion check
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Render loop
    let animId;
    const clock = new THREE.Clock();

    const render = () => {
      const elapsed = clock.getElapsedTime();
      const p = progressRef.current;

      // Mouse parallax LERP
      mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * 0.03;
      mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * 0.03;

      // Camera subtle drift based on scroll + mouse
      if (!prefersReduced) {
        camera.position.x = mouseCurrent.x * 0.3;
        camera.position.y = -mouseCurrent.y * 0.2 - p * 2;
        camera.rotation.y = mouseCurrent.x * -0.015;
        camera.rotation.x = mouseCurrent.y * 0.01;
      }

      // Drift particles slowly
      particles.rotation.y = elapsed * 0.008 + mouseCurrent.x * 0.02;
      particles.rotation.x = elapsed * 0.005;
      particles.position.y = -p * 15;

      // Rosewood accent light moves with scroll, creating depth ambience
      rosewoodLight.position.y = -p * 20 + Math.sin(elapsed * 0.5) * 1.5;
      rosewoodLight.position.x = Math.sin(elapsed * 0.3) * 3 + mouseCurrent.x * 2;
      rosewoodLight.intensity = 0.45 + Math.sin(elapsed * 0.7) * 0.25;

      // Particle opacity based on scroll
      particleMaterial.opacity = 0.07 + Math.sin(elapsed * 0.4) * 0.03;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update progress ref when prop changes
  useEffect(() => {
    progressRef.current = scrollProgress;
  }, [scrollProgress]);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
