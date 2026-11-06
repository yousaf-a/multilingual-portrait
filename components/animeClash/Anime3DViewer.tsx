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

  // Resolve authentic character artwork for the selected rank
  const resolveHeroImage = (): string => {
    let img = hero.image;
    if (selectedRank === 'goat' && hero.poseImages?.goat) {
      img = hero.poseImages.goat;
    } else if (selectedRank === 'epic' && hero.poseImages?.epic) {
      img = hero.poseImages.epic;
    } else if (hero.poseImages?.combat) {
      img = hero.poseImages.combat;
    }
    return img.replace('.jpg', '.png');
  };

  const currentHeroImg = resolveHeroImage();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 420;
    const height = container.clientHeight || 460;

    // 1. Scene & Atmosphere
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060a14, 0.05);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 3.2 / (zoomLevel || 1.0));
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
    renderer.toneMappingExposure = 1.25;
    container.replaceChildren(renderer.domElement);

    // 4. Anime Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(2.0, 4.0, 3.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    fillLight.position.set(-2.5, 2.0, 2.0);
    scene.add(fillLight);

    // Dynamic Rim Backlight (Aura Colored)
    const heroMainColor = new THREE.Color(hero.color || '#38bdf8');
    const heroAccentColor = new THREE.Color(hero.accentColor || '#fbbf24');
    const rimLight = new THREE.DirectionalLight(heroMainColor, 3.6);
    rimLight.position.set(0, 2.8, -3.0);
    scene.add(rimLight);

    // 5. Hero Pedestal / Ground Rune Ring
    const pedestalGroup = new THREE.Group();
    scene.add(pedestalGroup);

    // Outer Stone Bevel Base
    const baseGeo = new THREE.CylinderGeometry(1.15, 1.28, 0.08, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x090f1d,
      roughness: 0.4,
      metalness: 0.85
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.04;
    baseMesh.receiveShadow = true;
    pedestalGroup.add(baseMesh);

    // Inner Glowing Disc
    const innerDiscGeo = new THREE.CylinderGeometry(1.08, 1.08, 0.02, 48);
    const innerDiscMat = new THREE.MeshStandardMaterial({
      color: 0x030712,
      roughness: 0.2,
      metalness: 0.6,
      emissive: heroMainColor,
      emissiveIntensity: 0.4
    });
    const innerDisc = new THREE.Mesh(innerDiscGeo, innerDiscMat);
    innerDisc.position.y = 0.01;
    innerDisc.receiveShadow = true;
    pedestalGroup.add(innerDisc);

    // Glowing Neon Rune Ring
    const ringGeo = new THREE.RingGeometry(0.94, 1.05, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: heroAccentColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.022;
    pedestalGroup.add(ringMesh);

    // Dynamic Ground Drop Shadow Mesh beneath character
    const shadowGeo = new THREE.PlaneGeometry(1.2, 0.45);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.75,
      blending: THREE.NormalBlending
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.018;
    pedestalGroup.add(shadowMesh);

    // 6. Character 3D Root Node (Horizontal 360° Drag Rotation)
    const characterRoot = new THREE.Group();
    scene.add(characterRoot);

    // 7. REAL ANIME CHARACTER 3D SCULPTED STANDEE / FIGURINE
    // Load the genuine, authentic high-res character artwork
    const textureLoader = new THREE.TextureLoader();
    let frontTexture = textureLoader.load(currentHeroImg);
    frontTexture.colorSpace = THREE.SRGBColorSpace;
    frontTexture.minFilter = THREE.LinearFilter;
    frontTexture.magFilter = THREE.LinearFilter;

    // Load turnaround back texture if available, or create shadowed silhouette back
    let backTexture = frontTexture;
    if (hero.turnaround?.back) {
      backTexture = textureLoader.load(hero.turnaround.back.replace('.jpg', '.png'));
      backTexture.colorSpace = THREE.SRGBColorSpace;
    }

    const figureGroup = new THREE.Group();
    figureGroup.position.y = 0.02;
    characterRoot.add(figureGroup);

    // Figure Dimensions
    const figWidth = 1.15;
    const figHeight = 1.68;
    const depth = 0.035; // 3D Acrylic/Sculpt depth

    // Front Face (Authentic high-resolution hero artwork)
    const frontMat = new THREE.MeshStandardMaterial({
      map: frontTexture,
      transparent: true,
      alphaTest: 0.08,
      roughness: 0.35,
      metalness: 0.1,
      side: THREE.FrontSide
    });

    const frontPlaneGeo = new THREE.PlaneGeometry(figWidth, figHeight);
    const frontMesh = new THREE.Mesh(frontPlaneGeo, frontMat);
    frontMesh.position.set(0, figHeight / 2, depth / 2);
    frontMesh.castShadow = true;
    figureGroup.add(frontMesh);

    // Back Face (Authentic rear turnaround view or mirrored battle silhouette)
    const backTex = hero.turnaround?.back
      ? textureLoader.load(hero.turnaround.back.replace('.jpg', '.png'))
      : frontTexture.clone();
    if (!hero.turnaround?.back) {
      backTex.wrapS = THREE.RepeatWrapping;
      backTex.repeat.x = -1;
    }
    backTex.colorSpace = THREE.SRGBColorSpace;

    const backMat = new THREE.MeshStandardMaterial({
      map: backTex,
      transparent: true,
      alphaTest: 0.08,
      roughness: 0.45,
      metalness: 0.1,
      side: THREE.BackSide,
      color: hero.turnaround?.back ? 0xffffff : 0xdddddd
    });

    const backPlaneGeo = new THREE.PlaneGeometry(figWidth, figHeight);
    const backMesh = new THREE.Mesh(backPlaneGeo, backMat);
    backMesh.position.set(0, figHeight / 2, -depth / 2);
    backMesh.castShadow = true;
    figureGroup.add(backMesh);

    // Glowing Divine Halo Ring positioned safely behind the character's back (No clipping)
    const haloGeo = new THREE.TorusGeometry(0.52, 0.014, 16, 64);
    const haloMat = new THREE.MeshStandardMaterial({
      color: heroAccentColor,
      emissive: heroAccentColor,
      emissiveIntensity: selectedRank === 'goat' ? 1.6 : selectedRank === 'epic' ? 0.9 : 0.35,
      roughness: 0.15,
      metalness: 0.85,
      transparent: true,
      opacity: selectedRank === 'goat' ? 0.95 : selectedRank === 'epic' ? 0.65 : 0.25
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.position.set(0, 1.15, -0.08); // Floating safely behind upper torso
    figureGroup.add(haloMesh);

    // 8. Orbiting Satellite Energy Orbs (Epic & GOAT forms)
    const orbGroup = new THREE.Group();
    characterRoot.add(orbGroup);
    const orbCount = selectedRank === 'goat' ? 4 : selectedRank === 'epic' ? 2 : 0;
    const orbMeshes: THREE.Mesh[] = [];

    const orbGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const orbMat = new THREE.MeshStandardMaterial({
      color: heroAccentColor,
      emissive: heroAccentColor,
      emissiveIntensity: selectedRank === 'goat' ? 1.8 : 1.2,
      roughness: 0.2,
      metalness: 0.8
    });

    for (let i = 0; i < orbCount; i++) {
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orbGroup.add(orb);
      orbMeshes.push(orb);
    }

    // 9. Volumetric Particle Ascension Aura System
    const particleCount = 130;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleVel = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.25 + Math.random() * 0.65;
      particlePos[i * 3] = Math.cos(angle) * radius;
      particlePos[i * 3 + 1] = Math.random() * 1.9;
      particlePos[i * 3 + 2] = Math.sin(angle) * radius;

      particleVel[i * 3] = (Math.random() - 0.5) * 0.006;
      particleVel[i * 3 + 1] = 0.012 + Math.random() * 0.024;
      particleVel[i * 3 + 2] = (Math.random() - 0.5) * 0.006;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
      color: heroMainColor,
      size: 0.065,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 10. Animation & Render Loop
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
        currentAngleRef.current = (currentAngleRef.current + delta * 32) % 360;
        onAngleChange(currentAngleRef.current);
      }

      const rad = (currentAngleRef.current * Math.PI) / 180;
      characterRoot.rotation.y = rad;
      pedestalGroup.rotation.y = rad * 0.2;

      // 2. Real-Time Pose Animations
      const pose = currentPoseRef.current;
      const rank = selectedRankRef.current;

      // Idle breathing sway
      const breath = Math.sin(elapsed * 2.8) * 0.015;

      if (pose === 'combat') {
        // Low battle posture + weapon charge vibration
        figureGroup.position.y = 0.02 + breath;
        figureGroup.rotation.x = 0.08;
        figureGroup.scale.set(1.0, 0.98, 1.0);
      } else if (pose === 'ultimate') {
        // High floating ascension in mid-air
        const levitate = Math.sin(elapsed * 4.5) * 0.08 + 0.16;
        figureGroup.position.y = 0.02 + levitate;
        figureGroup.rotation.x = -0.05;
        figureGroup.scale.set(1.06, 1.06, 1.06);
      } else if (pose === 'victory') {
        // Upright triumphant stance with celebration bounce
        const bounce = Math.abs(Math.sin(elapsed * 3.5)) * 0.04;
        figureGroup.position.y = 0.02 + bounce;
        figureGroup.rotation.x = -0.04;
        figureGroup.scale.set(1.02, 1.02, 1.02);
      } else {
        // Meditate floating zen levitation
        const levitateZen = Math.sin(elapsed * 2.0) * 0.06 + 0.18;
        figureGroup.position.y = 0.02 + levitateZen;
        figureGroup.rotation.x = 0;
        figureGroup.scale.set(0.96, 0.96, 0.96);
      }

      // Gentle Divine Halo Rotation & Resonance
      haloMesh.rotation.z += 0.006;
      haloMesh.rotation.y = Math.sin(elapsed * 1.5) * 0.08;

      // Orbiting Satellites Motion
      orbMeshes.forEach((orb, i) => {
        const orbAngle = elapsed * 1.6 + (i * Math.PI * 2) / (orbCount || 1);
        const radius = 0.72 + Math.sin(elapsed * 2.2 + i) * 0.06;
        orb.position.x = Math.cos(orbAngle) * radius;
        orb.position.z = Math.sin(orbAngle) * radius;
        orb.position.y = 0.95 + Math.sin(elapsed * 2.8 + i * 1.8) * 0.22;
      });

      // 3. Tier Transformation Aura Vibrancy
      if (rank === 'goat') {
        particleMat.size = 0.095;
        particleMat.opacity = 0.95;
        rimLight.intensity = 4.8;
        innerDiscMat.emissiveIntensity = 0.9;
        haloMat.emissiveIntensity = 1.8;
        haloMat.opacity = 0.95;
      } else if (rank === 'epic') {
        particleMat.size = 0.07;
        particleMat.opacity = 0.8;
        rimLight.intensity = 3.4;
        innerDiscMat.emissiveIntensity = 0.55;
        haloMat.emissiveIntensity = 0.9;
        haloMat.opacity = 0.65;
      } else {
        particleMat.size = 0.045;
        particleMat.opacity = 0.55;
        rimLight.intensity = 2.4;
        innerDiscMat.emissiveIntensity = 0.35;
        haloMat.emissiveIntensity = 0.3;
        haloMat.opacity = 0.2;
      }

      // Particle physics
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += particleVel[i * 3 + 1];
        if (positions[i * 3 + 1] > 2.0) {
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
      shadowGeo.dispose();
      shadowMat.dispose();
      frontPlaneGeo.dispose();
      frontMat.dispose();
      backPlaneGeo.dispose();
      backMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      orbGeo.dispose();
      orbMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [hero.id, hero.color, hero.accentColor, currentHeroImg, zoomLevel, selectedRank]);

  // Horizontal Drag Handlers
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
