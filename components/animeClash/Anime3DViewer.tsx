'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
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

  // Sync refs to avoid re-creating Three.js scene on prop updates
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

  const [fps, setFps] = useState(60);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060a14, 0.08);

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 450;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.25, 3.4 / (zoomLevel || 1.0));
    camera.lookAt(0, 0.85, 0);

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
    renderer.toneMappingExposure = 1.15;
    container.replaceChildren(renderer.domElement);

    // 4. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0x22304d, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(2.5, 4.0, 3.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    fillLight.position.set(-3.0, 2.0, 2.0);
    scene.add(fillLight);

    // Dynamic Rim Light colored with Hero/Form Aura
    const rimLight = new THREE.DirectionalLight(new THREE.Color(hero.color || '#3b82f6'), 2.8);
    rimLight.position.set(0, 2.8, -3.2);
    scene.add(rimLight);

    // 5. Hero Pedestal / Ground Rune Ring
    const pedestalGroup = new THREE.Group();
    scene.add(pedestalGroup);

    // Stone Bevel Base
    const baseGeo = new THREE.CylinderGeometry(1.15, 1.25, 0.08, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.6,
      metalness: 0.8
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.04;
    baseMesh.receiveShadow = true;
    pedestalGroup.add(baseMesh);

    // Glowing Inner Disc
    const innerDiscGeo = new THREE.CylinderGeometry(1.05, 1.05, 0.02, 48);
    const innerDiscMat = new THREE.MeshStandardMaterial({
      color: 0x050811,
      roughness: 0.3,
      metalness: 0.5,
      emissive: new THREE.Color(hero.color || '#3b82f6'),
      emissiveIntensity: 0.25
    });
    const innerDisc = new THREE.Mesh(innerDiscGeo, innerDiscMat);
    innerDisc.position.y = 0.01;
    innerDisc.receiveShadow = true;
    pedestalGroup.add(innerDisc);

    // Rune Border Ring
    const ringGeo = new THREE.RingGeometry(0.92, 1.02, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(hero.accentColor || hero.color || '#38bdf8'),
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

    // Color definitions based on hero
    const heroMainColor = new THREE.Color(hero.color || '#38bdf8');
    const heroAccentColor = new THREE.Color(hero.accentColor || '#fbbf24');
    const skinColor = new THREE.Color(0xfdd5b1);
    const darkSuitColor = new THREE.Color(0x131926);

    // Materials
    const suitMat = new THREE.MeshStandardMaterial({
      color: darkSuitColor,
      roughness: 0.6,
      metalness: 0.2
    });
    const heroVestMat = new THREE.MeshStandardMaterial({
      color: heroMainColor,
      roughness: 0.45,
      metalness: 0.35,
      emissive: heroMainColor,
      emissiveIntensity: 0.15
    });
    const skinMat = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.7,
      metalness: 0.05
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: heroIdHairCol(hero.id),
      roughness: 0.4,
      metalness: 0.1
    });
    const weaponMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.15,
      emissive: heroMainColor,
      emissiveIntensity: 0.25
    });

    // Procedural 3D Anime Guardian Rig Nodes
    // Pelvis & Spine
    const pelvis = new THREE.Group();
    pelvis.position.y = 0.68;
    characterRoot.add(pelvis);

    const torso = new THREE.Group();
    torso.position.y = 0.1;
    pelvis.add(torso);

    // Chest & Tactical Jacket
    const chestGeo = new THREE.BoxGeometry(0.38, 0.44, 0.22);
    const chestMesh = new THREE.Mesh(chestGeo, suitMat);
    chestMesh.position.y = 0.15;
    chestMesh.castShadow = true;
    torso.add(chestMesh);

    const vestGeo = new THREE.BoxGeometry(0.41, 0.36, 0.25);
    const vestMesh = new THREE.Mesh(vestGeo, heroVestMat);
    vestMesh.position.y = 0.16;
    vestMesh.castShadow = true;
    torso.add(vestMesh);

    // Neck & Head
    const neckGeo = new THREE.CylinderGeometry(0.065, 0.075, 0.12, 16);
    const neckMesh = new THREE.Mesh(neckGeo, skinMat);
    neckMesh.position.y = 0.4;
    torso.add(neckMesh);

    const headGroup = new THREE.Group();
    headGroup.position.y = 0.52;
    torso.add(headGroup);

    const faceGeo = new THREE.SphereGeometry(0.14, 24, 24);
    faceGeo.scale(0.95, 1.15, 0.95);
    const faceMesh = new THREE.Mesh(faceGeo, skinMat);
    faceMesh.castShadow = true;
    headGroup.add(faceMesh);

    // Anime Spiked Hair
    const hairGroup = new THREE.Group();
    headGroup.add(hairGroup);
    const hairBaseGeo = new THREE.SphereGeometry(0.155, 16, 16);
    hairBaseGeo.scale(1.0, 1.1, 1.0);
    const hairBase = new THREE.Mesh(hairBaseGeo, hairMat);
    hairBase.position.set(0, 0.04, -0.02);
    hairGroup.add(hairBase);

    // Front/Side Anime Spikes
    for (let i = 0; i < 7; i++) {
      const spikeGeo = new THREE.ConeGeometry(0.06, 0.18, 5);
      const spike = new THREE.Mesh(spikeGeo, hairMat);
      const angle = (i / 6 - 0.5) * 1.5;
      spike.position.set(Math.sin(angle) * 0.14, 0.12 + Math.cos(angle) * 0.05, 0.08);
      spike.rotation.set(-0.4, 0, -angle * 0.8);
      hairGroup.add(spike);
    }

    // Glowing Eyes
    const eyeGeo = new THREE.PlaneGeometry(0.045, 0.02);
    const eyeMat = new THREE.MeshBasicMaterial({
      color: hero.id === 'gojo' ? 0x38bdf8 : heroAccentColor,
      side: THREE.DoubleSide
    });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.055, 0.015, 0.135);
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.055, 0.015, 0.135);
    headGroup.add(rightEye);

    // Headband / Accessories
    if (hero.id === 'naruto' || hero.id === 'minato') {
      const bandGeo = new THREE.CylinderGeometry(0.152, 0.152, 0.05, 24, 1, true);
      const bandMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
      const band = new THREE.Mesh(bandGeo, bandMat);
      band.position.y = 0.04;
      headGroup.add(band);

      const metalPlateGeo = new THREE.BoxGeometry(0.09, 0.04, 0.01);
      const metalPlateMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.2 });
      const plate = new THREE.Mesh(metalPlateGeo, metalPlateMat);
      plate.position.set(0, 0.04, 0.15);
      headGroup.add(plate);
    } else if (hero.id === 'luffy') {
      // Classic Straw Hat
      const hatBrimGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.02, 32);
      const hatCrownGeo = new THREE.CylinderGeometry(0.16, 0.18, 0.12, 32);
      const hatMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.8 });
      const hatRibbonMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });

      const hatGroup = new THREE.Group();
      hatGroup.position.set(0, 0.12, -0.04);
      hatGroup.rotation.x = -0.15;

      const brim = new THREE.Mesh(hatBrimGeo, hatMat);
      const crown = new THREE.Mesh(hatCrownGeo, hatMat);
      crown.position.y = 0.06;
      const ribbon = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.165, 0.03, 32), hatRibbonMat);
      ribbon.position.y = 0.02;

      hatGroup.add(brim, crown, ribbon);
      headGroup.add(hatGroup);
    }

    // Right Arm (Dominant Weapon Arm)
    const rightShoulder = new THREE.Group();
    rightShoulder.position.set(0.24, 0.28, 0);
    torso.add(rightShoulder);

    const rightUpperArmGeo = new THREE.CylinderGeometry(0.055, 0.05, 0.24, 16);
    const rightUpperArm = new THREE.Mesh(rightUpperArmGeo, suitMat);
    rightUpperArm.position.y = -0.12;
    rightUpperArm.castShadow = true;
    rightShoulder.add(rightUpperArm);

    const rightElbow = new THREE.Group();
    rightElbow.position.y = -0.24;
    rightShoulder.add(rightElbow);

    const rightForearmGeo = new THREE.CylinderGeometry(0.05, 0.045, 0.24, 16);
    const rightForearm = new THREE.Mesh(rightForearmGeo, skinMat);
    rightForearm.position.y = -0.12;
    rightForearm.castShadow = true;
    rightElbow.add(rightForearm);

    // Signature Weapon attached to Right Hand
    const weaponGroup = new THREE.Group();
    weaponGroup.position.set(0, -0.25, 0.04);
    rightElbow.add(weaponGroup);

    if (['ichigo', 'zoro', 'levi', 'asta'].includes(hero.id)) {
      // Giant Katana / Greatsword Blade
      const bladeGeo = new THREE.BoxGeometry(0.04, 0.95, 0.012);
      const bladeMesh = new THREE.Mesh(bladeGeo, weaponMat);
      bladeMesh.position.y = 0.45;
      bladeMesh.castShadow = true;
      weaponGroup.add(bladeMesh);

      const hiltGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.22, 12);
      const hiltMesh = new THREE.Mesh(hiltGeo, suitMat);
      hiltMesh.position.y = -0.05;
      weaponGroup.add(hiltMesh);
    } else {
      // Energy Combat Gauntlet / Kunai / Chakra Core
      const energyCoreGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const energyCoreMat = new THREE.MeshBasicMaterial({
        color: heroMainColor,
        wireframe: true
      });
      const core = new THREE.Mesh(energyCoreGeo, energyCoreMat);
      weaponGroup.add(core);
    }

    // Left Arm (Guard Arm)
    const leftShoulder = new THREE.Group();
    leftShoulder.position.set(-0.24, 0.28, 0);
    torso.add(leftShoulder);

    const leftUpperArmGeo = new THREE.CylinderGeometry(0.055, 0.05, 0.24, 16);
    const leftUpperArm = new THREE.Mesh(leftUpperArmGeo, suitMat);
    leftUpperArm.position.y = -0.12;
    leftUpperArm.castShadow = true;
    leftShoulder.add(leftUpperArm);

    const leftElbow = new THREE.Group();
    leftElbow.position.y = -0.24;
    leftShoulder.add(leftElbow);

    const leftForearmGeo = new THREE.CylinderGeometry(0.05, 0.045, 0.24, 16);
    const leftForearm = new THREE.Mesh(leftForearmGeo, skinMat);
    leftForearm.position.y = -0.12;
    leftForearm.castShadow = true;
    leftElbow.add(leftForearm);

    // Legs & Combat Boots
    // Right Leg
    const rightHip = new THREE.Group();
    rightHip.position.set(0.12, -0.05, 0);
    pelvis.add(rightHip);

    const rightThighGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.32, 16);
    const rightThigh = new THREE.Mesh(rightThighGeo, suitMat);
    rightThigh.position.y = -0.16;
    rightThigh.castShadow = true;
    rightHip.add(rightThigh);

    const rightKnee = new THREE.Group();
    rightKnee.position.y = -0.32;
    rightHip.add(rightKnee);

    const rightShinGeo = new THREE.CylinderGeometry(0.06, 0.055, 0.32, 16);
    const rightShin = new THREE.Mesh(rightShinGeo, suitMat);
    rightShin.position.y = -0.16;
    rightShin.castShadow = true;
    rightKnee.add(rightShin);

    const rightBootGeo = new THREE.BoxGeometry(0.11, 0.1, 0.18);
    const rightBoot = new THREE.Mesh(rightBootGeo, suitMat);
    rightBoot.position.set(0, -0.32, 0.04);
    rightBoot.castShadow = true;
    rightKnee.add(rightBoot);

    // Left Leg
    const leftHip = new THREE.Group();
    leftHip.position.set(-0.12, -0.05, 0);
    pelvis.add(leftHip);

    const leftThighGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.32, 16);
    const leftThigh = new THREE.Mesh(leftThighGeo, suitMat);
    leftThigh.position.y = -0.16;
    leftThigh.castShadow = true;
    leftHip.add(leftThigh);

    const leftKnee = new THREE.Group();
    leftKnee.position.y = -0.32;
    leftHip.add(leftKnee);

    const leftShinGeo = new THREE.CylinderGeometry(0.06, 0.055, 0.32, 16);
    const leftShin = new THREE.Mesh(leftShinGeo, suitMat);
    leftShin.position.y = -0.16;
    leftShin.castShadow = true;
    leftKnee.add(leftShin);

    const leftBootGeo = new THREE.BoxGeometry(0.11, 0.1, 0.18);
    const leftBoot = new THREE.Mesh(leftBootGeo, suitMat);
    leftBoot.position.set(0, -0.32, 0.04);
    leftBoot.castShadow = true;
    leftKnee.add(leftBoot);

    // 7. Dynamic Particle Aura System (Normal / Epic / GOAT Mode)
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleVel = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.3 + Math.random() * 0.7;
      particlePos[i * 3] = Math.cos(angle) * radius;
      particlePos[i * 3 + 1] = Math.random() * 1.8;
      particlePos[i * 3 + 2] = Math.sin(angle) * radius;

      particleVel[i * 3] = (Math.random() - 0.5) * 0.005;
      particleVel[i * 3 + 1] = 0.01 + Math.random() * 0.02;
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

    // 8. Animation & Render Loop
    let animFrameId: number;
    let clock = new THREE.Clock();
    let frameCount = 0;
    let lastFpsTime = performance.now();

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // FPS tracking
      frameCount++;
      if (performance.now() - lastFpsTime > 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastFpsTime = performance.now();
      }

      // 1. Horizontal Auto-Spinning or Drag Rotation
      if (autoRotateRef.current && !isDraggingRef.current) {
        currentAngleRef.current = (currentAngleRef.current + delta * 35) % 360;
        onAngleChange(currentAngleRef.current);
      }

      const rad = (currentAngleRef.current * Math.PI) / 180;
      characterRoot.rotation.y = rad;
      pedestalGroup.rotation.y = rad * 0.2; // Subtle pedestal parallax

      // 2. Real-time Animated Poses Engine
      const pose = currentPoseRef.current;
      const rank = selectedRankRef.current;

      // Base breathing
      const breath = Math.sin(elapsed * 2.8) * 0.015;

      if (pose === 'combat') {
        // Low Battle Crouch Stance
        pelvis.position.y = 0.62 + breath;
        torso.rotation.x = 0.18;
        torso.rotation.y = 0.22;

        rightShoulder.rotation.x = -0.55 + Math.sin(elapsed * 3) * 0.05;
        rightShoulder.rotation.z = -0.3;
        rightElbow.rotation.x = -0.85;

        leftShoulder.rotation.x = 0.45;
        leftShoulder.rotation.z = 0.45;
        leftElbow.rotation.x = -1.1;

        rightHip.rotation.x = -0.35;
        rightKnee.rotation.x = 0.55;
        leftHip.rotation.x = 0.25;
        leftKnee.rotation.x = 0.35;
      } else if (pose === 'ultimate') {
        // Floating Apex Energy Charge Levitation
        const levitate = Math.sin(elapsed * 4.2) * 0.08 + 0.18;
        pelvis.position.y = 0.68 + levitate;
        torso.rotation.x = -0.15;
        torso.rotation.y = 0;

        // Both arms raised high to sky
        rightShoulder.rotation.x = -2.6 + Math.sin(elapsed * 6) * 0.05;
        rightShoulder.rotation.z = -0.3;
        rightElbow.rotation.x = -0.2;

        leftShoulder.rotation.x = -2.6 - Math.sin(elapsed * 6) * 0.05;
        leftShoulder.rotation.z = 0.3;
        leftElbow.rotation.x = -0.2;

        rightHip.rotation.x = 0.15;
        rightKnee.rotation.x = 0.45;
        leftHip.rotation.x = -0.15;
        leftKnee.rotation.x = 0.55;
      } else if (pose === 'victory') {
        // Fist to the Sky Celebratory Stance
        pelvis.position.y = 0.68 + breath;
        torso.rotation.x = -0.08;
        torso.rotation.y = -0.15;

        // Right arm thrust high
        rightShoulder.rotation.x = -2.85;
        rightShoulder.rotation.z = -0.15;
        rightElbow.rotation.x = 0;

        // Left arm cocked on hip
        leftShoulder.rotation.x = 0.2;
        leftShoulder.rotation.z = 0.65;
        leftElbow.rotation.x = -1.4;

        rightHip.rotation.x = 0.05;
        leftHip.rotation.x = -0.05;
      } else {
        // Meditate - Floating Lotus Levitation
        const levitateZen = Math.sin(elapsed * 2.2) * 0.06 + 0.25;
        pelvis.position.y = 0.68 + levitateZen;
        torso.rotation.x = 0;
        torso.rotation.y = 0;

        rightShoulder.rotation.x = 0.25;
        rightShoulder.rotation.z = -0.4;
        rightElbow.rotation.x = -1.2;

        leftShoulder.rotation.x = 0.25;
        leftShoulder.rotation.z = 0.4;
        leftElbow.rotation.x = -1.2;

        // Crossed knees
        rightHip.rotation.x = -1.2;
        rightHip.rotation.z = 0.6;
        rightKnee.rotation.x = 1.6;

        leftHip.rotation.x = -1.2;
        leftHip.rotation.z = -0.6;
        leftKnee.rotation.x = 1.6;
      }

      // 3. Tier Transformation Aura Vibrancy
      if (rank === 'goat') {
        particleMat.size = 0.09;
        particleMat.opacity = 0.95;
        rimLight.intensity = 4.2;
        innerDiscMat.emissiveIntensity = 0.8;
      } else if (rank === 'epic') {
        particleMat.size = 0.07;
        particleMat.opacity = 0.8;
        rimLight.intensity = 3.0;
        innerDiscMat.emissiveIntensity = 0.45;
      } else {
        particleMat.size = 0.045;
        particleMat.opacity = 0.55;
        rimLight.intensity = 2.0;
        innerDiscMat.emissiveIntensity = 0.25;
      }

      // Update particles
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

    // 9. Resize Listener
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

  // Mouse & Touch Drag Handlers for 360 Rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMouseXRef.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMouseXRef.current;
    lastMouseXRef.current = e.clientX;

    // 0.65 degrees per pixel drag
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
