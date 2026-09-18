/* ============================================
   FALLEN HAIR — 3D Spatial Portfolio Experience
   Scroll-driven camera traveling through 4 continuous
   spatial depth layers: Hero -> Identity -> Work -> Contact.
   ============================================ */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createTextTexture } from './textTextureHelper';

// Project image assets
import photoCamera from '@/assets/about/murari-camera.jpg';
import photoTiranga from '@/assets/photography/tiranga-yatra.jpg';
import photoOutdoor from '@/assets/about/murari-outdoor.jpg';
import photoMirror from '@/assets/about/murari-mirror.jpg';

export function SpatialPortfolio({
  currentLayerIndex,
  onLayerChange,
  onSelectProject,
}) {
  const mountRef = useRef(null);
  const scrollProgressRef = useRef(0);
  const targetProgressRef = useRef(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 500;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#070707', 0.038);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 45);
    camera.position.set(0, 0, 5.2);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 3. Cinematic Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfaf8f5, 1.4);
    keyLight.position.set(6, 10, 8);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x444444, 0.6);
    fillLight.position.set(-6, -6, -4);
    scene.add(fillLight);

    const redAccentLight = new THREE.PointLight(0xff2a2a, 2.5, 16);
    redAccentLight.position.set(0, -2, -10);
    scene.add(redAccentLight);

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();
    const spatialElements = [];
    const interactiveMeshes = [];

    // Helper: Create Text Plane
    const addTextPlane = ({
      lines,
      fontSize = 56,
      fontWeight = '300',
      color = '#faf8f5',
      align = 'center',
      position = [0, 0, 0],
      scale = [4, 2],
      canvasWidth = 1024,
      canvasHeight = 512,
      opacity = 1,
    }) => {
      const { texture } = createTextTexture({
        lines,
        fontSize,
        fontWeight,
        color,
        align,
        width: canvasWidth,
        height: canvasHeight,
      });

      const geometry = new THREE.PlaneGeometry(scale[0], scale[1]);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: opacity,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      scene.add(mesh);

      const elem = {
        mesh,
        material,
        baseZ: position[2],
        baseOpacity: opacity,
        type: 'text',
      };
      spatialElements.push(elem);
      return elem;
    };

    // Helper: Create Image Project Plane
    const addImagePlane = ({
      url,
      position = [0, 0, 0],
      rotation = [0, 0, 0],
      scale = [2.2, 1.6],
      title = 'Project',
      role = 'Media Head',
      category = 'Brand Identity',
      code = '01 // WORK',
    }) => {
      const group = new THREE.Group();
      group.position.set(...position);
      group.rotation.set(...rotation);

      const texture = textureLoader.load(url);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;

      const geometry = new THREE.PlaneGeometry(scale[0], scale[1]);
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.35,
        metalness: 0.1,
        transparent: true,
        opacity: 0.94,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData = { title, role, category, code, url };
      group.add(mesh);
      interactiveMeshes.push(mesh);

      // Wireframe border outline
      const edges = new THREE.EdgesGeometry(geometry);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.18,
      });
      const borderLine = new THREE.LineSegments(edges, lineMat);
      group.add(borderLine);

      // Caption label underneath
      const { texture: capTexture } = createTextTexture({
        lines: [`${code} — ${title.toUpperCase()}`, `${role} · ${category}`],
        fontSize: 32,
        fontWeight: '400',
        color: '#ffffff',
        align: 'left',
        width: 1024,
        height: 256,
      });
      const capMat = new THREE.MeshBasicMaterial({
        map: capTexture,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      });
      const capMesh = new THREE.Mesh(new THREE.PlaneGeometry(scale[0], scale[0] * 0.25), capMat);
      capMesh.position.set(0, -scale[1] / 2 - 0.22, 0.02);
      group.add(capMesh);

      scene.add(group);

      const elem = {
        group,
        mesh,
        material,
        lineMat,
        borderLine,
        baseZ: position[2],
        baseOpacity: 0.94,
        type: 'image',
        isHovered: false,
      };
      spatialElements.push(elem);
      return elem;
    };

    // ==========================================
    // LAYER 1: HERO (Z: 0 to -3.5)
    // ==========================================
    addTextPlane({
      lines: ['STUDIO / CREATIVE IDENTITY', '24°53\'N 84°58\'E // RAW ARCHIVE'],
      fontSize: 28,
      fontWeight: '400',
      color: '#888888',
      position: [0, 1.8, 0.4],
      scale: [5, 1.2],
    });

    addTextPlane({
      lines: ['FALLEN HAIR.'],
      fontSize: 108,
      fontWeight: '300',
      color: '#ffffff',
      position: [0, 0.2, 0.0],
      scale: [6.5, 2.2],
    });

    addTextPlane({
      lines: ['MURARI — PANDU', 'DESIGN · EDITING · PHOTOGRAPHY'],
      fontSize: 36,
      fontWeight: '300',
      color: '#aaaaaa',
      position: [0, -1.5, -1.8],
      scale: [5.2, 1.4],
    });

    // ==========================================
    // LAYER 2: THE IDENTITY (Z: -7 to -13)
    // ==========================================
    // Oversized Ghost Background Watermark
    addTextPlane({
      lines: ['STORYTELLING'],
      fontSize: 140,
      fontWeight: '300',
      color: '#ffffff',
      position: [0, 0.5, -14.0],
      scale: [12, 4],
      opacity: 0.028,
    });

    addTextPlane({
      lines: ['THE IDENTITY // 01'],
      fontSize: 26,
      fontWeight: '500',
      color: '#ff2a2a',
      position: [-2.2, 1.8, -8.2],
      scale: [3.5, 0.9],
      align: 'left',
    });

    addTextPlane({
      lines: [
        'A CREATIVE mind working',
        'at the intersection of',
        'DESIGN, EDITING and VISUAL',
        'STORYTELLING.',
      ],
      fontSize: 48,
      fontWeight: '300',
      color: '#faf8f5',
      position: [-0.6, 0.3, -9.2],
      scale: [6.5, 3.2],
      align: 'left',
    });

    addTextPlane({
      lines: [
        '+ PERSPECTIVE // 2026',
        'Not defined by a single discipline. Not confined to a single medium.',
        'The work moves between design, photography, editing and editorial thinking.',
        'MURARI  |  PANDU  |  FALLEN HAIR',
      ],
      fontSize: 26,
      fontWeight: '300',
      color: '#888888',
      position: [1.8, -1.4, -11.2],
      scale: [5.5, 2.0],
      align: 'left',
    });

    // ==========================================
    // LAYER 3: WORK / PROJECTS (Z: -16 to -23)
    // ==========================================
    addTextPlane({
      lines: ['SELECTED DESTINATIONS // 02'],
      fontSize: 28,
      fontWeight: '500',
      color: '#ff2a2a',
      position: [0, 2.2, -16.2],
      scale: [4.5, 1.0],
    });

    // Project 01: SPIRIT 2026 (Left Offset Destination)
    addImagePlane({
      url: photoCamera,
      position: [-2.6, 0.4, -17.2],
      rotation: [0.03, 0.08, -0.02],
      scale: [2.2, 2.8],
      title: 'SPIRIT 2026',
      role: 'MEDIA HEAD',
      category: 'Visual Identity · Direction',
      code: '01 // WORK',
    });

    // Project 02: TIRANGA YATRA 2026 (Right Offset Destination)
    addImagePlane({
      url: photoTiranga,
      position: [2.4, -0.1, -19.8],
      rotation: [-0.02, -0.07, 0.02],
      scale: [3.2, 2.0],
      title: 'TIRANGA YATRA 2026',
      role: 'MEDIA HEAD',
      category: 'Cinematic Film · Campaign',
      code: '02 // WORK',
    });

    // Project 03: RAW FRAMES & PHOTOGRAPHY (Center-Left Destination)
    addImagePlane({
      url: photoOutdoor,
      position: [-1.2, -1.2, -22.5],
      rotation: [0.04, 0.05, -0.03],
      scale: [2.4, 2.0],
      title: 'NATURAL LIGHT',
      role: 'CREATIVE DIRECTOR',
      category: 'Tonal Photography Study',
      code: '03 // WORK',
    });

    // ==========================================
    // LAYER 4: END / CONTACT (Z: -26 to -30)
    // ==========================================
    addTextPlane({
      lines: ['CLOSING // 03'],
      fontSize: 26,
      fontWeight: '500',
      color: '#ff2a2a',
      position: [0, 1.9, -26.2],
      scale: [3.5, 0.8],
    });

    addTextPlane({
      lines: ['GOT SOMETHING', 'INTERESTING?'],
      fontSize: 72,
      fontWeight: '300',
      color: '#ffffff',
      position: [0, 0.6, -27.2],
      scale: [6.5, 2.5],
    });

    addTextPlane({
      lines: [
        'Always open to meaningful projects, collaborations and conversations worth having.',
        'muraridamalapati@gmail.com   ·   +91 85550 41660   ·   @fallen.hair',
      ],
      fontSize: 26,
      fontWeight: '300',
      color: '#aaaaaa',
      position: [0, -1.2, -28.8],
      scale: [7.2, 1.6],
    });

    addTextPlane({
      lines: ['FALLEN HAIR  //  2026 RAW ARCHIVE  //  END OF SPATIAL SCENE'],
      fontSize: 20,
      fontWeight: '400',
      color: '#555555',
      position: [0, -2.4, -30.0],
      scale: [5.0, 0.8],
    });

    // 6. Camera Spline Coordinates for Scroll Navigation
    // Camera travels from Z = 4.8 down to Z = -25.5
    const getCameraTargetForProgress = (p) => {
      // Clamped 0 to 1
      const t = Math.max(0, Math.min(1, p));

      // Non-linear framing trajectory
      const z = 4.8 - t * 30.2; // 4.8 -> -25.4
      let x = 0;
      let y = 0;

      if (t < 0.25) {
        // Hero
        x = 0;
        y = 0;
      } else if (t < 0.55) {
        // Identity (subtle pan left/right)
        const localT = (t - 0.25) / 0.3;
        x = (localT - 0.5) * 0.6;
        y = -localT * 0.2;
      } else if (t < 0.85) {
        // Work (gentle drift through project destinations)
        const localT = (t - 0.55) / 0.3;
        x = Math.sin(localT * Math.PI * 1.5) * 0.8;
        y = Math.cos(localT * Math.PI) * 0.3 - 0.2;
      } else {
        // Contact
        const localT = (t - 0.85) / 0.15;
        x = (1 - localT) * 0.3;
        y = 0;
      }

      return { x, y, z };
    };

    // 7. Interactive Pointer & Raycasting
    const pointer = new THREE.Vector2(-9999, -9999);
    const mouseParallax = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    let hoveredMesh = null;

    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      pointer.x = (x / rect.width) * 2 - 1;
      pointer.y = -(y / rect.height) * 2 + 1;

      mouseParallax.x = pointer.x * 0.35;
      mouseParallax.y = pointer.y * 0.22;
    };

    const onPointerLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
      mouseParallax.x = 0;
      mouseParallax.y = 0;
      container.style.cursor = 'default';
    };

    // Wheel Scroll Navigation inside 3D Canvas
    const onWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY * 0.00085;
      targetProgressRef.current = Math.max(0, Math.min(1, targetProgressRef.current + delta));
    };

    // Touch Drag Navigation
    let touchStartY = 0;
    const onTouchStart = (e) => {
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        const touchY = e.touches[0].clientY;
        const diff = (touchStartY - touchY) * 0.002;
        touchStartY = touchY;
        targetProgressRef.current = Math.max(0, Math.min(1, targetProgressRef.current + diff));
      }
    };

    // Click on 3D Project Planes
    const onClick = () => {
      if (hoveredMesh?.userData) {
        onSelectProject?.(hoveredMesh.userData);
      }
    };

    container.addEventListener('pointermove', onPointerMove, { passive: true });
    container.addEventListener('pointerleave', onPointerLeave);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('click', onClick);

    // 8. Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      if (width === 0 || height === 0) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(container);

    // 9. 60FPS Render & Smooth Interpolation Loop
    let animId = null;
    let lastReportedLayer = 0;

    const render = () => {
      // Smooth LERP camera scroll travel
      scrollProgressRef.current = THREE.MathUtils.lerp(
        scrollProgressRef.current,
        targetProgressRef.current,
        0.065
      );

      const targetPos = getCameraTargetForProgress(scrollProgressRef.current);

      // Camera position with mouse parallax
      camera.position.x = THREE.MathUtils.lerp(
        camera.position.x,
        targetPos.x + mouseParallax.x,
        0.08
      );
      camera.position.y = THREE.MathUtils.lerp(
        camera.position.y,
        targetPos.y + mouseParallax.y,
        0.08
      );
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetPos.z, 0.08);

      // Subtle camera tilt toward motion
      camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, -mouseParallax.x * 0.04, 0.08);
      camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, mouseParallax.y * 0.03, 0.08);

      // Report active layer to parent
      const p = scrollProgressRef.current;
      let currentLayer = 0;
      if (p < 0.25) currentLayer = 0; // Hero
      else if (p < 0.55) currentLayer = 1; // Identity
      else if (p < 0.85) currentLayer = 2; // Work
      else currentLayer = 3; // Contact

      if (currentLayer !== lastReportedLayer) {
        lastReportedLayer = currentLayer;
        onLayerChange?.(currentLayer, p);
      }

      // Raycasting for interactive hover
      if (pointer.x !== -9999) {
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(interactiveMeshes, false);

        if (intersects.length > 0) {
          hoveredMesh = intersects[0].object;
          container.style.cursor = 'pointer';
        } else {
          hoveredMesh = null;
          container.style.cursor = 'default';
        }
      } else {
        hoveredMesh = null;
      }

      // Update spatial elements (distance opacity & hover effect)
      spatialElements.forEach((el) => {
        const distToCam = el.baseZ - camera.position.z;

        // Elements behind camera fade out cleanly
        if (distToCam > 0.4) {
          // Passed behind camera
          el.material.opacity = THREE.MathUtils.lerp(el.material.opacity, 0, 0.15);
        } else if (distToCam > -1.0) {
          // Approaching camera: soft fade out
          const fadeRatio = Math.max(0, (distToCam + 1.0) / 1.4);
          el.material.opacity = THREE.MathUtils.lerp(
            el.material.opacity,
            el.baseOpacity * (1 - fadeRatio),
            0.12
          );
        } else {
          // Visible in front
          el.material.opacity = THREE.MathUtils.lerp(el.material.opacity, el.baseOpacity, 0.08);
        }

        // Image hover animation
        if (el.type === 'image') {
          const isHover = hoveredMesh === el.mesh;
          const targetScale = isHover ? 1.08 : 1.0;
          el.group.scale.x = THREE.MathUtils.lerp(el.group.scale.x, targetScale, 0.08);
          el.group.scale.y = THREE.MathUtils.lerp(el.group.scale.y, targetScale, 0.08);

          if (isHover) {
            el.lineMat.color.setHex(0xff2a2a);
            el.lineMat.opacity = 0.9;
          } else {
            el.lineMat.color.setHex(0xffffff);
            el.lineMat.opacity = 0.18;
          }
        }
      });

      renderer.render(scene, camera);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // Global listener for jumping to layer via props
    window.__setSpatialProgress = (p) => {
      targetProgressRef.current = Math.max(0, Math.min(1, p));
    };

    // 10. Cleanup
    return () => {
      if (animId) cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('click', onClick);

      spatialElements.forEach((el) => {
        el.mesh?.geometry?.dispose();
        el.material?.map?.dispose();
        el.material?.dispose();
        el.borderLine?.geometry?.dispose();
        el.lineMat?.dispose();
      });

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      delete window.__setSpatialProgress;
    };
  }, [onLayerChange, onSelectProject]);

  // Handle external layer jump
  useEffect(() => {
    if (typeof currentLayerIndex === 'number' && window.__setSpatialProgress) {
      const layerTargets = [0.0, 0.38, 0.72, 1.0];
      window.__setSpatialProgress(layerTargets[currentLayerIndex] ?? 0);
    }
  }, [currentLayerIndex]);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        touchAction: 'none',
      }}
    />
  );
}
