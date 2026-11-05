'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { HeroData, HeroTierRank } from '@/lib/animeClash/types';

interface Anime3DViewerProps {
  hero: HeroData;
  selectedRank: HeroTierRank;
  currentPose: 'combat' | 'ultimate' | 'victory' | 'meditate';
  rotationAngle: number;
  onAngleChange: (angle: number) => void;
  autoRotate: boolean;
  zoomLevel?: number;
}

export default function Anime3DViewer({
  hero,
  selectedRank,
  currentPose,
  rotationAngle,
  onAngleChange,
  autoRotate,
  zoomLevel = 1.0
}: Anime3DViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const lastMouseXRef = useRef(0);
  const currentAngleRef = useRef(rotationAngle);
  const autoRotateRef = useRef(autoRotate);
  const currentPoseRef = useRef(currentPose);
  const selectedRankRef = useRef(selectedRank);

  const [modelType, setModelType] = useState<'procedural_anime' | 'glb_mesh'>('procedural_anime');
  const [fps, setFps] = useState(60);

  useEffect(() => {
    currentAngleRef.current = rotationAngle;
  }, [rotationAngle]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    currentPoseRef.current = currentPose;
  }, [currentPose]);

  useEffect(() => {
    selectedRankRef.current = selectedRank;
  }, [selectedRank]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 420;
    const height = container.clientHeight || 460;

    // 1. Scene & Atmosphere
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060a14, 0.06);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.25, 3.4 / (zoomLevel || 1.0));
    camera.lookAt(0, 0.9, 0);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.replaceChildren(renderer.domElement);

    // 4. Anime Studio Lighting
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff8ee, 2.4);
    keyLight.position.set(2.5, 4.0, 3.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    fillLight.position.set(-3.0, 2.0, 2.0);
    scene.add(fillLight);

    // Dynamic Rim Light for Iconic Shonen Anime Edge Highlights
    const heroMainColor = new THREE.Color(hero.color || '#38bdf8');
    const heroAccentColor = new THREE.Color(hero.accentColor || '#fbbf24');
    const rimLight = new THREE.DirectionalLight(heroMainColor, 3.5);
    rimLight.position.set(0, 2.5, -3.2);
    scene.add(rimLight);

    // 5. Hero Pedestal / Ground Rune Ring
    const pedestalGroup = new THREE.Group();
    scene.add(pedestalGroup);

    // Stone Bevel Base
    const baseGeo = new THREE.CylinderGeometry(1.2, 1.32, 0.08, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x090f1d,
      roughness: 0.5,
      metalness: 0.8
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.04;
    baseMesh.receiveShadow = true;
    pedestalGroup.add(baseMesh);

    // Glowing Inner Disc
    const innerDiscGeo = new THREE.CylinderGeometry(1.12, 1.12, 0.02, 48);
    const innerDiscMat = new THREE.MeshStandardMaterial({
      color: 0x030712,
      roughness: 0.2,
      metalness: 0.6,
      emissive: heroMainColor,
      emissiveIntensity: 0.35
    });
    const innerDisc = new THREE.Mesh(innerDiscGeo, innerDiscMat);
    innerDisc.position.y = 0.01;
    innerDisc.receiveShadow = true;
    pedestalGroup.add(innerDisc);

    // Outer Rune Ring
    const ringGeo = new THREE.RingGeometry(0.96, 1.08, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: heroAccentColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.022;
    pedestalGroup.add(ringMesh);

    // 6. Character Root Node (Rotates horizontally with mouse/touch drag)
    const characterRoot = new THREE.Group();
    scene.add(characterRoot);

    // Try loading external .glb if provided or available
    let mixer: THREE.AnimationMixer | null = null;
    let glbLoaded = false;
    const targetGlb = hero.model3dUrl || (hero.franchise === 'one_piece' ? null : null);

    if (targetGlb) {
      const loader = new GLTFLoader();
      loader.load(
        targetGlb,
        (gltf) => {
          glbLoaded = true;
          setModelType('glb_mesh');
          const model = gltf.scene;

          // Normalize Scale & Position
          const box = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3();
          box.getSize(size);
          const maxDim = Math.max(size.x, size.y, size.z);
          const scaleFactor = 1.75 / (maxDim || 1);
          model.scale.setScalar(scaleFactor);

          box.setFromObject(model);
          model.position.y = -box.min.y;

          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          characterRoot.add(model);

          if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
          }
        },
        undefined,
        () => {
          // Fallback to high-definition procedural anime guardian
          glbLoaded = false;
        }
      );
    }

    // 7. HIGH-DEFINITION PROCEDURAL CEL-SHADED ANIME GUARDIAN RIG
    // (Used whenever a dedicated .glb is loading or as the primary character rig)
    const rigGroup = new THREE.Group();
    characterRoot.add(rigGroup);

    // Generate Expressive Anime Face Texture dynamically on a Canvas
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = 512;
    faceCanvas.height = 512;
    const fctx = faceCanvas.getContext('2d');
    if (fctx) {
      // Skin tone gradient
      fctx.fillStyle = '#fce4cd';
      fctx.fillRect(0, 0, 512, 512);

      // Anime Blush Cheeks
      fctx.fillStyle = 'rgba(248, 113, 113, 0.35)';
      fctx.beginPath();
      fctx.ellipse(140, 290, 42, 20, 0, 0, Math.PI * 2);
      fctx.ellipse(372, 290, 42, 20, 0, 0, Math.PI * 2);
      fctx.fill();

      // Sharp Anime Eyes (Left and Right)
      const drawEye = (cx: number, cy: number, isRight: boolean) => {
        // Eyeliner / upper lash line
        fctx.fillStyle = '#0f172a';
        fctx.beginPath();
        fctx.moveTo(cx - 55, cy);
        fctx.quadraticCurveTo(cx, cy - 35, cx + 55, cy - 8);
        fctx.quadraticCurveTo(cx, cy - 25, cx - 55, cy);
        fctx.fill();

        // Eye white
        fctx.fillStyle = '#ffffff';
        fctx.beginPath();
        fctx.ellipse(cx, cy + 6, 44, 28, 0, 0, Math.PI * 2);
        fctx.fill();

        // Iris (Colored with hero accent)
        const eyeColor = hero.id === 'gojo' ? '#38bdf8' : hero.color || '#ea580c';
        const grad = fctx.createRadialGradient(cx, cy + 4, 4, cx, cy + 6, 26);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, eyeColor);
        grad.addColorStop(1, '#090d16');
        fctx.fillStyle = grad;
        fctx.beginPath();
        fctx.ellipse(cx + (isRight ? -4 : 4), cy + 6, 26, 26, 0, 0, Math.PI * 2);
        fctx.fill();

        // Pupil & Catchlight reflection
        fctx.fillStyle = '#000000';
        fctx.beginPath();
        fctx.arc(cx + (isRight ? -4 : 4), cy + 6, 12, 0, Math.PI * 2);
        fctx.fill();

        fctx.fillStyle = '#ffffff';
        fctx.beginPath();
        fctx.arc(cx - 6, cy - 2, 8, 0, Math.PI * 2);
        fctx.arc(cx + 8, cy + 12, 4, 0, Math.PI * 2);
        fctx.fill();

        // Lower eyelid line
        fctx.strokeStyle = '#334155';
        fctx.lineWidth = 4;
        fctx.beginPath();
        fctx.ellipse(cx, cy + 22, 28, 12, 0, 0.2, Math.PI - 0.2);
        fctx.stroke();

        // Anime Eyebrows
        fctx.fillStyle = '#1e293b';
        fctx.beginPath();
        fctx.moveTo(cx - 50, cy - 50);
        fctx.quadraticCurveTo(cx, cy - 65, cx + 50, cy - 45);
        fctx.lineTo(cx + 45, cy - 40);
        fctx.quadraticCurveTo(cx, cy - 56, cx - 48, cy - 44);
        fctx.fill();
      };

      drawEye(170, 240, false);
      drawEye(342, 240, true);

      // Anime Nose contour
      fctx.fillStyle = '#e29e71';
      fctx.beginPath();
      fctx.moveTo(256, 300);
      fctx.lineTo(262, 318);
      fctx.lineTo(252, 318);
      fctx.closePath();
      fctx.fill();

      // Confident smirk/smile
      fctx.strokeStyle = '#0f172a';
      fctx.lineWidth = 5;
      fctx.beginPath();
      fctx.moveTo(226, 360);
      fctx.quadraticCurveTo(256, 385, 290, 355);
      fctx.stroke();

      // White fanged grin glint
      fctx.fillStyle = '#ffffff';
      fctx.beginPath();
      fctx.moveTo(238, 362);
      fctx.quadraticCurveTo(256, 376, 276, 360);
      fctx.closePath();
      fctx.fill();
    }
    const faceTexture = new THREE.CanvasTexture(faceCanvas);
    faceTexture.colorSpace = THREE.SRGBColorSpace;

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({
      map: faceTexture,
      roughness: 0.55,
      metalness: 0.05
    });

    const plainSkinMat = new THREE.MeshStandardMaterial({
      color: 0xfce4cd,
      roughness: 0.65,
      metalness: 0.05
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: heroIdHairCol(hero.id),
      roughness: 0.35,
      metalness: 0.15
    });

    const tacticalSuitMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.55,
      metalness: 0.3
    });

    const heroJacketMat = new THREE.MeshStandardMaterial({
      color: heroMainColor,
      roughness: 0.4,
      metalness: 0.35,
      emissive: heroMainColor,
      emissiveIntensity: 0.2
    });

    const metallicWeaponMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.15,
      metalness: 0.95,
      emissive: heroMainColor,
      emissiveIntensity: 0.25
    });

    // SKELETAL HIERARCHY
    const pelvis = new THREE.Group();
    pelvis.position.y = 0.72;
    rigGroup.add(pelvis);

    const torso = new THREE.Group();
    pelvis.add(torso);

    // Anatomical Tapered Torso (V-taper)
    const torsoGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.44, 24);
    const torsoMesh = new THREE.Mesh(torsoGeo, tacticalSuitMat);
    torsoMesh.position.y = 0.22;
    torsoMesh.castShadow = true;
    torso.add(torsoMesh);

    // High-Tech Anime Tactical Vest & High Storm Collar
    const vestGeo = new THREE.CylinderGeometry(0.26, 0.2, 0.38, 24);
    const vestMesh = new THREE.Mesh(vestGeo, heroJacketMat);
    vestMesh.position.y = 0.24;
    vestMesh.castShadow = true;
    torso.add(vestMesh);

    const stormCollarGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.12, 24, 1, true);
    const stormCollar = new THREE.Mesh(stormCollarGeo, heroJacketMat);
    stormCollar.position.y = 0.46;
    torso.add(stormCollar);

    // Lower Coat Flaps (Fluttering in the wind)
    const flapGeo = new THREE.CylinderGeometry(0.21, 0.34, 0.32, 16, 1, true, -Math.PI * 0.7, Math.PI * 1.4);
    const flapMat = new THREE.MeshStandardMaterial({
      color: heroMainColor,
      side: THREE.DoubleSide,
      roughness: 0.4
    });
    const coatFlap = new THREE.Mesh(flapGeo, flapMat);
    coatFlap.position.y = -0.12;
    pelvis.add(coatFlap);

    // Neck & Head
    const neckGeo = new THREE.CylinderGeometry(0.07, 0.08, 0.14, 16);
    const neck = new THREE.Mesh(neckGeo, plainSkinMat);
    neck.position.y = 0.48;
    torso.add(neck);

    const headGroup = new THREE.Group();
    headGroup.position.y = 0.62;
    torso.add(headGroup);

    // Stylized Anime Head with Chin Taper
    const headGeo = new THREE.SphereGeometry(0.165, 32, 32);
    headGeo.scale(0.9, 1.15, 0.95);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.rotation.y = -Math.PI / 2;
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // 3D Layered Anime Hair
    const hairGroup = new THREE.Group();
    headGroup.add(hairGroup);

    const hairCapGeo = new THREE.SphereGeometry(0.185, 24, 24);
    hairCapGeo.scale(0.94, 1.12, 0.98);
    const hairCap = new THREE.Mesh(hairCapGeo, hairMat);
    hairCap.position.set(0, 0.04, -0.02);
    hairGroup.add(hairCap);

    // Dynamic Multi-layered Anime Hair Spikes (Front, Side & Crown)
    const spikePositions = [
      { pos: [0, 0.18, 0.08], rot: [-0.35, 0, 0], scale: [1, 1.3, 1] },
      { pos: [-0.08, 0.16, 0.07], rot: [-0.3, 0, 0.35], scale: [0.9, 1.2, 0.9] },
      { pos: [0.08, 0.16, 0.07], rot: [-0.3, 0, -0.35], scale: [0.9, 1.2, 0.9] },
      { pos: [-0.14, 0.08, 0.04], rot: [-0.1, 0, 0.7], scale: [0.8, 1.1, 0.8] },
      { pos: [0.14, 0.08, 0.04], rot: [-0.1, 0, -0.7], scale: [0.8, 1.1, 0.8] },
      { pos: [-0.06, 0.22, -0.04], rot: [0.2, 0, 0.4], scale: [1, 1.4, 1] },
      { pos: [0.06, 0.22, -0.04], rot: [0.2, 0, -0.4], scale: [1, 1.4, 1] },
      { pos: [0, 0.24, -0.06], rot: [0.35, 0, 0], scale: [1.1, 1.5, 1.1] }
    ];

    spikePositions.forEach((s) => {
      const spGeo = new THREE.ConeGeometry(0.075, 0.22, 5);
      const sp = new THREE.Mesh(spGeo, hairMat);
      sp.position.set(s.pos[0], s.pos[1], s.pos[2]);
      sp.rotation.set(s.rot[0], s.rot[1], s.rot[2]);
      sp.scale.set(s.scale[0], s.scale[1], s.scale[2]);
      hairGroup.add(sp);
    });

    // Special Accessories: Headband / Straw Hat / Scout Cravat
    if (hero.id === 'naruto' || hero.id === 'minato') {
      const bandGeo = new THREE.CylinderGeometry(0.175, 0.175, 0.06, 32, 1, true);
      const bandMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
      const band = new THREE.Mesh(bandGeo, bandMat);
      band.position.y = 0.04;
      headGroup.add(band);

      const metalPlateGeo = new THREE.BoxGeometry(0.12, 0.05, 0.015);
      const metalPlateMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.2 });
      const plate = new THREE.Mesh(metalPlateGeo, metalPlateMat);
      plate.position.set(0, 0.04, 0.17);
      headGroup.add(plate);
    } else if (hero.id === 'luffy') {
      const hatBrimGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.02, 36);
      const hatCrownGeo = new THREE.CylinderGeometry(0.18, 0.2, 0.14, 36);
      const hatMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.8 });
      const hatRibbonMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });

      const hatGroup = new THREE.Group();
      hatGroup.position.set(0, 0.14, -0.04);
      hatGroup.rotation.x = -0.12;

      const brim = new THREE.Mesh(hatBrimGeo, hatMat);
      const crown = new THREE.Mesh(hatCrownGeo, hatMat);
      crown.position.y = 0.07;
      const ribbon = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.185, 0.035, 36), hatRibbonMat);
      ribbon.position.y = 0.025;

      hatGroup.add(brim, crown, ribbon);
      headGroup.add(hatGroup);
    } else if (hero.id === 'levi') {
      // White Ascot Cravat
      const cravatGeo = new THREE.ConeGeometry(0.08, 0.16, 4);
      const cravatMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 });
      const cravat = new THREE.Mesh(cravatGeo, cravatMat);
      cravat.rotation.x = Math.PI;
      cravat.position.set(0, 0.42, 0.16);
      torso.add(cravat);
    }

    // ARMS & WEAPONS
    // Right Shoulder & Arm (Dominant Weapon Arm)
    const rightShoulder = new THREE.Group();
    rightShoulder.position.set(0.27, 0.38, 0);
    torso.add(rightShoulder);

    const rightUpperArmGeo = new THREE.CylinderGeometry(0.065, 0.058, 0.26, 16);
    const rightUpperArm = new THREE.Mesh(rightUpperArmGeo, tacticalSuitMat);
    rightUpperArm.position.y = -0.13;
    rightUpperArm.castShadow = true;
    rightShoulder.add(rightUpperArm);

    const rightElbow = new THREE.Group();
    rightElbow.position.y = -0.26;
    rightShoulder.add(rightElbow);

    const rightForearmGeo = new THREE.CylinderGeometry(0.058, 0.052, 0.26, 16);
    const rightForearm = new THREE.Mesh(rightForearmGeo, plainSkinMat);
    rightForearm.position.y = -0.13;
    rightForearm.castShadow = true;
    rightElbow.add(rightForearm);

    // Right Hand & Weapon Mount
    const rightHandGeo = new THREE.SphereGeometry(0.055, 12, 12);
    const rightHand = new THREE.Mesh(rightHandGeo, plainSkinMat);
    rightHand.position.y = -0.27;
    rightElbow.add(rightHand);

    const weaponGroup = new THREE.Group();
    weaponGroup.position.set(0, -0.27, 0.05);
    rightElbow.add(weaponGroup);

    // Authentic Weapon Geometries
    if (['ichigo', 'zoro', 'levi', 'sanemi'].includes(hero.id)) {
      // Shonen Katana / Cleaver
      const bladeGeo = new THREE.BoxGeometry(0.045, 1.05, 0.014);
      const bladeMesh = new THREE.Mesh(bladeGeo, metallicWeaponMat);
      bladeMesh.position.y = 0.52;
      bladeMesh.castShadow = true;
      weaponGroup.add(bladeMesh);

      // Gold Tsuba (Guard)
      const tsubaGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.015, 16);
      const tsubaMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
      const tsuba = new THREE.Mesh(tsubaGeo, tsubaMat);
      tsuba.position.y = 0.02;
      weaponGroup.add(tsuba);

      // Wrapped Tsuka (Hilt)
      const hiltGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.24, 12);
      const hiltMesh = new THREE.Mesh(hiltGeo, tacticalSuitMat);
      hiltMesh.position.y = -0.1;
      weaponGroup.add(hiltMesh);
    } else {
      // Swirling Chakra Sphere / Flame Fist
      const orbGeo = new THREE.SphereGeometry(0.11, 24, 24);
      const orbMat = new THREE.MeshStandardMaterial({
        color: heroMainColor,
        emissive: heroMainColor,
        emissiveIntensity: 0.8,
        wireframe: true
      });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      weaponGroup.add(orb);
    }

    // Left Shoulder & Arm (Guard Arm)
    const leftShoulder = new THREE.Group();
    leftShoulder.position.set(-0.27, 0.38, 0);
    torso.add(leftShoulder);

    const leftUpperArmGeo = new THREE.CylinderGeometry(0.065, 0.058, 0.26, 16);
    const leftUpperArm = new THREE.Mesh(leftUpperArmGeo, tacticalSuitMat);
    leftUpperArm.position.y = -0.13;
    leftUpperArm.castShadow = true;
    leftShoulder.add(leftUpperArm);

    const leftElbow = new THREE.Group();
    leftElbow.position.y = -0.26;
    leftShoulder.add(leftElbow);

    const leftForearmGeo = new THREE.CylinderGeometry(0.058, 0.052, 0.26, 16);
    const leftForearm = new THREE.Mesh(leftForearmGeo, plainSkinMat);
    leftForearm.position.y = -0.13;
    leftForearm.castShadow = true;
    leftElbow.add(leftForearm);

    const leftHandGeo = new THREE.SphereGeometry(0.055, 12, 12);
    const leftHand = new THREE.Mesh(leftHandGeo, plainSkinMat);
    leftHand.position.y = -0.27;
    leftElbow.add(leftHand);

    // LEGS & COMBAT BOOTS
    // Right Leg
    const rightHip = new THREE.Group();
    rightHip.position.set(0.13, -0.04, 0);
    pelvis.add(rightHip);

    const rightThighGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.36, 16);
    const rightThigh = new THREE.Mesh(rightThighGeo, tacticalSuitMat);
    rightThigh.position.y = -0.18;
    rightThigh.castShadow = true;
    rightHip.add(rightThigh);

    const rightKnee = new THREE.Group();
    rightKnee.position.y = -0.36;
    rightHip.add(rightKnee);

    const rightShinGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.34, 16);
    const rightShin = new THREE.Mesh(rightShinGeo, tacticalSuitMat);
    rightShin.position.y = -0.17;
    rightShin.castShadow = true;
    rightKnee.add(rightShin);

    const rightBootGeo = new THREE.BoxGeometry(0.13, 0.11, 0.22);
    const rightBoot = new THREE.Mesh(rightBootGeo, tacticalSuitMat);
    rightBoot.position.set(0, -0.36, 0.05);
    rightBoot.castShadow = true;
    rightKnee.add(rightBoot);

    // Left Leg
    const leftHip = new THREE.Group();
    leftHip.position.set(-0.13, -0.04, 0);
    pelvis.add(leftHip);

    const leftThighGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.36, 16);
    const leftThigh = new THREE.Mesh(leftThighGeo, tacticalSuitMat);
    leftThigh.position.y = -0.18;
    leftThigh.castShadow = true;
    leftHip.add(leftThigh);

    const leftKnee = new THREE.Group();
    leftKnee.position.y = -0.36;
    leftHip.add(leftKnee);

    const leftShinGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.34, 16);
    const leftShin = new THREE.Mesh(leftShinGeo, tacticalSuitMat);
    leftShin.position.y = -0.17;
    leftShin.castShadow = true;
    leftKnee.add(leftShin);

    const leftBootGeo = new THREE.BoxGeometry(0.13, 0.11, 0.22);
    const leftBoot = new THREE.Mesh(leftBootGeo, tacticalSuitMat);
    leftBoot.position.set(0, -0.36, 0.05);
    leftBoot.castShadow = true;
    leftKnee.add(leftBoot);

    // 8. Dynamic Particle Aura System (Normal / Epic / GOAT Mode)
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleVel = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.3 + Math.random() * 0.75;
      particlePos[i * 3] = Math.cos(angle) * radius;
      particlePos[i * 3 + 1] = Math.random() * 2.0;
      particlePos[i * 3 + 2] = Math.sin(angle) * radius;

      particleVel[i * 3] = (Math.random() - 0.5) * 0.005;
      particleVel[i * 3 + 1] = 0.012 + Math.random() * 0.025;
      particleVel[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
      color: heroMainColor,
      size: 0.06,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 9. Animation & Render Loop
    let animFrameId: number;
    let clock = new THREE.Clock();
    let frameCount = 0;
    let lastFpsTime = performance.now();

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      frameCount++;
      if (performance.now() - lastFpsTime > 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastFpsTime = performance.now();
      }

      // Update GLB Mixer if playing
      if (mixer) {
        mixer.update(delta);
      }

      // Horizontal Drag or Auto-Spin Orbiting
      if (autoRotateRef.current && !isDraggingRef.current) {
        currentAngleRef.current = (currentAngleRef.current + delta * 32) % 360;
        onAngleChange(currentAngleRef.current);
      }

      const rad = (currentAngleRef.current * Math.PI) / 180;
      characterRoot.rotation.y = rad;
      pedestalGroup.rotation.y = rad * 0.2;

      // Real-time Skeletal Pose Animations (When using procedural anime rig)
      if (!glbLoaded) {
        const pose = currentPoseRef.current;
        const breath = Math.sin(elapsed * 2.8) * 0.015;

        // Coat flap wind flutter
        coatFlap.rotation.x = Math.sin(elapsed * 4.5) * 0.12 - 0.08;

        if (pose === 'combat') {
          pelvis.position.y = 0.65 + breath;
          torso.rotation.x = 0.16;
          torso.rotation.y = 0.2;

          rightShoulder.rotation.x = -0.6 + Math.sin(elapsed * 3.2) * 0.05;
          rightShoulder.rotation.z = -0.35;
          rightElbow.rotation.x = -0.9;

          leftShoulder.rotation.x = 0.45;
          leftShoulder.rotation.z = 0.45;
          leftElbow.rotation.x = -1.15;

          rightHip.rotation.x = -0.35;
          rightKnee.rotation.x = 0.55;
          leftHip.rotation.x = 0.25;
          leftKnee.rotation.x = 0.35;
        } else if (pose === 'ultimate') {
          const levitate = Math.sin(elapsed * 4.5) * 0.08 + 0.2;
          pelvis.position.y = 0.72 + levitate;
          torso.rotation.x = -0.15;
          torso.rotation.y = 0;

          rightShoulder.rotation.x = -2.6 + Math.sin(elapsed * 6) * 0.06;
          rightShoulder.rotation.z = -0.3;
          rightElbow.rotation.x = -0.2;

          leftShoulder.rotation.x = -2.6 - Math.sin(elapsed * 6) * 0.06;
          leftShoulder.rotation.z = 0.3;
          leftElbow.rotation.x = -0.2;

          rightHip.rotation.x = 0.15;
          rightKnee.rotation.x = 0.45;
          leftHip.rotation.x = -0.15;
          leftKnee.rotation.x = 0.55;
        } else if (pose === 'victory') {
          pelvis.position.y = 0.72 + breath;
          torso.rotation.x = -0.08;
          torso.rotation.y = -0.15;

          rightShoulder.rotation.x = -2.85;
          rightShoulder.rotation.z = -0.15;
          rightElbow.rotation.x = 0;

          leftShoulder.rotation.x = 0.2;
          leftShoulder.rotation.z = 0.65;
          leftElbow.rotation.x = -1.4;

          rightHip.rotation.x = 0.05;
          leftHip.rotation.x = -0.05;
        } else {
          // Meditate Lotus
          const levitateZen = Math.sin(elapsed * 2.2) * 0.06 + 0.28;
          pelvis.position.y = 0.72 + levitateZen;
          torso.rotation.x = 0;
          torso.rotation.y = 0;

          rightShoulder.rotation.x = 0.25;
          rightShoulder.rotation.z = -0.4;
          rightElbow.rotation.x = -1.2;

          leftShoulder.rotation.x = 0.25;
          leftShoulder.rotation.z = 0.4;
          leftElbow.rotation.x = -1.2;

          rightHip.rotation.x = -1.2;
          rightHip.rotation.z = 0.6;
          rightKnee.rotation.x = 1.6;

          leftHip.rotation.x = -1.2;
          leftHip.rotation.z = -0.6;
          leftKnee.rotation.x = 1.6;
        }
      }

      // Tier Transformation Aura Vibrancy
      const rank = selectedRankRef.current;
      if (rank === 'goat') {
        particleMat.size = 0.095;
        particleMat.opacity = 0.95;
        rimLight.intensity = 4.5;
        innerDiscMat.emissiveIntensity = 0.9;
      } else if (rank === 'epic') {
        particleMat.size = 0.07;
        particleMat.opacity = 0.8;
        rimLight.intensity = 3.2;
        innerDiscMat.emissiveIntensity = 0.5;
      } else {
        particleMat.size = 0.045;
        particleMat.opacity = 0.55;
        rimLight.intensity = 2.2;
        innerDiscMat.emissiveIntensity = 0.3;
      }

      // Particle physics
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += particleVel[i * 3 + 1];
        if (positions[i * 3 + 1] > 2.2) {
          positions[i * 3 + 1] = 0.05;
        }
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      baseGeo.dispose();
      baseMat.dispose();
      innerDiscGeo.dispose();
      innerDiscMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [hero.id, hero.color, hero.accentColor, zoomLevel]);

  // Horizontal Mouse & Touch Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMouseXRef.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMouseXRef.current;
    lastMouseXRef.current = e.clientX;

    let newAngle = (currentAngleRef.current + deltaX * 0.65) % 360;
    if (newAngle < 0) newAngle += 360;
    currentAngleRef.current = newAngle;
    onAngleChange(newAngle);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      lastMouseXRef.current = e.touches[0].clientX;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - lastMouseXRef.current;
    lastMouseXRef.current = e.touches[0].clientX;

    let newAngle = (currentAngleRef.current + deltaX * 0.65) % 360;
    if (newAngle < 0) newAngle += 360;
    currentAngleRef.current = newAngle;
    onAngleChange(newAngle);
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-full min-h-[380px] sm:min-h-[440px] cursor-grab active:cursor-grabbing select-none overflow-hidden touch-none"
    >
      {/* Real-time 3D Viewport HUD Badge */}
      <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none z-20">
        <span className="px-2.5 py-1 rounded-full bg-black/75 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 font-bold backdrop-blur-md shadow-md flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          WebGL 3D Studio &bull; {Math.round(rotationAngle)}&deg; &bull; {fps} FPS
        </span>
      </div>

      {/* Interactive Drag Instruction Pill */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none z-20">
        <span className="px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[11px] font-bold text-slate-300 backdrop-blur-md shadow">
          &larr; Drag horizontally to rotate 360&deg; &rarr;
        </span>
      </div>
    </div>
  );
}

function heroIdHairCol(id: string): number {
  switch (id) {
    case 'naruto':
    case 'minato':
      return 0xfacc15; // Golden blonde
    case 'luffy':
    case 'levi':
    case 'mikasa':
    case 'sung_jinwoo':
      return 0x0f172a; // Jet black
    case 'ichigo':
      return 0xea580c; // Bright orange
    case 'zoro':
      return 0x16a34a; // Marimo green
    case 'gojo':
      return 0xf8fafc; // Snow white
    case 'mereoleona':
      return 0xc2410c; // Fiery vermillion
    case 'sanemi':
      return 0xe2e8f0; // Spiky ash grey
    case 'hitsugaya':
      return 0xffffff; // Ice white
    default:
      return 0x1e293b;
  }
}
