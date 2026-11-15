import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GamePhase } from '../types/game';
import {
  createBronzeCauldron,
  createDienThaiHoaComplex,
  createDragonThrone,
  createEmperorFigure,
  createGuidingLanternFactory,
  createImperialGuardFigure,
  createMandarinFigure,
  createSidePavilion,
  GuidingLanternHandle,
} from './imperialModels';
import {
  createPhotoMonument,
  createRealTreeFactory,
  createRoadsideMonument,
  isDienThaiHoaSkyPixel,
  isNgoMonSkyPixel,
  RoadsideMonumentResult,
} from './photoArchitecture';
import {
  createAoThungTexture,
  createCourtyardStoneTexture,
  createLotusWaterTexture,
  createRoyalPathTexture,
  createSunMoteTexture,
} from './proceduralTextures';

interface HueCitadelViewportProps {
  phase: GamePhase;
  totalStepsMoved: number; // 0 .. maxSteps (totalQuestions * 5)
  maxSteps: number;
  gatesOpen: boolean;
  hallDoorsOpen: boolean;
  isWalkingStep: boolean;
  isCommended: boolean; // True when final question answered or final audience reached
}

// Module-scoped reusable vectors to avoid GC inside animation loop
const _lookTarget = new THREE.Vector3();
const _desiredCamPos = new THREE.Vector3();

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export const HueCitadelViewport: React.FC<HueCitadelViewportProps> = ({
  phase,
  totalStepsMoved,
  maxSteps,
  gatesOpen,
  hallDoorsOpen,
  isWalkingStep,
  isCommended,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const stateRef = useRef({
    phase,
    totalStepsMoved,
    maxSteps,
    gatesOpen,
    hallDoorsOpen,
    isWalkingStep,
    isCommended,
  });

  useEffect(() => {
    stateRef.current = {
      phase,
      totalStepsMoved,
      maxSteps,
      gatesOpen,
      hallDoorsOpen,
      isWalkingStep,
      isCommended,
    };
  }, [phase, totalStepsMoved, maxSteps, gatesOpen, hallDoorsOpen, isWalkingStep, isCommended]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const maxAnisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    // Scene & Warm Golden-Afternoon Huế Citadel Atmosphere (Nắng chiều cổ kính)
    const scene = new THREE.Scene();
    const skyColor = new THREE.Color(0x9fd2ec);
    scene.background = skyColor;
    scene.fog = new THREE.FogExp2(0xd8e4df, 0.0042);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(
      58,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.1,
      260,
    );
    camera.position.set(0, 2.4, 42);

    // Warm Afternoon Sunlight + Cool Sky Hemisphere Fill
    const hemiLight = new THREE.HemisphereLight(0xe4f1ff, 0x627345, 0.92);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xffeed0, 2.2);
    sunLight.position.set(34, 34, 24);
    sunLight.castShadow = !isSoftwareGl;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 2;
    sunLight.shadow.camera.far = 180;
    sunLight.shadow.camera.left = -45;
    sunLight.shadow.camera.right = 45;
    sunLight.shadow.camera.top = 70;
    sunLight.shadow.camera.bottom = -70;
    sunLight.shadow.bias = -0.0004;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0xcfe3ff, 0.48);
    rimLight.position.set(-24, 18, -50);
    scene.add(rimLight);

    // Warm interior hall lantern lights (inside Điện Thái Hòa z = -100 .. -126)
    const hallLight1 = new THREE.PointLight(0xffb85c, 4.8, 28, 1.45);
    hallLight1.position.set(0, 5.45, -109);
    const hallLight2 = new THREE.PointLight(0xffcb77, 5.4, 30, 1.45);
    hallLight2.position.set(0, 5.45, -119);
    // Subtle warm golden accents at Cầu Trung Đạo & Điện Thái Hòa front marble steps
    const bridgeWarmAccent = new THREE.PointLight(0xffc46b, 1.9, 18, 1.6);
    bridgeWarmAccent.position.set(0, 3.2, 3);
    const stepsWarmAccent = new THREE.PointLight(0xffbd59, 2.8, 18, 1.5);
    stepsWarmAccent.position.set(0, 3.2, -91);
    scene.add(hallLight1, hallLight2, bridgeWarmAccent, stepsWarmAccent);

    // --------------------------------------------------------
    // 1. Ground, Outer Moat, Royal Path, Hồ Thái Dịch & Cầu Trung Đạo
    // --------------------------------------------------------
    const grassTerrain = new THREE.Mesh(
      new THREE.PlaneGeometry(340, 360),
      new THREE.MeshStandardMaterial({ color: 0x4c7a38, roughness: 0.94 }),
    );
    grassTerrain.rotation.x = -Math.PI / 2;
    grassTerrain.position.set(0, -0.08, -40);
    grassTerrain.receiveShadow = true;
    scene.add(grassTerrain);

    // Sunlit Sandstone Courtyard Paving (Quảng trường Ngọ Môn & Sân Đại Triều Nghi)
    const courtyardMat = new THREE.MeshStandardMaterial({
      map: createCourtyardStoneTexture(maxAnisotropy),
      roughness: 0.82,
      metalness: 0.03,
    });
    const innerPlazaMesh = new THREE.Mesh(new THREE.PlaneGeometry(31, 122), courtyardMat);
    innerPlazaMesh.rotation.x = -Math.PI / 2;
    innerPlazaMesh.position.set(0, 0, -39);
    innerPlazaMesh.receiveShadow = true;
    scene.add(innerPlazaMesh);

    // Outer Ngọ Môn Plaza & 3-lane Approach Causeway (matching aerial photo)
    const outerPlaza = new THREE.Mesh(new THREE.PlaneGeometry(24, 34), courtyardMat);
    outerPlaza.rotation.x = -Math.PI / 2;
    outerPlaza.position.set(0, 0, 38);
    outerPlaza.receiveShadow = true;
    scene.add(outerPlaza);

    // Central Imperial Axis Path (Đường Ngự Đạo) + two flanking outer stone strips before Ngọ Môn
    const royalPathMat = new THREE.MeshStandardMaterial({
      map: createRoyalPathTexture(maxAnisotropy),
      roughness: 0.68,
      metalness: 0.05,
    });
    const royalPath = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 146), royalPathMat);
    royalPath.rotation.x = -Math.PI / 2;
    royalPath.position.set(0, 0.025, -24);
    royalPath.receiveShadow = true;
    scene.add(royalPath);

    for (const side of [-1, 1]) {
      const sideWalkway = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 26), royalPathMat);
      sideWalkway.rotation.x = -Math.PI / 2;
      sideWalkway.position.set(side * 6.5, 0.02, 36);
      sideWalkway.receiveShadow = true;
      scene.add(sideWalkway);
    }

    // Two-tier Esplanade Step Divider midway across Sân Đại Triều Nghi (z = -48)
    const midTerraceWall = new THREE.Mesh(
      new THREE.BoxGeometry(30.5, 0.28, 1.1),
      new THREE.MeshStandardMaterial({ color: 0xb7a994, roughness: 0.8 }),
    );
    midTerraceWall.position.set(0, 0.14, -48);
    midTerraceWall.receiveShadow = true;
    scene.add(midTerraceWall);

    // Emerald Water Material for Hồ Thái Dịch & Outer Hào Thành Moat
    const waterMat = new THREE.MeshStandardMaterial({
      map: createLotusWaterTexture(maxAnisotropy),
      roughness: 0.18,
      metalness: 0.35,
    });

    // Outer Hoàng Thành Moat (Hào Thành) in front of Ngọ Môn flanking the approach causeway
    for (const side of [-1, 1]) {
      const outerMoat = new THREE.Mesh(new THREE.PlaneGeometry(48, 8.5), waterMat);
      outerMoat.rotation.x = -Math.PI / 2;
      outerMoat.position.set(side * 36, 0.015, 29.5);
      outerMoat.receiveShadow = true;
      scene.add(outerMoat);
    }

    // Hoàng Thành Brick Citadel Wings extending left & right from Ngọ Môn (z = 22)
    const citadelWallMat = new THREE.MeshStandardMaterial({ color: 0x7c7267, roughness: 0.9 });
    const yellowCopingMat = new THREE.MeshStandardMaterial({ color: 0xd49b24, roughness: 0.4 });
    for (const side of [-1, 1]) {
      const wingWall = new THREE.Mesh(new THREE.BoxGeometry(52, 5.2, 3.2), citadelWallMat);
      wingWall.position.set(side * 44, 2.6, 22);
      wingWall.castShadow = true;
      wingWall.receiveShadow = true;
      const wingCap = new THREE.Mesh(new THREE.BoxGeometry(52, 0.35, 3.4), yellowCopingMat);
      wingCap.position.set(side * 44, 5.35, 22);
      scene.add(wingWall, wingCap);
    }

    // Hồ Thái Dịch (Twin Emerald Lotus Ponds flanking Cầu Trung Đạo around z = 1)
    const padMat = new THREE.MeshStandardMaterial({ color: 0x2c8249, roughness: 0.72 });
    const flowerMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.5 });
    const stoneWallMat = new THREE.MeshStandardMaterial({ color: 0xb7aa96, roughness: 0.82 });

    for (const side of [-1, 1]) {
      const pond = new THREE.Mesh(new THREE.PlaneGeometry(18.5, 20), waterMat);
      pond.rotation.x = -Math.PI / 2;
      pond.position.set(side * 12.6, 0.03, 1);
      pond.receiveShadow = true;
      scene.add(pond);

      // Stone pond retaining wall + yellow coping
      const outerRim = new THREE.Mesh(new THREE.BoxGeometry(19.2, 0.55, 20.6), stoneWallMat);
      outerRim.position.set(side * 12.6, -0.22, 1);
      scene.add(outerRim);

      for (let i = 0; i < 14; i++) {
        const lx = side * (4.8 + ((i * 3.1) % 14.5));
        const lz = -7.8 + ((i * 4.7) % 17.2);
        const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.04, 10), padMat);
        pad.position.set(lx, 0.05, lz);
        scene.add(pad);
        if (i % 3 === 0) {
          const bloom = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.24, 6), flowerMat);
          bloom.rotation.x = Math.PI;
          bloom.position.set(lx, 0.16, lz);
          scene.add(bloom);
        }
      }
    }

    // Cầu Trung Đạo stone balustrades with yellow glazed coping spanning z = -9 to z = +11
    for (const side of [-1, 1]) {
      const railBeam = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.78, 20), stoneWallMat);
      railBeam.position.set(side * 2.85, 0.4, 1);
      railBeam.castShadow = true;
      const railTop = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.16, 20.1), yellowCopingMat);
      railTop.position.set(side * 2.85, 0.85, 1);
      scene.add(railBeam, railTop);

      for (let pz = -9; pz <= 11; pz += 4) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.15, 0.5), stoneWallMat);
        post.position.set(side * 2.85, 0.58, pz);
        post.castShadow = true;
        scene.add(post);
      }
    }

    // Low Imperial Courtyard Enclosure Walls (Tường bao Sân Đại Triều Nghi at x = ±15.2)
    for (const side of [-1, 1]) {
      const innerCourtWall = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.45, 78), stoneWallMat);
      innerCourtWall.position.set(side * 15.2, 0.72, -52);
      innerCourtWall.receiveShadow = true;
      const innerCourtCoping = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.22, 78.2), yellowCopingMat);
      innerCourtCoping.position.set(side * 15.2, 1.54, -52);
      scene.add(innerCourtWall, innerCourtCoping);

      // Outer Citadel Walls (x = ±36)
      const outerWall = new THREE.Mesh(new THREE.BoxGeometry(1.4, 4.4, 142), citadelWallMat);
      outerWall.position.set(side * 36, 2.2, -46);
      outerWall.receiveShadow = true;
      scene.add(outerWall);
    }

    // Distant Hue Mountain Silhouettes on Horizon (Núi Ngự Bình)
    const mountainMat = new THREE.MeshStandardMaterial({ color: 0x5c7c66, roughness: 0.95 });
    const mountainPositions = [
      [-65, -165, 36, 18],
      [0, -180, 48, 22],
      [70, -162, 40, 17],
      [-95, -90, 32, 14],
      [95, -85, 34, 15],
    ];
    for (const [mx, mz, mr, mh] of mountainPositions) {
      const hill = new THREE.Mesh(new THREE.ConeGeometry(mr, mh, 7), mountainMat);
      hill.position.set(mx, mh / 2 - 1, mz);
      scene.add(hill);
    }

    // --------------------------------------------------------
    // 2. Ngọ Môn Gate (Real Photo) & Điện Thái Hòa Complex (Real Photo + 3D Hall)
    // --------------------------------------------------------
    const ngoMon = createPhotoMonument({
      imageUrl:
        '/assets/aistudio/ghe-tham-cong-ngo-mon-kham-pha-di-san-kien-truc-duoi-trieu-nguyen-01-1638279590_4de7ed0f.png',
      cropTopRatio: 0.145,
      cropBottomRatio: 0.538,
      totalWidth: 38,
      totalHeight: 11.2,
      doorLeftU: 0.472,
      doorRightU: 0.532,
      doorHeightRatio: 0.25,
      isSkyPixel: isNgoMonSkyPixel,
      fallbackColor: 0x8e7f6d,
      anisotropy: maxAnisotropy,
    });
    ngoMon.group.position.set(0, 0, 22);
    scene.add(ngoMon.group);

    const dienThaiHoa = createDienThaiHoaComplex(maxAnisotropy);
    dienThaiHoa.group.position.set(0, 0, -96);
    scene.add(dienThaiHoa.group);

    const dienThaiHoaFacade = createPhotoMonument({
      imageUrl:
        '/assets/aistudio/baodanang.vn-dataimages-202502-original-_images1766808_dienthaihoa_anh01_c2fcf658.jpg',
      cropTopRatio: 0.183,
      cropBottomRatio: 0.488,
      totalWidth: 27,
      totalHeight: 5.51,
      doorLeftU: 0.453,
      doorRightU: 0.547,
      doorHeightRatio: 0.472,
      isSkyPixel: isDienThaiHoaSkyPixel,
      fallbackColor: 0x8f181c,
      anisotropy: maxAnisotropy,
    });
    dienThaiHoaFacade.group.position.set(0, 1.5, -97.8);
    scene.add(dienThaiHoaFacade.group);

    // Dragon Throne & Emperor seated inside Điện Thái Hòa (world z = -121.5, y = 1.52)
    const throne = createDragonThrone(maxAnisotropy);
    throne.position.set(0, 1.52, -121.5);
    scene.add(throne);

    const emperor = createEmperorFigure(maxAnisotropy);
    emperor.group.position.set(0, 2.24, -121.3);
    scene.add(emperor.group);

    // --------------------------------------------------------
    // 3. Cửu Đỉnh Bronze Cauldrons, Tả Vu / Hữu Vu Pavilions, Real Sculpted Pine Groves & Banners
    // --------------------------------------------------------
    const realTreeFactory = createRealTreeFactory(
      '/assets/aistudio/120250513110642_b605442e.jpg',
      maxAnisotropy,
    );

    const treeZList = [36, 26, 16, 4, -14, -26, -38, -50, -68, -86, -96];
    for (const side of [-1, 1]) {
      for (const cz of [-22, -44, -66, -86]) {
        const cauldron = createBronzeCauldron();
        cauldron.position.set(side * 13.0, 0, cz);
        scene.add(cauldron);
      }

      // Traditional Tả Vu & Hữu Vu side pavilions flanking Sân Đại Triều Nghi
      for (const pz of [-58, -76]) {
        const pav = createSidePavilion(maxAnisotropy);
        pav.position.set(side * 20.5, 0, pz);
        scene.add(pav);
      }

      // Real sculpted imperial pine trees (Tùng la hán) framing gardens & outer courtyard
      treeZList.forEach((tz, idx) => {
        const tree1 = realTreeFactory.createTree();
        tree1.position.set(side * 18.8, 0, tz);
        tree1.rotation.y = idx * 1.15 + (side > 0 ? 0.55 : 0);
        tree1.scale.setScalar(0.92 + ((Math.abs(tz) % 5) * 0.08));
        scene.add(tree1);

        const tree2 = realTreeFactory.createTree();
        tree2.position.set(side * 27.8, 0, tz + 3);
        tree2.rotation.y = idx * 1.65 + (side > 0 ? 1.2 : 0.3);
        tree2.scale.setScalar(1.05 + ((Math.abs(tz) % 4) * 0.09));
        scene.add(tree2);
      });
    }

    // --------------------------------------------------------
    // 3B. 13 Heritage Monuments evenly distributed along both sides of the Imperial Path
    //     Left side: z = -15, -27, -39, -51, -63, -75, -87 (12m interval)
    //     Right side: z = -21, -33, -45, -57, -69, -81     (12m staggered interval)
    // --------------------------------------------------------
    const neutralBrightSky = (r: number, g: number, b: number) => {
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      const spread = Math.max(r, g, b) - Math.min(r, g, b);
      return (luma > 168 && spread < 44) || (b > r + 12 && luma > 130);
    };
    const blueSky = (r: number, g: number, b: number) => {
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      const spread = Math.max(r, g, b) - Math.min(r, g, b);
      return (b > r + 14 && luma > 105) || (luma > 188 && spread < 36);
    };

    const monumentSpecs = [
      {
        imageUrl: '/assets/aistudio/frame-427319874-10400_33a9f829.png',
        cropLeftRatio: 0.255,
        cropRightRatio: 0.835,
        cropTopRatio: 0.04,
        cropBottomRatio: 0.81,
        width: 5.8,
        height: 3.9,
        isBgPixel: neutralBrightSky,
      },
      {
        imageUrl: '/assets/aistudio/images_dd6e7363.jpg',
        cropLeftRatio: 0.23,
        cropRightRatio: 0.74,
        cropTopRatio: 0.05,
        cropBottomRatio: 0.87,
        width: 3.8,
        height: 5.2,
        isBgPixel: blueSky,
      },
      {
        imageUrl: '/assets/aistudio/images_f8fd1629.jpg',
        cropLeftRatio: 0.1,
        cropRightRatio: 0.89,
        cropTopRatio: 0.145,
        cropBottomRatio: 0.5,
        width: 5.8,
        height: 3.0,
        isBgPixel: (r: number, g: number, b: number, _nx: number, ny: number) => {
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          const isRedFlag = r > g + 24 && r > 120;
          return ny < 0.34 && luma < 128 && !isRedFlag;
        },
      },
      {
        imageUrl: '/assets/aistudio/thap-po-sah-inu-2_8ef2b55b.jpg',
        cropLeftRatio: 0.3,
        cropRightRatio: 0.92,
        cropTopRatio: 0.11,
        cropBottomRatio: 0.84,
        width: 4.5,
        height: 4.3,
        isBgPixel: (r: number, g: number, b: number, nx: number, ny: number) =>
          blueSky(r, g, b) || (ny < 0.32 && nx > 0.58 && g >= r - 2),
      },
      {
        imageUrl: '/assets/aistudio/images_470de7c3.jpg',
        cropLeftRatio: 0.04,
        cropRightRatio: 0.96,
        cropTopRatio: 0.33,
        cropBottomRatio: 0.77,
        width: 6.0,
        height: 3.1,
        isBgPixel: neutralBrightSky,
      },
      {
        imageUrl: '/assets/aistudio/images_f09dc646.jpg',
        cropLeftRatio: 0.31,
        cropRightRatio: 0.68,
        cropTopRatio: 0.255,
        cropBottomRatio: 0.805,
        width: 3.8,
        height: 4.2,
        isBgPixel: (r: number, g: number, b: number) => {
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          const spread = Math.max(r, g, b) - Math.min(r, g, b);
          return luma > 158 && spread < 28;
        },
      },
      {
        imageUrl: '/assets/aistudio/Anh-Hoang-Thanh-Than-11_a2f542ea.jpg',
        cropLeftRatio: 0.01,
        cropRightRatio: 0.99,
        cropTopRatio: 0.23,
        cropBottomRatio: 0.83,
        width: 6.0,
        height: 3.5,
        isBgPixel: blueSky,
      },
      {
        imageUrl: '/assets/aistudio/van-mieu-quoc-tu-giam-miti.vn6_b002a3e84488487bb217bd7689f80e19_9ec40318.webp',
        cropLeftRatio: 0.22,
        cropRightRatio: 0.76,
        cropTopRatio: 0.03,
        cropBottomRatio: 0.89,
        width: 4.6,
        height: 4.3,
        isBgPixel: neutralBrightSky,
      },
      {
        imageUrl: '/assets/aistudio/images_ec10b9c5.jpg',
        cropLeftRatio: 0.14,
        cropRightRatio: 0.84,
        cropTopRatio: 0.1,
        cropBottomRatio: 0.92,
        width: 4.8,
        height: 4.1,
        isBgPixel: neutralBrightSky,
      },
      {
        imageUrl: '/assets/aistudio/9d11f499434319f1931e7dd558e52554_7617bddd.jpg',
        cropLeftRatio: 0.06,
        cropRightRatio: 0.86,
        cropTopRatio: 0.06,
        cropBottomRatio: 0.89,
        width: 4.1,
        height: 5.2,
        isBgPixel: blueSky,
      },
      {
        imageUrl: '/assets/aistudio/23A04032-2_1ce8af8e.jpg',
        cropLeftRatio: 0.04,
        cropRightRatio: 0.95,
        cropTopRatio: 0.1,
        cropBottomRatio: 0.79,
        width: 6.0,
        height: 3.3,
        isBgPixel: blueSky,
      },
      {
        imageUrl: '/assets/aistudio/lang-bac_8b2848fb.jpg',
        cropLeftRatio: 0.16,
        cropRightRatio: 0.82,
        cropTopRatio: 0.01,
        cropBottomRatio: 0.86,
        width: 5.6,
        height: 3.8,
        isBgPixel: neutralBrightSky,
      },
      {
        imageUrl: '/assets/aistudio/h1-17043512183492038699419_ae279198.png',
        cropLeftRatio: 0.03,
        cropRightRatio: 0.96,
        cropTopRatio: 0.25,
        cropBottomRatio: 0.64,
        width: 6.0,
        height: 3.2,
        isBgPixel: blueSky,
      },
    ];

    const roadsideMonuments: RoadsideMonumentResult[] = monumentSpecs.map((spec, idx) => {
      const side = idx % 2 === 0 ? -1 : 1;
      const zPos = -14 - idx * 6; // Even 6m alternating spacing centered at z = -50: -14 (L), -20 (R) ... -86 (L)
      const monument = createRoadsideMonument({
        ...spec,
        anisotropy: maxAnisotropy,
      });
      monument.group.position.set(side * 9.2, 0, zPos);
      monument.group.rotation.y = side * -0.42; // Angle gently inward toward the imperial avenue
      scene.add(monument.group);
      return monument;
    });

    // --------------------------------------------------------
    // 3C. Glowing Imperial Courtyard Lanterns guiding from Ngọ Môn to Điện Thái Hòa
    // --------------------------------------------------------
    const guidingLanternFactory = createGuidingLanternFactory(maxAnisotropy);
    const guidingLanterns: GuidingLanternHandle[] = [];
    const bridgeLanternZ = [11, 3, -5];
    const courtyardLanternZ = [16.5, -14, -24, -34, -44, -54, -64, -74, -84, -91.5];

    for (const side of [-1, 1] as const) {
      for (const bz of bridgeLanternZ) {
        const handle = guidingLanternFactory.createLantern({
          side,
          zPos: bz,
          style: 'bridge_post',
        });
        handle.group.position.set(side * 2.85, 1.15, bz);
        scene.add(handle.group);
        guidingLanterns.push(handle);
      }

      for (const cz of courtyardLanternZ) {
        const handle = guidingLanternFactory.createLantern({
          side,
          zPos: cz,
          style: 'pillar',
        });
        handle.group.position.set(side * 3.45, 0, cz);
        scene.add(handle.group);
        guidingLanterns.push(handle);
      }
    }

    // Imperial Flag Banners along Sân Đại Triều Nghi (swaying softly)
    const bannerClothMeshes: THREE.Mesh[] = [];
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x6b1616, roughness: 0.5 });
    const flagColors = [0xd97706, 0xb91c1c, 0x1d4ed8, 0x047857];
    for (const side of [-1, 1]) {
      [-28, -52, -76].forEach((bz, idx) => {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 6.2, 8), poleMat);
        pole.position.set(side * 13.5, 3.1, bz);
        scene.add(pole);

        const cloth = new THREE.Mesh(
          new THREE.PlaneGeometry(1.1, 2.6, 4, 6),
          new THREE.MeshStandardMaterial({
            color: flagColors[idx % flagColors.length],
            side: THREE.DoubleSide,
            roughness: 0.7,
          }),
        );
        cloth.position.set(side * 13.5 - side * 0.6, 4.7, bz);
        scene.add(cloth);
        bannerClothMeshes.push(cloth);
      });
    }

    // Other Court Mandarins standing along Sân Đại Triều Nghi (distinct colors from player!)
    const otherRobePalettes = [
      { robeHex: '#7f1d1d', trimHex: '#d4a843', badgeHex: '#1e3a8a' }, // Đỏ tía
      { robeHex: '#1e3a8a', trimHex: '#eab308', badgeHex: '#7f1d1d' }, // Lam thẫm
      { robeHex: '#581c87', trimHex: '#e2b857', badgeHex: '#065f46' }, // Tím trầm
      { robeHex: '#78350f', trimHex: '#d97706', badgeHex: '#991b1b' }, // Nâu gụ
      { robeHex: '#92400e', trimHex: '#fcd34d', badgeHex: '#7c2d12' }, // Vàng đất sẫm
      { robeHex: '#312e81', trimHex: '#d4a843', badgeHex: '#4c1d95' }, // Chàm hoàng triều
    ];

    const courtyardMandarinZ = [-18, -32, -46, -60, -74, -84];
    courtyardMandarinZ.forEach((mz, idx) => {
      for (const side of [-1, 1]) {
        const pal = otherRobePalettes[(idx + (side > 0 ? 1 : 0)) % otherRobePalettes.length];
        const m = createMandarinFigure(pal, maxAnisotropy);
        m.position.set(side * 4.6, 0, mz);
        m.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
        scene.add(m);
      }
    });

    // Two ceremonial ranks of Court Mandarins (20 Quan Đại Thần) inside Điện Thái Hòa
    const hallInnerRankZ = [-104.0, -107.6, -111.2, -114.8, -118.4];
    hallInnerRankZ.forEach((hz, idx) => {
      for (const side of [-1, 1]) {
        const pal = otherRobePalettes[(idx + (side > 0 ? 2 : 0)) % otherRobePalettes.length];
        const m = createMandarinFigure({ ...pal, bowAngle: 0.14 }, maxAnisotropy);
        m.position.set(side * 3.15, 1.52, hz);
        m.rotation.y = side > 0 ? -Math.PI * 0.68 : Math.PI * 0.68;
        scene.add(m);
      }
    });

    const hallOuterRankZ = [-105.4, -109.0, -112.6, -116.2, -119.8];
    hallOuterRankZ.forEach((hz, idx) => {
      for (const side of [-1, 1]) {
        const pal = otherRobePalettes[(idx + (side > 0 ? 4 : 1)) % otherRobePalettes.length];
        const m = createMandarinFigure({ ...pal, bowAngle: 0.12 }, maxAnisotropy);
        m.position.set(side * 5.25, 1.52, hz);
        m.rotation.y = side > 0 ? -Math.PI * 0.62 : Math.PI * 0.62;
        scene.add(m);
      }
    });

    // 2 Imperial Guards (Thị Vệ) flanking the Dragon Throne Dais
    for (const side of [-1, 1]) {
      const guard = createImperialGuardFigure(maxAnisotropy);
      guard.position.set(side * 3.85, 1.52, -121.8);
      guard.rotation.y = side > 0 ? -0.22 : 0.22;
      scene.add(guard);
    }

    // --------------------------------------------------------
    // 4. Player Mandarin Character (Ngọc Bích Jade-Teal Áo Thụng!)
    //    Visible in 3rd-person inside Điện Thái Hòa (Scene 4)
    // --------------------------------------------------------
    const playerMandarin = createMandarinFigure(
      {
        robeHex: '#0d7a6f', // Distinct Ngọc Bích Jade Teal
        trimHex: '#f5c542', // Royal gold trim
        badgeHex: '#fef3c7', // Ivory crane badge
        isPlayer: true,
        bowAngle: 0.2,
      },
      maxAnisotropy,
    );
    playerMandarin.position.set(0, 1.52, -111.5);
    playerMandarin.rotation.y = Math.PI; // Facing the Emperor at z = -121.3
    playerMandarin.visible = false;
    scene.add(playerMandarin);

    // --------------------------------------------------------
    // 5. First-Person Áo Thụng Sleeves Rig attached to Camera
    //    So player clearly sees their distinct Ngọc Bích áo thụng in 1st-person!
    // --------------------------------------------------------
    const fpSleevesGroup = new THREE.Group();
    const fpRobeTex = createAoThungTexture('#0d7a6f', '#f5c542', '#fef3c7', maxAnisotropy);
    const fpRobeMat = new THREE.MeshStandardMaterial({
      map: fpRobeTex,
      roughness: 0.58,
      metalness: 0.12,
    });
    const fpGoldCuffMat = new THREE.MeshStandardMaterial({
      color: 0xf5c542,
      roughness: 0.35,
      metalness: 0.65,
    });

    const leftFpSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.14, 0.48, 12), fpRobeMat);
    leftFpSleeve.position.set(-0.34, -0.34, -0.48);
    leftFpSleeve.rotation.set(1.05, 0.25, -0.45);
    const leftCuff = new THREE.Mesh(new THREE.CylinderGeometry(0.142, 0.145, 0.045, 12), fpGoldCuffMat);
    leftCuff.position.set(-0.22, -0.25, -0.62);
    leftCuff.rotation.copy(leftFpSleeve.rotation);

    const rightFpSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.14, 0.48, 12), fpRobeMat);
    rightFpSleeve.position.set(0.34, -0.34, -0.48);
    rightFpSleeve.rotation.set(1.05, -0.25, 0.45);
    const rightCuff = new THREE.Mesh(new THREE.CylinderGeometry(0.142, 0.145, 0.045, 12), fpGoldCuffMat);
    rightCuff.position.set(0.22, -0.25, -0.62);
    rightCuff.rotation.copy(rightFpSleeve.rotation);

    fpSleevesGroup.add(leftFpSleeve, leftCuff, rightFpSleeve, rightCuff);
    camera.add(fpSleevesGroup);
    scene.add(camera);

    // --------------------------------------------------------
    // 6. Warm Atmospheric Dust Motes & Celebration Particles
    // --------------------------------------------------------
    const sunMoteTex = createSunMoteTexture();

    // Drifting golden dust motes floating through the sunlit corridor (Ngọ Môn -> Điện Thái Hòa)
    const moteCount = 160;
    const motePos = new Float32Array(moteCount * 3);
    const moteSpeed = new Float32Array(moteCount);
    for (let i = 0; i < moteCount; i++) {
      motePos[i * 3] = (Math.random() - 0.5) * 26;
      motePos[i * 3 + 1] = 0.6 + Math.random() * 6.4;
      motePos[i * 3 + 2] = -95 + Math.random() * 118;
      moteSpeed[i] = 0.22 + Math.random() * 0.35;
    }
    const moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
    const moteMat = new THREE.PointsMaterial({
      map: sunMoteTex,
      color: 0xffebb8,
      size: 0.22,
      transparent: true,
      opacity: 0.68,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const courtyardSunMotes = new THREE.Points(moteGeo, moteMat);
    scene.add(courtyardSunMotes);

    // Subtle Golden Celebration Particles inside Điện Thái Hòa
    const petalCount = 70;
    const petalPos = new Float32Array(petalCount * 3);
    for (let i = 0; i < petalCount; i++) {
      petalPos[i * 3] = (Math.random() - 0.5) * 16;
      petalPos[i * 3 + 1] = 2 + Math.random() * 4.2;
      petalPos[i * 3 + 2] = -124 + Math.random() * 24;
    }
    const petalGeo = new THREE.BufferGeometry();
    petalGeo.setAttribute('position', new THREE.BufferAttribute(petalPos, 3));
    const petalMat = new THREE.PointsMaterial({
      map: sunMoteTex,
      color: 0xfde047,
      size: 0.24,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const celebrationPetals = new THREE.Points(petalGeo, petalMat);
    celebrationPetals.visible = false;
    scene.add(celebrationPetals);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // --------------------------------------------------------
    // 7. Mouse Drag Look-Around in First-Person View
    // --------------------------------------------------------
    let lookYaw = 0;
    let lookPitch = 0;
    let isDragging = false;
    let lastPtrX = 0;
    let lastPtrY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      lastPtrX = e.clientX;
      lastPtrY = e.clientY;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastPtrX;
      const dy = e.clientY - lastPtrY;
      lastPtrX = e.clientX;
      lastPtrY = e.clientY;
      lookYaw = THREE.MathUtils.clamp(lookYaw - dx * 0.0032, -0.75, 0.75);
      lookPitch = THREE.MathUtils.clamp(lookPitch - dy * 0.0025, -0.25, 0.35);
    };
    const onPointerUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Resize listener
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = Math.max(1, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // --------------------------------------------------------
    // 8. Animation State & Render Loop
    // --------------------------------------------------------
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    let currentCamX = 0;
    let currentCamY = 2.4;
    let currentCamZ = 42;
    let currentLookX = 0;
    let currentLookY = 3.2;
    let currentLookZ = 20;
    let ngoMonDoorAngle = 0;
    let hallDoorAngle = 0;
    let walkBobPhase = 0;
    let lastKnownSteps = 0;
    let prevPhase: GamePhase = stateRef.current.phase;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const status = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
        if (status === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();
      const st = stateRef.current;

      // Animate imperial banners gently
      bannerClothMeshes.forEach((mesh, idx) => {
        mesh.rotation.y = Math.sin(elapsed * 2.2 + idx) * 0.14;
      });

      // Animate guiding courtyard lanterns: gentle breeze sway + subtle forward glow ripple toward Điện Thái Hòa
      for (let i = 0; i < guidingLanterns.length; i++) {
        const l = guidingLanterns[i];
        const wave = 0.5 + 0.5 * Math.sin(elapsed * 2.6 + l.zPos * 0.16);
        l.silkMaterial.emissiveIntensity = 1.25 + wave * 0.55;
        l.glowSprite.material.opacity = 0.34 + wave * 0.16;
        const haloScale = 1.42 + wave * 0.22;
        l.glowSprite.scale.set(haloScale, haloScale, haloScale);
        if (l.groundGlow) {
          (l.groundGlow.material as THREE.MeshBasicMaterial).opacity = 0.13 + wave * 0.07;
        }
        l.lanternPivot.rotation.z = Math.sin(elapsed * 1.45 + l.phaseOffset) * 0.045;
        l.lanternPivot.rotation.x = Math.cos(elapsed * 1.15 + l.phaseOffset) * 0.025;
      }

      // Drifting golden dust motes along sunlit corridor
      if (st.phase !== 'dialogue' && st.phase !== 'reward') {
        const moteAttr = courtyardSunMotes.geometry.getAttribute('position') as THREE.BufferAttribute;
        for (let i = 0; i < moteCount; i++) {
          let mx = moteAttr.getX(i) - delta * 0.18 * moteSpeed[i];
          let my = moteAttr.getY(i) - delta * 0.14 * moteSpeed[i];
          if (my < 0.5) my = 6.8;
          if (mx < -13.5) mx = 13.5;
          moteAttr.setXY(i, mx, my);
        }
        moteAttr.needsUpdate = true;
      }

      // Gate & Hall Doors animation
      const targetNgoMonAngle = st.gatesOpen ? 1.48 : 0;
      ngoMonDoorAngle = THREE.MathUtils.damp(ngoMonDoorAngle, targetNgoMonAngle, 3.2, delta);
      ngoMon.leftDoorPivot.rotation.y = ngoMonDoorAngle;
      ngoMon.rightDoorPivot.rotation.y = -ngoMonDoorAngle;

      const targetHallAngle = st.hallDoorsOpen ? 1.48 : 0;
      hallDoorAngle = THREE.MathUtils.damp(hallDoorAngle, targetHallAngle, 3.2, delta);
      dienThaiHoaFacade.leftDoorPivot.rotation.y = hallDoorAngle;
      dienThaiHoaFacade.rightDoorPivot.rotation.y = -hallDoorAngle;

      // Recenter look yaw smoothly if user isn't dragging during scripted transitions
      if (st.phase === 'entering' || st.phase === 'entering_hall' || st.phase === 'reward') {
        lookYaw = THREE.MathUtils.damp(lookYaw, 0, 4, delta);
        lookPitch = THREE.MathUtils.damp(lookPitch, 0, 4, delta);
      }

      // Compute step bobbing when player advances
      if (st.totalStepsMoved !== lastKnownSteps) {
        lastKnownSteps = st.totalStepsMoved;
        walkBobPhase += Math.PI;
      }
      const stepBob =
        st.phase === 'walking' || st.phase === 'entering'
          ? Math.abs(Math.sin(walkBobPhase + elapsed * (st.isWalkingStep ? 9 : 0))) *
            (st.isWalkingStep ? 0.08 : 0)
          : 0;

      // Visibility & Camera Target per Phase
      if (st.phase === 'entry') {
        fpSleevesGroup.visible = false;
        playerMandarin.visible = false;
        celebrationPetals.visible = false;
        _desiredCamPos.set(Math.sin(elapsed * 0.16) * 7, 3.8, 46);
        _lookTarget.set(0, 4.4, 22);
      } else if (st.phase === 'dialogue') {
        // First-person inside Điện Thái Hòa facing the Emperor on Dragon Throne
        fpSleevesGroup.visible = true;
        playerMandarin.visible = false;
        celebrationPetals.visible = false;
        _desiredCamPos.set(0, 3.22, -111.5);
        _lookTarget.set(Math.sin(lookYaw) * 8, 3.6 + lookPitch * 5, -121.3);
      } else if (st.phase === 'ngo_mon') {
        fpSleevesGroup.visible = true;
        playerMandarin.visible = false;
        celebrationPetals.visible = false;
        _desiredCamPos.set(0, 2.3, 41.5);
        _lookTarget.set(Math.sin(lookYaw) * 6, 4.6 + lookPitch * 4, 22);
      } else if (st.phase === 'entering') {
        fpSleevesGroup.visible = true;
        playerMandarin.visible = false;
        celebrationPetals.visible = false;
        _desiredCamPos.set(0, 1.78 + Math.abs(Math.sin(elapsed * 8)) * 0.05, 17.5);
        _lookTarget.set(0, 2.2, -30);
      } else if (st.phase === 'walking' || st.phase === 'question') {
        fpSleevesGroup.visible = true;
        playerMandarin.visible = false;
        celebrationPetals.visible = false;

        const journeyProgress = Math.min(1, st.totalStepsMoved / Math.max(1, st.maxSteps));
        const targetZ = 17.5 - journeyProgress * 101.5;
        _desiredCamPos.set(0, 1.75 + stepBob, targetZ);
        _lookTarget.set(
          Math.sin(lookYaw) * 14,
          2.25 + lookPitch * 7,
          targetZ - 14 * Math.cos(lookYaw),
        );
      } else if (st.phase === 'entering_hall') {
        fpSleevesGroup.visible = true;
        playerMandarin.visible = false;
        celebrationPetals.visible = false;
        _desiredCamPos.set(0, 3.25 + Math.abs(Math.sin(elapsed * 7)) * 0.04, -108);
        _lookTarget.set(0, 3.3, -121.5);
      } else {
        // 'reward' -> THIRD-PERSON PANORAMIC VIEW inside Điện Thái Hòa!
        fpSleevesGroup.visible = false;
        playerMandarin.visible = true;
        celebrationPetals.visible = true;

        // Gentle sweeping third-person orbit inside the nave showing Emperor, 20+ mandarins, wooden floor & player
        const orbitAngle = Math.sin(elapsed * 0.28) * 0.42;
        _desiredCamPos.set(
          Math.sin(orbitAngle) * 4.6,
          4.55 + Math.sin(elapsed * 0.35) * 0.2,
          -101.8,
        );
        _lookTarget.set(0, 2.7, -116.2);

        // Emperor raises golden decree scroll during commendation
        const targetRaise = st.isCommended ? -0.65 : -0.15;
        emperor.rightArmPivot.rotation.x = THREE.MathUtils.damp(
          emperor.rightArmPivot.rotation.x,
          targetRaise,
          3.0,
          delta,
        );

        // Drift celebration golden embers
        const posAttr = celebrationPetals.geometry.getAttribute('position') as THREE.BufferAttribute;
        for (let i = 0; i < petalCount; i++) {
          let py = posAttr.getY(i) - delta * 0.55;
          if (py < 1.8) py = 5.8;
          posAttr.setY(i, py);
        }
        posAttr.needsUpdate = true;
      }

      const isCutsceneJump =
        prevPhase !== st.phase &&
        (st.phase === 'dialogue' || st.phase === 'ngo_mon' || st.phase === 'entry');
      prevPhase = st.phase;

      if (isCutsceneJump) {
        currentCamX = _desiredCamPos.x;
        currentCamY = _desiredCamPos.y;
        currentCamZ = _desiredCamPos.z;
        currentLookX = _lookTarget.x;
        currentLookY = _lookTarget.y;
        currentLookZ = _lookTarget.z;
      } else {
        // Smooth exponential camera damping along physical Imperial Path
        const dampSpeed = st.phase === 'entering' || st.phase === 'reward' ? 2.4 : 6.2;
        currentCamX = THREE.MathUtils.damp(currentCamX, _desiredCamPos.x, dampSpeed, delta);
        currentCamY = THREE.MathUtils.damp(currentCamY, _desiredCamPos.y, dampSpeed, delta);
        currentCamZ = THREE.MathUtils.damp(currentCamZ, _desiredCamPos.z, dampSpeed, delta);

        currentLookX = THREE.MathUtils.damp(currentLookX, _lookTarget.x, dampSpeed + 1.5, delta);
        currentLookY = THREE.MathUtils.damp(currentLookY, _lookTarget.y, dampSpeed + 1.5, delta);
        currentLookZ = THREE.MathUtils.damp(currentLookZ, _lookTarget.z, dampSpeed + 1.5, delta);
      }

      camera.position.set(currentCamX, currentCamY, currentCamZ);
      camera.lookAt(currentLookX, currentLookY, currentLookZ);

      // Gentle breathing / walking sway on first-person Áo thụng sleeves
      if (fpSleevesGroup.visible) {
        fpSleevesGroup.position.y = Math.sin(elapsed * 2.2) * 0.008 - stepBob * 0.25;
        fpSleevesGroup.rotation.z = Math.sin(elapsed * 1.4) * 0.012;
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry?.dispose();
          if (Array.isArray(m.material)) {
            m.material.forEach((mat) => mat.dispose());
          } else {
            m.material?.dispose();
          }
        }
      });
      ngoMon.dispose();
      dienThaiHoaFacade.dispose();
      realTreeFactory.dispose();
      roadsideMonuments.forEach((m) => m.dispose());
      guidingLanterns.forEach((l) => {
        l.glowSprite.material.dispose();
      });
      guidingLanternFactory.dispose();
      sunMoteTex.dispose();
      envTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full select-none cursor-grab active:cursor-grabbing"
      aria-label="Không gian 3D Kinh thành Huế Triều Nguyễn"
    />
  );
};
