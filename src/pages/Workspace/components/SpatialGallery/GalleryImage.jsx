/* ============================================
   FALLEN HAIR — 3D Spatial Gallery Image Card
   Interactive 3D textured plane with gentle floating
   motion, hover depth translation, and red accent glow.
   ============================================ */

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Text } from '@react-three/drei';
import * as THREE from 'three';

export function GalleryImage({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1.8, 2.4, 1],
  title = 'Untitled',
  code = '00 // FRAME',
  floatSpeed = 1,
  floatOffset = 0,
  onSelect,
}) {
  const meshRef = useRef();
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Load texture cleanly
  const texture = useTexture(url);

  // Initial reference transforms
  const [initX, initY, initZ] = position;
  const [initRx, initRy, initRz] = rotation;

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime() * floatSpeed + floatOffset;

    // 1. Subtle, slow ambient floating oscillation
    const floatY = Math.sin(time * 0.7) * 0.08;
    const floatRotZ = Math.sin(time * 0.5) * 0.015;
    const floatRotX = Math.cos(time * 0.6) * 0.015;

    // 2. Smooth hover scale & forward Z translation
    const targetZ = hovered ? initZ + 0.55 : initZ;
    const targetScale = hovered ? 1.08 : 1;
    const targetRotX = hovered ? 0 : initRx + floatRotX;
    const targetRotY = hovered ? 0 : initRy;
    const targetRotZ = hovered ? 0 : initRz + floatRotZ;

    // Dampened interpolation (LERP)
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, initX, delta * 6);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, initY + floatY, delta * 6);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, delta * 6);

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, delta * 5);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, delta * 5);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRotZ, delta * 5);

    groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, delta * 8);
    groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, targetScale, delta * 8);
    groupRef.current.scale.z = THREE.MathUtils.lerp(groupRef.current.scale.z, targetScale, delta * 8);

    // Subtle material brightness tweak on hover
    if (meshRef.current?.material) {
      const targetOpacity = hovered ? 1 : 0.92;
      meshRef.current.material.opacity = THREE.MathUtils.lerp(meshRef.current.material.opacity, targetOpacity, delta * 6);
    }
  });

  return (
    <group
      ref={groupRef}
      position={[initX, initY, initZ]}
      rotation={[initRx, initRy, initRz]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.({ title, code, url });
      }}
    >
      {/* 3D Image Plane */}
      <mesh ref={meshRef}>
        <planeGeometry args={[scale[0], scale[1]]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.4}
          metalness={0.1}
          transparent
          opacity={0.92}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Subtle Dark Minimal Border Frame */}
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(scale[0], scale[1])]} />
        <lineBasicMaterial
          color={hovered ? '#ff2a2a' : '#ffffff'}
          opacity={hovered ? 0.85 : 0.12}
          transparent
        />
      </lineSegments>

      {/* Micro Floating Metadata (Visible on Hover) */}
      <group position={[0, -scale[1] / 2 - 0.18, 0.02]}>
        <Text
          fontSize={0.085}
          letterSpacing={0.12}
          color={hovered ? '#ffffff' : '#888888'}
          anchorX="center"
          anchorY="middle"
          fillOpacity={hovered ? 1 : 0.4}
        >
          {title.toUpperCase()}
        </Text>

        <Text
          position={[0, -0.12, 0]}
          fontSize={0.065}
          letterSpacing={0.18}
          color={hovered ? '#ff2a2a' : '#555555'}
          anchorX="center"
          anchorY="middle"
          fillOpacity={hovered ? 1 : 0.3}
        >
          {code}
        </Text>
      </group>
    </group>
  );
}
