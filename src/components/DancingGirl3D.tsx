'use client';

// ============================================================
// DancingGirl3D — Girl.fbx rendered with three.js / R3F.
//
// The FBX (a rigged "Megumi" anime model) ships with a skeleton
// and mesh but ZERO baked animation curves, and its texture paths
// point at the original author's machine, so:
//   • we animate the skeleton PROCEDURALLY (dance loop + hover wave)
//   • we apply a clean fallback material palette + lighting
//
// She lives in a small fixed box at the bottom-left of the screen,
// dances continuously, and waves "hello" when the user hovers her.
// ============================================================

import { useEffect, useRef, useState, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useFBX } from '@react-three/drei';
import * as THREE from 'three';

interface DancingGirl3DProps {
  mode?: 'dashboard' | 'login';
}

// Bones we drive. The FBX names them "Hips", "Spine", "Chest",
// "Head", "Left arm", "Right arm", "Left leg", "Right leg".
// Real bone names in Girl.fbx (VRoid-style rig, underscore-separated):
// Hips, Spine, Chest, Neck, Head, Left_shoulder, Left_arm, Left_elbow,
// Left_wrist, Left_leg, Left_knee, Left_ankle (and Right_* mirror).
type BoneKey =
  | 'hips' | 'spine' | 'chest' | 'neck' | 'head'
  | 'leftShoulder' | 'rightShoulder'
  | 'leftArm' | 'rightArm'
  | 'leftElbow' | 'rightElbow'
  | 'leftLeg' | 'rightLeg'
  | 'leftKnee' | 'rightKnee';

const BONE_MATCHERS: Record<BoneKey, (n: string) => boolean> = {
  hips: (n) => n === 'hips',
  spine: (n) => n === 'spine',
  chest: (n) => n === 'chest',
  neck: (n) => n === 'neck',
  head: (n) => n === 'head',
  leftShoulder: (n) => n === 'left_shoulder',
  rightShoulder: (n) => n === 'right_shoulder',
  leftArm: (n) => n === 'left_arm',
  rightArm: (n) => n === 'right_arm',
  leftElbow: (n) => n === 'left_elbow',
  rightElbow: (n) => n === 'right_elbow',
  leftLeg: (n) => n === 'left_leg',
  rightLeg: (n) => n === 'right_leg',
  leftKnee: (n) => n === 'left_knee',
  rightKnee: (n) => n === 'right_knee',
};

// Pick a pleasant fallback colour from the material / mesh name,
// since the real PNG textures aren't bundled with the FBX.
function fallbackColor(name: string): THREE.Color {
  const n = name.toLowerCase();
  if (n.includes('hair')) return new THREE.Color('#5b4636');          // brown hair
  if (n.includes('skin') || n.includes('body') || n.includes('face')) return new THREE.Color('#f3cfb4'); // skin
  if (n.includes('top')) return new THREE.Color('#7aa2c9');           // top — soft blue
  if (n.includes('bottom') || n.includes('skirt')) return new THREE.Color('#3b4a63'); // skirt — navy
  if (n.includes('shoe')) return new THREE.Color('#2b2b33');          // shoes — dark
  if (n.includes('eye')) return new THREE.Color('#caa06a');           // eyes
  return new THREE.Color('#d8d2cc');                                  // neutral
}

const _eu = new THREE.Euler();
const _q = new THREE.Quaternion();

// Target on-screen height (world units) the model is normalized to.
const TARGET_HEIGHT = 2.2;

function GirlModel({ hovering }: { hovering: boolean }) {
  const fbx = useFBX('/3d/Girl.fbx');
  const groupRef = useRef<THREE.Group>(null); // animated (bounce / sway)
  const fitRef = useRef<THREE.Group>(null);   // fit scale + centering (set once)

  // Map of driven bones + their original (rest) quaternions.
  const bones = useRef<Partial<Record<BoneKey, THREE.Bone>>>({});
  const rest = useRef<Partial<Record<BoneKey, THREE.Quaternion>>>({});

  // Smoothed 0→1 wave factor so the hello blends in/out gently.
  const wave = useRef(0);

  // One-time setup: fix materials + collect bones. We DO NOT touch the
  // FBX root transform here — FBXLoader bakes its own root scale (the
  // model is authored in centimetres); overwriting it blows the mesh up
  // ~100× and puts the camera inside it. We fit via a wrapper group below.
  const prepared = useMemo(() => {
    const root = fbx;

    // ── Materials: replace missing-texture look with lit fallbacks ──
    root.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      mesh.frustumCulled = false; // skinned bounds can be wrong → don't cull
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const fixed = mats.map((m) => {
        const src = m as THREE.MeshStandardMaterial & { map?: THREE.Texture | null };
        const label = `${src?.name || ''} ${mesh.name || ''}`;
        // Modern three.js auto-detects skinning from the SkinnedMesh,
        // so no material.skinning flag is needed.
        const std = new THREE.MeshStandardMaterial({
          color: src?.map ? new THREE.Color('#ffffff') : fallbackColor(label),
          map: src?.map ?? null,
          roughness: 0.6,
          metalness: 0.0,
          emissive: new THREE.Color('#000000'),
        });
        std.side = THREE.DoubleSide;
        return std;
      });
      mesh.material = Array.isArray(mesh.material) ? fixed : fixed[0];
    });

    // ── Collect the bones we want to drive ──
    root.traverse((child) => {
      const bone = child as THREE.Bone;
      if (!(bone as THREE.Object3D).type || (bone as THREE.Object3D).type !== 'Bone') return;
      const name = (bone.name || '').toLowerCase();
      (Object.keys(BONE_MATCHERS) as BoneKey[]).forEach((key) => {
        if (!bones.current[key] && BONE_MATCHERS[key](name)) {
          bones.current[key] = bone;
          rest.current[key] = bone.quaternion.clone();
        }
      });
    });

    return root;
  }, [fbx]);

  // ── Fit: measure AFTER the matrices are current, then scale + center
  // the wrapper group so the model is ~TARGET_HEIGHT tall and centred at
  // the origin (where the camera is already looking). Preserves FBX scale.
  useEffect(() => {
    const fit = fitRef.current;
    if (!fit) return;
    prepared.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(prepared);
    if (box.isEmpty()) return;
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const height = size.y > 0.0001 ? size.y : 1;
    const s = TARGET_HEIGHT / height;
    fit.scale.setScalar(s);
    // Center the model at the origin in the fit group's parent space.
    fit.position.set(-center.x * s, -center.y * s, -center.z * s);
  }, [prepared]);

  // Helper: apply a local-space delta rotation on top of rest pose.
  const drive = (key: BoneKey, x: number, y: number, z: number) => {
    const bone = bones.current[key];
    const r = rest.current[key];
    if (!bone || !r) return;
    _q.setFromEuler(_eu.set(x, y, z));
    bone.quaternion.copy(r).multiply(_q);
  };

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Ease the wave factor toward the hover target.
    const target = hovering ? 1 : 0;
    wave.current += (target - wave.current) * Math.min(1, delta * 6);
    const w = wave.current;

    // ── Continuous dance (always on) ──
    const bob = Math.sin(t * 4) * 0.5 + 0.5;          // 0..1 bounce
    const sway = Math.sin(t * 2);                      // -1..1 side sway
    const swing = Math.sin(t * 4);                     // arm/leg swing

    // Whole-body bounce + gentle turn.
    if (groupRef.current) {
      groupRef.current.position.y = bob * 0.1;
      groupRef.current.rotation.y = sway * 0.12;
    }

    // Torso chain.
    drive('hips', Math.sin(t * 4) * 0.05, sway * 0.12, sway * 0.10);
    drive('spine', 0, -sway * 0.06, -sway * 0.07);
    drive('chest', Math.sin(t * 4 + 1) * 0.04, sway * 0.05, sway * 0.06);
    drive('neck', 0, sway * 0.05, 0);
    drive('head', Math.sin(t * 4) * 0.06, sway * 0.08, -sway * 0.04 + w * 0.12);

    // Legs: small alternating bounce + knee follow-through.
    drive('leftLeg', swing * 0.1, 0, 0);
    drive('rightLeg', -swing * 0.1, 0, 0);
    drive('leftKnee', Math.max(0, swing) * 0.12, 0, 0);
    drive('rightKnee', Math.max(0, -swing) * 0.12, 0, 0);

    // Arms: alternating dance swing on shoulders + upper arms.
    const danceL = swing * 0.4;
    const danceR = -swing * 0.4;
    drive('leftShoulder', 0, 0, danceL * 0.4);
    drive('rightShoulder', 0, 0, danceR * 0.4);
    drive('leftArm', danceL, danceL * 0.5, 0);
    drive('leftElbow', 0, 0, Math.abs(danceL) * 0.6);

    // Right arm: blend dance → hello wave on hover.
    // w=0 → dance swing; w=1 → arm raised, forearm oscillating.
    const waveOsc = Math.sin(t * 10) * 0.45;
    drive('rightShoulder', 0, 0, danceR * 0.4 - w * 0.5);
    drive(
      'rightArm',
      danceR * (1 - w),                              // stop dance swing while waving
      danceR * 0.5 * (1 - w) - w * 1.2,              // lift the arm up/out
      -w * 0.6,                                      // rotate outward
    );
    drive('rightElbow', 0, w * waveOsc, w * 1.0);    // forearm waves side-to-side
  });

  return (
    <group ref={groupRef}>
      <group ref={fitRef}>
        <primitive object={prepared} />
      </group>
    </group>
  );
}

export default function DancingGirl3D({ mode = 'dashboard' }: DancingGirl3DProps) {
  const [mounted, setMounted] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => setMounted(true), []);

  // Only render the floating dancer on the dashboard.
  if (!mounted || mode !== 'dashboard') return null;

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        position: 'fixed',
        left: 12,
        bottom: 0,
        width: 170,
        height: 240,
        zIndex: 40,
        pointerEvents: 'auto',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      aria-hidden
    >
      {/* Greeting bubble on hover */}
      <div
        style={{
          position: 'absolute',
          top: 6,
          left: '50%',
          transform: `translateX(-50%) scale(${hovering ? 1 : 0.6})`,
          opacity: hovering ? 1 : 0,
          transition: 'opacity .25s ease, transform .25s cubic-bezier(.34,1.56,.64,1)',
          background: 'rgba(20,22,28,0.92)',
          color: '#ECEFF4',
          fontSize: 12,
          fontWeight: 600,
          padding: '5px 10px',
          borderRadius: 12,
          border: '1px solid rgba(136,192,208,0.35)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          boxShadow: '0 4px 18px rgba(0,0,0,0.4)',
        }}
      >
        Hi there! 👋
      </div>

      <Canvas
        camera={{ position: [0, 0.15, 5], fov: 38 }}
        dpr={[1, 1.8]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        {/* Bright, even lighting so the (texture-less) fallback materials
            never read as flat black. */}
        <hemisphereLight args={['#ffffff', '#3a4252', 1.0]} />
        <ambientLight intensity={0.9} />
        <directionalLight position={[2, 4, 3]} intensity={1.8} />
        <directionalLight position={[-3, 2, 2]} intensity={0.7} color="#88C0D0" />
        <directionalLight position={[0, 1, -4]} intensity={0.5} />
        <Suspense fallback={null}>
          <GirlModel hovering={hovering} />
        </Suspense>
      </Canvas>
    </div>
  );
}
