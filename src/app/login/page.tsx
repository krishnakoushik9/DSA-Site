'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const DancingGirl3DLazy = dynamic(() => import('@/components/DancingGirl3D'), { ssr: false });
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
    Gamepad2,
    ExternalLink,
    Mail,
    Search,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getUserCount } from '@/lib/firebase';
import { format } from 'date-fns';

const STEPS = {
    USERNAME: 'username',
    PASSCODE: 'passcode',
} as const;
type Step = typeof STEPS[keyof typeof STEPS];

const features = [
    { icon: Brain, label: '755+ Questions', desc: 'FINAL450 + Fraz sheets' },
    { icon: Target, label: 'Smart Study Path', desc: 'Arrays → Graphs → DP flow' },
    { icon: Flame, label: 'Streaks & Ratings', desc: 'Daily DSA streak tracking' },
    { icon: BookOpen, label: 'Workspace', desc: 'Notes + whiteboard' },
];

const usernameRules = [
    'Use letters, numbers, underscores or hyphens',
    'Min 5 characters, max 20 characters',
    'No random words — use a real, identifiable name',
    'Same username = same progress on any device',
];

/* ─── Pathfinder Game ───────────────────────────────────────────────────────── */
function PathfinderGame({ onFinish }: { onFinish: () => void }) {
    const [grid, setGrid] = useState<number[]>(new Array(49).fill(0));
    const [pos, setPos] = useState(0);
    const target = 48;

    const move = (targetPos: number) => {
        if (targetPos < 0 || targetPos >= 49) return;
        setPos(targetPos);
        if (targetPos === target) onFinish();
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#84cc16]">Solve to see profile</p>
                <p className="text-[10px] opacity-40">Get to the bottom-right!</p>
            </div>
            <div className="grid grid-cols-7 gap-1 bg-[#1a202c] p-2 rounded-xl border border-white/5">
                {new Array(49).fill(0).map((_, i) => (
                    <div
                        key={i}
                        className={`w-full aspect-square rounded-sm border transition-all ${i === pos ? 'bg-[#84cc16] shadow-[0_0_10px_#84cc16]' : i === target ? 'bg-[#ef4444] animate-pulse' : 'bg-white/5 border-white/5'}`}
                    >
                        {i === pos && <div className="w-full h-full flex items-center justify-center text-[10px] bg-[#000]/20 rounded-sm">P</div>}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
                <div />
                <button onClick={() => move(pos - 7)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">↑</button>
                <div />
                <button onClick={() => move(pos - 1)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">←</button>
                <button onClick={() => move(pos + 7)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">↓</button>
                <button onClick={() => move(pos + 1)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">→</button>
            </div>
        </div>
    );
}

/* ─── Main Page ─────────────────────────────────────────────────────────────── */
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
    const [showGithubProfile, setShowGithubProfile] = useState(false);
    const [showGitCity, setShowGitCity] = useState(false);
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
        if (!trimmed || trimmed.length < 5) { setError('Username must be at least 5 characters (letters, numbers, - or _). No random words.'); return; }
        if (trimmed.length > 20) { setError('Username cannot exceed 20 characters'); return; }
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

    const handleBack = () => {
        setStep(STEPS.USERNAME);
        setPasscode(['', '', '', '']);
        setError('');
        setIsNewUser(false);
    };

    const handleGithubLogin = async () => {
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
        <div
            className="min-h-screen flex items-stretch overflow-hidden"
            style={{ backgroundColor: 'var(--th-nord0)' }}
        >

            {/* ── Left panel: branding ───────────────────────────────────────── */}
            <div
                className="hidden lg:flex flex-col justify-between w-[340px] shrink-0 p-8 relative overflow-hidden border-r"
                style={{ borderColor: 'color-mix(in srgb, var(--th-nord3) 15%, transparent)' }}
            >
                {/* ambient blobs */}
                <div className="absolute top-0 left-0 w-72 h-72 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" style={{ background: 'color-mix(in srgb, var(--th-nord8) 8%, transparent)' }} />
                <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-[140px] translate-x-1/3 -translate-y-1/3" style={{ background: 'color-mix(in srgb, var(--th-nord15) 5%, transparent)' }} />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, var(--th-nord8), var(--th-nord10))' }}>
                        <Zap size={16} style={{ color: 'var(--th-nord0)' }} />
                    </div>
                    <span className="font-bold text-base tracking-tight" style={{ color: 'var(--th-nord5)' }}>DSA Tracker</span>
                </div>

                {/* Hero */}
                <div className="relative z-10 space-y-6">
                    <div>
                        <h2 className="text-[26px] font-extrabold leading-[1.15] mb-4" style={{ color: 'var(--th-nord6)' }}>
                            Track your DSA journey and<br />
                            <span style={{ background: 'linear-gradient(90deg, var(--th-nord8), var(--th-nord9))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                stay consistent.
                            </span>
                        </h2>

                        <div className="mb-4 p-3 rounded-xl border bg-white/[0.02] border-white/5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                            <p className="text-[12px] font-medium opacity-80" style={{ color: 'var(--th-nord6)' }}>
                                Most quit DSA after 3 weeks.
                            </p>
                            <p className="text-[12px] font-medium mt-0.5" style={{ color: 'var(--th-nord8)' }}>
                                Track progress so you don&apos;t.
                            </p>
                        </div>

                        {userCount && (
                            <div className="flex items-center gap-2 mb-4 bg-white/5 py-1 px-3 rounded-full w-fit border border-white/10">
                                <Users size={10} className="text-[#84cc16]" />
                                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--th-nord4)' }}>
                                    Joined by <span className="text-[#84cc16]">{userCount.toLocaleString()}</span> aspirants
                                </span>
                            </div>
                        )}
                        <p className="text-[12px] leading-relaxed opacity-60 max-w-[280px]" style={{ color: 'var(--th-nord4)' }}>
                            Save your progress, build streaks, and solve curated questions to crack your dream job.
                        </p>
                    </div>

                    <div className="space-y-2.5">
                        {features.map((feat, i) => {
                            const Icon = feat.icon;
                            return (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border transition-colors hover:bg-white/[0.02]" style={{ background: 'color-mix(in srgb, var(--th-nord1) 50%, transparent)', borderColor: 'color-mix(in srgb, var(--th-nord3) 12%, transparent)' }}>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, var(--th-nord8) 12%, transparent)' }}>
                                        <Icon size={14} style={{ color: 'var(--th-nord8)' }} />
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-bold" style={{ color: 'var(--th-nord5)' }}>{feat.label}</p>
                                        <p className="text-[10px] opacity-40" style={{ color: 'var(--th-nord4)' }}>{feat.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Actions at bottom */}
                <div className="relative z-10 flex flex-col gap-2.5">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowGitCity(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border-2 transition-all hover:scale-105 active:scale-95 shadow-lg bg-white text-gray-900 border-white hover:bg-gray-100"
                        >
                            <Github size={12} />
                            Git City
                        </button>
                    </div>
                    <p className="text-[10px] opacity-20" style={{ color: 'var(--th-nord4)' }}>
                        SRCS Companion · Synced via Firebase
                    </p>
                </div>
            </div>

            {/* ── Right panel: form ─────────────────────────────────────────── */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-10 relative overflow-hidden">
                {/* Subtle animated background shapes */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl animate-[pulse_8s_infinite_alternate]" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/[0.015] rounded-full blur-3xl animate-[pulse_10s_infinite_alternate-reverse]" />

                <div className="w-full max-w-[340px] space-y-8 relative z-10">

                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center justify-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--th-nord8), var(--th-nord10))' }}>
                            <Zap size={16} style={{ color: 'var(--th-nord0)' }} />
                        </div>
                        <span className="font-bold text-base tracking-tight" style={{ color: 'var(--th-nord5)' }}>DSA Tracker</span>
                    </div>

                    {/* ── Step: Username ───────────────────────────────────── */}
                    {step === STEPS.USERNAME && (
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--th-nord6)' }}>
                                    Sign in for Consistency
                                </h1>
                                <p className="text-[13px] mt-1.5 opacity-50 leading-relaxed" style={{ color: 'var(--th-nord4)' }}>
                                    Sign in to save your DSA progress and streaks.
                                </p>
                            </div>

                            {/* ── GitHub Login Button (PRIMARY) ───────── */}
                            <button
                                onClick={handleGithubLogin}
                                disabled={githubLoading}
                                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] relative overflow-hidden group shadow-xl border border-white/10"
                                style={{
                                    background: githubLoading
                                        ? 'var(--th-nord3)'
                                        : 'linear-gradient(135deg, #24292e 0%, #1b1f23 100%)',
                                    color: '#ffffff',
                                    cursor: githubLoading ? 'not-allowed' : 'pointer',
                                }}
                            >
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'rgba(255,255,255,0.05)' }} />
                                {githubLoading ? (
                                    <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#fff' }} />
                                ) : (
                                    <>
                                        <Github size={20} />
                                        <span>Start with GitHub</span>
                                    </>
                                )}
                            </button>

                            {/* ── Divider ────────────────────────────── */}
                            <div className="flex items-center gap-4 py-2">
                                <div className="flex-1 h-px bg-white/5" />
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-20" style={{ color: 'var(--th-nord4)' }}>or use username</span>
                                <div className="flex-1 h-px bg-white/5" />
                            </div>

                            {/* Username field */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider mb-2 opacity-50" style={{ color: 'var(--th-nord4)' }}>
                                    Username
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm select-none opacity-30" style={{ color: 'var(--th-nord4)' }}>@</span>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => { setUsername(e.target.value); setError(''); }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleUsernameNext()}
                                        placeholder="your_name"
                                        maxLength={20}
                                        className="w-full pl-9 pr-10 py-3.5 rounded-xl text-sm font-medium border focus:outline-none focus:ring-2 transition-all shadow-inner"
                                        style={{
                                            background: 'color-mix(in srgb, var(--th-nord1) 70%, transparent)',
                                            borderColor: 'color-mix(in srgb, var(--th-nord3) 25%, transparent)',
                                            color: 'var(--th-nord5)',
                                        }}
                                        autoComplete="username"
                                    />
                                    {username.trim().length >= 5 && (
                                        <User size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-60" style={{ color: 'var(--th-nord14)' }} />
                                    )}
                                </div>
                                {error && (
                                    <p className="text-[11px] mt-2 flex items-center gap-1" style={{ color: 'var(--th-nord11)' }}>
                                        ⚠ {error}
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={handleUsernameNext}
                                disabled={!username.trim()}
                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
                                style={!username.trim()
                                    ? { background: 'color-mix(in srgb, var(--th-nord3) 10%, transparent)', color: 'opacity-20', cursor: 'not-allowed' }
                                    : { background: 'var(--th-nord3)', color: 'var(--th-nord6)', border: '1px solid var(--th-nord4)' }
                                }
                            >
                                <span>Continue</span>
                                <ArrowRight size={16} />
                            </button>

                            <div className="flex flex-col items-center gap-2 pt-2">
                                <div className="flex items-center gap-2 text-[10px] opacity-40" style={{ color: 'var(--th-nord4)' }}>
                                    <ShieldCheck size={12} className="text-[#84cc16]" />
                                    <span>Secure login via Firebase Auth</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] opacity-40" style={{ color: 'var(--th-nord4)' }}>
                                    <Lock size={12} />
                                    <span>Your progress is securely synced across devices</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Step: Passcode ───────────────────────────────────── */}
                    {step === STEPS.PASSCODE && (
                        <div className="space-y-5">
                            <div>
                                <button
                                    onClick={handleBack}
                                    className="flex items-center gap-1.5 text-xs mb-4 -ml-1 opacity-40 hover:opacity-70 transition-opacity"
                                    style={{ color: 'var(--th-nord4)' }}
                                >
                                    <ChevronLeft size={14} /> Back
                                </button>
                                <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--th-nord6)' }}>
                                    {isNewUser ? 'Create your PIN' : 'Enter your PIN'}
                                </h1>
                                <p className="text-sm mt-1 opacity-50" style={{ color: 'var(--th-nord4)' }}>
                                    Signing in as <span className="font-semibold opacity-100" style={{ color: 'var(--th-nord8)' }}>@{username}</span>
                                </p>
                            </div>

                            {/* PIN instructions */}
                            <div className="rounded-xl p-4 space-y-2 border" style={{ background: 'color-mix(in srgb, var(--th-nord1) 60%, transparent)', borderColor: 'color-mix(in srgb, var(--th-nord3) 15%, transparent)' }}>
                                <div className="flex items-center gap-2 mb-1">
                                    <Lock size={12} style={{ color: 'var(--th-nord9)' }} />
                                    <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--th-nord9)' }}>
                                        {isNewUser ? 'Setting up your PIN' : 'About your PIN'}
                                    </span>
                                </div>
                                {isNewUser ? (
                                    <>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 size={11} className="mt-0.5 shrink-0 opacity-60" style={{ color: 'var(--th-nord14)' }} />
                                            <p className="text-[11px] leading-snug opacity-60" style={{ color: 'var(--th-nord4)' }}>First time here — choose a 4-digit PIN you&apos;ll remember.</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 size={11} className="mt-0.5 shrink-0 opacity-60" style={{ color: 'var(--th-nord14)' }} />
                                            <p className="text-[11px] leading-snug opacity-60" style={{ color: 'var(--th-nord4)' }}>This PIN protects your data — it cannot be recovered if lost.</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 size={11} className="mt-0.5 shrink-0 opacity-60" style={{ color: 'var(--th-nord14)' }} />
                                            <p className="text-[11px] leading-snug opacity-60" style={{ color: 'var(--th-nord4)' }}>Enter the same 4-digit PIN you set when you signed up.</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 size={11} className="mt-0.5 shrink-0 opacity-60" style={{ color: 'var(--th-nord14)' }} />
                                            <p className="text-[11px] leading-snug opacity-60" style={{ color: 'var(--th-nord4)' }}>Wrong username? Hit Back to change it.</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* PIN inputs */}
                            <div>
                                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-3 text-center opacity-50" style={{ color: 'var(--th-nord4)' }}>
                                    {isNewUser ? 'Choose a 4-digit PIN' : '4-digit PIN'}
                                </label>
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
                                            className="w-14 h-14 text-center text-xl font-bold rounded-xl border-2 focus:outline-none transition-all duration-300 shadow-lg"
                                            style={{
                                                background: 'color-mix(in srgb, var(--th-nord1) 70%, transparent)',
                                                color: 'var(--th-nord6)',
                                                borderColor: passcode[i]
                                                    ? 'color-mix(in srgb, var(--th-nord8) 60%, transparent)'
                                                    : 'color-mix(in srgb, var(--th-nord3) 25%, transparent)',
                                                boxShadow: passcode[i] ? '0 0 12px color-mix(in srgb, var(--th-nord8) 18%, transparent)' : 'none',
                                            }}
                                            disabled={loading}
                                        />
                                    ))}
                                </div>
                                {error && (
                                    <p className="text-[11px] mt-3 text-center flex items-center justify-center gap-1" style={{ color: 'var(--th-nord11)' }}>
                                        ⚠ {error}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2.5">
                                <button
                                    onClick={handleBack}
                                    className="px-4 py-3 rounded-xl text-xs font-semibold border transition-all hover:opacity-80"
                                    style={{
                                        color: 'color-mix(in srgb, var(--th-nord4) 50%, transparent)',
                                        borderColor: 'color-mix(in srgb, var(--th-nord3) 20%, transparent)',
                                    }}
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => handleLogin(passcode.join(''))}
                                    disabled={loading || passcode.join('').length !== 4}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
                                    style={loading || passcode.join('').length !== 4
                                        ? { background: 'color-mix(in srgb, var(--th-nord3) 20%, transparent)', color: 'color-mix(in srgb, var(--th-nord4) 25%, transparent)', cursor: 'not-allowed' }
                                        : { background: 'linear-gradient(90deg, var(--th-nord8), var(--th-nord9))', color: 'var(--th-nord0)' }
                                    }
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'color-mix(in srgb, var(--th-nord0) 30%, transparent)', borderTopColor: 'var(--th-nord0)' }} />
                                    ) : (
                                        <>
                                            <KeyRound size={14} />
                                            <span>{isNewUser ? 'Create Account' : 'Sign In'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    <p className="text-center text-[10px] opacity-20" style={{ color: 'var(--th-nord4)' }}>
                        Synced securely via Firebase · Protected by your PIN
                    </p>

                    {/* ── Footer ─────────────────────────────────────────────────── */}
                    <div
                        className="flex justify-center gap-6 mt-12 text-xs font-bold uppercase tracking-widest opacity-40"
                        style={{ color: 'var(--th-nord4)' }}
                    >
                        <button onClick={() => setFooterModal('about')} className="hover:opacity-100 transition-opacity">About</button>
                        <button onClick={() => setFooterModal('privacy')} className="hover:opacity-100 transition-opacity">Privacy</button>
                        <button onClick={() => setFooterModal('github')} className="hover:opacity-100 transition-opacity">GitHub</button>
                        <button onClick={() => setFooterModal('contact')} className="hover:opacity-100 transition-opacity">Contact</button>
                    </div>
                </div>
            </div>

            {/* ── Footer Modals ─────────────────────────────────────────── */}
            {footerModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
                    <div
                        className="w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-2xl relative"
                        style={{ background: 'var(--th-nord0)', borderColor: 'var(--th-nord3)' }}
                    >
                        <button
                            onClick={() => { setFooterModal(null); setShowGithubProfile(false); }}
                            className="absolute top-4 right-4 text-xs opacity-40 hover:opacity-100"
                        >✕</button>

                        {footerModal === 'about' && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--th-nord8)' }}>
                                    <Info size={16} /> Why the Alias?
                                </h3>
                                <div className="text-xs leading-relaxed opacity-70 space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar" style={{ color: 'var(--th-nord6)' }}>
                                    <p>The developer goes by <strong>Ankith Yellanathi</strong> — though historians, philosophers, and a few confused database logs claim he has existed since the <strong>age of the Buddha</strong>.</p>
                                    <p>Legend says he was once a wandering student who tried to master logic under a Bodhi tree, only to discover that enlightenment is easier than debugging asynchronous code.</p>
                                    <p>Over the centuries he held many roles: monk, mathematician, wandering storyteller, part-time cook of suspiciously experimental noodles, and occasionally, a developer.</p>
                                    <p>His identity became… complicated.</p>
                                    <p>At one point he fell into a tragic love story involving a poet, a misplaced Git repository, and a German Shepherd named <strong>Compiler</strong> who judged every commit silently. The relationship ended during what historians now call <strong>The Great Merge Conflict</strong>.</p>
                                    <p>After the breakup, Ankith swore never to trust romance again — only <strong>clean code and deterministic algorithms</strong>.</p>
                                    <hr className="border-white/10 my-4" />
                                    <p>Things escalated.</p>
                                    <p>At some unclear point in the 1800s he allegedly entered a <strong>racing competition against a group of extremely angry bulls</strong>, which he claims taught him two important lessons:</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>never run production code without testing</li>
                                        <li>never race animals that weigh more than your entire tech stack</li>
                                    </ul>
                                    <hr className="border-white/10 my-4" />
                                    <p>There are also records of Ankith participating in a strange contest known as <strong>The Titanic Regatta</strong>, where developers attempted to optimize boat steering algorithms while the ship slowly headed toward an iceberg.</p>
                                    <p>His algorithm worked perfectly. The iceberg, however, did not respect version control.</p>
                                    <hr className="border-white/10 my-4" />
                                    <p>Later myths say he accidentally wandered into a <strong>war between gods</strong>.</p>
                                    <p>Zeus demanded lightning-fast computation.<br />Odin wanted distributed systems.<br />Shiva simply asked if the servers could survive destruction cycles.</p>
                                    <p>Ankith responded the only way a developer could: He deployed a patch.</p>
                                    <p>No one understood the code, but the universe kept running, so everyone agreed to leave it alone.</p>
                                    <hr className="border-white/10 my-4" />
                                    <p>Then came the <strong>Great Server Crash of 2024</strong>.</p>
                                    <p>The real Ankith allegedly disappeared during a catastrophic incident involving a corrupted backup, twelve cups of coffee, and an experimental script named <code>final_final_really_final_v7.py</code>.</p>
                                    <p>What remains today is uncertain. Some say it is just an alias. Some say it is a ghost in the machine. Others believe it is simply <strong>a student who has been learning for 2,500 years and still hasn&apos;t finished debugging life</strong>.</p>
                                    <p>What we know for sure is this:<br />The developer behind this project is <strong>Ankith Yellanathi</strong>.</p>
                                    <p>Possibly human.<br />Possibly code.<br />Definitely still fixing bugs.</p>
                                </div>
                            </div>
                        )}

                        {footerModal === 'privacy' && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold flex items-center gap-2 text-red-400">
                                    <ShieldCheck size={16} /> The Cold Truth
                                </h3>
                                <div className="text-xs leading-relaxed opacity-70 space-y-3" style={{ color: 'var(--th-nord6)' }}>
                                    <p>Let&apos;s be honest. I don&apos;t care about your privacy in the way lawyers want me to.</p>
                                    <p>Your data is on Firebase. Is it safe? Google says yes. But in a world where even the God of War can be brought down, nothing is truly unhackable. I capture your solves, your notes, and your streaks to make this app work.</p>
                                    <p>If you&apos;re worried about hackers finding out you couldn&apos;t solve &quot;Two Sum&quot; on your first try... well, maybe don&apos;t use the internet.</p>
                                </div>
                            </div>
                        )}

                        {footerModal === 'github' && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--th-nord14)' }}>
                                    <Gamepad2 size={16} /> The Developer&apos;s Lair
                                </h3>
                                {showGithubProfile ? (
                                    <div className="flex flex-col items-center gap-4 p-4 rounded-xl bg-white/5 border border-[#84cc16]/20">
                                        <Image
                                            src="https://avatars.slack-edge.com/2025-05-14/8891273522918_30c38bf627ac73075db6_512.png"
                                            alt="Profile"
                                            width={80}
                                            height={80}
                                            className="rounded-full ring-4 ring-[#84cc16]"
                                            unoptimized
                                        />
                                        <div className="text-center">
                                            <h4 className="text-sm font-bold">krishnakoushik9</h4>
                                            <p className="text-[10px] opacity-50">Builder, Sufferer, Leader</p>
                                        </div>
                                        <a
                                            href="https://github.com/krishnakoushik9"
                                            target="_blank"
                                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#84cc16] text-[#0f172a] text-[10px] font-bold"
                                        >
                                            View Github <ExternalLink size={12} />
                                        </a>
                                    </div>
                                ) : (
                                    <PathfinderGame onFinish={() => setShowGithubProfile(true)} />
                                )}
                            </div>
                        )}

                        {footerModal === 'contact' && (
                            <div className="space-y-4 text-center">
                                <h3 className="text-sm font-bold flex items-center justify-center gap-2" style={{ color: 'var(--th-nord15)' }}>
                                    <Mail size={16} /> Signal the Bat
                                </h3>
                                <p className="text-xs opacity-60">Wanna reach out? I might be in Gotham.</p>
                                <a
                                    href="https://www.instagram.com/thebatman/"
                                    target="_blank"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-xs shadow-lg"
                                >
                                    DM on Instagram <ExternalLink size={14} />
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Git City Island Modal ─────────────────────────────────────── */}
            {showGitCity && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 lg:p-10 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full h-full max-w-[85vw] max-h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-300">
                        {/* Header bar */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-900 rounded-lg text-white">
                                    <Github size={18} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">The Git City</h3>
                                    <p className="text-[10px] font-medium text-gray-500 max-w-md truncate">
                                        A damn cool city based on GitHub repos and pushes. Built by <a href="https://x.com/samuelrizzondev" target="_blank" className="text-blue-600 hover:underline">@samuelrizzondev</a>
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowGitCity(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                            >
                                <span className="font-bold">✕</span>
                                <span className="text-lg font-bold leading-none -mt-0.5">×</span>
                            </button>
                        </div>

                        {/* Iframe Content */}
                        <div className="flex-1 bg-gray-100 relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                            </div>
                            <iframe
                                src="https://www.thegitcity.com/"
                                className="w-full h-full border-none relative z-10"
                                title="The Git City"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            />
                        </div>
                    </div>
                </div>
            )}

            <DancingGirl3DLazy mode="login" />
        </div>
    );
}
