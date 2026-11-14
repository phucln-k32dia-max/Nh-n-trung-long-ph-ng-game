import * as THREE from 'three';
import {
  createAoThungTexture,
  createPlaqueTexture,
  createRedLacquerTexture,
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

  // Imperial Canopy (Bửu tán) supported by 4 gilded posts
  const canopy = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.7, 0.45, 8), goldMat);
  canopy.position.set(0, 4.35, -0.1);
  const canopyTrim = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.72, 0.22, 8), redLacquerMat);
  canopyTrim.position.set(0, 4.05, -0.1);

  group.add(seat, backrest, leftArm, rightArm, dragonCrest, canopy, canopyTrim);
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
 * Điện Thái Hòa Marble Terrace & Grand Interior Hall seamlessly connected behind the real photo facade!
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
  const floorMat = new THREE.MeshStandardMaterial({
    map: createThroneHallFloorTexture(anisotropy),
    roughness: 0.42,
    metalness: 0.08,
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

  // Polished Throne Hall Floor on top of terrace
  const hallFloor = new THREE.Mesh(new THREE.PlaneGeometry(24, 30), floorMat);
  hallFloor.rotation.x = -Math.PI / 2;
  hallFloor.position.set(0, 1.52, -16);
  hallFloor.receiveShadow = true;
  group.add(hallFloor);

  // Red Lacquered Colonnade inside Điện Thái Hòa
  const colGeo = new THREE.CylinderGeometry(0.32, 0.36, 7.2, 14);
  const zRows = [-4.5, -10.5, -16.5, -23, -29];
  const xCols = [-10.5, -6.2, -2.6, 2.6, 6.2, 10.5];
  for (const zr of zRows) {
    for (const xc of xCols) {
      if (Math.abs(xc) < 3 && zr < -3) continue;
      const col = new THREE.Mesh(colGeo, redMat);
      col.position.set(xc, 5.1, zr);
      col.castShadow = true;
      group.add(col);

      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.44, 0.35, 14), goldMat);
      ring.position.set(xc, 1.68, zr);
      group.add(ring);
    }
  }

  // Side walls & Back wall of Điện Thái Hòa interior
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(24, 7.6, 0.6), redMat);
  backWall.position.set(0, 5.3, -30.5);
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 7.6, 28.5), redMat);
  leftWall.position.set(-11.8, 5.3, -16.2);
  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 7.6, 28.5), redMat);
  rightWall.position.set(11.8, 5.3, -16.2);

  group.add(backWall, leftWall, rightWall);

  // Interior Royal Plaque "NHÂN TRUNG LONG PHƯỢNG" above Dragon Throne
  const innerPlaqueTex = createPlaqueTexture('人中龍鳳', 'NHÂN TRUNG LONG PHƯỢNG', '#7a1218', anisotropy);
  const innerPlaque = new THREE.Mesh(
    new THREE.BoxGeometry(5.6, 1.55, 0.18),
    new THREE.MeshStandardMaterial({ map: innerPlaqueTex, roughness: 0.3, metalness: 0.35 }),
  );
  innerPlaque.position.set(0, 7.2, -29.8);
  group.add(innerPlaque);

  // Interior dark-lacquered ceiling enclosing the hall
  const ceiling = new THREE.Mesh(
    new THREE.BoxGeometry(24, 0.3, 28.5),
    new THREE.MeshStandardMaterial({ color: 0x451210, roughness: 0.7 }),
  );
  ceiling.position.set(0, 8.9, -16.2);
  group.add(ceiling);

  return { group };
}

/**
 * Multi-part Hue Courtyard Tree (Cây xanh Hoàng Thành)
 */
export function createCourtyardTree(): THREE.Group {
  const group = new THREE.Group();
  const barkMat = new THREE.MeshStandardMaterial({ color: 0x523b2a, roughness: 0.92 });
  const leafMat1 = new THREE.MeshStandardMaterial({ color: 0x2b7333, roughness: 0.85 });
  const leafMat2 = new THREE.MeshStandardMaterial({ color: 0x3b8c3e, roughness: 0.82 });

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.32, 3.2, 8), barkMat);
  trunk.position.y = 1.6;
  trunk.castShadow = true;

  const crown1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.55, 1), leafMat1);
  crown1.position.set(0, 3.8, 0);
  crown1.scale.set(1.25, 0.88, 1.25);
  crown1.castShadow = true;

  const crown2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 1), leafMat2);
  crown2.position.set(0.9, 3.35, 0.35);
  crown2.castShadow = true;

  const crown3 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.05, 1), leafMat2);
  crown3.position.set(-0.85, 3.45, -0.35);
  crown3.castShadow = true;

  group.add(trunk, crown1, crown2, crown3);
  return group;
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

