'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import {
    Zap,
    ArrowRight,
    Brain,
    Target,
    Sparkles,
    BookOpen,
    Trophy,
    Lock,
    KeyRound,
    ChevronLeft,
    User,
    Info,
    CheckCircle2,
    Code2,
    Github,
    Heart,
    Users,
    Flame,
    ShieldCheck,
    ExternalLink,
    Mail,
    Search,
    BarChart3,
    Calendar,
    Award,
    Briefcase,
    CheckCircle,
    MousePointer2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { getUserCount } from '@/lib/firebase';

const DancingGirl3DLazy = dynamic(() => import('@/components/DancingGirl3D'), { ssr: false });

const STEPS = {
    USERNAME: 'username',
    PASSCODE: 'passcode',
} as const;
type Step = typeof STEPS[keyof typeof STEPS];

const productSteps = [
    {
        icon: Brain,
        title: 'Solve',
        desc: 'Solve curated DSA questions organized by topic. No random practice. Just structured progression.',
        color: '#5e81f4',
    },
    {
        icon: Sparkles,
        title: 'Execute & Test',
        desc: 'Run code intelligently against AI-generated bounds and edge cases to validate logic.',
        color: '#bf67f5',
    },
    {
        icon: Target,
        title: 'Track',
        desc: 'Your streaks, ratings, and topic completion are automatically tracked.',
        color: '#5e81f4',
    },
    {
        icon: BarChart3,
        title: 'Improve',
        desc: 'See exactly where you are weak and what to practice next.',
        color: '#a3be8c',
    },
];

const featureHighlights = [
    { icon: Code2, label: '750+ Curated Problems' },
    { icon: Sparkles, label: 'AI Test Case Engine', highlight: true },
    { icon: Target, label: 'Topic-based Study Path' },
    { icon: Flame, label: 'Daily Streak Tracking' },
    { icon: Calendar, label: 'Calendar Planning' },
    { icon: Briefcase, label: 'Company Prep Mode' },
];

/* ── Flappy Bird Game Identity Gate ─────────────────────────────────────────── */
function FlappyBirdGame({ onSuccess }: { onSuccess: () => void }) {
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
    const [score, setScore] = useState(0);
    const [birdY, setBirdY] = useState(150);
    const [birdVelocity, setBirdVelocity] = useState(0);
    const [pipes, setPipes] = useState<{ x: number; topHeight: number }[]>([]);
    const gameRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number | null>(null);

    const GRAVITY = 0.18;
    const JUMP_STRENGTH = -4.2;
    const PIPE_SPEED = 1.8;
    const PIPE_SPACING = 220;
    const PIPE_WIDTH = 52;
    const BIRD_SIZE = 24;
    const GROUND_Y = 360;
    const GAME_WIDTH = 320;
    const PIPE_GAP = 140;

    const jump = () => {
        if (gameState === 'idle') {
            setGameState('playing');
            setBirdVelocity(JUMP_STRENGTH);
        } else if (gameState === 'playing') {
            setBirdVelocity(JUMP_STRENGTH);
        } else if (gameState === 'gameover') {
            resetGame();
        }
    };

    const resetGame = () => {
        setBirdY(150);
        setBirdVelocity(0);
        setScore(0);
        setPipes([]);
        setGameState('playing');
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                jump();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState]);

    useEffect(() => {
        if (gameState !== 'playing') return;

        const loop = () => {
            setBirdY((y) => {
                const nextY = y + birdVelocity;
                if (nextY < 0 || nextY > GROUND_Y - BIRD_SIZE) {
                    setGameState('gameover');
                    return y;
                }
                return nextY;
            });
            setBirdVelocity((v) => v + GRAVITY);

            setPipes((prev) => {
                let next = prev.map((p) => ({ ...p, x: p.x - PIPE_SPEED }));

                if (next.length === 0 || next[next.length - 1].x < GAME_WIDTH - PIPE_SPACING) {
                    next.push({
                        x: GAME_WIDTH,
                        topHeight: Math.random() * (GROUND_Y - PIPE_GAP - 100) + 50,
                    });
                }

                if (next[0].x < -PIPE_WIDTH) {
                    next.shift();
                    setScore((s) => {
                        const newScore = s + 1;
                        if (newScore >= 10) {
                            setTimeout(onSuccess, 500);
                        }
                        return newScore;
                    });
                }

                const birdX = 50;
                for (const p of next) {
                    if (birdX + BIRD_SIZE > p.x && birdX < p.x + PIPE_WIDTH) {
                        if (birdY < p.topHeight || birdY + BIRD_SIZE > p.topHeight + PIPE_GAP) {
                            setGameState('gameover');
                        }
                    }
                }

                return next;
            });

            animationRef.current = requestAnimationFrame(loop);
        };

        animationRef.current = requestAnimationFrame(loop);
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [gameState, birdVelocity, birdY, onSuccess]);

    return (
        <div
            ref={gameRef}
            onClick={jump}
            className="relative w-[320px] h-[400px] mx-auto rounded-2xl overflow-hidden cursor-pointer select-none border-4 border-nord3 shadow-inner"
            style={{ backgroundColor: '#000000' }}
        >
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute bottom-0 w-full h-1/4" style={{ background: '#5e81f4' }} />
                <div className="absolute bottom-1/4 w-full h-1/2" style={{ background: '#5e81f4' }} />
            </div>

            {pipes.map((p, i) => (
                <React.Fragment key={i}>
                    <div
                        className="absolute border-x-4 border-b-4 border-nord3 rounded-b-lg"
                        style={{ left: p.x, top: 0, width: PIPE_WIDTH, height: p.topHeight, background: '#a3be8c' }}
                    />
                    <div
                        className="absolute border-x-4 border-t-4 border-nord3 rounded-t-lg"
                        style={{ left: p.x, top: p.topHeight + PIPE_GAP, width: PIPE_WIDTH, height: GROUND_Y - (p.topHeight + PIPE_GAP), background: '#a3be8c' }}
                    />
                </React.Fragment>
            ))}

            <div className="absolute bottom-0 w-full h-[40px] z-20" style={{ background: '#1a1a1a' }} />

            <motion.div
                animate={{ rotate: birdVelocity * 5 }}
                className="absolute left-[50px] rounded-full border-2 border-white/30 flex items-center justify-center shadow-lg z-30"
                style={{ top: birdY, width: BIRD_SIZE, height: BIRD_SIZE, background: '#bf67f5' }}
            >
                <div className="w-1.5 h-1.5 rounded-full ml-1" style={{ background: '#000000' }} />
            </motion.div>

            <div className="absolute top-8 left-0 w-full text-center z-40 pointer-events-none">
                <p className="text-4xl font-black text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]">{score}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: '#5e81f4' }}>Score 10 to reveal dev</p>
            </div>

            {gameState === 'idle' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-50 backdrop-blur-[2px]" style={{ background: 'rgba(0,0,0,0.6)' }}>
                    <div className="animate-bounce mb-4">
                        <MousePointer2 size={48} style={{ color: '#5e81f4' }} />
                    </div>
                    <p className="text-xl font-bold text-white">Click to Jump</p>
                    <p className="text-sm opacity-60 mt-2" style={{ color: '#888888' }}>Space works too</p>
                </div>
            )}

            {gameState === 'gameover' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-50 backdrop-blur-sm" style={{ background: 'rgba(236,76,71,0.15)' }}>
                    <h3 className="text-2xl font-black mb-2" style={{ color: '#ec4c47' }}>CRASHED!</h3>
                    <p className="text-sm font-bold text-white mb-6">Score: {score}</p>
                    <button
                        onClick={(e) => { e.stopPropagation(); resetGame(); }}
                        className="px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform shadow-lg"
                        style={{ background: '#5e81f4', color: '#000000' }}
                    >
                        Try Again
                    </button>
                    {score >= 10 && <p className="text-xs font-bold mt-4" style={{ color: '#a3be8c' }}>Unlocking Identity...</p>}
                </div>
            )}

            {score >= 10 && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center z-[60] pointer-events-none"
                >
                    <div className="w-40 h-40 rounded-full blur-3xl opacity-50" style={{ background: '#a3be8c' }} />
                    <Sparkles size={64} className="absolute" style={{ color: '#a3be8c' }} />
                </motion.div>
            )}
        </div>
    );
}

/* ── Watching Eyes ─────────────────────────────────────────────────────────── */
const MAX_TRAVEL = 14;

function Eye({ eyeRef, pupilRef, blinkRef }: {
    eyeRef: React.RefObject<HTMLDivElement | null>;
    pupilRef: React.RefObject<HTMLDivElement | null>;
    blinkRef: React.RefObject<HTMLDivElement | null>;
}) {
    return (
        <div style={{ position: 'relative', width: 72, height: 72 }}>
            <div
                ref={eyeRef}
                style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: '#111', border: '2px solid #1a1a1a',
                    position: 'relative', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
            >
                <div
                    ref={pupilRef}
                    style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: '#ffffff', position: 'absolute',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'transform 0.08s cubic-bezier(.22,.68,0,1.2)',
                    }}
                >
                    <div style={{
                        width: 18, height: 18, borderRadius: '50%',
                        background: '#5e81f4', position: 'absolute',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#000' }} />
                    </div>
                    <div style={{
                        width: 4, height: 4, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.85)',
                        position: 'absolute', top: 4, left: 6,
                    }} />
                </div>
                <div
                    ref={blinkRef}
                    style={{
                        position: 'absolute', inset: 0, borderRadius: '50%',
                        background: '#000', transform: 'scaleY(0)',
                        transformOrigin: 'center',
                        transition: 'transform 0.07s ease-in',
                        pointerEvents: 'none', zIndex: 10,
                    }}
                />
            </div>
        </div>
    );
}

export function WatchingEyes() {
    const eyeL = useRef<HTMLDivElement>(null);
    const eyeR = useRef<HTMLDivElement>(null);
    const pupilL = useRef<HTMLDivElement>(null);
    const pupilR = useRef<HTMLDivElement>(null);
    const blinkL = useRef<HTMLDivElement>(null);
    const blinkR = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function getCenter(el: HTMLDivElement) {
            const r = el.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }

        function movePupil(pupil: HTMLDivElement, eye: HTMLDivElement, mx: number, my: number) {
            const c = getCenter(eye);
            const dx = mx - c.x;
            const dy = my - c.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const factor = Math.min(dist, MAX_TRAVEL * 3) / (MAX_TRAVEL * 3);
            const travel = factor * MAX_TRAVEL;
            const angle = Math.atan2(dy, dx);
            pupil.style.transform = `translate(${Math.cos(angle) * travel}px, ${Math.sin(angle) * travel}px)`;
        }

        function onMouseMove(e: MouseEvent) {
            if (pupilL.current && eyeL.current) movePupil(pupilL.current, eyeL.current, e.clientX, e.clientY);
            if (pupilR.current && eyeR.current) movePupil(pupilR.current, eyeR.current, e.clientX, e.clientY);
        }

        function onTouchMove(e: TouchEvent) {
            const t = e.touches[0];
            if (pupilL.current && eyeL.current) movePupil(pupilL.current, eyeL.current, t.clientX, t.clientY);
            if (pupilR.current && eyeR.current) movePupil(pupilR.current, eyeR.current, t.clientX, t.clientY);
        }

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('touchmove', onTouchMove, { passive: true });

        let timer: ReturnType<typeof setTimeout>;
        function blink() {
            [blinkL.current, blinkR.current].forEach(b => {
                if (!b) return;
                b.style.transition = 'transform 0.07s ease-in';
                b.style.transform = 'scaleY(1)';
                setTimeout(() => {
                    if (b) {
                        b.style.transition = 'transform 0.10s ease-out';
                        b.style.transform = 'scaleY(0)';
                    }
                }, 120);
            });
            timer = setTimeout(blink, 2500 + Math.random() * 3000);
        }
        timer = setTimeout(blink, 1800);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchmove', onTouchMove);
            clearTimeout(timer);
        };
    }, []);

    return (
        <div style={{
            display: 'flex',
            gap: 36,
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 0 8px',
        }}>
            <Eye eyeRef={eyeL} pupilRef={pupilL} blinkRef={blinkL} />
            <Eye eyeRef={eyeR} pupilRef={pupilR} blinkRef={blinkR} />
        </div>
    );
}

/* ── Login Page ─────────────────────────────────────────────────────────────── */
export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [passcode, setPasscode] = useState(['', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState<Step>(STEPS.USERNAME);
    const [mounted, setMounted] = useState(false);
    const [isNewUser, setIsNewUser] = useState(false);
    const [githubLoading, setGithubLoading] = useState(false);
    const [userCount, setUserCount] = useState<number | null>(null);
    const [footerModal, setFooterModal] = useState<'about' | 'privacy' | 'github' | 'contact' | null>(null);
    const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
    const [score, setScore] = useState(0);
    const [usernameFocused, setUsernameFocused] = useState(false);
    const [showPrivacyPopover, setShowPrivacyPopover] = useState(false);

    const usernameInputRef = useRef<HTMLInputElement>(null);
    const usernameTooltipRef = useRef<HTMLDivElement>(null);
    const usernameArrowRef = useRef<HTMLDivElement>(null);
    const privacyBtnRef = useRef<HTMLButtonElement>(null);
    const privacyPopoverRef = useRef<HTMLDivElement>(null);
    const pinRowRef = useRef<HTMLDivElement>(null);
    const pinTooltipRef = useRef<HTMLDivElement>(null);

    const { isLoggedIn, login, loginWithGithub } = useAppStore();
    const router = useRouter();
    const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        setMounted(true);
        getUserCount().then(setUserCount);
    }, []);

    useEffect(() => {
        let cleanup = false;
        async function updatePositions() {
            if (!mounted) return;
            const { computePosition, offset, flip, shift, arrow } = await import('@floating-ui/dom');
            if (cleanup) return;

            const isUsernameInvalid = username.length > 0 && (username.length < 5 || username.length > 20 || /[^a-z0-9_-]/i.test(username));
            if (usernameFocused && isUsernameInvalid && usernameInputRef.current && usernameTooltipRef.current) {
                const middleware = [offset(8), flip(), shift({ padding: 8 })];
                if (usernameArrowRef.current) {
                    middleware.push(arrow({ element: usernameArrowRef.current }));
                }

                const { x, y, placement, middlewareData } = await computePosition(
                    usernameInputRef.current,
                    usernameTooltipRef.current,
                    { placement: 'top', middleware }
                );
                if (!cleanup && usernameTooltipRef.current) {
                    Object.assign(usernameTooltipRef.current.style, { left: `${x}px`, top: `${y}px`, display: 'block' });
                    if (middlewareData.arrow && usernameArrowRef.current) {
                        const { x: ax, y: ay } = middlewareData.arrow;
                        const staticSide = ({ top: 'bottom', right: 'left', bottom: 'top', left: 'right' } as any)[placement.split('-')[0]] || 'bottom';
                        Object.assign(usernameArrowRef.current.style, {
                            left: ax != null ? `${ax}px` : '',
                            top: ay != null ? `${ay}px` : '',
                            right: '', bottom: '',
                            [staticSide]: '-4px',
                        });
                    }
                }
            } else if (usernameTooltipRef.current) {
                usernameTooltipRef.current.style.display = 'none';
            }

            if (showPrivacyPopover && privacyBtnRef.current && privacyPopoverRef.current) {
                const { x, y } = await computePosition(privacyBtnRef.current, privacyPopoverRef.current, {
                    placement: 'right-start',
                    middleware: [offset(16), flip(), shift({ padding: 16 })],
                });
                if (!cleanup && privacyPopoverRef.current) {
                    Object.assign(privacyPopoverRef.current.style, { left: `${x}px`, top: `${y}px`, display: 'block' });
                }
            } else if (privacyPopoverRef.current) {
                privacyPopoverRef.current.style.display = 'none';
            }

            const allPinsFilled = passcode.every(p => p !== '');
            if (allPinsFilled && !loading && pinRowRef.current && pinTooltipRef.current) {
                const { x, y } = await computePosition(pinRowRef.current, pinTooltipRef.current, {
                    placement: 'bottom',
                    middleware: [offset(12), flip(), shift({ padding: 8 })],
                });
                if (!cleanup && pinTooltipRef.current) {
                    Object.assign(pinTooltipRef.current.style, { left: `${x}px`, top: `${y}px`, display: 'block' });
                }
            } else if (pinTooltipRef.current) {
                pinTooltipRef.current.style.display = 'none';
            }
        }
        updatePositions();
        return () => { cleanup = true; };
    }, [mounted, usernameFocused, username, showPrivacyPopover, passcode, loading]);

    useEffect(() => {
        if (mounted && isLoggedIn) router.push('/dashboard');
    }, [mounted, isLoggedIn, router]);

    const handleUsernameNext = () => {
        const trimmed = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
        if (!trimmed || trimmed.length < 5) { setError('Username must be at least 5 characters.'); return; }
        if (trimmed.length > 20) { setError('Username cannot exceed 20 characters.'); return; }
        setUsername(trimmed);
        setError('');
        setStep(STEPS.PASSCODE);
        setTimeout(() => pinRefs.current[0]?.focus(), 100);
    };

    const handlePinChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newPin = [...passcode];
        newPin[index] = value.slice(-1);
        setPasscode(newPin);
        setError('');
        if (value && index < 3) pinRefs.current[index + 1]?.focus();
        if (newPin.every(d => d !== '') && index === 3) handleLogin(newPin.join(''));
    };

    const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !passcode[index] && index > 0) pinRefs.current[index - 1]?.focus();
        if (e.key === 'Enter') { const pin = passcode.join(''); if (pin.length === 4) handleLogin(pin); }
    };

    const handleLogin = async (pin: string) => {
        if (pin.length !== 4) { setError('Please enter all 4 digits'); return; }
        setLoading(true);
        setError('');
        try {
            const result = await login(username, pin);
            if (result.success) {
                if (result.isNew) {
                    try { localStorage.setItem('dsa_week_celebration', '1'); } catch {}
                }
                router.push('/dashboard');
            } else {
                const errMsg = result.error || 'Login failed';
                if (errMsg.toLowerCase().includes('new user')) setIsNewUser(true);
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

    const handleGithubLogin = async () => {
        if (!acceptedPrivacy) return;
        setGithubLoading(true);
        setError('');
        try {
            const result = await loginWithGithub();
            if (result.success) {
                if (result.isNew) {
                    try { localStorage.setItem('dsa_week_celebration', '1'); } catch {}
                }
                router.push('/dashboard');
            }
            else { setError(result.error || 'GitHub sign-in failed.'); }
        } catch {
            setError('GitHub sign-in failed. Please try again.');
        } finally {
            setGithubLoading(false);
        }
    };

    if (!mounted || isLoggedIn) return null;

    const allPinsFilled = passcode.every(p => p !== '');

    return (
        <div className="login-root min-h-screen relative flex flex-col items-center overflow-x-hidden" style={{ backgroundColor: '#000000' }}>

            <style>{`
                .login-root {
                    --th-nord0: #000000;
                    --th-nord1: #0a0a0a;
                    --th-nord2: #0a0a0a;
                    --th-nord3: #1a1a1a;
                    --th-nord4: #888888;
                    --th-nord5: #ffffff;
                    --th-nord6: #ffffff;
                    --th-nord8: #5e81f4;
                    --th-nord9: #5e81f4;
                    --th-nord10: #5e81f4;
                    --th-nord11: #ec4c47;
                    --th-nord12: #ec4c47;
                    --th-nord14: #a3be8c;
                    --th-nord15: #bf67f5;
                }
                @keyframes amoled-pulse {
                    0%   { box-shadow: 0 0 0 0px rgba(94,129,244,0.7); }
                    100% { box-shadow: 0 0 0 6px rgba(94,129,244,0); }
                }
                .pulse-ring {
                    animation: amoled-pulse 0.4s ease-out forwards;
                    border-color: #5e81f4 !important;
                }
            `}</style>

            {/* Background blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20" style={{ background: '#5e81f4' }} />
                <div className="absolute bottom-[10%] right-[-10%] w-[35%] h-[35%] rounded-full blur-[140px] opacity-10" style={{ background: '#bf67f5' }} />
            </div>

            {/* Nav */}
            <nav className="w-full max-w-[1200px] flex items-center justify-between p-6 lg:p-8 relative z-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #5e81f4, #bf67f5)' }}>
                        <Zap size={20} style={{ color: '#000000' }} />
                    </div>
                    <span className="font-bold text-xl tracking-tight" style={{ color: '#ffffff' }}>DSA Tracker</span>
                </div>
                <div className="hidden sm:flex items-center gap-6">
                    <button onClick={() => setFooterModal('privacy')} className="text-sm font-medium opacity-60 hover:opacity-100 transition-opacity" style={{ color: '#888888' }}>Privacy</button>
                    <button onClick={() => setFooterModal('github')} className="text-sm font-medium opacity-60 hover:opacity-100 transition-opacity" style={{ color: '#888888' }}>Developer</button>
                </div>
            </nav>

            {/* Main */}
            <main className="w-full max-w-[1200px] flex flex-col items-center px-6 lg:px-10 py-12 lg:py-20 relative z-10 text-center">

                {/* Hero */}
                <div className="space-y-6 mb-16">
                    <WatchingEyes />
                    <h1
                        data-aos="fade-up"
                        data-aos-duration="900"
                        className="text-4xl md:text-6xl lg:text-[64px] font-[800] leading-[1.1] tracking-tight"
                        style={{ color: '#ffffff' }}
                    >
                        Track your DSA journey.<br />
                        Build consistency.<br />
                        <span style={{ background: 'linear-gradient(90deg, #5e81f4, #bf67f5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Crack placements.
                        </span>
                    </h1>
                    <p
                        data-aos="fade-up"
                        data-aos-delay="150"
                        className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed opacity-80"
                        style={{ color: '#888888' }}
                    >
                        A structured system to solve 750+ curated problems, track streaks, and build real interview readiness.
                    </p>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-wrap items-center justify-center gap-4 pt-4"
                    >
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                            <Users size={16} style={{ color: '#5e81f4' }} />
                            <span className="text-sm font-bold" style={{ color: '#888888' }}>
                                Join <span style={{ color: '#5e81f4' }}>{userCount?.toLocaleString() || '1500+'}</span> aspirants tracking their prep.
                            </span>
                        </div>
                    </motion.div>
                </div>

                {/* Product Steps — AOS, no framer-motion */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl mb-24 relative">
                    <div className="hidden lg:block absolute top-[56px] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    {productSteps.map((s, i) => (
                        <div
                            key={s.title}
                            data-aos="fade-up"
                            data-aos-delay={String(i * 100)}
                            className="bg-white/[0.03] border border-white/5 p-8 rounded-3xl hover:bg-white/[0.05] transition-all group relative text-center"
                        >
                            <div
                                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform relative z-10"
                                style={{ backgroundColor: '#000000', color: s.color }}
                            >
                                <span className="font-bold text-lg tracking-wider">0{i + 1}</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3" style={{ color: '#ffffff' }}>{s.title}</h3>
                            <p className="text-sm leading-relaxed opacity-60" style={{ color: '#888888' }}>{s.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Login Panel + How it Works */}
                <div id="login-section" className="w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-2 gap-16 items-start py-20">

                    {/* How it works */}
                    <div className="text-left space-y-12">
                        <section className="space-y-6">
                            <h2 className="text-3xl font-bold" style={{ color: '#ffffff' }}>How it works</h2>
                            <div className="space-y-4 relative pl-8">
                                <div className="absolute left-[11px] top-2 bottom-2 w-px" style={{ background: '#1a1a1a' }} />
                                {[
                                    { text: 'Pick Topic' },
                                    { text: 'Solve Problems' },
                                    { text: 'Execute AI Tests' },
                                    { text: 'Track Progress' },
                                    { text: 'Build Streak' },
                                    { text: 'Crack Interviews' },
                                ].map((s, i) => (
                                    <div
                                        key={i}
                                        data-aos="fade-left"
                                        data-aos-delay={String(i * 60)}
                                        className="flex items-center gap-4 group"
                                    >
                                        <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 transition-colors" style={{ borderColor: '#1a1a1a', background: '#000000' }}>
                                            <div className="w-2 h-2 rounded-full scale-0 group-hover:scale-100 transition-transform" style={{ background: '#5e81f4' }} />
                                        </div>
                                        <span className="text-base font-medium opacity-60 group-hover:opacity-100 transition-opacity" style={{ color: '#888888' }}>
                                            {s.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div className="p-6 rounded-2xl border" style={{ background: 'rgba(94,129,244,0.05)', borderColor: 'rgba(94,129,244,0.1)' }}>
                            <p className="text-sm font-medium leading-relaxed italic" style={{ color: '#5e81f4' }}>
                                &quot;Used by students preparing for FAANG and top level startups. The structure makes all the difference.&quot;
                            </p>
                        </div>
                    </div>

                    {/* Login Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="rounded-[40px] p-10 md:p-14 md:px-16 relative"
                        style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(24px)',
                        }}
                    >
                        <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full animate-pulse" style={{ background: 'rgba(94,129,244,0.1)', filter: 'blur(16px)' }} />

                        <div className="space-y-8">
                            <div className="text-center">
                                <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>Continue your DSA journey</h1>
                                <p className="text-sm mt-2 opacity-50" style={{ color: '#888888' }}>Start Tracking Your Progress</p>
                            </div>

                            {step === STEPS.USERNAME && (
                                <div className="space-y-6">
                                    {/* Privacy checkbox */}
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                                        <button
                                            onClick={() => setAcceptedPrivacy(!acceptedPrivacy)}
                                            className="w-5 h-5 rounded border mt-0.5 flex items-center justify-center transition-all bg-white/5 hover:bg-white/10"
                                            style={{ borderColor: acceptedPrivacy ? '#a3be8c' : '#1a1a1a' }}
                                        >
                                            {acceptedPrivacy && <CheckCircle size={14} style={{ color: '#a3be8c' }} />}
                                        </button>
                                        <p className="text-[11px] leading-relaxed opacity-60 text-left" style={{ color: '#888888' }}>
                                            I accept the{' '}
                                            <button
                                                ref={privacyBtnRef}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (window.innerWidth < 640) setFooterModal('privacy');
                                                    else setShowPrivacyPopover(!showPrivacyPopover);
                                                }}
                                                className="underline hover:text-white"
                                            >
                                                privacy policy
                                            </button>
                                            . I understand my progress is synced securely.
                                        </p>
                                    </div>

                                    {/* GitHub */}
                                    <button
                                        onClick={handleGithubLogin}
                                        disabled={githubLoading || !acceptedPrivacy}
                                        className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-sm transition-all hover:scale-[1.03] active:scale-[0.98] shadow-xl border border-white/10"
                                        style={{
                                            background: !acceptedPrivacy ? '#1a1a1a' : 'linear-gradient(135deg, #24292e 0%, #1b1f23 100%)',
                                            opacity: !acceptedPrivacy ? 0.5 : 1,
                                            cursor: !acceptedPrivacy ? 'not-allowed' : 'pointer',
                                            color: '#fff',
                                        }}
                                    >
                                        {githubLoading ? (
                                            <div className="w-5 h-5 border-2 rounded-full animate-spin border-white/20 border-t-white" />
                                        ) : (
                                            <>
                                                <Github size={20} />
                                                <span>Sign in with GitHub to sync</span>
                                            </>
                                        )}
                                    </button>

                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 h-px bg-white/5" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-20" style={{ color: '#888888' }}>or</span>
                                        <div className="flex-1 h-px bg-white/5" />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="relative">
                                            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" style={{ color: '#888888' }} />
                                            <input
                                                ref={usernameInputRef}
                                                onFocus={() => setUsernameFocused(true)}
                                                onBlur={() => setUsernameFocused(false)}
                                                type="text"
                                                value={username}
                                                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                                                onKeyDown={(e) => e.key === 'Enter' && handleUsernameNext()}
                                                placeholder="Enter username"
                                                className="w-full pl-12 pr-4 py-4 rounded-xl text-sm bg-white/5 border border-white/10 focus:outline-none focus:ring-2 transition-all font-medium"
                                                style={{ color: '#ffffff', focusRingColor: '#5e81f4' } as any}
                                            />
                                        </div>
                                        {error && <p className="text-[11px] text-center" style={{ color: '#ec4c47' }}>⚠ {error}</p>}
                                        <button
                                            onClick={handleUsernameNext}
                                            disabled={!username.trim()}
                                            className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed group/btn"
                                            style={{ background: '#5e81f4', color: '#000000' }}
                                        >
                                            <span className="group-hover/btn:translate-x-[-2px] transition-transform">Start tracking progress</span>
                                            <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === STEPS.PASSCODE && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <button
                                            onClick={() => setStep(STEPS.USERNAME)}
                                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 opacity-60"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <div className="text-left">
                                            <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">Account found</p>
                                            <p className="text-sm font-bold" style={{ color: '#5e81f4' }}>@{username}</p>
                                        </div>
                                    </div>

                                    <div ref={pinRowRef} className="flex justify-center gap-3">
                                        {[0, 1, 2, 3].map(i => (
                                            <input
                                                key={i}
                                                ref={el => { pinRefs.current[i] = el; }}
                                                type="password"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={passcode[i]}
                                                onChange={(e) => handlePinChange(i, e.target.value)}
                                                onKeyDown={(e) => handlePinKeyDown(i, e)}
                                                className={`w-14 h-14 text-center text-xl font-bold rounded-xl border-2 focus:outline-none transition-all bg-white/5 ${allPinsFilled ? 'pulse-ring' : ''}`}
                                                style={{
                                                    borderColor: passcode[i] ? '#5e81f4' : '#1a1a1a',
                                                    color: '#ffffff',
                                                }}
                                            />
                                        ))}
                                    </div>
                                    {error && <p className="text-[11px] text-center font-medium" style={{ color: '#ec4c47' }}>⚠ {error}</p>}
                                    <button
                                        onClick={() => handleLogin(passcode.join(''))}
                                        disabled={loading || passcode.join('').length !== 4}
                                        className="w-full py-4 rounded-xl font-bold text-sm hover:scale-[1.03] transition-all disabled:opacity-30"
                                        style={{ background: '#5e81f4', color: '#000000' }}
                                    >
                                        {loading
                                            ? <div className="w-5 h-5 border-2 rounded-full animate-spin border-black/20 border-t-black mx-auto" />
                                            : (isNewUser ? 'Create Account' : 'Start Solving')
                                        }
                                    </button>
                                </div>
                            )}

                            <p className="text-center text-[10px] opacity-40 uppercase tracking-widest pt-4" style={{ color: '#888888' }}>
                                Your progress syncs securely across devices.
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Product Preview */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2, duration: 1 }}
                    className="w-full max-w-5xl mb-32 relative group border-t border-white/5 pt-24"
                >
                    <div className="relative rounded-[32px] overflow-hidden border border-white/10 shadow-2xl backdrop-blur-sm aspect-[16/9] flex flex-col group" style={{ background: 'rgba(10,10,10,0.5)' }}>
                        <div className="h-10 border-b border-white/10 flex items-center px-4 gap-2 z-20" style={{ background: 'rgba(0,0,0,0.4)' }}>
                            {[1, 2, 3].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-white/20" />)}
                        </div>
                        <div className="absolute inset-0 pt-10 blur-[8px] group-hover:blur-[4px] transition-all duration-700 select-none grayscale group-hover:grayscale-0 pointer-events-none">
                            <img src="/images/dashboard-preview.png" alt="Dashboard Preview" className="w-full h-full object-cover" draggable="false" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[1px] z-10 pointer-events-none" style={{ background: 'rgba(0,0,0,0.4)' }}>
                            <div className="text-center p-8">
                                <h3 className="text-2xl font-bold mb-2 drop-shadow-lg" style={{ color: '#ffffff' }}>Know exactly where you stand.</h3>
                                <p className="text-sm opacity-80 drop-shadow-md" style={{ color: '#888888' }}>No guessing your preparation level.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Feature Highlights — AOS, no framer-motion */}
                <div className="w-full max-w-5xl py-24">
                    <h2 className="text-xl font-bold opacity-30 uppercase tracking-[.25em] text-center mb-12" style={{ color: '#ffffff' }}>System Features</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {featureHighlights.map((f, i) => (
                            <div
                                key={i}
                                data-aos="zoom-in"
                                data-aos-delay={String(i * 50)}
                                className={`hover:-translate-y-1 p-4 rounded-2xl border flex flex-col items-center gap-3 text-center relative overflow-hidden transition-all ${f.highlight
                                    ? 'scale-105 z-10'
                                    : ''
                                    }`}
                                style={{
                                    background: f.highlight ? 'rgba(163,190,140,0.08)' : 'rgba(255,255,255,0.02)',
                                    borderColor: f.highlight ? 'rgba(163,190,140,0.25)' : 'rgba(255,255,255,0.05)',
                                    boxShadow: f.highlight ? '0 0 20px rgba(163,190,140,0.12)' : 'none',
                                }}
                            >
                                {f.highlight && (
                                    <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full animate-pulse" style={{ background: 'rgba(163,190,140,0.25)', filter: 'blur(12px)' }} />
                                )}
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center relative z-10"
                                    style={{
                                        background: f.highlight ? 'rgba(163,190,140,0.15)' : 'rgba(94,129,244,0.1)',
                                        color: f.highlight ? '#a3be8c' : '#5e81f4',
                                    }}
                                >
                                    <f.icon size={16} />
                                </div>
                                <span
                                    className="text-[11px] font-bold leading-tight relative z-10"
                                    style={{ color: f.highlight ? '#a3be8c' : '#ffffff' }}
                                >
                                    {f.label}
                                </span>
                                {f.highlight && (
                                    <span
                                        className="absolute top-1.5 right-1.5 text-[7px] uppercase font-black px-1.5 py-0.5 rounded"
                                        style={{ background: '#a3be8c', color: '#000000' }}
                                    >
                                        Hot
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer
                data-aos="fade-up"
                className="w-full border-t border-white/5 mt-auto backdrop-blur-md"
                style={{ background: 'rgba(0,0,0,0.5)' }}
            >
                <div className="max-w-[1200px] mx-auto p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 justify-center md:justify-start">
                            <Zap size={16} style={{ color: '#5e81f4' }} />
                            <span className="font-bold" style={{ color: '#ffffff' }}>DSA Tracker</span>
                        </div>
                        <p className="text-xs opacity-50" style={{ color: '#888888' }}>© 2026 Structured Progress for Aspirants</p>
                    </div>
                    <div className="flex gap-8 text-[11px] font-bold uppercase tracking-widest opacity-40">
                        <button onClick={() => setFooterModal('about')} className="hover:opacity-100 transition-all" style={{ color: '#ffffff' }}>About</button>
                        <button onClick={() => setFooterModal('privacy')} className="hover:opacity-100 transition-all" style={{ color: '#ffffff' }}>Privacy</button>
                        <button onClick={() => setFooterModal('github')} className="hover:opacity-100 transition-all" style={{ color: '#ffffff' }}>GitHub</button>
                        <button onClick={() => setFooterModal('contact')} className="hover:opacity-100 transition-all" style={{ color: '#ffffff' }}>Contact</button>
                    </div>
                </div>
            </footer>

            {/* Modals */}
            <AnimatePresence>
                {footerModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-md rounded-[32px] border p-8 space-y-4 shadow-2xl relative"
                            style={{ background: '#000000', borderColor: '#1a1a1a' }}
                        >
                            <button
                                onClick={() => setFooterModal(null)}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors opacity-40 hover:opacity-100"
                                style={{ color: '#ffffff' }}
                            >✕</button>

                            {footerModal === 'about' && (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: '#5e81f4' }}>
                                        <Info size={20} /> About The Project
                                    </h3>
                                    <div className="text-sm leading-relaxed opacity-70 space-y-3 max-h-[60vh] overflow-y-auto pr-2" style={{ color: '#ffffff' }}>
                                        <p>This tool was built to solve the &quot;random practice&quot; problem. Most students solve high volumes of questions but lack a structured sequence or tracking mechanism.</p>
                                        <p>By blending verified sheets, streak tracking, and automated exams, we create a high-integrity environment for preparation.</p>
                                        <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} className="my-4" />
                                        <p className="font-bold" style={{ color: '#5e81f4' }}>Built by Ankith Yellanathi</p>
                                        <p>Engineering consistency since the dawn of binary search.</p>
                                    </div>
                                </div>
                            )}

                            {footerModal === 'privacy' && (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: '#ec4c47' }}>
                                        <ShieldCheck size={20} /> Privacy Policy
                                    </h3>
                                    <div className="text-sm leading-relaxed opacity-70 space-y-3 max-h-[60vh] overflow-y-auto pr-2" style={{ color: '#ffffff' }}>
                                        <p><strong>1. Data Storage:</strong> We store your progress (solved questions, streaks, notes) on Google Firebase.</p>
                                        <p><strong>2. Authentication:</strong> Your PIN is hashed. We don&apos;t store plain-text passwords.</p>
                                        <p><strong>3. Transparency:</strong> We don&apos;t sell data. We don&apos;t run ads. This is a tool for students.</p>
                                    </div>
                                </div>
                            )}

                            {footerModal === 'github' && (
                                <div className="space-y-6 text-center">
                                    <h3 className="text-xl font-bold flex items-center justify-center gap-2" style={{ color: '#5e81f4' }}>
                                        <Github size={24} /> The Developer&apos;s Lair
                                    </h3>
                                    {score >= 10 ? (
                                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                                            <div
                                                className="w-24 h-24 rounded-full mx-auto flex items-center justify-center border-4 border-white/10"
                                                style={{ background: 'linear-gradient(135deg, #5e81f4, #bf67f5)', color: '#000000' }}
                                            >
                                                <Github size={48} />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-2xl font-black" style={{ color: '#ffffff' }}>krishnakoushik9</h4>
                                                <p className="text-sm opacity-60" style={{ color: '#888888' }}>Building tools for developers.</p>
                                            </div>
                                            <div className="pt-4 flex flex-col gap-3">
                                                <a
                                                    href="https://github.com/krishnakoushik9"
                                                    target="_blank"
                                                    className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-sm hover:scale-[1.05] active:scale-95 transition-all"
                                                    style={{ background: '#5e81f4', color: '#000000' }}
                                                >
                                                    GitHub Profile <ExternalLink size={16} />
                                                </a>
                                                <p className="text-[10px] uppercase font-bold tracking-[.2em] opacity-30" style={{ color: '#ffffff' }}>Identity Unlocked</p>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="py-4">
                                            <FlappyBirdGame onSuccess={() => setScore(10)} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {footerModal === 'contact' && (
                                <div className="space-y-4 text-center">
                                    <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4" style={{ background: 'rgba(191,103,245,0.15)', color: '#bf67f5' }}>
                                        <Mail size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold" style={{ color: '#ffffff' }}>Get in Touch</h3>
                                    <p className="text-sm opacity-60" style={{ color: '#888888' }}>Feedback or issues? DM me.</p>
                                    <a
                                        href="https://www.instagram.com/thebatman/"
                                        target="_blank"
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white"
                                        style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
                                    >
                                        Instagram <ExternalLink size={14} />
                                    </a>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AOS + Floating UI Portals — only after mount */}
            {mounted && (
                <>
                    <Script
                        src="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.min.js"
                        strategy="afterInteractive"
                        onLoad={() => {
                            // @ts-ignore
                            if (window.AOS) window.AOS.init({ once: true, duration: 700 });
                        }}
                    />

                    {/* Username tooltip */}
                    <div
                        ref={usernameTooltipRef}
                        style={{
                            position: 'absolute', display: 'none', top: 0, left: 0,
                            zIndex: 9999, backgroundColor: '#1a1a1a',
                            border: '1px solid #5e81f4', color: '#ffffff',
                            fontSize: '12px', padding: '6px 12px', borderRadius: '8px',
                            pointerEvents: 'none', whiteSpace: 'nowrap',
                        }}
                    >
                        5–20 chars, letters, numbers, _ or -
                        <div
                            ref={usernameArrowRef}
                            style={{
                                position: 'absolute', width: '8px', height: '8px',
                                backgroundColor: '#1a1a1a',
                                borderRight: '1px solid #5e81f4', borderBottom: '1px solid #5e81f4',
                                transform: 'rotate(45deg)',
                            }}
                        />
                    </div>

                    {/* Privacy popover */}
                    <div
                        ref={privacyPopoverRef}
                        style={{
                            position: 'absolute', display: 'none', top: 0, left: 0,
                            zIndex: 9999, backgroundColor: '#0a0a0a',
                            border: '1px solid #1a1a1a', maxWidth: '300px',
                            borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
                            padding: '16px',
                        }}
                    >
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: '#a3be8c' }}>
                                <ShieldCheck size={14} /> Privacy Info
                            </h3>
                            <button
                                onClick={() => setShowPrivacyPopover(false)}
                                className="opacity-50 hover:opacity-100 transition-opacity"
                                style={{ color: '#ffffff' }}
                            >✕</button>
                        </div>
                        <ul className="text-xs space-y-2" style={{ color: '#888888' }}>
                            <li>• Progress stored on Google Firebase</li>
                            <li>• PIN is securely hashed, never plain text</li>
                            <li>• No data sold, no ads, ever</li>
                        </ul>
                    </div>

                    {/* PIN tooltip */}
                    <div
                        ref={pinTooltipRef}
                        style={{
                            position: 'absolute', display: 'none', top: 0, left: 0,
                            zIndex: 9999, backgroundColor: '#1a1a1a',
                            border: '1px solid #5e81f4', color: '#ffffff',
                            fontSize: '12px', padding: '6px 12px', borderRadius: '8px',
                            pointerEvents: 'none', whiteSpace: 'nowrap',
                        }}
                    >
                        Press Enter to sign in
                    </div>
                </>
            )}

            <DancingGirl3DLazy mode="login" />
        </div>
    );
}