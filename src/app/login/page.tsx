'use client';

import { useState, useEffect, useRef } from 'react';
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
    'Same username = same data across devices',
];

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
        if (mounted && isLoggedIn) {
            router.push('/dashboard');
        }
    }, [mounted, isLoggedIn, router]);

    const handleUsernameNext = () => {
        const trimmed = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
        if (!trimmed || trimmed.length < 2) {
            setError('Username must be at least 2 characters (letters, numbers, - or _)');
            return;
        }
        if (trimmed.length > 20) {
            setError('Username cannot exceed 20 characters');
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

        if (value && index < 3) {
            pinRefs.current[index + 1]?.focus();
        }

        if (newPin.every(d => d !== '') && index === 3) {
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
                router.push('/dashboard');
            } else {
                // Check if it's a wrong PIN error (existing user wrong pin vs new user)
                const errMsg = result.error || 'Login failed';
                if (errMsg.toLowerCase().includes('new user')) {
                    setIsNewUser(true);
                }
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
        <div className="min-h-screen bg-nord0 flex items-stretch overflow-hidden">

            {/* ── Left panel: branding (hidden on mobile) ─────────────────────── */}
            <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-10 relative overflow-hidden border-r border-nord3/10">
                {/* Ambient blobs */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-nord8/8 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-nord15/6 rounded-full blur-[140px] translate-x-1/3 translate-y-1/3" />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nord8 via-nord9 to-nord10 flex items-center justify-center shadow-lg">
                        <Zap size={20} className="text-nord0" />
                    </div>
                    <span className="text-nord5 font-bold text-lg tracking-tight">DSA Tracker</span>
                </div>

                {/* Hero text */}
                <div className="relative z-10 space-y-6">
                    <div>
                        <h2 className="text-3xl font-extrabold text-nord6 leading-tight mb-3">
                            Your placement<br />
                            <span className="bg-gradient-to-r from-nord8 to-nord9 bg-clip-text text-transparent">
                                preparation hub.
                            </span>
                        </h2>
                        <p className="text-nord4/50 text-sm leading-relaxed">
                            Track your DSA journey, build streaks, collaborate with peers and land your dream job.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {features.map((feat, i) => {
                            const Icon = feat.icon;
                            return (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-nord1/50 border border-nord3/10">
                                    <div className="w-8 h-8 rounded-lg bg-nord8/10 flex items-center justify-center shrink-0">
                                        <Icon size={15} className="text-nord8" />
                                    </div>
                                    <div>
                                        <p className="text-nord5 text-xs font-semibold">{feat.label}</p>
                                        <p className="text-nord4/40 text-[10px]">{feat.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <p className="relative z-10 text-nord4/20 text-[10px]">
                    SRCS Companion · Synced via Firebase
                </p>
            </div>

            {/* ── Right panel: form ──────────────────────────────────────────────── */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-sm space-y-6">

                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center justify-center gap-2 mb-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-nord8 to-nord10 flex items-center justify-center">
                            <Zap size={18} className="text-nord0" />
                        </div>
                        <span className="text-nord5 font-bold text-base tracking-tight">DSA Tracker</span>
                    </div>

                    {/* ── Step: Username ────────────────────────────────────────── */}
                    {step === STEPS.USERNAME && (
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-2xl font-extrabold text-nord6 tracking-tight">
                                    Welcome 👋
                                </h1>
                                <p className="text-nord4/50 text-sm mt-1">
                                    Sign in or create your account to continue.
                                </p>
                            </div>

                            {/* Instructions box */}
                            <div className="rounded-xl bg-nord8/5 border border-nord8/15 p-4 space-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <Info size={13} className="text-nord8/70 shrink-0" />
                                    <span className="text-[11px] font-semibold text-nord8/80 uppercase tracking-wider">How it works</span>
                                </div>
                                {usernameRules.map((rule, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <CheckCircle2 size={12} className="text-nord14/60 mt-0.5 shrink-0" />
                                        <p className="text-[11px] text-nord4/60 leading-snug">{rule}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Username field */}
                            <div>
                                <label className="block text-[11px] font-semibold text-nord4/50 uppercase tracking-wider mb-2">
                                    Username
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-nord4/30 font-mono text-sm select-none">@</span>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => { setUsername(e.target.value); setError(''); }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleUsernameNext()}
                                        placeholder="your_username"
                                        maxLength={20}
                                        className="w-full pl-9 pr-4 py-3.5 bg-nord1/70 border border-nord3/25 rounded-xl text-nord5 text-sm font-medium placeholder:text-nord3/35 focus:outline-none focus:ring-2 focus:ring-nord8/30 focus:border-nord8/40 transition-all"
                                        autoFocus
                                        autoComplete="username"
                                    />
                                    {username.trim().length >= 2 && (
                                        <User size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-nord14/60" />
                                    )}
                                </div>
                                {error && (
                                    <p className="text-nord11 text-[11px] mt-2 flex items-center gap-1">
                                        <span>⚠</span> {error}
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={handleUsernameNext}
                                disabled={!username.trim()}
                                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all ${!username.trim()
                                        ? 'bg-nord3/20 text-nord4/25 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-nord8 to-nord9 text-nord0 hover:from-nord7 hover:to-nord8 hover:shadow-[0_0_24px_rgba(136,192,208,0.3)] active:scale-[0.98]'
                                    }`}
                            >
                                <span>Continue</span>
                                <ArrowRight size={16} />
                            </button>

                            {/* Mobile features grid */}
                            <div className="grid grid-cols-2 gap-2 lg:hidden">
                                {features.map((feat, i) => {
                                    const Icon = feat.icon;
                                    return (
                                        <div key={i} className="p-2.5 rounded-lg bg-nord1/50 border border-nord3/10">
                                            <Icon size={13} className="text-nord8/60 mb-1" />
                                            <p className="text-[10px] font-semibold text-nord5">{feat.label}</p>
                                            <p className="text-[9px] text-nord4/30">{feat.desc}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── Step: Passcode ────────────────────────────────────────── */}
                    {step === STEPS.PASSCODE && (
                        <div className="space-y-6">
                            <div>
                                <button
                                    onClick={handleBack}
                                    className="flex items-center gap-1.5 text-nord4/40 text-xs hover:text-nord4/70 transition-colors mb-4 -ml-1"
                                >
                                    <ChevronLeft size={14} /> Back
                                </button>
                                <h1 className="text-2xl font-extrabold text-nord6 tracking-tight">
                                    {isNewUser ? 'Create your PIN 🔐' : 'Enter your PIN 🔑'}
                                </h1>
                                <p className="text-nord4/50 text-sm mt-1">
                                    Signing in as{' '}
                                    <span className="text-nord8 font-semibold">@{username}</span>
                                </p>
                            </div>

                            {/* PIN instructions */}
                            <div className="rounded-xl bg-nord1/60 border border-nord3/15 p-4 space-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <Lock size={13} className="text-nord9/70 shrink-0" />
                                    <span className="text-[11px] font-semibold text-nord9/80 uppercase tracking-wider">
                                        {isNewUser ? 'Setting up your PIN' : 'About your PIN'}
                                    </span>
                                </div>
                                {isNewUser ? (
                                    <>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 size={12} className="text-nord14/60 mt-0.5 shrink-0" />
                                            <p className="text-[11px] text-nord4/60">This is your first time — choose a 4-digit PIN you&apos;ll remember.</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 size={12} className="text-nord14/60 mt-0.5 shrink-0" />
                                            <p className="text-[11px] text-nord4/60">Your PIN protects your data. Store it safely — it cannot be recovered.</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 size={12} className="text-nord14/60 mt-0.5 shrink-0" />
                                            <p className="text-[11px] text-nord4/60">Enter the same 4-digit PIN you set when you first signed up.</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 size={12} className="text-nord14/60 mt-0.5 shrink-0" />
                                            <p className="text-[11px] text-nord4/60">Wrong username? Use the Back button to change it.</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* PIN dots */}
                            <div>
                                <label className="block text-[11px] font-semibold text-nord4/50 uppercase tracking-wider mb-3 text-center">
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
                                            className={`w-14 h-14 text-center text-xl font-bold rounded-xl border-2 bg-nord1/70 text-nord6 focus:outline-none transition-all duration-200 ${passcode[i]
                                                    ? 'border-nord8/60 shadow-[0_0_12px_rgba(136,192,208,0.18)]'
                                                    : 'border-nord3/25 focus:border-nord8/50'
                                                }`}
                                            disabled={loading}
                                        />
                                    ))}
                                </div>
                                {error && (
                                    <p className="text-nord11 text-[11px] mt-3 text-center flex items-center justify-center gap-1">
                                        <span>⚠</span> {error}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2.5">
                                <button
                                    onClick={handleBack}
                                    className="px-4 py-3 rounded-xl text-xs font-semibold text-nord4/50 border border-nord3/20 hover:border-nord3/40 hover:text-nord4/70 transition-all"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => handleLogin(passcode.join(''))}
                                    disabled={loading || passcode.join('').length !== 4}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${loading || passcode.join('').length !== 4
                                            ? 'bg-nord3/20 text-nord4/25 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-nord8 to-nord9 text-nord0 hover:from-nord7 hover:to-nord8 hover:shadow-[0_0_24px_rgba(136,192,208,0.3)] active:scale-[0.98]'
                                        }`}
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-nord0/30 border-t-nord0 rounded-full animate-spin" />
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

                    {/* Footer note */}
                    <p className="text-center text-[10px] text-nord4/20 pt-2">
                        Your data is synced securely via Firebase · Protected by your PIN
                    </p>
                </div>
            </div>
        </div>
    );
}
