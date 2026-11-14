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

  // Seed flood fill across top edge (y = 0) and upper left/right corners (top 25%)
  for (let x = 0; x < targetW; x++) {
    const idx = x;
    const p = idx * 4;
    if (isSkyPixel(data[p], data[p + 1], data[p + 2])) {
      visited[idx] = 1;
      queue[tail++] = idx;
    }
  }
  const maxSeedY = Math.floor(targetH * 0.25);
  for (let y = 1; y < maxSeedY; y++) {
    for (const x of [0, targetW - 1]) {
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
 * Sky classifier for dusk/night Điện Thái Hòa photograph (deep indigo-blue sky).
 */
export function isDienThaiHoaSkyPixel(r: number, g: number, b: number): boolean {
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return luma < 125 && b > r + 14 && b > g + 6;
}
