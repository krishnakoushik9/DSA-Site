'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import SpecularButton from './SpecularButton';

interface MobileLoginPanelProps {
  /** Normalized 0→1 drag progress */
  progress: number;
  /** Whether the drag interaction has completed (progress settled at 1) */
  isComplete: boolean;
  /** Callback to reset drag progress back to 0 */
  onReset: () => void;
}

type LoginStep = 'buttons' | 'username' | 'passcode';

export default function MobileLoginPanel({
  progress,
  isComplete,
  onReset,
}: MobileLoginPanelProps) {
  const [step, setStep] = useState<LoginStep>('buttons');
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [error, setError] = useState('');

  const usernameInputRef = useRef<HTMLInputElement>(null);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const { login, loginWithGithub, isLoggedIn } = useAppStore();

  // Redirect if logged in
  useEffect(() => {
    if (isLoggedIn) {
      router.push('/dashboard');
    }
  }, [isLoggedIn, router]);

  // Focus username input when switching to username step
  useEffect(() => {
    if (step === 'username') {
      setTimeout(() => usernameInputRef.current?.focus(), 300);
    }
  }, [step]);

  // Panel visibility based on progress
  const panelOpacity = Math.max(0, (progress - 0.55) * 3.33);
  const panelY = (1 - Math.min(1, (progress - 0.5) * 2.5)) * 60;

  if (panelOpacity < 0.01) return null;

  // — Auth handlers —

  const handleGithubLogin = async () => {
    setGithubLoading(true);
    setError('');
    try {
      const result = await loginWithGithub();
      if (result.success) {
        if (result.isNew) {
          try {
            localStorage.setItem('dsa_week_celebration', '1');
          } catch { /* noop */ }
        }
        router.push('/dashboard');
      } else {
        setError(result.error || 'GitHub sign-in failed.');
      }
    } catch {
      setError('GitHub sign-in failed. Please try again.');
    } finally {
      setGithubLoading(false);
    }
  };

  const handleUsernameNext = () => {
    const trimmed = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!trimmed || trimmed.length < 5) {
      setError('Username must be at least 5 characters.');
      return;
    }
    if (trimmed.length > 20) {
      setError('Username cannot exceed 20 characters.');
      return;
    }
    setUsername(trimmed);
    setError('');
    setStep('passcode');
    setTimeout(() => pinRefs.current[0]?.focus(), 100);
  };

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...passcode];
    newPin[index] = value.slice(-1);
    setPasscode(newPin);
    setError('');
    if (value && index < 3) pinRefs.current[index + 1]?.focus();
    if (newPin.every((d) => d !== '') && index === 3) {
      handleLogin(newPin.join(''));
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !passcode[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      const pin = passcode.join('');
      if (pin.length === 4) handleLogin(pin);
    }
  };

  const handleLogin = async (pin: string) => {
    if (pin.length !== 4) {
      setError('Please enter all 4 digits');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await login(username, pin);
      if (result.success) {
        if (result.isNew) {
          try {
            localStorage.setItem('dsa_week_celebration', '1');
          } catch { /* noop */ }
        }
        router.push('/dashboard');
      } else {
        const errMsg = result.error || 'Login failed';
        setError(errMsg);
        setPasscode(['', '', '', '']);
        pinRefs.current[0]?.focus();
      }
    } catch {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'passcode') {
      setStep('username');
      setPasscode(['', '', '', '']);
      setError('');
    } else if (step === 'username') {
      setStep('buttons');
      setUsername('');
      setError('');
    }
  };

  return (
    <div
      className="mobile-login-panel"
      style={{
        opacity: panelOpacity,
        transform: `translateY(${panelY}px)`,
        pointerEvents: panelOpacity > 0.3 && isComplete ? 'auto' : 'none',
      }}
    >
      {/* Buttons view */}
      {step === 'buttons' && (
        <div className="login-buttons-container">
          <button
            className="login-panel-dismiss-btn"
            onClick={onReset}
            aria-label="Go back to landing screen"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
            <span>Swipe down or tap here to close</span>
          </button>

          {/* GitHub button */}
          <SpecularButton
            size="lg"
            radius={22}
            tint="#ffffff"
            tintOpacity={0.85}
            blur={12}
            textColor="#1a1a1a"
            lineColor="#888888"
            baseColor="#d4d4d4"
            intensity={0.8}
            shineSize={12}
            shineFade={45}
            thickness={1}
            speed={0.25}
            autoAnimate
            disabled={githubLoading}
            onClick={handleGithubLogin}
            className="mobile-login-btn"
          >
            <span className="login-btn-inner">
              {githubLoading ? (
                <span className="login-spinner" />
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              )}
              <span>Continue with GitHub</span>
            </span>
          </SpecularButton>

          {/* Divider */}
          <div className="login-divider">
            <div className="login-divider-line" />
            <span className="login-divider-text">or</span>
            <div className="login-divider-line" />
          </div>

          {/* Username button */}
          <SpecularButton
            size="lg"
            radius={22}
            tint="#f5f5f5"
            tintOpacity={0.6}
            blur={8}
            textColor="#333333"
            lineColor="#aaaaaa"
            baseColor="#e0e0e0"
            intensity={0.5}
            shineSize={10}
            shineFade={40}
            thickness={1}
            speed={0.2}
            autoAnimate
            onClick={() => setStep('username')}
            className="mobile-login-btn"
          >
            <span className="login-btn-inner">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Continue with Username</span>
            </span>
          </SpecularButton>

          {error && <p className="login-error">{error}</p>}
        </div>
      )}

      {/* Username step */}
      {step === 'username' && (
        <div className="login-username-container">
          <button
            className="login-back-btn"
            onClick={handleBack}
            aria-label="Go back"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <h3 className="login-step-title">Enter your username</h3>
          <p className="login-step-subtitle">
            New users will create an account automatically
          </p>

          <input
            ref={usernameInputRef}
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleUsernameNext()}
            placeholder="username"
            autoCapitalize="none"
            autoComplete="username"
            className="login-text-input"
          />

          {error && <p className="login-error">{error}</p>}

          <button
            className="login-continue-btn"
            onClick={handleUsernameNext}
            disabled={!username.trim()}
          >
            Continue
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}

      {/* Passcode step */}
      {step === 'passcode' && (
        <div className="login-passcode-container">
          <button
            className="login-back-btn"
            onClick={handleBack}
            aria-label="Go back"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <h3 className="login-step-title">Enter passcode</h3>
          <p className="login-step-subtitle">
            4-digit PIN for <span className="login-username-badge">@{username}</span>
          </p>

          <div className="login-pin-row">
            {[0, 1, 2, 3].map((i) => (
              <input
                key={i}
                ref={(el) => { pinRefs.current[i] = el; }}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={passcode[i]}
                onChange={(e) => handlePinChange(i, e.target.value)}
                onKeyDown={(e) => handlePinKeyDown(i, e)}
                className="login-pin-input"
                autoComplete="one-time-code"
              />
            ))}
          </div>

          {error && <p className="login-error">{error}</p>}

          <button
            className="login-continue-btn"
            onClick={() => handleLogin(passcode.join(''))}
            disabled={loading || passcode.join('').length !== 4}
          >
            {loading ? (
              <span className="login-spinner" />
            ) : (
              'Sign In'
            )}
          </button>
        </div>
      )}

      <p className="login-sync-note">
        Your progress syncs securely across devices
      </p>
    </div>
  );
}
