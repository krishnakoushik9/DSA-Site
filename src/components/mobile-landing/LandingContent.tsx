'use client';

import React from 'react';

interface LandingContentProps {
  /** Normalized 0→1 drag progress */
  progress: number;
}

export default function LandingContent({ progress }: LandingContentProps) {
  // Headline: visible at progress 0, fades out by 0.55
  const headlineOpacity = Math.max(0, 1 - progress * 2.2);
  const headlineY = progress * -40;
  const headlineScale = 1 - progress * 0.08;

  // "Swipe up" hint: visible at progress 0, fades out by 0.3
  const hintOpacity = Math.max(0, 1 - progress * 4);

  // Login prompt: invisible until 0.5, full by 0.85
  const loginPromptOpacity = Math.max(0, (progress - 0.5) * 2.86);
  const loginPromptY = (1 - Math.min(1, (progress - 0.4) * 2.5)) * 30;

  return (
    <>
      {/* Landing headline — fades out as orb rises */}
      <div
        className="landing-content-headline"
        style={{
          opacity: headlineOpacity,
          transform: `translateX(-50%) translateY(${headlineY}px) scale(${headlineScale})`,
          pointerEvents: headlineOpacity < 0.1 ? 'none' : 'auto',
        }}
      >
        <h1 className="landing-headline-text">
          Master DSA.
          <br />
          <span className="landing-headline-accent">Crack Placements.</span>
        </h1>
        <p className="landing-tagline-text">
          A structured system to solve 750+ curated problems, track streaks,
          and build real interview readiness.
        </p>
      </div>

      {/* Swipe up hint — below the orb */}
      <div
        className="landing-swipe-hint"
        style={{
          opacity: hintOpacity,
          transform: `translateX(-50%) translateY(${progress * -20}px)`,
        }}
      >
        <div className="swipe-hint-chevrons">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </div>
        <span>Swipe up to enter</span>
      </div>

      {/* Login prompt — fades in as orb reaches top */}
      <div
        className="landing-login-prompt"
        style={{
          opacity: loginPromptOpacity,
          transform: `translateX(-50%) translateY(${loginPromptY}px)`,
          pointerEvents: loginPromptOpacity < 0.1 ? 'none' : 'auto',
        }}
      >
        <h2 className="login-prompt-title">
          Welcome to
          <br />
          <span className="login-prompt-brand">DSA Tracker</span>
        </h2>
        <p className="login-prompt-subtitle">
          Sign in to continue your journey.
        </p>
      </div>
    </>
  );
}
