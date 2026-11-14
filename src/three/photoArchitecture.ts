import * as THREE from 'three';

interface PhotoSliceOptions {
  imageUrl: string;
  cropTopRatio: number;     // 0..1 from top of source image
  cropBottomRatio: number;  // 0..1 from top of source image
  totalWidth: number;
  totalHeight: number;
  doorLeftU: number;        // 0..1 horizontal start of central doorway
  doorRightU: number;       // 0..1 horizontal end of central doorway
  doorHeightRatio: number;  // 0..1 from bottom of cropped image
  isSkyPixel: (r: number, g: number, b: number) => boolean;
  fallbackColor: number;
  anisotropy?: number;
}

export interface PhotoMonumentResult {
  group: THREE.Group;
  leftDoorPivot: THREE.Group;
  rightDoorPivot: THREE.Group;
  dispose: () => void;
}

function createSubGeometry(
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  uMin: number,
  uMax: number,
  vMin: number,
  vMax: number,
): THREE.BufferGeometry {
  const w = xMax - xMin;
  const h = yMax - yMin;
  const geo = new THREE.PlaneGeometry(w, h);
  geo.translate((xMin + xMax) / 2, (yMin + yMax) / 2, 0);

  const uv = geo.attributes.uv as THREE.BufferAttribute;
  // PlaneGeometry vertex order: top-left, top-right, bottom-left, bottom-right
  uv.setXY(0, uMin, vMax);
  uv.setXY(1, uMax, vMax);
  uv.setXY(2, uMin, vMin);
  uv.setXY(3, uMax, vMin);
  uv.needsUpdate = true;
  return geo;
}

/**
 * Flood-fills sky pixels starting from the top row of the cropped canvas
 * so building roofs/dragons/trees remain 100% opaque while sky is cleanly removed.
 */
function processCroppedPhotoCanvas(
  img: HTMLImageElement,
  cropTopRatio: number,
  cropBottomRatio: number,
  isSkyPixel: (r: number, g: number, b: number) => boolean,
): HTMLCanvasElement {
  const targetW = 1400;
  const srcY = Math.floor(img.naturalHeight * cropTopRatio);
  const srcH = Math.max(1, Math.floor(img.naturalHeight * (cropBottomRatio - cropTopRatio)));
  const targetH = Math.max(1, Math.round((srcH / img.naturalWidth) * targetW));

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, srcY, img.naturalWidth, srcH, 0, 0, targetW, targetH);

  const imgData = ctx.getImageData(0, 0, targetW, targetH);
  const data = imgData.data;
  const visited = new Uint8Array(targetW * targetH);
  const queue = new Int32Array(targetW * targetH);
  let head = 0;
  let tail = 0;

  // Seed flood fill across top edge (y = 0) and left/right borders down to 64% height
  for (let x = 0; x < targetW; x++) {
    const idx = x;
    const p = idx * 4;
    if (isSkyPixel(data[p], data[p + 1], data[p + 2])) {
      visited[idx] = 1;
      queue[tail++] = idx;
    }
  }
  const maxSeedY = Math.floor(targetH * 0.64);
  for (let y = 1; y < maxSeedY; y++) {
    for (const x of [0, 1, targetW - 2, targetW - 1]) {
      const idx = y * targetW + x;
      if (!visited[idx]) {
        const p = idx * 4;
        if (isSkyPixel(data[p], data[p + 1], data[p + 2])) {
          visited[idx] = 1;
          queue[tail++] = idx;
        }
      }
    }
  }

  while (head < tail) {
    const idx = queue[head++];
    const p = idx * 4;
    data[p + 3] = 0; // transparent sky

    const x = idx % targetW;
    const y = (idx - x) / targetW;

    // 4-connected neighbors
    if (x > 0) {
      const n = idx - 1;
      if (!visited[n]) {
        const np = n * 4;
        if (isSkyPixel(data[np], data[np + 1], data[np + 2])) {
          visited[n] = 1;
          queue[tail++] = n;
        }
      }
    }
    if (x < targetW - 1) {
      const n = idx + 1;
      if (!visited[n]) {
        const np = n * 4;
        if (isSkyPixel(data[np], data[np + 1], data[np + 2])) {
          visited[n] = 1;
          queue[tail++] = n;
        }
      }
    }
    if (y > 0) {
      const n = idx - targetW;
      if (!visited[n]) {
        const np = n * 4;
        if (isSkyPixel(data[np], data[np + 1], data[np + 2])) {
          visited[n] = 1;
          queue[tail++] = n;
        }
      }
    }
    if (y < targetH - 1) {
      const n = idx + targetW;
      if (!visited[n]) {
        const np = n * 4;
        if (isSkyPixel(data[np], data[np + 1], data[np + 2])) {
          visited[n] = 1;
          queue[tail++] = n;
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

export function createPhotoMonument(opts: PhotoSliceOptions): PhotoMonumentResult {
  const group = new THREE.Group();
  const {
    imageUrl,
    cropTopRatio,
    cropBottomRatio,
    totalWidth,
    totalHeight,
    doorLeftU,
    doorRightU,
    doorHeightRatio,
    isSkyPixel,
    fallbackColor,
    anisotropy = 8,
  } = opts;

  const halfW = totalWidth / 2;
  const doorLeftX = -halfW + doorLeftU * totalWidth;
  const doorRightX = -halfW + doorRightU * totalWidth;
  const doorCenterX = (doorLeftX + doorRightX) / 2;
  const doorHeight = totalHeight * doorHeightRatio;
  const doorMidU = (doorLeftU + doorRightU) / 2;

  const material = new THREE.MeshBasicMaterial({
    color: fallbackColor,
    side: THREE.DoubleSide,
    transparent: true,
    alphaTest: 0.35,
  });

  // Left Wing Mesh
  const leftGeo = createSubGeometry(
    -halfW,
    doorLeftX,
    0,
    totalHeight,
    0,
    doorLeftU,
    0,
    1,
  );
  const leftMesh = new THREE.Mesh(leftGeo, material);

  // Right Wing Mesh
  const rightGeo = createSubGeometry(
    doorRightX,
    halfW,
    0,
    totalHeight,
    doorRightU,
    1,
    0,
    1,
  );
  const rightMesh = new THREE.Mesh(rightGeo, material);

  // Upper Center Lintel above doorway
  const topCenterGeo = createSubGeometry(
    doorLeftX,
    doorRightX,
    doorHeight,
    totalHeight,
    doorLeftU,
    doorRightU,
    doorHeightRatio,
    1,
  );
  const topCenterMesh = new THREE.Mesh(topCenterGeo, material);

  group.add(leftMesh, rightMesh, topCenterMesh);

  // Animated Left & Right Central Doors (pivoting at outer jambs!)
  const leftDoorPivot = new THREE.Group();
  leftDoorPivot.position.set(doorLeftX, 0, 0.04);
  const leftDoorGeo = createSubGeometry(
    0,
    doorCenterX - doorLeftX,
    0,
    doorHeight,
    doorLeftU,
    doorMidU,
    0,
    doorHeightRatio,
  );
  const leftDoorMesh = new THREE.Mesh(leftDoorGeo, material);
  leftDoorPivot.add(leftDoorMesh);

  const rightDoorPivot = new THREE.Group();
  rightDoorPivot.position.set(doorRightX, 0, 0.04);
  const rightDoorGeo = createSubGeometry(
    doorCenterX - doorRightX,
    0,
    0,
    doorHeight,
    doorMidU,
    doorRightU,
    0,
    doorHeightRatio,
  );
  const rightDoorMesh = new THREE.Mesh(rightDoorGeo, material);
  rightDoorPivot.add(rightDoorMesh);

  group.add(leftDoorPivot, rightDoorPivot);

  let loadedTexture: THREE.CanvasTexture | null = null;
  let cancelled = false;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    if (cancelled) return;
    const processedCanvas = processCroppedPhotoCanvas(
      img,
      cropTopRatio,
      cropBottomRatio,
      isSkyPixel,
    );
    const tex = new THREE.CanvasTexture(processedCanvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = anisotropy;
    tex.needsUpdate = true;
    loadedTexture = tex;

    material.color.setHex(0xffffff);
    material.map = tex;
    material.needsUpdate = true;
  };
  img.src = imageUrl;

  const dispose = () => {
    cancelled = true;
    leftGeo.dispose();
    rightGeo.dispose();
    topCenterGeo.dispose();
    leftDoorGeo.dispose();
    rightDoorGeo.dispose();
    loadedTexture?.dispose();
    material.dispose();
  };

  return { group, leftDoorPivot, rightDoorPivot, dispose };
}

/**
 * Sky classifier for daytime Ngọ Môn photograph (bright blue/white sky).
 */
export function isNgoMonSkyPixel(r: number, g: number, b: number): boolean {
  const maxC = Math.max(r, g, b);
  const minC = Math.min(r, g, b);
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  // Bright blue sky or soft white clouds
  return luma > 165 && b >= r - 4 && maxC - minC < 78;
}

/**
 * Sky classifier for dusk/night Điện Thái Hòa photograph (deep indigo-blue sky, soft clouds, and dark upper silhouettes).
 */
export function isDienThaiHoaSkyPixel(r: number, g: number, b: number): boolean {
  const isNightBlueOrCloud = b > r + 4 && b >= g + 1 && r < 128 && g < 142;
  const isDarkUpperEdge = r < 34 && g < 40 && b < 50;
  return isNightBlueOrCloud || isDarkUpperEdge;
}

export interface RealTreeFactory {
  createTree: () => THREE.Group;
  dispose: () => void;
}

/**
 * Segments the sculpted imperial pine tree (Tùng la hán) from the uploaded photo,
 * removing white sky, left temple roof/wall, right background trees, and ground gravel,
 * centered horizontally on the trunk axis so 3 crossed 3D planes align cleanly.
 */
function processRealTreeCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const srcW = img.naturalWidth;
  const srcH = img.naturalHeight;

  // Trunk center in source image sits at u = 0.555; symmetric span +/- 0.535 keeps left canopy intact
  const trunkU = 0.555;
  const halfSpanU = 0.535;
  const cropTopV = 0.075;
  const cropBottomV = 0.842;

  const canvasW = 768;
  const canvasH = 736;
  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d')!;

  // Map source rectangle [0.02 .. 0.91] x [0.075 .. 0.842] into trunk-centered canvas coordinates
  const validLeftU = 0.02;
  const validRightU = 0.908;
  const sx = Math.floor(validLeftU * srcW);
  const sy = Math.floor(cropTopV * srcH);
  const sw = Math.floor((validRightU - validLeftU) * srcW);
  const sh = Math.floor((cropBottomV - cropTopV) * srcH);

  const dstLeft = ((validLeftU - (trunkU - halfSpanU)) / (halfSpanU * 2)) * canvasW;
  const dstWidth = ((validRightU - validLeftU) / (halfSpanU * 2)) * canvasW;
  ctx.drawImage(img, sx, sy, sw, sh, dstLeft, 0, dstWidth, canvasH);

  const imgData = ctx.getImageData(0, 0, canvasW, canvasH);
  const data = imgData.data;
  const total = canvasW * canvasH;
  const fg = new Uint8Array(total);

  for (let y = 0; y < canvasH; y++) {
    const nyOrig = cropTopV + (y / canvasH) * (cropBottomV - cropTopV);
    for (let x = 0; x < canvasW; x++) {
      const idx = y * canvasW + x;
      const p = idx * 4;
      const a = data[p + 3];
      if (a < 20) continue;

      const r = data[p];
      const g = data[p + 1];
      const b = data[p + 2];
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;

      const nxOrig = trunkU - halfSpanU + (x / canvasW) * (halfSpanU * 2);

      // 1. Bright sky / clouds / pale sky halos
      const isSky = luma > 172 && maxC - minC < 40;
      if (isSky) continue;

      // 2. Right-side background autumn maple / far hedge
      if (nxOrig > 0.905) continue;
      if (nxOrig > 0.72 && r > g + 5 && r > b + 12) continue;
      if (nxOrig > 0.79 && nyOrig < 0.58 && luma > 135 && g - r < 14) continue;

      // 3. Left-side temple slate roof, eaves, and dark wooden wall (keep only true pine greens)
      if (nxOrig < 0.405 && nyOrig < 0.80) {
        const isPineGreen = g > b + 11 && g >= r - 5;
        if (!isPineGreen) continue;
      }

      // 4. Bottom sunlit gravel ground around trunk base
      if (nyOrig > 0.755 && !(nxOrig > 0.48 && nxOrig < 0.625)) {
        const isGravel = luma > 112 && g - b < 17;
        if (isGravel) continue;
      }
      if (nyOrig > 0.835 && (nxOrig < 0.49 || nxOrig > 0.615)) continue;

      fg[idx] = 1;
    }
  }

  // Keep only connected components reachable from core anchors inside the hero pine tree
  const visited = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  const seedPoints: Array<[number, number]> = [
    [0.555, 0.76], // Trunk base
    [0.54, 0.56],  // Mid trunk
    [0.52, 0.43],  // Center cloud pad
    [0.53, 0.20],  // Top crown pad
    [0.62, 0.22],  // Upper-right crown pad
    [0.66, 0.30],  // Mid-upper-right pad
    [0.74, 0.62],  // Lower-right cloud pad
    [0.27, 0.42],  // Upper-left cloud pad
    [0.24, 0.62],  // Lower-left cloud pad
    [0.40, 0.72],  // Bottom-center-left pad
    [0.16, 0.68],  // Bottom-leftmost pad
  ];

  for (const [su, sv] of seedPoints) {
    const cx = Math.round(((su - (trunkU - halfSpanU)) / (halfSpanU * 2)) * canvasW);
    const cy = Math.round(((sv - cropTopV) / (cropBottomV - cropTopV)) * canvasH);
    for (let dy = -12; dy <= 12; dy++) {
      for (let dx = -12; dx <= 12; dx++) {
        const sx2 = cx + dx;
        const sy2 = cy + dy;
        if (sx2 >= 0 && sx2 < canvasW && sy2 >= 0 && sy2 < canvasH) {
          const idx = sy2 * canvasW + sx2;
          if (fg[idx] && !visited[idx]) {
            visited[idx] = 1;
            queue[tail++] = idx;
          }
        }
      }
    }
  }

  while (head < tail) {
    const idx = queue[head++];
    const x = idx % canvasW;
    const y = (idx - x) / canvasW;

    if (x > 0 && fg[idx - 1] && !visited[idx - 1]) {
      visited[idx - 1] = 1;
      queue[tail++] = idx - 1;
    }
    if (x < canvasW - 1 && fg[idx + 1] && !visited[idx + 1]) {
      visited[idx + 1] = 1;
      queue[tail++] = idx + 1;
    }
    if (y > 0 && fg[idx - canvasW] && !visited[idx - canvasW]) {
      visited[idx - canvasW] = 1;
      queue[tail++] = idx - canvasW;
    }
    if (y < canvasH - 1 && fg[idx + canvasW] && !visited[idx + canvasW]) {
      visited[idx + canvasW] = 1;
      queue[tail++] = idx + canvasW;
    }
  }

  // Apply alpha mask and strip bright sky-fringe rim pixels
  for (let i = 0; i < total; i++) {
    const p = i * 4;
    if (!visited[i]) {
      data[p + 3] = 0;
      continue;
    }
    const x = i % canvasW;
    const y = (i - x) / canvasW;
    let touchesBg = false;
    if (
      (x > 0 && !visited[i - 1]) ||
      (x < canvasW - 1 && !visited[i + 1]) ||
      (y > 0 && !visited[i - canvasW]) ||
      (y < canvasH - 1 && !visited[i + canvasW])
    ) {
      touchesBg = true;
    }
    if (touchesBg) {
      const luma = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
      if (luma > 152) {
        data[p + 3] = 0;
      } else {
        // Slightly deepen rim color so no bright halo shows against foliage
        data[p] = Math.round(data[p] * 0.85);
        data[p + 1] = Math.round(data[p + 1] * 0.88);
        data[p + 2] = Math.round(data[p + 2] * 0.85);
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

export function createRealTreeFactory(imageUrl: string, anisotropy = 8): RealTreeFactory {
  const planeW = 6.2;
  const planeH = 5.95;

  const planeGeo = new THREE.PlaneGeometry(planeW, planeH);
  planeGeo.translate(0, planeH / 2, 0);

  const shadowGeo = new THREE.CircleGeometry(1.75, 20);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x162412,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
  });

  const treeMat = new THREE.MeshBasicMaterial({
    color: 0x3b6e35,
    side: THREE.DoubleSide,
    transparent: true,
    alphaTest: 0.42,
  });

  let loadedTex: THREE.CanvasTexture | null = null;
  let cancelled = false;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    if (cancelled) return;
    const processed = processRealTreeCanvas(img);
    const tex = new THREE.CanvasTexture(processed);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = anisotropy;
    tex.needsUpdate = true;
    loadedTex = tex;

    treeMat.color.setHex(0xf4f5ef);
    treeMat.map = tex;
    treeMat.needsUpdate = true;
  };
  img.src = imageUrl;

  const createTree = (): THREE.Group => {
    const group = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const plane = new THREE.Mesh(planeGeo, treeMat);
      plane.rotation.y = (i * Math.PI) / 3;
      group.add(plane);
    }
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.position.y = 0.025;
    group.add(contactShadow);
    return group;
  };

  const dispose = () => {
    cancelled = true;
    planeGeo.dispose();
    shadowGeo.dispose();
    shadowMat.dispose();
    loadedTex?.dispose();
    treeMat.dispose();
  };

  return { createTree, dispose };
}

export interface RoadsideMonumentOptions {
  imageUrl: string;
  cropLeftRatio: number;
  cropRightRatio: number;
  cropTopRatio: number;
  cropBottomRatio: number;
  width: number;
  height: number;
  isBgPixel: (r: number, g: number, b: number, nx: number, ny: number) => boolean;
  anisotropy?: number;
}

export interface RoadsideMonumentResult {
  group: THREE.Group;
  dispose: () => void;
}

function processRoadsideMonumentCanvas(
  img: HTMLImageElement,
  opts: RoadsideMonumentOptions,
): HTMLCanvasElement {
  const srcX = Math.floor(img.naturalWidth * opts.cropLeftRatio);
  const srcY = Math.floor(img.naturalHeight * opts.cropTopRatio);
  const srcW = Math.max(1, Math.floor(img.naturalWidth * (opts.cropRightRatio - opts.cropLeftRatio)));
  const srcH = Math.max(1, Math.floor(img.naturalHeight * (opts.cropBottomRatio - opts.cropTopRatio)));

  const targetW = 768;
  const targetH = Math.max(1, Math.round((srcH / srcW) * targetW));

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, targetW, targetH);

  const imgData = ctx.getImageData(0, 0, targetW, targetH);
  const data = imgData.data;
  const total = targetW * targetH;
  const visited = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  const trySeed = (x: number, y: number) => {
    const idx = y * targetW + x;
    if (visited[idx]) return;
    const p = idx * 4;
    if (opts.isBgPixel(data[p], data[p + 1], data[p + 2], x / targetW, y / targetH)) {
      visited[idx] = 1;
      queue[tail++] = idx;
    }
  };

  for (let x = 0; x < targetW; x++) {
    trySeed(x, 0);
  }
  const maxSideSeedY = Math.floor(targetH * 0.78);
  for (let y = 1; y < maxSideSeedY; y++) {
    trySeed(0, y);
    trySeed(1, y);
    trySeed(targetW - 2, y);
    trySeed(targetW - 1, y);
  }

  while (head < tail) {
    const idx = queue[head++];
    data[idx * 4 + 3] = 0;

    const x = idx % targetW;
    const y = (idx - x) / targetW;

    if (x > 0) trySeed(x - 1, y);
    if (x < targetW - 1) trySeed(x + 1, y);
    if (y > 0) trySeed(x, y - 1);
    if (y < targetH - 1) trySeed(x, y + 1);
  }

  // Soft 1px rim cleanup to avoid bright white halo fringes against the sky
  for (let i = 0; i < total; i++) {
    if (visited[i]) continue;
    const x = i % targetW;
    const y = (i - x) / targetW;
    const touchesSky =
      (x > 0 && visited[i - 1]) ||
      (x < targetW - 1 && visited[i + 1]) ||
      (y > 0 && visited[i - targetW]) ||
      (y < targetH - 1 && visited[i + targetW]);
    if (touchesSky) {
      const p = i * 4;
      const luma = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
      if (luma > 188 && Math.max(data[p], data[p + 1], data[p + 2]) - Math.min(data[p], data[p + 1], data[p + 2]) < 35) {
        data[p + 3] = 0;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

export function createRoadsideMonument(opts: RoadsideMonumentOptions): RoadsideMonumentResult {
  const group = new THREE.Group();
  const anisotropy = opts.anisotropy ?? 8;

  // Low imperial sandstone plinth so every heritage monument sits firmly grounded on the courtyard
  const plinthMat = new THREE.MeshStandardMaterial({
    color: 0xc2b29b,
    roughness: 0.84,
    metalness: 0.04,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0xd4a843,
    roughness: 0.45,
    metalness: 0.4,
  });

  const basePlinthGeo = new THREE.BoxGeometry(opts.width + 0.55, 0.22, 0.85);
  const basePlinth = new THREE.Mesh(basePlinthGeo, plinthMat);
  basePlinth.position.y = 0.11;
  basePlinth.receiveShadow = true;
  basePlinth.castShadow = true;

  const upperPlinthGeo = new THREE.BoxGeometry(opts.width + 0.25, 0.12, 0.62);
  const upperPlinth = new THREE.Mesh(upperPlinthGeo, trimMat);
  upperPlinth.position.y = 0.28;
  upperPlinth.receiveShadow = true;

  const planeGeo = new THREE.PlaneGeometry(opts.width, opts.height);
  planeGeo.translate(0, opts.height / 2 + 0.32, 0);

  const photoMat = new THREE.MeshBasicMaterial({
    color: 0xbfb39e,
    side: THREE.DoubleSide,
    transparent: true,
    alphaTest: 0.35,
  });

  const photoMesh = new THREE.Mesh(planeGeo, photoMat);
  group.add(basePlinth, upperPlinth, photoMesh);

  let loadedTex: THREE.CanvasTexture | null = null;
  let cancelled = false;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    if (cancelled) return;
    const processed = processRoadsideMonumentCanvas(img, opts);
    const tex = new THREE.CanvasTexture(processed);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = anisotropy;
    tex.needsUpdate = true;
    loadedTex = tex;

    photoMat.color.setHex(0xffffff);
    photoMat.map = tex;
    photoMat.needsUpdate = true;
  };
  img.src = opts.imageUrl;

  const dispose = () => {
    cancelled = true;
    basePlinthGeo.dispose();
    upperPlinthGeo.dispose();
    planeGeo.dispose();
    plinthMat.dispose();
    trimMat.dispose();
    loadedTex?.dispose();
    photoMat.dispose();
  };

  return { group, dispose };
}
