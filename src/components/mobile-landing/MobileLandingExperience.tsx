'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useDragProgress } from '@/hooks/useDragProgress';
import ParticleField from './ParticleField';
import LandingContent from './LandingContent';
import MobileLoginPanel from './MobileLoginPanel';
import './mobile-landing.css';

/**
 * Dynamically import the GlassOrb (heavy Three.js dependency).
 * Shows a CSS placeholder while loading.
 */
const GlassOrb = dynamic(() => import('./GlassOrb'), {
  ssr: false,
  loading: () => null,
});

/**
 * Dynamically import the Prism (OGL WebGL background).
 */
const Prism = dynamic(() => import('./Prism'), {
  ssr: false,
  loading: () => null,
});

/**
 * MobileLandingExperience — the root orchestrator for the Wabi-inspired
 * mobile login page. All visual elements are driven by a single `progress`
 * value (0→1) from the spring-physics drag hook.
 *
 * Replaces the old MobileBlockedScreen for pre-login mobile users.
 */
export default function MobileLandingExperience() {
  const { progress, isDragging, isComplete, orbPixelX, orbPixelY, ref: dragRef, reset } =
    useDragProgress();
  const [loaded, setLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // For reduced motion: skip animation, show login directly
  if (prefersReducedMotion) {
    return (
      <div className="mobile-landing-root">
        <LandingContent progress={1} />
        <MobileLoginPanel progress={1} isComplete={true} onReset={() => {}} />
      </div>
    );
  }

  return (
    <div
      className="mobile-landing-root"
      role="main"
      aria-label="DSA Tracker Mobile Login"
    >
      {/* Hidden SVG filter for glass distortion */}
      <svg className="glass-svg-filters" aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="glass-displacement" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={isDragging ? 0.022 : 0.015}
              numOctaves="2"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={isDragging ? 38 : 25}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* OGL Prism Background effect */}
      {mounted && (
        <div 
          className="mobile-landing-prism-bg" 
          style={{ opacity: 1 - progress * 0.4 }}
        >
          <Prism
            animationType="rotate"
            timeScale={0.3}
            height={3.2}
            baseWidth={5.2}
            scale={3.6}
            hueShift={0.2}
            colorFrequency={1.1}
            noise={0.12}
            glow={1.15}
            suspendWhenOffscreen={false}
          />
        </div>
      )}

      {/* Particle system (canvas 2D) */}
      <ParticleField progress={progress} orbPixelY={orbPixelY} />

      {/* Typography layers */}
      <LandingContent progress={progress} />

      {/* Combined Glass Orb Element (both CSS blur and 3D reflections) */}
      {mounted && (
        <div
          ref={dragRef}
          className="glass-orb-combined-container"
          style={{
            position: 'absolute',
            left: `${orbPixelX}px`,
            top: `${orbPixelY}px`,
            transform: `translate(-50%, -50%) scale(${isDragging ? 0.94 : 1.0})`,
            width: '230px',
            height: '230px',
            zIndex: 99,
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none',
          }}
        >
          {/* CSS backdrop magnifier (blur & distortion) */}
          <div
            className="glass-orb-magnifier"
            style={{
              opacity: loaded ? 1 - progress * 0.15 : 0,
            }}
          />

          {/* CSS Placeholder (before 3D loads) */}
          {!loaded && <div className="glass-orb-placeholder" />}

          {/* 3D Glass reflections (centered inside this container) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              opacity: loaded ? 1 : 0,
              transition: 'opacity 0.4s ease',
            }}
          >
            <GlassOrb
              isDragging={isDragging}
              onLoad={() => setLoaded(true)}
            />
          </div>
        </div>
      )}


      {/* Login panel (fades in at high progress) */}
      <MobileLoginPanel progress={progress} isComplete={isComplete} onReset={reset} />

      {/* Screen reader hint */}
      <p
        className="sr-only"
        aria-live="polite"
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
      >
        {isComplete
          ? 'Login options are now visible. Please choose a sign-in method.'
          : 'Swipe up on the glass orb to reveal login options.'}
      </p>
    </div>
  );
}
