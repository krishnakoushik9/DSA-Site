/* eslint-disable react/no-unknown-property */
'use client';

import * as THREE from 'three';
import { useRef, useState, useEffect, memo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Preload, Environment } from '@react-three/drei';
import { easing } from 'maath';

interface GlassOrbProps {
  /** Whether the user is currently dragging */
  isDragging: boolean;
  /** Callback fired when the GLB has loaded */
  onLoad: () => void;
}

/**
 * Inner Three.js scene — the glass lens that distorts content behind it.
 */
const GlassLens = memo(function GlassLens({
  isDragging,
  onLoad,
}: {
  isDragging: boolean;
  onLoad: () => void;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  const { nodes } = useGLTF('/assets/3d/lens.glb');

  // Call onLoad on mount
  useEffect(() => {
    onLoad();
  }, [onLoad]);

  useFrame((state, delta) => {
    // Subtle tilt based on movement / drag
    const targetRotationX = Math.PI / 2 + (isDragging ? 0.12 : 0);
    easing.damp(ref.current.rotation, 'x', targetRotationX, 0.1, delta);
    
    // Squeeze on drag
    const baseScale = 0.34;
    const squeeze = isDragging ? 0.92 : 1.0;
    const targetScale = baseScale * squeeze;
    easing.damp(ref.current.scale, 'x', targetScale, 0.08, delta);
    easing.damp(ref.current.scale, 'y', targetScale, 0.08, delta);
    easing.damp(ref.current.scale, 'z', targetScale, 0.08, delta);
  });

  return (
    <mesh
      ref={ref}
      position={[0, 0, 15]}
      scale={0.34}
      rotation-x={Math.PI / 2}
      geometry={(nodes.Cylinder as THREE.Mesh)?.geometry}
    >
      <meshPhysicalMaterial
        color="#ffffff"
        transmission={0.99}
        thickness={2.5}
        roughness={0.0}
        metalness={0.0}
        clearcoat={1.0}
        clearcoatRoughness={0.0}
        ior={1.45}
        transparent={true}
        opacity={1.0}
      />
    </mesh>
  );
});

/**
 * GlassOrb — wraps a Three.js Canvas containing the glass lens.
 */
export default function GlassOrb({ isDragging, onLoad }: GlassOrbProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 20], fov: 15 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      style={{ pointerEvents: 'none', width: '230px', height: '230px' }}
    >
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 10]} intensity={2.0} />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#5e81f4" />
      <pointLight position={[10, 10, -10]} intensity={1.2} color="#bf67f5" />
      
      <Suspense fallback={null}>
        <GlassLens isDragging={isDragging} onLoad={onLoad} />
        {/* Environment preset provides the reflections/refractions needed for glass realism */}
        <Environment preset="studio" />
      </Suspense>
      <Preload all />
    </Canvas>
  );
}

// Preload the GLB model
useGLTF.preload('/assets/3d/lens.glb');
