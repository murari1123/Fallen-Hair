/* ============================================
   FALLEN HAIR — Text Texture Generator
   Creates crisp, high-DPI canvas textures for 3D
   editorial typography in Three.js WebGL scenes.
   ============================================ */

import * as THREE from 'three';

export function createTextTexture({
  lines = [],
  fontSize = 64,
  fontFamily = "'Helvetica Neue', Arial, sans-serif",
  fontWeight = '300',
  color = '#F1ECE6',
  accentColor = '#7D4047',
  accentWords = [],
  width = 1024,
  height = 512,
  letterSpacing = '0px',
  lineHeight = 1.2,
  align = 'center',
}) {
  const canvas = document.createElement('canvas');
  canvas.width = width * 2; // 2x for Retina sharpness
  canvas.height = height * 2;

  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);

  ctx.clearRect(0, 0, width, height);

  const totalTextHeight = lines.length * fontSize * lineHeight;
  let startY = (height - totalTextHeight) / 2 + fontSize * 0.85;

  lines.forEach((line) => {
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.textBaseline = 'alphabetic';

    let x = width / 2;
    ctx.textAlign = align;

    if (align === 'left') x = 40;
    if (align === 'right') x = width - 40;

    // Check if line contains special accent formatting
    if (typeof line === 'object' && line.chunks) {
      let currentX = align === 'center' ? (width - line.totalWidth) / 2 : 40;
      line.chunks.forEach((chunk) => {
        ctx.font = `${chunk.weight || fontWeight} ${chunk.size || fontSize}px ${fontFamily}`;
        ctx.fillStyle = chunk.color || color;
        ctx.textAlign = 'left';
        ctx.fillText(chunk.text, currentX, startY);
        currentX += ctx.measureText(chunk.text).width + (chunk.spacing || 0);
      });
    } else {
      ctx.fillStyle = color;
      ctx.fillText(line, x, startY);
    }

    startY += fontSize * lineHeight;
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  return { texture, aspect: width / height };
}
