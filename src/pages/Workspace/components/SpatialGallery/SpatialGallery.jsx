/* ============================================
   FALLEN HAIR — 3D Spatial Gallery Canvas Engine
   High-performance Three.js WebGL spatial gallery
   with floating planes, camera parallax, Raycaster
   hover interaction, and dark cinematic lighting.
   ============================================ */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Project image assets
import photoCamera from '@/assets/about/murari-camera.jpg';
import photoOutdoor from '@/assets/about/murari-outdoor.jpg';
import photoMirror from '@/assets/about/murari-mirror.jpg';
import photoTiranga from '@/assets/photography/tiranga-yatra.jpg';
import photoSunset from '@/assets/photography/sunset-river.jpg';
import photoPerformance from '@/assets/photography/live-performance.jpg';
import photoFallen from '@/assets/murari-fallen-hair.jpg';

// Spatial gallery arrangement (Art-directed 3D layout)
const GALLERY_ITEMS = [
  {
    id: 'frame-01',
    url: photoCamera,
    title: 'THE CRAFT // IN FOCUS',
    code: '01 // CANON EOS',
    position: [-2.4, 0.5, 0.4],
    rotation: [0.03, 0.08, -0.02],
    scale: [1.7, 2.4],
    floatSpeed: 0.9,
    floatOffset: 0.2,
  },
  {
    id: 'frame-02',
    url: photoTiranga,
    title: 'TIRANGA YATRA 2026',
    code: '02 // PROCESSION',
    position: [0, 0.7, -0.2],
    rotation: [-0.02, 0, 0.01],
    scale: [2.5, 1.7],
    floatSpeed: 1.1,
    floatOffset: 1.4,
  },
  {
    id: 'frame-03',
    url: photoOutdoor,
    title: 'PERSPECTIVE',
    code: '03 // NATURAL LIGHT',
    position: [2.5, 0.4, 0.3],
    rotation: [-0.03, -0.07, 0.02],
    scale: [1.7, 2.3],
    floatSpeed: 0.95,
    floatOffset: 2.8,
  },
  {
    id: 'frame-04',
    url: photoMirror,
    title: 'RAW FRAMES',
    code: '04 // UNFILTERED',
    position: [-1.4, -1.3, 0.6],
    rotation: [0.04, 0.06, -0.03],
    scale: [2.2, 1.6],
    floatSpeed: 1.05,
    floatOffset: 3.5,
  },
  {
    id: 'frame-05',
    url: photoSunset,
    title: 'SUNSET HORIZON',
    code: '05 // TONAL STUDY',
    position: [1.3, -1.2, -0.1],
    rotation: [0.02, -0.05, 0.01],
    scale: [2.3, 1.6],
    floatSpeed: 0.85,
    floatOffset: 4.2,
  },
  {
    id: 'frame-06',
    url: photoPerformance,
    title: 'LIVE STAGE',
    code: '06 // CULTURE',
    position: [3.4, -0.9, -0.8],
    rotation: [-0.04, -0.11, 0.03],
    scale: [2.2, 1.6],
    floatSpeed: 1.15,
    floatOffset: 5.1,
  },
  {
    id: 'frame-07',
    url: photoFallen,
    title: 'FALLEN IDENTITY',
    code: '07 // STUDIO',
    position: [-3.3, -0.8, -0.7],
    rotation: [0.04, 0.09, -0.02],
    scale: [1.7, 2.3],
    floatSpeed: 1.0,
    floatOffset: 0.8,
  },
];

export function SpatialGallery({ onSelectImage }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 500;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#080808', 0.06);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 30);
    camera.position.set(0, 0, 6.8);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 3. Cinematic Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfaf8f5, 1.2);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x555555, 0.5);
    fillLight.position.set(-6, -4, -3);
    scene.add(fillLight);

    const redAccentLight = new THREE.PointLight(0xff2a2a, 2.0, 10);
    redAccentLight.position.set(0, -2, 2.5);
    scene.add(redAccentLight);

    // 4. Texture Loader & Spatial Mesh Construction
    const textureLoader = new THREE.TextureLoader();
    const planeMeshes = [];
    const interactiveMeshes = [];

    GALLERY_ITEMS.forEach((item) => {
      const group = new THREE.Group();
      const [ix, iy, iz] = item.position;
      const [irx, iry, irz] = item.rotation;
      const [sw, sh] = item.scale;

      group.position.set(ix, iy, iz);
      group.rotation.set(irx, iry, irz);

      // Texture
      const texture = textureLoader.load(item.url);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;

      // Plane Mesh
      const geometry = new THREE.PlaneGeometry(sw, sh);
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.35,
        metalness: 0.1,
        transparent: true,
        opacity: 0.92,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData = { item, group };
      group.add(mesh);
      interactiveMeshes.push(mesh);

      // Border Wireframe Outline
      const edges = new THREE.EdgesGeometry(geometry);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.15,
      });
      const borderLine = new THREE.LineSegments(edges, lineMaterial);
      group.add(borderLine);

      scene.add(group);

      planeMeshes.push({
        group,
        mesh,
        material,
        borderLine,
        lineMaterial,
        item,
        initPos: { x: ix, y: iy, z: iz },
        initRot: { x: irx, y: iry, z: irz },
        isHovered: false,
      });
    });

    // 5. Pointer Tracking & Raycasting
    const pointer = new THREE.Vector2(-9999, -9999);
    const targetCam = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    let hoveredMesh = null;

    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      pointer.x = (x / rect.width) * 2 - 1;
      pointer.y = -(y / rect.height) * 2 + 1;

      targetCam.x = pointer.x * 0.7;
      targetCam.y = pointer.y * 0.45;
    };

    const onPointerLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
      targetCam.x = 0;
      targetCam.y = 0;
      container.style.cursor = 'default';
      planeMeshes.forEach((p) => {
        p.isHovered = false;
      });
    };

    const onClick = (e) => {
      if (hoveredMesh?.userData?.item) {
        onSelectImage?.(hoveredMesh.userData.item);
      }
    };

    container.addEventListener('pointermove', onPointerMove, { passive: true });
    container.addEventListener('pointerleave', onPointerLeave);
    container.addEventListener('click', onClick);

    // 6. Resize Observer
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

    // 7. 60FPS Animation Loop
    let animId = null;
    const clock = new THREE.Clock();

    const render = () => {
      const elapsedTime = clock.getElapsedTime();

      // Camera Parallax LERP
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCam.x, 0.05);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCam.y, 0.05);
      camera.lookAt(0, 0, 0);

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

      // Update each spatial plane
      planeMeshes.forEach((p) => {
        const isHover = hoveredMesh === p.mesh;
        p.isHovered = isHover;

        const time = elapsedTime * p.item.floatSpeed + p.item.floatOffset;

        // Subtle floating oscillation
        const floatY = Math.sin(time * 0.7) * 0.08;
        const floatRotZ = Math.sin(time * 0.5) * 0.015;
        const floatRotX = Math.cos(time * 0.6) * 0.015;

        // Target transforms
        const targetZ = isHover ? p.initPos.z + 0.55 : p.initPos.z;
        const targetScale = isHover ? 1.08 : 1.0;
        const targetRotX = isHover ? 0 : p.initRot.x + floatRotX;
        const targetRotY = isHover ? 0 : p.initRot.y;
        const targetRotZ = isHover ? 0 : p.initRot.z + floatRotZ;

        // Smooth LERP
        p.group.position.x = THREE.MathUtils.lerp(p.group.position.x, p.initPos.x, 0.08);
        p.group.position.y = THREE.MathUtils.lerp(p.group.position.y, p.initPos.y + floatY, 0.08);
        p.group.position.z = THREE.MathUtils.lerp(p.group.position.z, targetZ, 0.08);

        p.group.rotation.x = THREE.MathUtils.lerp(p.group.rotation.x, targetRotX, 0.08);
        p.group.rotation.y = THREE.MathUtils.lerp(p.group.rotation.y, targetRotY, 0.08);
        p.group.rotation.z = THREE.MathUtils.lerp(p.group.rotation.z, targetRotZ, 0.08);

        p.group.scale.x = THREE.MathUtils.lerp(p.group.scale.x, targetScale, 0.08);
        p.group.scale.y = THREE.MathUtils.lerp(p.group.scale.y, targetScale, 0.08);
        p.group.scale.z = THREE.MathUtils.lerp(p.group.scale.z, targetScale, 0.08);

        // Border and material opacity
        const targetOpacity = isHover ? 1.0 : 0.92;
        p.material.opacity = THREE.MathUtils.lerp(p.material.opacity, targetOpacity, 0.08);

        if (isHover) {
          p.lineMaterial.color.setHex(0xff2a2a);
          p.lineMaterial.opacity = THREE.MathUtils.lerp(p.lineMaterial.opacity, 0.9, 0.1);
        } else {
          p.lineMaterial.color.setHex(0xffffff);
          p.lineMaterial.opacity = THREE.MathUtils.lerp(p.lineMaterial.opacity, 0.15, 0.08);
        }
      });

      renderer.render(scene, camera);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // 8. Cleanup on Unmount
    return () => {
      if (animId) cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      container.removeEventListener('click', onClick);

      planeMeshes.forEach((p) => {
        p.mesh.geometry.dispose();
        p.material.map?.dispose();
        p.material.dispose();
        p.borderLine.geometry.dispose();
        p.lineMaterial.dispose();
      });

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onSelectImage]);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    />
  );
}
