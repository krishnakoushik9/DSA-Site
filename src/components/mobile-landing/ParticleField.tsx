'use client';

import React, { useRef, useEffect, useCallback } from 'react';

/**
 * DSA-themed color palette for floating particles.
 */
const PARTICLE_COLORS = [
  '#FF6B6B', // Warm red
  '#4ECDC4', // Teal
  '#45B7D1', // Sky blue
  '#96CEB4', // Sage green
  '#FFEAA7', // Gold
  '#DDA0DD', // Plum
  '#FF9A8B', // Salmon
  '#A8E6CF', // Mint
  '#FFD93D', // Bright yellow
  '#6C5CE7', // Purple
  '#FD79A8', // Pink
  '#00B894', // Emerald
];

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  opacity: number;
  baseOpacity: number;
  color: string;
  phase: number;
  floatSpeedX: number;
  floatSpeedY: number;
  /** Optional inner glow gradient */
  hasGlow: boolean;
  /** DSA icon type drawn inside large particles */
  iconType: 'none' | 'tree' | 'graph' | 'brackets' | 'hash';
}

interface ParticleFieldProps {
  /** Normalized 0→1 drag progress */
  progress: number;
  /** Current pixel-Y of the glass orb center */
  orbPixelY: number;
}

const PARTICLE_COUNT = 18;

function createParticles(width: number, height: number): Particle[] {
  const particles: Particle[] = [];
  const iconTypes: Particle['iconType'][] = ['none', 'tree', 'graph', 'brackets', 'hash'];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const radius = 8 + Math.random() * 28;
    const x = width * 0.1 + Math.random() * width * 0.8;
    const y = height * 0.05 + Math.random() * height * 0.45;
    const baseOpacity = 0.25 + Math.random() * 0.55;

    particles.push({
      x,
      y,
      baseX: x,
      baseY: y,
      radius,
      opacity: baseOpacity,
      baseOpacity,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      phase: Math.random() * Math.PI * 2,
      floatSpeedX: 0.2 + Math.random() * 0.5,
      floatSpeedY: 0.15 + Math.random() * 0.4,
      hasGlow: radius > 16 && Math.random() > 0.4,
      iconType: radius > 20 && Math.random() > 0.6
        ? iconTypes[Math.floor(Math.random() * iconTypes.length)]
        : 'none',
    });
  }

  // Sort by size so large particles are drawn first (behind smaller ones)
  return particles.sort((a, b) => b.radius - a.radius);
}

/**
 * Draw a tiny DSA-themed icon inside a particle.
 */
function drawIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  iconType: Particle['iconType'],
  alpha: number
) {
  if (iconType === 'none') return;

  ctx.save();
  ctx.globalAlpha = alpha * 0.3;
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 1.2;
  ctx.lineCap = 'round';

  const s = radius * 0.35;

  switch (iconType) {
    case 'tree': {
      // Simple binary tree
      ctx.beginPath();
      ctx.moveTo(x, y - s * 0.6);
      ctx.lineTo(x - s * 0.5, y + s * 0.3);
      ctx.moveTo(x, y - s * 0.6);
      ctx.lineTo(x + s * 0.5, y + s * 0.3);
      // Child nodes
      ctx.moveTo(x - s * 0.5, y + s * 0.3);
      ctx.lineTo(x - s * 0.8, y + s * 0.8);
      ctx.moveTo(x - s * 0.5, y + s * 0.3);
      ctx.lineTo(x - s * 0.2, y + s * 0.8);
      ctx.stroke();
      break;
    }
    case 'graph': {
      // Small graph nodes
      const nodes = [
        [x - s * 0.4, y - s * 0.3],
        [x + s * 0.4, y - s * 0.2],
        [x, y + s * 0.4],
      ];
      // Edges
      ctx.beginPath();
      ctx.moveTo(nodes[0][0], nodes[0][1]);
      ctx.lineTo(nodes[1][0], nodes[1][1]);
      ctx.lineTo(nodes[2][0], nodes[2][1]);
      ctx.lineTo(nodes[0][0], nodes[0][1]);
      ctx.stroke();
      // Nodes
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      nodes.forEach(([nx, ny]) => {
        ctx.beginPath();
        ctx.arc(nx, ny, 2, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }
    case 'brackets': {
      // Code brackets { }
      ctx.font = `bold ${s * 1.2}px monospace`;
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('{ }', x, y);
      break;
    }
    case 'hash': {
      // Hash/table grid
      const g = s * 0.5;
      ctx.beginPath();
      ctx.moveTo(x - g * 0.3, y - g);
      ctx.lineTo(x - g * 0.3, y + g);
      ctx.moveTo(x + g * 0.3, y - g);
      ctx.lineTo(x + g * 0.3, y + g);
      ctx.moveTo(x - g, y - g * 0.3);
      ctx.lineTo(x + g, y - g * 0.3);
      ctx.moveTo(x - g, y + g * 0.3);
      ctx.lineTo(x + g, y + g * 0.3);
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

export default function ParticleField({ progress, orbPixelY }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const dprRef = useRef(1);

  // Initialize particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    dprRef.current = dpr;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      // Re-create particles on resize
      particlesRef.current = createParticles(w, h);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Animation progress refs (avoid re-renders)
  const progressRef = useRef(progress);
  const orbYRef = useRef(orbPixelY);
  progressRef.current = progress;
  orbYRef.current = orbPixelY;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = dprRef.current;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const p = progressRef.current;
    const orbY = orbYRef.current;
    const orbX = w / 2;
    const time = timeRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);

    // Global progress-based fade (particles disappear by progress=1)
    const globalAlpha = Math.max(0, 1 - p * 1.3);

    particlesRef.current.forEach((particle) => {
      // Idle float animation
      const floatX =
        Math.sin(time * particle.floatSpeedX + particle.phase) * 12;
      const floatY =
        Math.cos(time * particle.floatSpeedY + particle.phase * 1.3) * 8;

      let px = particle.baseX + floatX;
      let py = particle.baseY + floatY;

      // Magnetic repulsion from orb
      const dx = px - orbX;
      const dy = py - orbY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const repulsionRadius = 120 + p * 80;

      if (dist < repulsionRadius && dist > 0) {
        const force = (1 - dist / repulsionRadius) * (2 + p * 4);
        px += (dx / dist) * force * 8;
        py += (dy / dist) * force * 6;
      }

      // Progress-based scale and opacity
      const scaleMultiplier = Math.max(0, 1 - p * 1.2);
      const currentRadius = particle.radius * scaleMultiplier;
      const currentOpacity = particle.baseOpacity * globalAlpha;

      if (currentRadius < 0.5 || currentOpacity < 0.01) return;

      particle.x = px;
      particle.y = py;

      // Draw particle
      ctx.save();
      ctx.globalAlpha = currentOpacity;

      // Glow
      if (particle.hasGlow && currentRadius > 8) {
        const glowGrad = ctx.createRadialGradient(
          px, py, currentRadius * 0.3,
          px, py, currentRadius * 1.8
        );
        glowGrad.addColorStop(0, particle.color + '40');
        glowGrad.addColorStop(1, particle.color + '00');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(px, py, currentRadius * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Main circle with gradient
      const grad = ctx.createRadialGradient(
        px - currentRadius * 0.3,
        py - currentRadius * 0.3,
        currentRadius * 0.1,
        px,
        py,
        currentRadius
      );
      grad.addColorStop(0, particle.color + 'CC');
      grad.addColorStop(0.7, particle.color + '99');
      grad.addColorStop(1, particle.color + '33');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, currentRadius, 0, Math.PI * 2);
      ctx.fill();

      // Glass-like inner highlight
      if (currentRadius > 10) {
        const hlGrad = ctx.createRadialGradient(
          px - currentRadius * 0.25,
          py - currentRadius * 0.3,
          0,
          px - currentRadius * 0.15,
          py - currentRadius * 0.2,
          currentRadius * 0.6
        );
        hlGrad.addColorStop(0, 'rgba(255,255,255,0.35)');
        hlGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = hlGrad;
        ctx.beginPath();
        ctx.arc(px, py, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // DSA icon
      if (particle.iconType !== 'none' && currentRadius > 12) {
        drawIcon(ctx, px, py, currentRadius, particle.iconType, currentOpacity);
      }

      ctx.restore();
    });

    ctx.restore();

    timeRef.current += 0.016; // ~60fps assumed
    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="particle-field-canvas"
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2,
      }}
    />
  );
}
