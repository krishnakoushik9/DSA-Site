'use client';

import { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const STEPS = {
    USERNAME: 'username',
    PASSCODE: 'passcode',
} as const;
type Step = typeof STEPS[keyof typeof STEPS];

const features = [
    { icon: Brain, label: '755+ Questions', desc: 'FINAL450 + Fraz sheets' },
    { icon: Target, label: 'Smart Schedule', desc: 'Basics → Advanced path' },
    { icon: Trophy, label: 'Gamified Progress', desc: 'Rating & streaks' },
    { icon: BookOpen, label: 'Workspace', desc: 'Notes + whiteboard' },
];

const usernameRules = [
    'Use letters, numbers, underscores or hyphens',
    'Min 2 characters, max 20 characters',
    'Same username = same progress on any device',
];

/* ─── Dev Card ─────────────────────────────────────────────────────────────── */
function DevCard() {
    const [easterEgg, setEasterEgg] = useState(false);
    const [aboutOpen, setAboutOpen] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const triggerEasterEgg = () => {
        setEasterEgg(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setEasterEgg(false), 3000);
    };

    return (
        <div className="relative">
            {/* Easter-egg cloud popup */}
            {easterEgg && (
                <div
                    className="absolute -top-14 left-1/2 -translate-x-1/2 px-3 py-2 rounded-2xl text-xs font-bold whitespace-nowrap animate-bounce z-50 shadow-xl"
                    style={{
                        background: 'linear-gradient(135deg,#a3e635,#65a30d)',
                        color: '#0f172a',
                        boxShadow: '0 4px 24px rgba(163,230,53,0.3)',
                    }}
                >
                    enti shock ayyara! 😲
                    {/* Cloud tail */}
                    <div
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0"
                        style={{
                            borderLeft: '8px solid transparent',
                            borderRight: '8px solid transparent',
                            borderTop: '8px solid #65a30d',
                        }}
                    />
                </div>
            )}

            {/* Collapsed trigger */}
            {!aboutOpen && (
                <button
                    onClick={() => setAboutOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border-2 transition-all hover:scale-105 active:scale-95 shadow-lg"
                    style={{
                        background: 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)',
                        borderColor: '#a3e635',
                        color: '#0f172a',
                        boxShadow: '0 4px 16px rgba(132,204,22,0.25)',
                    }}
                >
                    <Code2 size={12} />
                    About the Dev
                    <Sparkles size={12} />
                </button>
            )}


            {/* Expanded card */}
            {aboutOpen && (
                <div
                    className="rounded-2xl border p-4 space-y-3 w-64 shadow-2xl"
                    style={{
                        background: 'color-mix(in srgb, var(--th-nord1) 90%, transparent)',
                        borderColor: 'color-mix(in srgb, var(--th-nord3) 30%, transparent)',
                        backdropFilter: 'blur(20px)',
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--th-nord8)' }}>
                            About the Dev
                        </span>
                        <button
                            onClick={() => setAboutOpen(false)}
                            className="text-[10px] opacity-40 hover:opacity-70 transition-opacity"
                            style={{ color: 'var(--th-nord4)' }}
                        >
                            ✕ close
                        </button>
                    </div>

                    {/* Your profile (builder / operator) */}
                    <div
                        className="flex items-center gap-3 p-2.5 rounded-xl"
                        style={{ background: 'color-mix(in srgb, var(--th-nord0) 60%, transparent)' }}
                    >
                        <div className="relative shrink-0">
                            <Image
                                src="https://avatars.slack-edge.com/2025-05-14/8891273522918_30c38bf627ac73075db6_512.png"
                                alt="Profile"
                                width={48}
                                height={48}
                                className="rounded-full object-cover ring-2"
                                style={{ outline: '2px solid var(--th-nord8)', outlineOffset: '2px' }}
                                unoptimized
                            />
                            <div
                                className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                                style={{ background: 'var(--th-nord8)' }}
                            >
                                <Heart size={8} style={{ color: 'var(--th-nord0)' }} fill="currentColor" />
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-bold" style={{ color: 'var(--th-nord6)' }}>
                                CMR Student
                            </p>
                            <p className="text-[10px] opacity-50" style={{ color: 'var(--th-nord4)' }}>
                                Creator & Maintainer
                            </p>
                            <p className="text-[9px] opacity-35 mt-0.5 italic" style={{ color: 'var(--th-nord4)' }}>
                                Built this so you don&apos;t have to suffer alone.
                            </p>
                        </div>
                    </div>

                    {/* Alias dev (the easter egg one) */}
                    <div
                        className="flex items-center gap-3 p-2.5 rounded-xl"
                        style={{ background: 'color-mix(in srgb, var(--th-nord0) 60%, transparent)' }}
                    >
                        <div className="relative shrink-0">
                            <Image
                                src="https://static.wikia.nocookie.net/gtawiki/images/3/34/Claude-GTA3.png/revision/latest?cb=20230412193939"
                                alt="Ankith Yellanathi"
                                width={48}
                                height={48}
                                className="rounded-full object-cover ring-2"
                                style={{ outline: '2px solid #84cc16', outlineOffset: '2px' }}
                                unoptimized
                            />
                            <div
                                className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                                style={{ background: '#84cc16' }}
                            >
                                <Code2 size={7} style={{ color: '#0f172a' }} />
                            </div>
                        </div>
                        <div>
                            <button
                                onClick={triggerEasterEgg}
                                className="text-xs font-bold text-left transition-all hover:opacity-80 active:scale-95 cursor-pointer"
                                style={{ color: 'var(--th-nord6)' }}
                            >
                                Ankith Yellanathi
                            </button>
                            <p className="text-[10px] opacity-50" style={{ color: 'var(--th-nord4)' }}>
                                Alias / AI Wrangler 🤖
                            </p>
                            <p className="text-[9px] opacity-35 mt-0.5 italic" style={{ color: 'var(--th-nord4)' }}>
                                Helped ship the cursed features.
                            </p>
                        </div>
                    </div>

                    <p
                        className="text-[9px] text-center opacity-25"
                        style={{ color: 'var(--th-nord4)' }}
                    >
                        Made with love for CMR students ❤️
                    </p>
                </div>
            )}
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
    const { isLoggedIn, login } = useAppStore();
    const router = useRouter();
    const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => {
        if (mounted && isLoggedIn) router.push('/dashboard');
    }, [mounted, isLoggedIn, router]);

    const handleUsernameNext = () => {
        const trimmed = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
        if (!trimmed || trimmed.length < 2) { setError('Username must be at least 2 characters (letters, numbers, - or _)'); return; }
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

    if (!mounted || isLoggedIn) return null;

    return (
        <div
            className="min-h-screen flex items-stretch overflow-hidden"
            style={{ backgroundColor: 'var(--th-nord0)' }}
        >

            {/* ── Left panel: branding ───────────────────────────────────────── */}
            <div
                className="hidden lg:flex flex-col justify-between w-[400px] shrink-0 p-10 relative overflow-hidden border-r"
                style={{ borderColor: 'color-mix(in srgb, var(--th-nord3) 15%, transparent)' }}
            >
                {/* ambient blobs */}
                <div className="absolute top-0 left-0 w-72 h-72 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" style={{ background: 'color-mix(in srgb, var(--th-nord8) 8%, transparent)' }} />
                <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-[140px] translate-x-1/3 translate-y-1/3" style={{ background: 'color-mix(in srgb, var(--th-nord15) 5%, transparent)' }} />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, var(--th-nord8), var(--th-nord10))' }}>
                        <Zap size={20} style={{ color: 'var(--th-nord0)' }} />
                    </div>
                    <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--th-nord5)' }}>DSA Tracker</span>
                </div>

                {/* Hero */}
                <div className="relative z-10 space-y-6">
                    <div>
                        <h2 className="text-3xl font-extrabold leading-tight mb-3" style={{ color: 'var(--th-nord6)' }}>
                            Your placement<br />
                            <span style={{ background: 'linear-gradient(90deg, var(--th-nord8), var(--th-nord9))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                preparation hub.
                            </span>
                        </h2>
                        <p className="text-sm leading-relaxed opacity-50" style={{ color: 'var(--th-nord4)' }}>
                            Track your DSA journey, build streaks, collaborate and land your dream job.
                        </p>
                    </div>

                    <div className="space-y-2.5">
                        {features.map((feat, i) => {
                            const Icon = feat.icon;
                            return (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: 'color-mix(in srgb, var(--th-nord1) 50%, transparent)', borderColor: 'color-mix(in srgb, var(--th-nord3) 12%, transparent)' }}>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, var(--th-nord8) 12%, transparent)' }}>
                                        <Icon size={15} style={{ color: 'var(--th-nord8)' }} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold" style={{ color: 'var(--th-nord5)' }}>{feat.label}</p>
                                        <p className="text-[10px] opacity-40" style={{ color: 'var(--th-nord4)' }}>{feat.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Dev card at bottom */}
                <div className="relative z-10 flex flex-col gap-3">
                    <DevCard />
                    <p className="text-[10px] opacity-20" style={{ color: 'var(--th-nord4)' }}>
                        SRCS Companion · Synced via Firebase
                    </p>
                </div>
            </div>

            {/* ── Right panel: form ─────────────────────────────────────────── */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-sm space-y-6">

                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center justify-center gap-2 mb-2">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--th-nord8), var(--th-nord10))' }}>
                            <Zap size={18} style={{ color: 'var(--th-nord0)' }} />
                        </div>
                        <span className="font-bold text-base tracking-tight" style={{ color: 'var(--th-nord5)' }}>DSA Tracker</span>
                    </div>

                    {/* ── Step: Username ───────────────────────────────────── */}
                    {step === STEPS.USERNAME && (
                        <div className="space-y-5">
                            <div>
                                <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--th-nord6)' }}>
                                    Welcome 👋
                                </h1>
                                <p className="text-sm mt-1 opacity-50" style={{ color: 'var(--th-nord4)' }}>
                                    Sign in or create your free account to continue.
                                </p>
                            </div>

                            {/* How it works */}
                            <div className="rounded-xl p-4 space-y-2 border" style={{ background: 'color-mix(in srgb, var(--th-nord8) 5%, transparent)', borderColor: 'color-mix(in srgb, var(--th-nord8) 15%, transparent)' }}>
                                <div className="flex items-center gap-2 mb-1">
                                    <Info size={12} style={{ color: 'var(--th-nord8)' }} />
                                    <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--th-nord8)' }}>How it works</span>
                                </div>
                                {usernameRules.map((rule, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <CheckCircle2 size={11} className="mt-0.5 shrink-0 opacity-60" style={{ color: 'var(--th-nord14)' }} />
                                        <p className="text-[11px] leading-snug opacity-60" style={{ color: 'var(--th-nord4)' }}>{rule}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Username field */}
                            <div>
                                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-2 opacity-50" style={{ color: 'var(--th-nord4)' }}>
                                    Username
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm select-none opacity-30" style={{ color: 'var(--th-nord4)' }}>@</span>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => { setUsername(e.target.value); setError(''); }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleUsernameNext()}
                                        placeholder="your_username"
                                        maxLength={20}
                                        className="w-full pl-9 pr-10 py-3.5 rounded-xl text-sm font-medium border focus:outline-none focus:ring-2 transition-all"
                                        style={{
                                            background: 'color-mix(in srgb, var(--th-nord1) 70%, transparent)',
                                            borderColor: 'color-mix(in srgb, var(--th-nord3) 25%, transparent)',
                                            color: 'var(--th-nord5)',
                                        }}
                                        autoFocus
                                        autoComplete="username"
                                    />
                                    {username.trim().length >= 2 && (
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
                                    ? { background: 'color-mix(in srgb, var(--th-nord3) 20%, transparent)', color: 'color-mix(in srgb, var(--th-nord4) 25%, transparent)', cursor: 'not-allowed' }
                                    : { background: 'linear-gradient(90deg, var(--th-nord8), var(--th-nord9))', color: 'var(--th-nord0)' }
                                }
                            >
                                <span>Continue</span>
                                <ArrowRight size={16} />
                            </button>

                            {/* Mobile dev card */}
                            <div className="flex justify-center lg:hidden pt-1">
                                <DevCard />
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
                                <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--th-nord6)' }}>
                                    {isNewUser ? 'Create your PIN 🔐' : 'Enter your PIN 🔑'}
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
                                            className="w-14 h-14 text-center text-xl font-bold rounded-xl border-2 focus:outline-none transition-all duration-200"
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
                </div>
            </div>
        </div>
    );
}
