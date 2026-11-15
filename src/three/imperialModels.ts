import * as THREE from 'three';
import {
  createAoThungTexture,
  createLanternGlowTexture,
  createLanternSilkTexture,
  createPlaqueTexture,
  createRedLacquerTexture,
  createRoyalCarpetTexture,
  createThroneHallFloorTexture,
  createYellowRoofTileTexture,
} from './proceduralTextures';

export interface MandarinVisualConfig {
  robeHex: string;
  trimHex: string;
  badgeHex: string;
  isPlayer?: boolean;
  bowAngle?: number;
}

/**
 * Composite 10-part 3D Mandarin in traditional Nguyen Dynasty Áo Thụng & Mũ cánh chuồn.
 * Grounded at bottom-center pivot (y = 0).
 */
export function createMandarinFigure(config: MandarinVisualConfig, anisotropy = 8): THREE.Group {
  const group = new THREE.Group();

  const robeTex = createAoThungTexture(config.robeHex, config.trimHex, config.badgeHex, anisotropy);
  const robeMat = new THREE.MeshStandardMaterial({
    map: robeTex,
    roughness: 0.65,
    metalness: 0.08,
  });

  const trimMat = new THREE.MeshStandardMaterial({
    color: config.trimHex,
    roughness: 0.35,
    metalness: 0.65,
  });

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xd9ab87,
    roughness: 0.72,
    metalness: 0.02,
  });

  const darkBootMat = new THREE.MeshStandardMaterial({
    color: 0x1c1715,
    roughness: 0.8,
    metalness: 0.05,
  });

  const hatMat = new THREE.MeshStandardMaterial({
    color: 0x141418,
    roughness: 0.45,
    metalness: 0.15,
  });

  // 1. Boots base (grounded at y = 0)
  const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.24), darkBootMat);
  leftBoot.position.set(-0.11, 0.06, 0.04);
  leftBoot.castShadow = true;
  const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.24), darkBootMat);
  rightBoot.position.set(0.11, 0.06, 0.04);
  rightBoot.castShadow = true;
  group.add(leftBoot, rightBoot);

  // Upper body pivot for bowing animation
  const torsoPivot = new THREE.Group();
  torsoPivot.position.set(0, 0.78, 0);
  if (config.bowAngle) {
    torsoPivot.rotation.x = config.bowAngle;
  }

  // 2. Flared Áo thụng lower robe (Lathe/Cylinder skirt)
  const skirtGeo = new THREE.CylinderGeometry(0.24, 0.38, 0.84, 16);
  const skirt = new THREE.Mesh(skirtGeo, robeMat);
  skirt.position.set(0, 0.48, 0);
  skirt.castShadow = true;
  skirt.receiveShadow = true;
  group.add(skirt);

  // 3. Upper torso robe
  const chestGeo = new THREE.CylinderGeometry(0.21, 0.25, 0.64, 16);
  const chest = new THREE.Mesh(chestGeo, robeMat);
  chest.position.set(0, 0.32, 0);
  chest.castShadow = true;
  torsoPivot.add(chest);

  // 4. Embroidered Jade Belt (Đai ngọc)
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.235, 0.08, 16), trimMat);
  belt.position.set(0, 0.06, 0);
  torsoPivot.add(belt);

  // 5 & 6. Wide billowing Áo thụng sleeves folded respectfully in front
  const leftSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.17, 0.56, 12), robeMat);
  leftSleeve.position.set(-0.24, 0.24, 0.14);
  leftSleeve.rotation.set(-0.55, 0, -0.35);
  leftSleeve.castShadow = true;

  const rightSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.17, 0.56, 12), robeMat);
  rightSleeve.position.set(0.24, 0.24, 0.14);
  rightSleeve.rotation.set(-0.55, 0, 0.35);
  rightSleeve.castShadow = true;
  torsoPivot.add(leftSleeve, rightSleeve);

  // 7. Court ivory tablet (Hốt) / clasped hands
  const tablet = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.28, 0.025),
    new THREE.MeshStandardMaterial({ color: 0xf4ead2, roughness: 0.4, metalness: 0.1 }),
  );
  tablet.position.set(0, 0.26, 0.32);
  tablet.rotation.x = -0.25;
  torsoPivot.add(tablet);

  // 8. Head & neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.1, 10), skinMat);
  neck.position.set(0, 0.66, 0);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.135, 16, 14), skinMat);
  head.position.set(0, 0.78, 0);
  head.castShadow = true;
  torsoPivot.add(neck, head);

  // 9. Mandarin Winged Hat (Mũ cánh chuồn)
  const hatBase = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.145, 0.15, 16), hatMat);
  hatBase.position.set(0, 0.89, -0.01);
  const hatCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.1, 16), hatMat);
  hatCrown.position.set(0, 0.99, -0.02);

  // Gold crest on hat front
  const hatCrest = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.07, 0.02), trimMat);
  hatCrest.position.set(0, 0.91, 0.135);

  // Two side wings (cánh chuồn)
  const wingGeo = new THREE.BoxGeometry(0.24, 0.04, 0.015);
  const leftWing = new THREE.Mesh(wingGeo, hatMat);
  leftWing.position.set(-0.22, 0.9, -0.04);
  leftWing.rotation.y = 0.2;
  const rightWing = new THREE.Mesh(wingGeo, hatMat);
  rightWing.position.set(0.22, 0.9, -0.04);
  rightWing.rotation.y = -0.2;

  torsoPivot.add(hatBase, hatCrown, hatCrest, leftWing, rightWing);

  // Subtle golden halo ring underneath player figure in 3rd person so student immediately spots themselves
  if (config.isPlayer) {
    const markerRing = new THREE.Mesh(
      new THREE.RingGeometry(0.46, 0.56, 32),
      new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide, transparent: true, opacity: 0.75 }),
    );
    markerRing.rotation.x = -Math.PI / 2;
    markerRing.position.y = 0.02;
    group.add(markerRing);
  }

  group.add(torsoPivot);
  return group;
}

/**
 * Emperor figure seated on the Dragon Throne inside Điện Thái Hòa.
 */
export function createEmperorFigure(anisotropy = 8): { group: THREE.Group; rightArmPivot: THREE.Group } {
  const group = new THREE.Group();

  const goldRobeTex = createAoThungTexture('#eab308', '#b45309', '#991b1b', anisotropy);
  const robeMat = new THREE.MeshStandardMaterial({
    map: goldRobeTex,
    roughness: 0.42,
    metalness: 0.38,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf5c542,
    roughness: 0.25,
    metalness: 0.85,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xdfb28e,
    roughness: 0.7,
  });

  // Seated robe lap
  const lap = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.36, 0.52), robeMat);
  lap.position.set(0, 0.38, 0.16);
  lap.castShadow = true;

  // Lower robe skirt hanging over throne edge
  const lowerRobe = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.42, 0.22), robeMat);
  lowerRobe.position.set(0, 0.21, 0.36);

  // Torso
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.68, 16), robeMat);
  torso.position.set(0, 0.86, 0);
  torso.castShadow = true;

  // Left sleeve resting on armrest
  const leftSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.5, 12), robeMat);
  leftSleeve.position.set(-0.32, 0.74, 0.14);
  leftSleeve.rotation.set(-0.5, 0, -0.3);

  // Right arm pivot (can raise royal scroll during commendation)
  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.3, 0.96, 0.04);
  const rightSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.48, 12), robeMat);
  rightSleeve.position.set(0.04, -0.2, 0.14);
  rightSleeve.rotation.set(-0.7, 0, 0.22);

  // Golden imperial decree scroll
  const scroll = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.32, 12), goldMat);
  scroll.rotation.z = Math.PI / 2;
  scroll.position.set(0.04, -0.34, 0.34);
  rightArmPivot.add(rightSleeve, scroll);

  // Head & beard
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.145, 16, 14), skinMat);
  head.position.set(0, 1.34, 0.02);

  // Mũ Cửu Long (Imperial Dragon Crown)
  const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.155, 0.16, 16), goldMat);
  crownBase.position.set(0, 1.47, 0.01);
  const crownTop = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.04, 0.32), goldMat);
  crownTop.position.set(0, 1.57, 0.01);
  const crownOrb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), goldMat);
  crownOrb.position.set(0, 1.63, 0.01);

  group.add(lap, lowerRobe, torso, leftSleeve, rightArmPivot, head, crownBase, crownTop, crownOrb);
  return { group, rightArmPivot };
}

/**
 * Multi-part Golden Dragon Throne & Dais (Ngai vàng & Bệ rồng)
 */
export function createDragonThrone(anisotropy = 8): THREE.Group {
  const group = new THREE.Group();

  const redLacquerMat = new THREE.MeshStandardMaterial({
    map: createRedLacquerTexture(anisotropy),
    roughness: 0.35,
    metalness: 0.18,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xebb93d,
    roughness: 0.26,
    metalness: 0.86,
  });
  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0xd9cbb2,
    roughness: 0.72,
    metalness: 0.04,
  });

  // 3-stepped dais platform
  for (let i = 0; i < 3; i++) {
    const w = 6.2 - i * 1.1;
    const d = 4.6 - i * 0.85;
    const step = new THREE.Mesh(new THREE.BoxGeometry(w, 0.24, d), i === 2 ? redLacquerMat : stoneMat);
    step.position.set(0, 0.12 + i * 0.24, 0);
    step.receiveShadow = true;
    step.castShadow = true;
    group.add(step);
  }

  // Throne seat & carved gilded backrest
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.45, 1.1), goldMat);
  seat.position.set(0, 0.94, 0);
  seat.castShadow = true;

  const backrest = new THREE.Mesh(new THREE.BoxGeometry(1.45, 1.55, 0.16), goldMat);
  backrest.position.set(0, 1.85, -0.48);
  backrest.castShadow = true;

  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.45, 1.05), goldMat);
  leftArm.position.set(-0.68, 1.32, 0);
  const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.45, 1.05), goldMat);
  rightArm.position.set(0.68, 1.32, 0);

  // Decorative carved crest above backrest
  const dragonCrest = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.55, 6), goldMat);
  dragonCrest.position.set(0, 2.85, -0.48);

  // Imperial Canopy (Bửu tán)
  const canopy = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.62, 0.4, 8), goldMat);
  canopy.position.set(0, 3.85, -0.1);
  const canopyTrim = new THREE.Mesh(new THREE.CylinderGeometry(1.62, 1.65, 0.2, 8), redLacquerMat);
  canopyTrim.position.set(0, 3.58, -0.1);

  group.add(seat, backrest, leftArm, rightArm, dragonCrest, canopy, canopyTrim);
  return group;
}

/**
 * Imperial Palace Guard (Thị vệ / Cấm vệ quân) standing beside the throne dais with ceremonial halberd.
 */
export function createImperialGuardFigure(anisotropy = 8): THREE.Group {
  const group = createMandarinFigure(
    {
      robeHex: '#991b1b',
      trimHex: '#eab308',
      badgeHex: '#78350f',
      bowAngle: 0,
    },
    anisotropy,
  );

  const staffMat = new THREE.MeshStandardMaterial({ color: 0x5c1914, roughness: 0.45 });
  const bladeMat = new THREE.MeshStandardMaterial({ color: 0xf5c542, roughness: 0.25, metalness: 0.88 });

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.028, 2.55, 8), staffMat);
  pole.position.set(0.36, 1.28, 0.14);
  pole.castShadow = true;

  const spearHead = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.28, 6), bladeMat);
  spearHead.position.set(0.36, 2.66, 0.14);

  const crescent = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.018, 6, 12, Math.PI), bladeMat);
  crescent.position.set(0.36, 2.45, 0.14);
  crescent.rotation.z = Math.PI / 2;

  group.add(pole, spearHead, crescent);
  return group;
}

/**
 * Bronze Cauldron (Cửu Đỉnh / Vạc đồng) using LatheGeometry + legs + handles
 */
export function createBronzeCauldron(): THREE.Group {
  const group = new THREE.Group();
  const bronzeMat = new THREE.MeshStandardMaterial({
    color: 0x5c4730,
    roughness: 0.38,
    metalness: 0.78,
  });
  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0xb7aa96,
    roughness: 0.85,
  });

  // Stone pedestal
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.42, 1.5), stoneMat);
  plinth.position.y = 0.21;
  plinth.receiveShadow = true;
  plinth.castShadow = true;
  group.add(plinth);

  // Lathe profile for bronze cauldron bowl
  const pts = [
    new THREE.Vector2(0.0, 0.65),
    new THREE.Vector2(0.36, 0.68),
    new THREE.Vector2(0.56, 0.92),
    new THREE.Vector2(0.58, 1.35),
    new THREE.Vector2(0.46, 1.56),
    new THREE.Vector2(0.56, 1.66),
    new THREE.Vector2(0.46, 1.66),
  ];
  const bowl = new THREE.Mesh(new THREE.LatheGeometry(pts, 20), bronzeMat);
  bowl.castShadow = true;
  group.add(bowl);

  // 3 Tripod legs
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.42, 10), bronzeMat);
    leg.position.set(Math.cos(angle) * 0.34, 0.56, Math.sin(angle) * 0.34);
    leg.castShadow = true;
    group.add(leg);
  }

  // 2 Ear handles
  for (const side of [-1, 1]) {
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.035, 8, 16), bronzeMat);
    handle.position.set(side * 0.54, 1.58, 0);
    group.add(handle);
  }

  return group;
}

/**
 * Imperial Gate (Ngọ Môn) with animated left & right doors and Lầu Ngũ Phụng on top.
 */
export function createNgoMonGate(anisotropy = 8): {
  group: THREE.Group;
  leftDoorPivot: THREE.Group;
  rightDoorPivot: THREE.Group;
} {
  const group = new THREE.Group();

  const masonryMat = new THREE.MeshStandardMaterial({
    color: 0x8e7f6d,
    roughness: 0.88,
    metalness: 0.04,
  });
  const redMat = new THREE.MeshStandardMaterial({
    map: createRedLacquerTexture(anisotropy),
    roughness: 0.38,
    metalness: 0.16,
  });
  const roofMat = new THREE.MeshStandardMaterial({
    map: createYellowRoofTileTexture(anisotropy),
    roughness: 0.32,
    metalness: 0.25,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xe6b53c,
    roughness: 0.28,
    metalness: 0.82,
  });

  // Left and Right massive masonry piers (leaving central arched portal 4.8m wide)
  const leftPier = new THREE.Mesh(new THREE.BoxGeometry(10.5, 6.2, 5.4), masonryMat);
  leftPier.position.set(-7.65, 3.1, 0);
  leftPier.castShadow = true;
  leftPier.receiveShadow = true;

  const rightPier = new THREE.Mesh(new THREE.BoxGeometry(10.5, 6.2, 5.4), masonryMat);
  rightPier.position.set(7.65, 3.1, 0);
  rightPier.castShadow = true;
  rightPier.receiveShadow = true;

  // Lintel deck above central portal
  const centerBridge = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.8, 5.4), masonryMat);
  centerBridge.position.set(0, 5.3, 0);
  centerBridge.castShadow = true;
  centerBridge.receiveShadow = true;

  // Side decorative recessed arched doors (closed flanking portals)
  for (const side of [-1, 1]) {
    const sideDoor = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.6, 0.3), redMat);
    sideDoor.position.set(side * 6.8, 1.8, 2.65);
    const sideBack = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.6, 0.3), redMat);
    sideBack.position.set(side * 6.8, 1.8, -2.65);
    group.add(sideDoor, sideBack);
  }

  // Animated Central Imperial Doors (2.4m wide each, pivoting outward/inward)
  const leftDoorPivot = new THREE.Group();
  leftDoorPivot.position.set(-2.4, 0, 0.3);
  const leftLeaf = new THREE.Mesh(new THREE.BoxGeometry(2.38, 4.4, 0.28), redMat);
  leftLeaf.position.set(1.19, 2.2, 0);
  leftLeaf.castShadow = true;
  leftDoorPivot.add(leftLeaf);

  const rightDoorPivot = new THREE.Group();
  rightDoorPivot.position.set(2.4, 0, 0.3);
  const rightLeaf = new THREE.Mesh(new THREE.BoxGeometry(2.38, 4.4, 0.28), redMat);
  rightLeaf.position.set(-1.19, 2.2, 0);
  rightLeaf.castShadow = true;
  rightDoorPivot.add(rightLeaf);

  // Brass door studs & knockers on both leaves
  for (const pivot of [leftDoorPivot, rightDoorPivot]) {
    const sign = pivot === leftDoorPivot ? 1 : -1;
    const knocker = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 8, 16), goldMat);
    knocker.position.set(sign * 1.9, 2.1, 0.18);
    pivot.add(knocker);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 3; col++) {
        const stud = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), goldMat);
        stud.position.set(sign * (0.45 + col * 0.65), 0.9 + row * 0.85, 0.16);
        pivot.add(stud);
      }
    }
  }

  // Upper Terrace Balustrade (Đài Ngọ Môn)
  const parapetFront = new THREE.Mesh(new THREE.BoxGeometry(25.8, 0.9, 0.45), masonryMat);
  parapetFront.position.set(0, 6.65, 2.5);
  const parapetBack = new THREE.Mesh(new THREE.BoxGeometry(25.8, 0.9, 0.45), masonryMat);
  parapetBack.position.set(0, 6.65, -2.5);

  // Lầu Ngũ Phụng (Five Phoenix Pavilion) - 2-tier center pavilion + flanking wings
  const pavBase = new THREE.Mesh(new THREE.BoxGeometry(11.6, 2.8, 3.8), redMat);
  pavBase.position.set(0, 7.6, 0);
  pavBase.castShadow = true;

  // Lower curved roof
  const lowerRoof = new THREE.Mesh(new THREE.ConeGeometry(8.6, 2.1, 4), roofMat);
  lowerRoof.rotation.y = Math.PI / 4;
  lowerRoof.scale.set(1.25, 1, 0.68);
  lowerRoof.position.set(0, 9.75, 0);
  lowerRoof.castShadow = true;

  // Upper tier pavilion
  const upperTier = new THREE.Mesh(new THREE.BoxGeometry(7.2, 2.2, 2.8), redMat);
  upperTier.position.set(0, 10.7, 0);
  const upperRoof = new THREE.Mesh(new THREE.ConeGeometry(6.2, 1.9, 4), roofMat);
  upperRoof.rotation.y = Math.PI / 4;
  upperRoof.scale.set(1.2, 1, 0.7);
  upperRoof.position.set(0, 12.6, 0);
  upperRoof.castShadow = true;

  // Flanking wing pavilions
  for (const side of [-1, 1]) {
    const wingBody = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.2, 3.0), redMat);
    wingBody.position.set(side * 9.2, 7.3, 0);
    const wingRoof = new THREE.Mesh(new THREE.ConeGeometry(3.8, 1.6, 4), roofMat);
    wingRoof.rotation.y = Math.PI / 4;
    wingRoof.position.set(side * 9.2, 9.1, 0);
    group.add(wingBody, wingRoof);
  }

  // Golden Plaque "NGỌ MÔN" facing the player outside
  const plaqueTex = createPlaqueTexture('NGỌ MÔN', '午 門 · KINH THÀNH HUẾ', '#5b0e12', anisotropy);
  const plaque = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 1.25, 0.14),
    new THREE.MeshStandardMaterial({ map: plaqueTex, roughness: 0.35, metalness: 0.25 }),
  );
  plaque.position.set(0, 5.2, 2.78);

  group.add(
    leftPier,
    rightPier,
    centerBridge,
    leftDoorPivot,
    rightDoorPivot,
    parapetFront,
    parapetBack,
    pavBase,
    lowerRoof,
    upperTier,
    upperRoof,
    plaque,
  );

  return { group, leftDoorPivot, rightDoorPivot };
}

/**
 * Điện Thái Hòa Marble Terrace & Grand Timber-Floored Interior Hall seamlessly connected behind the real photo facade.
 */
export function createDienThaiHoaComplex(anisotropy = 8): {
  group: THREE.Group;
} {
  const group = new THREE.Group();

  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xd4c6ae, roughness: 0.78 });
  const redMat = new THREE.MeshStandardMaterial({
    map: createRedLacquerTexture(anisotropy),
    roughness: 0.32,
    metalness: 0.18,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xebb93d,
    roughness: 0.25,
    metalness: 0.85,
  });
  const bronzeMat = new THREE.MeshStandardMaterial({
    color: 0x6b4f2e,
    roughness: 0.32,
    metalness: 0.82,
  });
  const woodFloorMat = new THREE.MeshStandardMaterial({
    map: createThroneHallFloorTexture(anisotropy),
    roughness: 0.36,
    metalness: 0.05,
  });
  const carpetMat = new THREE.MeshStandardMaterial({
    map: createRoyalCarpetTexture(anisotropy),
    roughness: 0.65,
    metalness: 0.06,
  });
  const timberCeilingMat = new THREE.MeshStandardMaterial({
    color: 0x3b130f,
    roughness: 0.68,
    metalness: 0.08,
  });
  const lanternGlowMat = new THREE.MeshStandardMaterial({
    color: 0xffd27d,
    emissive: 0xff9d2e,
    emissiveIntensity: 0.9,
    roughness: 0.35,
  });

  // Grand Marble Terrace (Sân Bái Mạng) from z = 0 (at complex origin z=-96) back to z = -34
  const terrace = new THREE.Mesh(new THREE.BoxGeometry(36, 1.5, 36), stoneMat);
  terrace.position.set(0, 0.75, -16);
  terrace.receiveShadow = true;
  group.add(terrace);

  // Front Marble Steps leading up to Điện Thái Hòa
  for (let s = 0; s < 5; s++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.3, 0.7), stoneMat);
    step.position.set(0, 0.15 + s * 0.3, 3.8 - s * 0.65);
    step.receiveShadow = true;
    group.add(step);
  }

  // Polished Wooden Plank Floor (Sàn lợp gỗ lim) inside Điện Thái Hòa
  const hallFloor = new THREE.Mesh(new THREE.PlaneGeometry(23.6, 29.5), woodFloorMat);
  hallFloor.rotation.x = -Math.PI / 2;
  hallFloor.position.set(0, 1.52, -16.2);
  hallFloor.receiveShadow = true;
  group.add(hallFloor);

  // Central Imperial Crimson & Gold Carpet Runner leading to Dragon Throne Dais
  const royalCarpet = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 21.5), carpetMat);
  royalCarpet.rotation.x = -Math.PI / 2;
  royalCarpet.position.set(0, 1.54, -13.2);
  royalCarpet.receiveShadow = true;
  group.add(royalCarpet);

  // Red Lacquered Colonnade inside Điện Thái Hòa (sized so roof never protrudes above exterior facade)
  const colGeo = new THREE.CylinderGeometry(0.3, 0.34, 4.7, 14);
  const zRows = [-4.8, -10.5, -16.5, -22.8, -28.8];
  const xCols = [-10.4, -6.2, -2.5, 2.5, 6.2, 10.4];
  for (const zr of zRows) {
    for (const xc of xCols) {
      if (Math.abs(xc) < 3 && zr < -3) continue;
      const colHeight = Math.abs(xc) < 7 ? 5.05 : 4.35;
      const col = new THREE.Mesh(colGeo, redMat);
      col.scale.y = colHeight / 4.7;
      col.position.set(xc, 1.52 + colHeight / 2, zr);
      col.castShadow = true;
      group.add(col);

      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.3, 14), goldMat);
      ring.position.set(xc, 1.67, zr);
      group.add(ring);
    }
  }

  // Side walls & Back wall strictly below exterior photo roof silhouette (y <= 5.65 at sides, 6.45 center)
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(22.4, 5.05, 0.5), redMat);
  backWall.position.set(0, 4.04, -30.4);
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.55, 4.15, 27.6), redMat);
  leftWall.position.set(-11.1, 3.59, -16.7);
  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.55, 4.15, 27.6), redMat);
  rightWall.position.set(11.1, 3.59, -16.7);
  group.add(backWall, leftWall, rightWall);

  // Pitched Imperial Timber Ceiling & Rafters (Vì kèo gỗ) staying completely behind photo roof
  const leftSlope = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.22, 27.6), timberCeilingMat);
  leftSlope.position.set(-5.6, 6.15, -16.7);
  leftSlope.rotation.z = 0.085;
  const rightSlope = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.22, 27.6), timberCeilingMat);
  rightSlope.position.set(5.6, 6.15, -16.7);
  rightSlope.rotation.z = -0.085;
  group.add(leftSlope, rightSlope);

  // Exposed Red-and-Gold Crossbeams (Xà ngang) across the nave
  for (const zr of zRows) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(13.2, 0.26, 0.3), redMat);
    beam.position.set(0, 6.18, zr);
    const beamTrim = new THREE.Mesh(new THREE.BoxGeometry(13.25, 0.08, 0.32), goldMat);
    beamTrim.position.set(0, 6.03, zr);
    group.add(beam, beamTrim);
  }

  // Imperial Folding Screen (Bình phong sơn son thếp vàng) behind Dragon Throne
  const screenCenter = new THREE.Mesh(new THREE.BoxGeometry(4.6, 3.4, 0.16), redMat);
  screenCenter.position.set(0, 3.22, -29.2);
  const screenGoldFrame = new THREE.Mesh(new THREE.BoxGeometry(4.8, 3.55, 0.1), goldMat);
  screenGoldFrame.position.set(0, 3.22, -29.26);
  group.add(screenCenter, screenGoldFrame);
  for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.1, 0.14), redMat);
    wing.position.set(side * 3.25, 3.07, -28.7);
    wing.rotation.y = side * -0.35;
    const wingTrim = new THREE.Mesh(new THREE.BoxGeometry(2.3, 3.2, 0.08), goldMat);
    wingTrim.position.set(side * 3.25, 3.07, -28.75);
    wingTrim.rotation.y = side * -0.35;
    group.add(wing, wingTrim);
  }

  // Interior Royal Plaque "NHÂN TRUNG LONG PHƯỢNG" above screen & throne
  const innerPlaqueTex = createPlaqueTexture('人中龍鳳', 'NHÂN TRUNG LONG PHƯỢNG', '#7a1218', anisotropy);
  const innerPlaque = new THREE.Mesh(
    new THREE.BoxGeometry(4.8, 1.25, 0.18),
    new THREE.MeshStandardMaterial({ map: innerPlaqueTex, roughness: 0.3, metalness: 0.35 }),
  );
  innerPlaque.position.set(0, 5.75, -29.4);
  group.add(innerPlaque);

  // Vertical Golden Couplets (Câu đối) on inner colonnade pillars
  const coupletTex = createPlaqueTexture('御', 'TRIỀU ĐÌNH NGHI LỄ', '#6d1015', anisotropy);
  const coupletMat = new THREE.MeshStandardMaterial({ map: coupletTex, roughness: 0.35, metalness: 0.3 });
  for (const side of [-1, 1]) {
    for (const cz of [-10.1, -22.4]) {
      const couplet = new THREE.Mesh(new THREE.BoxGeometry(0.42, 2.6, 0.08), coupletMat);
      couplet.position.set(side * 6.0, 3.6, cz);
      couplet.rotation.y = side * -0.25;
      group.add(couplet);
    }
  }

  // Pair of Imperial Golden Parasols (Lọng vàng) & Feather Fans (Quạt vả) flanking Dragon Throne
  for (const side of [-1, 1]) {
    const parasol = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 3.8, 10), redMat);
    pole.position.y = 1.9;
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.22, 12), goldMat);
    stand.position.y = 0.11;
    const dome = new THREE.Mesh(new THREE.ConeGeometry(0.88, 0.65, 12), goldMat);
    dome.position.y = 3.72;
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.9, 0.32, 12, 1, true), redMat);
    skirt.position.y = 3.25;
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), goldMat);
    finial.position.y = 4.08;
    parasol.add(pole, stand, dome, skirt, finial);
    parasol.position.set(side * 3.15, 1.52, -25.4);
    group.add(parasol);

    // Ceremonial Feather Fan (Quạt vả) slightly forward and outward
    const fan = new THREE.Group();
    const fanPole = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.038, 3.1, 8), redMat);
    fanPole.position.y = 1.55;
    const fanStand = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.18, 10), goldMat);
    fanStand.position.y = 0.09;
    const fanLeaf = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.05, 16), goldMat);
    fanLeaf.rotation.x = Math.PI / 2;
    fanLeaf.position.y = 3.15;
    fan.add(fanPole, fanStand, fanLeaf);
    fan.position.set(side * 3.75, 1.52, -23.8);
    fan.rotation.y = side * -0.25;
    group.add(fan);
  }

  // Pair of Bronze Incense Burners (Đỉnh đồng / Lư hương) on lacquered stands before the Dais
  for (const side of [-1, 1]) {
    const burner = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.55, 0.75), redMat);
    base.position.y = 0.275;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.45, 16), bronzeMat);
    body.position.y = 0.82;
    const lid = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.28, 12), goldMat);
    lid.position.y = 1.18;
    for (const hSide of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 6, 12), goldMat);
      ear.position.set(hSide * 0.28, 0.92, 0);
      burner.add(ear);
    }
    burner.add(base, body, lid);
    burner.position.set(side * 2.25, 1.52, -21.2);
    group.add(burner);
  }

  // Ceremonial Court Drum (Trống chầu) & Bronze Gong (Chiêng đồng) in side bays
  const drumGroup = new THREE.Group();
  const drumFrameL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.75, 0.12), redMat);
  drumFrameL.position.set(0, 0.88, -0.58);
  const drumFrameR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.75, 0.12), redMat);
  drumFrameR.position.set(0, 0.88, 0.58);
  const drumBody = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.75, 18), redMat);
  drumBody.rotation.z = Math.PI / 2;
  drumBody.position.y = 1.15;
  const drumSkin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.43, 0.43, 0.77, 18),
    new THREE.MeshStandardMaterial({ color: 0xe8d5b0, roughness: 0.7 }),
  );
  drumSkin.rotation.z = Math.PI / 2;
  drumSkin.position.y = 1.15;
  drumGroup.add(drumFrameL, drumFrameR, drumBody, drumSkin);
  drumGroup.position.set(-8.2, 1.52, -18.2);
  group.add(drumGroup);

  const gongGroup = new THREE.Group();
  const gongStandL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.85, 0.12), redMat);
  gongStandL.position.set(0, 0.92, -0.62);
  const gongStandR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.85, 0.12), redMat);
  gongStandR.position.set(0, 0.92, 0.62);
  const gongCross = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 1.45), goldMat);
  gongCross.position.y = 1.84;
  const gongDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.08, 20), goldMat);
  gongDisc.rotation.z = Math.PI / 2;
  gongDisc.position.y = 1.16;
  gongGroup.add(gongStandL, gongStandR, gongCross, gongDisc);
  gongGroup.position.set(8.2, 1.52, -18.2);
  group.add(gongGroup);

  // Side Lacquered Ceremonial Tables (Án kỷ) with Porcelain/Gold Vases along side aisles
  const vaseMat = new THREE.MeshStandardMaterial({ color: 0x1e40af, roughness: 0.22, metalness: 0.2 });
  for (const side of [-1, 1]) {
    for (const tz of [-12.2, -23.5]) {
      const table = new THREE.Group();
      const top = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.1, 1.9), redMat);
      top.position.y = 0.92;
      for (const lx of [-0.36, 0.36]) {
        for (const lz of [-0.78, 0.78]) {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.92, 0.09), redMat);
          leg.position.set(lx, 0.46, lz);
          table.add(leg);
        }
      }
      const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.15, 0.44, 12), vaseMat);
      vase.position.set(0, 1.19, 0);
      const vaseRim = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.025, 6, 12), goldMat);
      vaseRim.rotation.x = Math.PI / 2;
      vaseRim.position.set(0, 1.41, 0);
      table.add(top, vase, vaseRim);
      table.position.set(side * 9.0, 1.52, tz);
      group.add(table);
    }
  }

  // 8 Hanging Imperial Hexagonal Silk Lanterns along both sides of the central nave
  for (const side of [-1, 1]) {
    for (const lz of [-7.5, -13.5, -19.5, -24.5]) {
      const lantern = new THREE.Group();
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.9, 6), goldMat);
      cord.position.y = 0.45;
      const capTop = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.1, 6), redMat);
      capTop.position.y = 0.02;
      const silkBody = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.56, 6), lanternGlowMat);
      silkBody.position.y = -0.3;
      const capBot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.1, 6), goldMat);
      capBot.position.y = -0.62;
      const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.34, 6), redMat);
      tassel.position.y = -0.84;
      lantern.add(cord, capTop, silkBody, capBot, tassel);
      lantern.position.set(side * 4.3, 5.4, lz);
      group.add(lantern);
    }
  }

  return { group };
}

/**
 * Multi-part Side Pavilion (Tả Vu / Hữu Vu) flanking Sân Đại Triều Nghi
 */
export function createSidePavilion(anisotropy = 8): THREE.Group {
  const group = new THREE.Group();

  const plinthMat = new THREE.MeshStandardMaterial({ color: 0xb9aa96, roughness: 0.85 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x8f7d6a, roughness: 0.8 });
  const redMat = new THREE.MeshStandardMaterial({
    map: createRedLacquerTexture(anisotropy),
    roughness: 0.4,
    metalness: 0.14,
  });
  const roofMat = new THREE.MeshStandardMaterial({
    map: createYellowRoofTileTexture(anisotropy),
    roughness: 0.35,
    metalness: 0.22,
  });

  // Stone base plinth
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.55, 11.4), plinthMat);
  plinth.position.y = 0.275;
  plinth.receiveShadow = true;
  group.add(plinth);

  // Main pavilion body
  const body = new THREE.Mesh(new THREE.BoxGeometry(4.8, 3.1, 10.4), wallMat);
  body.position.y = 2.1;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Red verandah columns on courtyard-facing side
  const colGeo = new THREE.CylinderGeometry(0.14, 0.16, 3.1, 10);
  for (let z = -4.5; z <= 4.5; z += 2.25) {
    for (const x of [-2.45, 2.45]) {
      const col = new THREE.Mesh(colGeo, redMat);
      col.position.set(x, 2.1, z);
      col.castShadow = true;
      group.add(col);
    }
  }

  // Traditional pitched roof with terracotta/yellow glazed tiles
  const roof = new THREE.Mesh(new THREE.ConeGeometry(6.8, 2.2, 4), roofMat);
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(0.68, 1, 1.32);
  roof.position.y = 4.75;
  roof.castShadow = true;
  group.add(roof);

  return group;
}

export interface GuidingLanternHandle {
  group: THREE.Group;
  lanternPivot: THREE.Group;
  silkMaterial: THREE.MeshStandardMaterial;
  glowSprite: THREE.Sprite;
  groundGlow: THREE.Mesh | null;
  zPos: number;
  phaseOffset: number;
}

/**
 * Factory for glowing imperial lanterns (Đèn lồng trụ cung đình) lining the ceremonial path
 * from Ngọ Môn through Cầu Trung Đạo across Sân Đại Triều Nghi to Điện Thái Hòa.
 */
export function createGuidingLanternFactory(anisotropy = 8): {
  createLantern: (options: {
    side: -1 | 1;
    zPos: number;
    style: 'pillar' | 'bridge_post';
  }) => GuidingLanternHandle;
  dispose: () => void;
} {
  const glowTex = createLanternGlowTexture();
  const silkTex = createLanternSilkTexture(anisotropy);

  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xbcb09b, roughness: 0.82 });
  const redWoodMat = new THREE.MeshStandardMaterial({
    map: createRedLacquerTexture(anisotropy),
    roughness: 0.36,
    metalness: 0.16,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xeeb83b,
    roughness: 0.25,
    metalness: 0.85,
  });

  // Shared geometries
  const plinthGeo = new THREE.BoxGeometry(0.56, 0.24, 0.56);
  const plinthCapGeo = new THREE.BoxGeometry(0.4, 0.14, 0.4);
  const tallPoleGeo = new THREE.CylinderGeometry(0.055, 0.072, 2.48, 10);
  const shortPoleGeo = new THREE.CylinderGeometry(0.048, 0.062, 1.25, 10);
  const ringGeo = new THREE.CylinderGeometry(0.085, 0.095, 0.08, 12);
  const topFinialGeo = new THREE.ConeGeometry(0.09, 0.22, 8);
  const armGeo = new THREE.BoxGeometry(0.54, 0.065, 0.075);
  const armBraceGeo = new THREE.BoxGeometry(0.32, 0.045, 0.045);

  const cordGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.28, 6);
  const capTopGeo = new THREE.CylinderGeometry(0.18, 0.24, 0.09, 6);
  const silkBodyGeo = new THREE.CylinderGeometry(0.22, 0.19, 0.46, 6);
  const capBotGeo = new THREE.CylinderGeometry(0.18, 0.13, 0.08, 6);
  const tasselGeo = new THREE.CylinderGeometry(0.022, 0.038, 0.26, 6);
  const groundPoolGeo = new THREE.PlaneGeometry(2.1, 2.1);

  let createdCount = 0;

  const createLantern = ({
    side,
    zPos,
    style,
  }: {
    side: -1 | 1;
    zPos: number;
    style: 'pillar' | 'bridge_post';
  }): GuidingLanternHandle => {
    const group = new THREE.Group();
    const inward = -side; // Bracket points inward toward the central walkway (x = 0)
    const idx = createdCount++;

    let armY = 2.68;
    let armLength = 0.5;

    if (style === 'pillar') {
      const plinth = new THREE.Mesh(plinthGeo, stoneMat);
      plinth.position.y = 0.12;
      plinth.receiveShadow = true;
      plinth.castShadow = true;

      const plinthCap = new THREE.Mesh(plinthCapGeo, stoneMat);
      plinthCap.position.y = 0.31;
      plinthCap.receiveShadow = true;

      const pole = new THREE.Mesh(tallPoleGeo, redWoodMat);
      pole.position.y = 1.62;
      pole.castShadow = true;

      const baseRing = new THREE.Mesh(ringGeo, goldMat);
      baseRing.position.y = 0.42;

      const capRing = new THREE.Mesh(ringGeo, goldMat);
      capRing.position.y = 2.74;

      const finial = new THREE.Mesh(topFinialGeo, goldMat);
      finial.position.y = 2.96;

      group.add(plinth, plinthCap, pole, baseRing, capRing, finial);
      armY = 2.7;
      armLength = 0.52;
    } else {
      // Ornate short red-and-gold post atop Cầu Trung Đạo stone balustrade post (y = 1.15)
      const baseRing = new THREE.Mesh(ringGeo, goldMat);
      baseRing.position.y = 0.04;

      const pole = new THREE.Mesh(shortPoleGeo, redWoodMat);
      pole.position.y = 0.66;
      pole.castShadow = true;

      const capRing = new THREE.Mesh(ringGeo, goldMat);
      capRing.position.y = 1.24;

      const finial = new THREE.Mesh(topFinialGeo, goldMat);
      finial.position.y = 1.44;

      group.add(baseRing, pole, capRing, finial);
      armY = 1.22;
      armLength = 0.44;
    }

    // Horizontal bracket extending inward toward the Imperial Axis
    const arm = new THREE.Mesh(armGeo, redWoodMat);
    arm.scale.x = armLength / 0.54;
    arm.position.set(inward * (armLength * 0.5), armY, 0);
    arm.castShadow = true;

    const armTip = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), goldMat);
    armTip.position.set(inward * armLength, armY, 0);

    const brace = new THREE.Mesh(armBraceGeo, goldMat);
    brace.position.set(inward * (armLength * 0.32), armY - 0.14, 0);
    brace.rotation.z = inward * 0.68;
    group.add(arm, armTip, brace);

    // Hanging hexagonal lantern assembly
    const lanternPivot = new THREE.Group();
    lanternPivot.position.set(inward * (armLength - 0.04), armY - 0.03, 0);

    const cord = new THREE.Mesh(cordGeo, goldMat);
    cord.position.y = -0.14;

    const capTop = new THREE.Mesh(capTopGeo, redWoodMat);
    capTop.position.y = -0.3;

    const silkMaterial = new THREE.MeshStandardMaterial({
      map: silkTex,
      color: 0xffd27d,
      emissive: 0xff9a26,
      emissiveIntensity: 1.45,
      roughness: 0.35,
      metalness: 0.05,
    });
    const silkBody = new THREE.Mesh(silkBodyGeo, silkMaterial);
    silkBody.position.y = -0.56;

    const capBot = new THREE.Mesh(capBotGeo, goldMat);
    capBot.position.y = -0.82;

    const tassel = new THREE.Mesh(tasselGeo, redWoodMat);
    tassel.position.y = -0.98;

    // Soft warm daytime glow halo sprite centered on the silk lantern body
    const glowSpriteMat = new THREE.SpriteMaterial({
      map: glowTex,
      color: 0xffcf70,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glowSprite = new THREE.Sprite(glowSpriteMat);
    glowSprite.position.set(0, -0.56, 0);
    glowSprite.scale.set(1.5, 1.5, 1.5);

    lanternPivot.add(cord, capTop, silkBody, capBot, tassel, glowSprite);
    group.add(lanternPivot);

    // Soft warm light pool on courtyard stone directly under the hanging lantern (pillars only)
    let groundGlow: THREE.Mesh | null = null;
    if (style === 'pillar') {
      const groundMat = new THREE.MeshBasicMaterial({
        map: glowTex,
        color: 0xffbe5c,
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      groundGlow = new THREE.Mesh(groundPoolGeo, groundMat);
      groundGlow.rotation.x = -Math.PI / 2;
      groundGlow.position.set(inward * (armLength - 0.04), 0.032, 0);
      group.add(groundGlow);
    }

    return {
      group,
      lanternPivot,
      silkMaterial,
      glowSprite,
      groundGlow,
      zPos,
      phaseOffset: idx * 0.65,
    };
  };

  const dispose = () => {
    glowTex.dispose();
    silkTex.dispose();
    stoneMat.dispose();
    redWoodMat.dispose();
    goldMat.dispose();
    plinthGeo.dispose();
    plinthCapGeo.dispose();
    tallPoleGeo.dispose();
    shortPoleGeo.dispose();
    ringGeo.dispose();
    topFinialGeo.dispose();
    armGeo.dispose();
    armBraceGeo.dispose();
    cordGeo.dispose();
    capTopGeo.dispose();
    silkBodyGeo.dispose();
    capBotGeo.dispose();
    tasselGeo.dispose();
    groundPoolGeo.dispose();
  };

  return { createLantern, dispose };
}


