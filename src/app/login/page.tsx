'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
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
        color: 'var(--th-nord8)',
    },
    {
        icon: Target,
        title: 'Track',
        desc: 'Your streaks, ratings, and topic completion are automatically tracked.',
        color: 'var(--th-nord9)',
    },
    {
        icon: BarChart3,
        title: 'Improve',
        desc: 'See exactly where you are weak and what to practice next.',
        color: 'var(--th-nord14)',
    },
];

const featureHighlights = [
    { icon: Code2, label: '750+ Curated Problems' },
    { icon: Target, label: 'Topic-based Study Path' },
    { icon: Flame, label: 'Daily Streak Tracking' },
    { icon: Calendar, label: 'Calendar Planning' },
    { icon: Award, label: 'Automated Exams' },
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
                // Collision with floor or ceiling
                if (nextY < 0 || nextY > GROUND_Y - BIRD_SIZE) {
                    setGameState('gameover');
                    return y;
                }
                return nextY;
            });
            setBirdVelocity((v) => v + GRAVITY);

            setPipes((prev) => {
                let next = prev.map((p) => ({ ...p, x: p.x - PIPE_SPEED }));

                // Add new pipe
                if (next.length === 0 || next[next.length - 1].x < GAME_WIDTH - PIPE_SPACING) {
                    next.push({
                        x: GAME_WIDTH,
                        topHeight: Math.random() * (GROUND_Y - PIPE_GAP - 100) + 50,
                    });
                }

                // Remove old pipe
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

                // Collision Detection
                const birdX = 50;
                const birdRect = { left: birdX, right: birdX + BIRD_SIZE, top: birdY, bottom: birdY + BIRD_SIZE };

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
            className="relative w-[320px] h-[400px] mx-auto rounded-2xl overflow-hidden cursor-pointer select-none border-4 border-nord3 shadow-inner bg-nord0"
            style={{ backgroundColor: 'var(--th-nord0)' }}
        >
            {/* Background elements */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute bottom-0 w-full h-1/4 bg-nord8" />
                <div className="absolute bottom-1/4 w-full h-1/2 bg-nord9" />
            </div>

            {/* Pipes */}
            {pipes.map((p, i) => (
                <React.Fragment key={i}>
                    {/* Top Pipe */}
                    <div
                        className="absolute bg-nord14 border-x-4 border-b-4 border-nord3 rounded-b-lg"
                        style={{ left: p.x, top: 0, width: PIPE_WIDTH, height: p.topHeight }}
                    />
                    {/* Bottom Pipe */}
                    <div
                        className="absolute bg-nord14 border-x-4 border-t-4 border-nord3 rounded-t-lg"
                        style={{ left: p.x, top: p.topHeight + PIPE_GAP, width: PIPE_WIDTH, height: GROUND_Y - (p.topHeight + PIPE_GAP) }}
                    />
                </React.Fragment>
            ))}

            {/* Ground */}
            <div className="absolute bottom-0 w-full h-[40px] bg-nord3 z-20" />

            {/* Bird */}
            <motion.div
                animate={{ rotate: birdVelocity * 5 }}
                className="absolute left-[50px] w-[30px] h-[30px] rounded-full bg-nord15 border-2 border-nord5 flex items-center justify-center shadow-lg z-30"
                style={{ top: birdY, width: BIRD_SIZE, height: BIRD_SIZE }}
            >
                <div className="w-1.5 h-1.5 bg-nord0 rounded-full ml-1 md-0.5" />
            </motion.div>

            {/* UI Overlay */}
            <div className="absolute top-8 left-0 w-full text-center z-40 pointer-events-none">
                <p className="text-4xl font-black text-nord5 drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]">{score}</p>
                <p className="text-[10px] font-bold text-nord8 uppercase tracking-widest mt-1">Score 10 to reveal dev</p>
            </div>

            {gameState === 'idle' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-nord0/60 z-50 backdrop-blur-[2px]">
                    <div className="animate-bounce mb-4">
                        <MousePointer2 size={48} className="text-nord8" />
                    </div>
                    <p className="text-xl font-bold text-nord6">Click to Jump</p>
                    <p className="text-sm opacity-60 text-nord4 mt-2">Space works too</p>
                </div>
            )}

            {gameState === 'gameover' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-nord11/20 z-50 backdrop-blur-sm animate-in fade-in zoom-in">
                    <h3 className="text-2xl font-black text-nord11 mb-2">CRASHED!</h3>
                    <p className="text-sm font-bold text-nord6 mb-6">Score: {score}</p>
                    <button
                        onClick={(e) => { e.stopPropagation(); resetGame(); }}
                        className="px-6 py-2 rounded-full bg-nord8 text-nord0 font-bold hover:scale-105 transition-transform shadow-lg"
                    >
                        Try Again
                    </button>
                    {score >= 10 && <p className="text-xs text-nord14 font-bold mt-4">Unlocking Identity...</p>}
                </div>
            )}

            {/* Success Animation */}
            {score >= 10 && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center z-[60] pointer-events-none"
                >
                    <div className="w-40 h-40 bg-nord14 rounded-full blur-3xl opacity-50" />
                    <Sparkles size={64} className="text-nord14 absolute" />
                </motion.div>
            )}
        </div>
    );
}

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

    const { isLoggedIn, login, loginWithGithub } = useAppStore();
    const router = useRouter();
    const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        setMounted(true);
        getUserCount().then(setUserCount);
    }, []);

    useEffect(() => {
        if (mounted && isLoggedIn) router.push('/dashboard');
    }, [mounted, isLoggedIn, router]);

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

    if (!mounted || isLoggedIn) return null;

    return (
        <div className="min-h-screen relative flex flex-col items-center overflow-x-hidden transition-colors" style={{ backgroundColor: 'var(--th-nord0)' }}>

            {/* ── Background Elements ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20" style={{ background: 'var(--th-nord8)' }} />
                <div className="absolute bottom-[10%] right-[-10%] w-[35%] h-[35%] rounded-full blur-[140px] opacity-10" style={{ background: 'var(--th-nord15)' }} />
            </div>

            {/* ── Phase 1: Top Nav ── */}
            <nav className="w-full max-w-[1200px] flex items-center justify-between p-6 lg:p-8 relative z-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, var(--th-nord8), var(--th-nord10))' }}>
                        <Zap size={20} style={{ color: 'var(--th-nord0)' }} />
                    </div>
                    <span className="font-bold text-xl tracking-tight" style={{ color: 'var(--th-nord5)' }}>DSA Tracker</span>
                </div>
                <div className="hidden sm:flex items-center gap-6">
                    <button onClick={() => setFooterModal('privacy')} className="text-sm font-medium opacity-60 hover:opacity-100 transition-opacity" style={{ color: 'var(--th-nord4)' }}>Privacy</button>
                    <button onClick={() => setFooterModal('github')} className="text-sm font-medium opacity-60 hover:opacity-100 transition-opacity" style={{ color: 'var(--th-nord4)' }}>Developer</button>
                </div>
            </nav>

            {/* ── Phase 2: Hero Section ── */}
            <main className="w-full max-w-[1200px] flex flex-col items-center px-6 lg:px-10 py-12 lg:py-20 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-6 mb-16"
                >
                    <h1 className="text-4xl md:text-6xl lg:text-[64px] font-[800] leading-[1.1] tracking-tight" style={{ color: 'var(--th-nord6)' }}>
                        Track your DSA journey.<br />
                        Build consistency.<br />
                        <span style={{ background: 'linear-gradient(90deg, var(--th-nord8), var(--th-nord9))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Crack placements.
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed opacity-80" style={{ color: 'var(--th-nord4)' }}>
                        A structured system to solve 750+ curated problems, track streaks, and build real interview readiness.
                    </p>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-wrap items-center justify-center gap-4 pt-4"
                    >
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                            <Users size={16} className="text-nord8" />
                            <span className="text-sm font-bold" style={{ color: 'var(--th-nord4)' }}>
                                Join <span className="text-nord8">{userCount?.toLocaleString() || '1500+'}</span> aspirants tracking their prep.
                            </span>
                        </div>
                    </motion.div>
                </motion.div>

                {/* ── Phase 3: Visual Product Walkthrough ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mb-24 relative">
                    {/* Connection lines (desktop only) */}
                    <div className="hidden md:block absolute top-[40px] left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-nord3/40 to-transparent" />

                    {productSteps.map((s, i) => (
                        <motion.div
                            key={s.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + i * 0.2 }}
                            className="bg-white/[0.03] border border-white/5 p-8 rounded-3xl hover:bg-white/[0.05] transition-all group relative"
                        >
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"
                                style={{ background: `color-mix(in srgb, ${s.color} 15%, transparent)`, color: s.color }}>
                                <s.icon size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--th-nord5)' }}>{s.title}</h3>
                            <p className="text-sm leading-relaxed opacity-60" style={{ color: 'var(--th-nord4)' }}>{s.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* ── Phase 5, 6: Login Panel & How it Works ── */}
                <div id="login-section" className="w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-2 gap-16 items-start py-20">

                    {/* How it Works / Social Proof */}
                    <div className="text-left space-y-12">
                        <section className="space-y-6">
                            <h2 className="text-3xl font-bold" style={{ color: 'var(--th-nord6)' }}>How it works</h2>
                            <div className="space-y-4 relative pl-8">
                                {/* Flow line */}
                                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-nord3" />

                                {[
                                    { text: 'Pick Topic', color: 'var(--th-nord8)' },
                                    { text: 'Solve Problems', color: 'var(--th-nord9)' },
                                    { text: 'Track Progress', color: 'var(--th-nord10)' },
                                    { text: 'Build Streak', color: 'var(--th-nord14)' },
                                    { text: 'Crack Interviews', color: 'var(--th-nord12)' },
                                ].map((step, i) => (
                                    <div key={i} className="flex items-center gap-4 group">
                                        <div className="w-6 h-6 rounded-full border-2 border-nord3 bg-nord0 flex items-center justify-center z-10 group-hover:border-nord8 transition-colors">
                                            <div className="w-2 h-2 rounded-full bg-nord8 scale-0 group-hover:scale-100 transition-transform" />
                                        </div>
                                        <span className="text-base font-medium opacity-60 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--th-nord4)' }}>
                                            {step.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div className="p-6 rounded-2xl bg-nord8/5 border border-nord8/10">
                            <p className="text-nord8 text-sm font-medium leading-relaxed italic">
                                &quot;Used by students preparing for FAANG and top level startups. The structure makes all the difference.&quot;
                            </p>
                        </div>
                    </div>

                    {/* Phase 5: Login Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="rounded-[40px] p-10 md:p-14 md:px-16 relative"
                        style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                            backdropFilter: 'blur(24px)'
                        }}
                    >
                        <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-nord8/10 blur-xl animate-pulse" />

                        <div className="space-y-8">
                            <div className="text-center">
                                <h1 className="text-2xl font-bold" style={{ color: 'var(--th-nord6)' }}>Continue your DSA journey</h1>
                                <p className="text-sm mt-2 opacity-50" style={{ color: 'var(--th-nord4)' }}>Start Tracking Your Progress</p>
                            </div>

                            {step === STEPS.USERNAME && (
                                <div className="space-y-6">
                                    {/* Privacy */}
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                                        <button
                                            onClick={() => setAcceptedPrivacy(!acceptedPrivacy)}
                                            className="w-5 h-5 rounded border mt-0.5 flex items-center justify-center transition-all bg-white/5 hover:bg-white/10"
                                            style={{ borderColor: acceptedPrivacy ? 'var(--th-nord14)' : 'var(--th-nord3)' }}
                                        >
                                            {acceptedPrivacy && <CheckCircle size={14} className="text-nord14" />}
                                        </button>
                                        <p className="text-[11px] leading-relaxed opacity-60 text-left" style={{ color: 'var(--th-nord4)' }}>
                                            I accept the <button onClick={() => setFooterModal('privacy')} className="underline hover:text-white">privacy policy</button>. I understand my progress is synced securely.
                                        </p>
                                    </div>

                                    {/* Github */}
                                    <button
                                        onClick={handleGithubLogin}
                                        disabled={githubLoading || !acceptedPrivacy}
                                        className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-sm transition-all hover:scale-[1.03] active:scale-[0.98] shadow-xl group border border-white/10"
                                        style={{
                                            background: !acceptedPrivacy ? 'var(--th-nord3)' : 'linear-gradient(135deg, #24292e 0%, #1b1f23 100%)',
                                            opacity: !acceptedPrivacy ? 0.5 : 1,
                                            cursor: !acceptedPrivacy ? 'not-allowed' : 'pointer',
                                            color: '#fff'
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
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-20" style={{ color: 'var(--th-nord4)' }}>or</span>
                                        <div className="flex-1 h-px bg-white/5" />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="relative">
                                            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                                                onKeyDown={(e) => e.key === 'Enter' && handleUsernameNext()}
                                                placeholder="Enter username"
                                                className="w-full pl-12 pr-4 py-4 rounded-xl text-sm bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-nord8/50 transition-all font-medium"
                                                style={{ color: 'var(--th-nord5)' }}
                                            />
                                        </div>
                                        {error && <p className="text-[11px] text-nord11 text-center">⚠ {error}</p>}
                                        <button
                                            onClick={handleUsernameNext}
                                            disabled={!username.trim()}
                                            className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-2xl shadow-nord8/30 group/btn"
                                            style={{ background: 'var(--th-nord8)', color: 'var(--th-nord0)' }}
                                        >
                                            <span className="group-hover/btn:translate-x-[-2px] transition-transform">Start tracking progress</span>
                                            <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === STEPS.PASSCODE && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="flex items-center gap-3 mb-2">
                                        <button onClick={() => setStep(STEPS.USERNAME)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 opacity-60">
                                            <ChevronLeft size={16} />
                                        </button>
                                        <div className="text-left">
                                            <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">Account found</p>
                                            <p className="text-sm font-bold" style={{ color: 'var(--th-nord8)' }}>@{username}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-center gap-3">
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
                                                className="w-14 h-14 text-center text-xl font-bold rounded-xl border-2 focus:outline-none transition-all bg-white/5"
                                                style={{
                                                    borderColor: passcode[i] ? 'var(--th-nord8)' : 'var(--th-nord3)',
                                                    color: 'var(--th-nord6)'
                                                }}
                                            />
                                        ))}
                                    </div>
                                    {error && <p className="text-[11px] text-nord11 text-center font-medium">⚠ {error}</p>}
                                    <button
                                        onClick={() => handleLogin(passcode.join(''))}
                                        disabled={loading || passcode.join('').length !== 4}
                                        className="w-full py-4 rounded-xl bg-nord8 text-nord0 font-bold text-sm hover:bg-nord9 hover:scale-[1.03] transition-all disabled:opacity-30"
                                    >
                                        {loading ? <div className="w-5 h-5 border-2 rounded-full animate-spin border-nord0/20 border-t-nord0 mx-auto" /> : (isNewUser ? 'Create Account' : 'Start Solving')}
                                    </button>
                                </div>
                            )}

                            <p className="text-center text-[10px] opacity-40 uppercase tracking-widest pt-4" style={{ color: 'var(--th-nord4)' }}>
                                Your progress syncs securely across devices.
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* ── Phase 4: Product Preview ── */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2, duration: 1 }}
                    className="w-full max-w-5xl mb-32 relative group border-t border-white/5 pt-24"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-nord8/20 to-transparent blur-3xl opacity-20" />
                    <div className="relative rounded-[32px] overflow-hidden border border-white/10 shadow-2xl bg-nord1/50 backdrop-blur-sm aspect-[16/9] flex flex-col group">
                        {/* Browser Header Mock */}
                        <div className="h-10 border-b border-white/10 flex items-center px-4 gap-2 bg-nord0/40 z-20">
                            {[1, 2, 3].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-white/20" />)}
                        </div>

                        {/* Real Dashboard Image (Blurred) */}
                        <div className="absolute inset-0 pt-10 blur-[8px] group-hover:blur-[4px] transition-all duration-700 select-none grayscale group-hover:grayscale-0 pointer-events-none">
                            <img
                                src="/images/dashboard-preview.png"
                                alt="Dashboard Preview"
                                className="w-full h-full object-cover"
                                draggable="false"
                            />
                        </div>

                        {/* Text Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-nord0/40 backdrop-blur-[1px] z-10 pointer-events-none">
                            <div className="text-center p-8">
                                <h3 className="text-2xl font-bold mb-2 drop-shadow-lg" style={{ color: 'var(--th-nord6)' }}>Know exactly where you stand.</h3>
                                <p className="text-sm opacity-80 drop-shadow-md" style={{ color: 'var(--th-nord4)' }}>No guessing your preparation level.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ── Phase 8: Feature Highlights ── */}
                <div className="w-full max-w-5xl py-24">
                    <h2 className="text-xl font-bold opacity-30 uppercase tracking-[.25em] text-center mb-12">System Features</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {featureHighlights.map((f, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -5 }}
                                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center gap-3 text-center"
                            >
                                <div className="w-8 h-8 rounded-lg bg-nord3/40 flex items-center justify-center" style={{ color: 'var(--th-nord8)' }}>
                                    <f.icon size={16} />
                                </div>
                                <span className="text-[11px] font-bold leading-tight" style={{ color: 'var(--th-nord5)' }}>{f.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>

            {/* ── Phase 13: Trust Signals ── */}
            <footer className="w-full border-t border-white/5 mt-auto bg-nord0/50 backdrop-blur-md">
                <div className="max-w-[1200px] mx-auto p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 justify-center md:justify-start">
                            <Zap size={16} className="text-nord8" />
                            <span className="font-bold text-nord6">DSA Tracker</span>
                        </div>
                        <p className="text-xs opacity-50" style={{ color: 'var(--th-nord4)' }}>© 2026 Structured Progress for Aspirants</p>
                    </div>

                    <div className="flex gap-8 text-[11px] font-bold uppercase tracking-widest opacity-40">
                        <button onClick={() => setFooterModal('about')} className="hover:opacity-100 hover:text-nord8 transition-all">About</button>
                        <button onClick={() => setFooterModal('privacy')} className="hover:opacity-100 hover:text-nord8 transition-all">Privacy</button>
                        <button onClick={() => setFooterModal('github')} className="hover:opacity-100 hover:text-nord8 transition-all">GitHub</button>
                        <button onClick={() => setFooterModal('contact')} className="hover:opacity-100 hover:text-nord8 transition-all">Contact</button>
                    </div>
                </div>
            </footer>

            {/* ── Modals (Keep Existing) ── */}
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
                            style={{ background: 'var(--th-nord0)', borderColor: 'var(--th-nord3)' }}
                        >
                            <button
                                onClick={() => setFooterModal(null)}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors opacity-40 hover:opacity-100"
                            >✕</button>

                            {footerModal === 'about' && (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--th-nord8)' }}>
                                        <Info size={20} /> About The Project
                                    </h3>
                                    <div className="text-sm leading-relaxed opacity-70 space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar" style={{ color: 'var(--th-nord6)' }}>
                                        <p>This tool was built to solve the &quot;random practice&quot; problem. Most students solve high volumes of questions but lack a structured sequence or tracking mechanism.</p>
                                        <p>By blending verified sheets, streak tracking, and automated exams, we create a high-integrity environment for preparation.</p>
                                        <hr className="border-white/10 my-4" />
                                        <p className="font-bold text-nord8">Built by Ankith Yellanathi</p>
                                        <p>Engineering consistency since the dawn of binary search.</p>
                                    </div>
                                </div>
                            )}

                            {footerModal === 'privacy' && (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold flex items-center gap-2 text-nord11">
                                        <ShieldCheck size={20} /> Privacy Policy
                                    </h3>
                                    <div className="text-sm leading-relaxed opacity-70 space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar" style={{ color: 'var(--th-nord6)' }}>
                                        <p><strong>1. Data Storage:</strong> We store your progress (solved questions, streaks, notes) on Google Firebase.</p>
                                        <p><strong>2. Authentication:</strong> Your PIN is hashed. We don&apos;t store plain-text passwords.</p>
                                        <p><strong>3. Transparency:</strong> We don&apos;t sell data. We don&apos;t run ads. This is a tool for students.</p>
                                    </div>
                                </div>
                            )}

                            {footerModal === 'github' && (
                                <div className="space-y-6 text-center">
                                    <h3 className="text-xl font-bold flex items-center justify-center gap-2" style={{ color: 'var(--th-nord8)' }}>
                                        <Github size={24} /> The Developer&apos;s Lair
                                    </h3>

                                    {score >= 10 ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="space-y-6"
                                        >
                                            <div className="w-24 h-24 bg-gradient-to-br from-nord8 to-nord9 rounded-full mx-auto flex items-center justify-center text-nord0 shadow-xl shadow-nord8/20 border-4 border-white/10 ring-4 ring-nord8/20">
                                                <Github size={48} />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-2xl font-black text-nord6">krishnakoushik9</h4>
                                                <p className="text-sm opacity-60 text-nord4 font-medium">Building tools for developers.</p>
                                            </div>
                                            <div className="pt-4 flex flex-col gap-3">
                                                <a href="https://github.com/krishnakoushik9" target="_blank" className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-nord8 text-nord0 font-black text-sm hover:scale-[1.05] active:scale-95 transition-all shadow-lg shadow-nord8/20">
                                                    GitHub Profile <ExternalLink size={16} />
                                                </a>
                                                <p className="text-[10px] uppercase font-bold tracking-[.2em] opacity-30">Identity Unlocked</p>
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
                                    <div className="w-16 h-16 bg-nord15/20 rounded-2xl mx-auto flex items-center justify-center text-nord15 mb-4">
                                        <Mail size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold">Get in Touch</h3>
                                    <p className="text-sm opacity-60">Feedback or issues? DM me.</p>
                                    <a href="https://www.instagram.com/thebatman/" target="_blank" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-sm">
                                        Instagram <ExternalLink size={14} />
                                    </a>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <DancingGirl3DLazy mode="login" />
        </div>
    );
}
