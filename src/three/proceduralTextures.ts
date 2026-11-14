import * as THREE from 'three';

function finalizeTexture(canvas: HTMLCanvasElement, repeatX = 1, repeatY = 1, anisotropy = 8): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = anisotropy;
  tex.needsUpdate = true;
  return tex;
}

export function createCourtyardStoneTexture(anisotropy = 8): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#cbb79d';
  ctx.fillRect(0, 0, 512, 512);

  const cols = 4;
  const rows = 4;
  const w = 512 / cols;
  const h = 512 / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const shade = 194 + ((r * 7 + c * 13) % 20) - 10;
      ctx.fillStyle = `rgb(${shade + 14}, ${shade + 2}, ${shade - 18})`;
      ctx.fillRect(c * w + 2, r * h + 2, w - 4, h - 4);

      ctx.fillStyle = 'rgba(95, 75, 52, 0.08)';
      for (let s = 0; s < 14; s++) {
        const sx = c * w + 6 + ((s * 29 + c * 17) % (w - 14));
        const sy = r * h + 6 + ((s * 41 + r * 23) % (h - 14));
        ctx.fillRect(sx, sy, 3, 2);
      }
    }
  }

  return finalizeTexture(canvas, 16, 36, anisotropy);
}

export function createRoyalPathTexture(anisotropy = 8): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#c4b8a6';
  ctx.fillRect(0, 0, 512, 512);

  // Sunlit pale limestone central ceremonial axis (Đường Ngự Đạo)
  ctx.fillStyle = '#dfd8cc';
  ctx.fillRect(44, 0, 424, 512);

  ctx.strokeStyle = '#9c8c74';
  ctx.lineWidth = 6;
  ctx.strokeRect(44, 4, 424, 504);

  for (let y = 0; y < 512; y += 64) {
    ctx.strokeStyle = 'rgba(120, 108, 90, 0.28)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(44, y);
    ctx.lineTo(468, y);
    ctx.stroke();
  }

  return finalizeTexture(canvas, 1, 24, anisotropy);
}

export function createYellowRoofTileTexture(anisotropy = 8): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#d49b24';
  ctx.fillRect(0, 0, 256, 256);

  // Vertical bamboo-style glazed ceramic ribs (ngói hoàng lưu ly)
  for (let x = 0; x < 256; x += 16) {
    const grad = ctx.createLinearGradient(x, 0, x + 16, 0);
    grad.addColorStop(0, '#9c6b12');
    grad.addColorStop(0.35, '#f5c443');
    grad.addColorStop(0.65, '#e5a922');
    grad.addColorStop(1, '#85570d');
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, 16, 256);
  }

  // Horizontal tile overlaps
  for (let y = 0; y < 256; y += 24) {
    ctx.fillStyle = 'rgba(70, 40, 5, 0.28)';
    ctx.fillRect(0, y, 256, 3);
  }

  return finalizeTexture(canvas, 6, 3, anisotropy);
}

export function createRedLacquerTexture(anisotropy = 8): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 256, 0);
  grad.addColorStop(0, '#6e1014');
  grad.addColorStop(0.5, '#8f181c');
  grad.addColorStop(1, '#680e12');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Subtle vertical wood lacquer sheen lines
  ctx.fillStyle = 'rgba(255, 210, 150, 0.04)';
  for (let x = 0; x < 256; x += 12) {
    ctx.fillRect(x, 0, 2, 256);
  }

  // Gold filigree trim band near top & bottom
  ctx.fillStyle = '#d4a843';
  ctx.fillRect(0, 14, 256, 6);
  ctx.fillRect(0, 236, 256, 6);

  return finalizeTexture(canvas, 1, 1, anisotropy);
}

export function createThroneHallFloorTexture(anisotropy = 8): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Rich polished Nguyễn Dynasty ironwood / teak plank base (Sàn lợp gỗ lim)
  ctx.fillStyle = '#4e2d18';
  ctx.fillRect(0, 0, 512, 512);

  const plankRows = 8;
  const plankH = 512 / plankRows;
  const plankColors = [
    '#663b20',
    '#5c341b',
    '#704224',
    '#553019',
    '#6a3e22',
    '#5e361c',
  ];

  for (let r = 0; r < plankRows; r++) {
    const y = r * plankH;
    const stagger = (r % 3) * 170;
    const segWidths = [256, 256];
    let curX = -stagger;

    let segIdx = 0;
    while (curX < 512) {
      const w = segWidths[segIdx % segWidths.length];
      const baseColor = plankColors[(r * 3 + segIdx) % plankColors.length];

      // Subtle gradient across plank width for bevel depth
      const grad = ctx.createLinearGradient(0, y, 0, y + plankH);
      grad.addColorStop(0, '#442412');
      grad.addColorStop(0.08, baseColor);
      grad.addColorStop(0.92, baseColor);
      grad.addColorStop(1, '#3b1f0f');
      ctx.fillStyle = grad;
      ctx.fillRect(curX + 1, y + 1, w - 2, plankH - 2);

      // Longitudinal wood grain streaks
      ctx.fillStyle = 'rgba(38, 18, 6, 0.22)';
      for (let g = 0; g < 6; g++) {
        const gy = y + 8 + ((g * 9 + r * 5) % (plankH - 14));
        const gx = curX + 12 + ((g * 37 + segIdx * 23) % 45);
        const gw = Math.max(40, w - 35 - ((g * 29) % 60));
        ctx.fillRect(gx, gy, gw, 1.5);
      }

      // Warm highlight grain streak
      ctx.fillStyle = 'rgba(180, 118, 62, 0.14)';
      ctx.fillRect(curX + 18, y + plankH * 0.42, w - 42, 1.5);

      // Plank end seam
      ctx.fillStyle = '#2d160a';
      ctx.fillRect(curX, y, 2, plankH);

      curX += w;
      segIdx++;
    }

    // Horizontal plank seam
    ctx.fillStyle = '#2a1409';
    ctx.fillRect(0, y, 512, 2);
  }

  return finalizeTexture(canvas, 5, 7, anisotropy);
}

export function createRoyalCarpetTexture(anisotropy = 8): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep imperial crimson silk carpet
  ctx.fillStyle = '#7c1318';
  ctx.fillRect(0, 0, 256, 512);

  // Outer gold brocade borders
  ctx.fillStyle = '#d9a438';
  ctx.fillRect(10, 0, 12, 512);
  ctx.fillRect(234, 0, 12, 512);
  ctx.fillStyle = '#f5cb5c';
  ctx.fillRect(28, 0, 4, 512);
  ctx.fillRect(224, 0, 4, 512);

  // Subtle woven dragon-cloud medallions down center
  ctx.strokeStyle = 'rgba(245, 203, 92, 0.26)';
  ctx.lineWidth = 3;
  for (let y = 44; y < 512; y += 88) {
    ctx.beginPath();
    ctx.arc(128, y, 28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(128, y, 14, 0, Math.PI * 2);
    ctx.stroke();
  }

  return finalizeTexture(canvas, 1, 6, anisotropy);
}

export function createAoThungTexture(
  primaryHex: string,
  trimHex: string,
  badgeColorHex: string,
  anisotropy = 8,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = primaryHex;
  ctx.fillRect(0, 0, 256, 256);

  // Subtle woven silk cloud medallions
  ctx.strokeStyle = 'rgba(255, 235, 180, 0.14)';
  ctx.lineWidth = 2;
  for (let y = 24; y < 256; y += 44) {
    for (let x = 24; x < 256; x += 44) {
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Mandarin embroidered chest square (Bổ tử)
  ctx.fillStyle = trimHex;
  ctx.fillRect(92, 48, 72, 64);
  ctx.fillStyle = badgeColorHex;
  ctx.fillRect(98, 54, 60, 52);

  // Stylized crane/phoenix gold emblem inside Bổ tử
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(128, 78, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(114, 92, 28, 5);

  // Collar & lower hem gold border
  ctx.fillStyle = trimHex;
  ctx.fillRect(0, 0, 256, 12);
  ctx.fillRect(0, 238, 256, 18);

  return finalizeTexture(canvas, 1, 1, anisotropy);
}

export function createPlaqueTexture(
  title: string,
  subtitle: string,
  bgHex = '#5b0e12',
  anisotropy = 8,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 192;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, 512, 192);

  // Carved gold border
  ctx.strokeStyle = '#e5b84b';
  ctx.lineWidth = 12;
  ctx.strokeRect(10, 10, 492, 172);
  ctx.strokeStyle = '#996c1d';
  ctx.lineWidth = 3;
  ctx.strokeRect(22, 22, 468, 148);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#fbd46d';
  ctx.font = 'bold 52px "Playfair Display", Georgia, serif';
  ctx.fillText(title, 256, subtitle ? 82 : 96);

  if (subtitle) {
    ctx.fillStyle = '#f4e3b2';
    ctx.font = '600 24px "Be Vietnam Pro", sans-serif';
    ctx.fillText(subtitle, 256, 138);
  }

  return finalizeTexture(canvas, 1, 1, anisotropy);
}

export function createLotusWaterTexture(anisotropy = 8): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 160);
  grad.addColorStop(0, '#1c784f');
  grad.addColorStop(1, '#105437');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = 'rgba(170, 240, 200, 0.14)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.arc((i * 67) % 256, (i * 97) % 256, 18 + (i % 3) * 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  return finalizeTexture(canvas, 4, 4, anisotropy);
}
