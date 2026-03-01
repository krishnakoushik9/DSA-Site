'use client';
import React, { Suspense, useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type * as T3 from 'three';

function Model() {
  const group = useRef<T3.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const { scene, animations } = useGLTF('/3d/chito__anime_character.glb');

  useEffect(() => {
    if (!animations.length) return;
    const mixer = new THREE.AnimationMixer(scene);
    const action = mixer.clipAction(animations[0]);
    action.play();
    mixerRef.current = mixer;
    return () => { mixer.stopAllAction(); mixerRef.current = null; };
  }, [animations, scene]);

  useFrame((_, delta) => mixerRef.current?.update(delta));

  return (
    // Raised Y from -0.5 to -0.1 so the character sits higher in the canvas
    <group ref={group} position={[0, -0.1, 0]}>
      <primitive object={scene} scale={0.9} />
    </group>
  );
}

function Platform() {
  // Platform follows character down
  return (
    <mesh position={[0, -1.1, 0]} receiveShadow castShadow>
      <boxGeometry args={[1.2, 0.08, 0.8]} />
      <meshStandardMaterial color="#4C566A" roughness={0.8} metalness={0.2} />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 5, 5]} intensity={1.5} castShadow />
      <Suspense fallback={null}>
        <Model />
        <Platform />
      </Suspense>
    </>
  );
}

// Taller + wider canvas so the full character body is visible
const CANVAS_HEIGHT = 420;
const CANVAS_WIDTH = 180;

interface DancingGirl3DProps {
  mode?: 'dashboard' | 'login';
}

function LoginMovingWrapper({ children }: { children: React.ReactNode }) {
  const [x, setX] = useState(120);

  useEffect(() => {
    const pickRandom = () => {
      if (typeof window === 'undefined') return;
      const vw = window.innerWidth;
      const margin = CANVAS_WIDTH / 2;
      const max = vw - margin - CANVAS_WIDTH;
      const min = margin;
      const next = max > min ? Math.random() * (max - min) + min : min;
      setX(next);
    };
    pickRandom();
    const id = setInterval(pickRandom, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      className="fixed z-30 pointer-events-none"
      style={{ bottom: 0, height: CANVAS_HEIGHT, width: CANVAS_WIDTH }}
      initial={{ left: 120 }}
      animate={{ left: x }}
      transition={{ duration: 2, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

export default function DancingGirl3D({ mode = 'dashboard' }: DancingGirl3DProps) {
  const canvas = (
    <Canvas
      // camera.position.y=1.0  → looks at the character's vertical center
      // camera.position.z=3.8  → far enough back to frame the whole body
      // fov=40                 → narrow FOV avoids distortion on tall canvas
      camera={{ position: [0, 1.0, 3.8], fov: 40 }}
      flat
      shadows
      gl={{ alpha: true, antialias: true }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <Scene />
    </Canvas>
  );

  if (mode === 'login') {
    return <LoginMovingWrapper>{canvas}</LoginMovingWrapper>;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { isSidebarCollapsed } = useAppStore();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [leftOffset, setLeftOffset] = useState(88);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const sidebarW = w >= 768 && !isSidebarCollapsed ? 260 : 72;
      setLeftOffset(sidebarW + 16);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [isSidebarCollapsed]);

  return (
    <div
      className="fixed z-30 pointer-events-none"
      style={{ bottom: 0, left: leftOffset, height: CANVAS_HEIGHT, width: CANVAS_WIDTH }}
    >
      {canvas}
    </div>
  );
}
