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
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [passcode, setPasscode] = useState(['', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState<'username' | 'passcode'>('username');
    const [mounted, setMounted] = useState(false);
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
            setError('At least 2 characters (letters, numbers, - or _)');
            return;
        }
        if (trimmed.length > 20) {
            setError('20 characters max');
            return;
        }
        setUsername(trimmed);
        setError('');
        setStep('passcode');
        setTimeout(() => pinRefs.current[0]?.focus(), 100);
    };

    const handlePinChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // digits only
        const newPin = [...passcode];
        newPin[index] = value.slice(-1); // single digit
        setPasscode(newPin);
        setError('');

        // Auto-focus next
        if (value && index < 3) {
            pinRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 4 filled
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
            setError('Enter all 4 digits');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await login(username, pin);
            if (result.success) {
                router.push('/dashboard');
            } else {
                setError(result.error || 'Login failed');
                setPasscode(['', '', '', '']);
                pinRefs.current[0]?.focus();
            }
        } catch {
            setError('Connection failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!mounted || isLoggedIn) return null;

    const features = [
        { icon: Brain, label: '755+ Questions', desc: 'FINAL450 + Fraz sheets' },
        { icon: Target, label: 'Smart Schedule', desc: 'Basics → Advanced' },
        { icon: Trophy, label: 'Gamified', desc: 'Rating & streaks' },
        { icon: BookOpen, label: 'Workspace', desc: 'Notes + whiteboard' },
    ];

    return (
        <div className="min-h-screen bg-nord0 flex items-center justify-center p-4 overflow-hidden relative">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(136,192,208,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(136,192,208,0.3) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px',
                    }}
                />
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-nord8/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-nord15/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="rounded-3xl p-8 border border-nord3/20"
                    style={{
                        backgroundColor: 'rgba(59, 66, 82, 0.6)',
                        backdropFilter: 'blur(40px) saturate(150%)',
                    }}
                >
                    {/* Logo */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-nord8 via-nord9 to-nord10 flex items-center justify-center">
                                <Zap size={28} className="text-nord0" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-nord14 flex items-center justify-center">
                                <Sparkles size={8} className="text-nord0" />
                            </div>
                        </div>
                    </div>

                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-extrabold text-nord6 tracking-tight mb-1">DSA Tracker</h1>
                        <p className="text-nord4/40 text-xs">SRCS Companion</p>
                    </div>

                    {step === 'username' ? (
                        /* Username Step */
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-semibold text-nord4/40 uppercase tracking-wider mb-1.5">
                                    Username
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-nord4/25 font-mono text-sm">@</span>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => { setUsername(e.target.value); setError(''); }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleUsernameNext()}
                                        placeholder="krishna"
                                        className="w-full pl-8 pr-4 py-3 bg-nord0/60 border border-nord3/30 rounded-xl text-nord5 text-sm font-medium placeholder:text-nord3/40 focus:outline-none focus:ring-2 focus:ring-nord8/30 focus:border-nord8/30 transition-all"
                                        autoFocus
                                    />
                                </div>
                                {error && <p className="text-nord11 text-[10px] mt-1.5">{error}</p>}
                                <p className="text-nord4/20 text-[9px] mt-1.5">
                                    Same username = same data on any device
                                </p>
                            </div>

                            <button
                                onClick={handleUsernameNext}
                                disabled={!username.trim()}
                                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${!username.trim()
                                    ? 'bg-nord3/20 text-nord4/25 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-nord8 to-nord9 text-nord0 hover:from-nord7 hover:to-nord8 hover:shadow-[0_0_20px_rgba(136,192,208,0.3)] hover:-translate-y-0.5'
                                    }`}
                            >
                                <span>Continue</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    ) : (
                        /* Passcode Step */
                        <div className="space-y-4">
                            <div className="text-center">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-nord0/40 mb-3">
                                    <Lock size={12} className="text-nord8/50" />
                                    <span className="text-xs text-nord4/50">@{username}</span>
                                </div>
                                <p className="text-nord4/40 text-xs">Enter your 4-digit passcode</p>
                                <p className="text-nord4/20 text-[9px] mt-0.5">New user? This will be your PIN for future logins</p>
                            </div>

                            {/* PIN Input */}
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
                                        className={`w-14 h-14 text-center text-xl font-bold rounded-xl border-2 bg-nord0/60 text-nord6 focus:outline-none transition-all duration-200 ${passcode[i]
                                            ? 'border-nord8/50 shadow-[0_0_10px_rgba(136,192,208,0.15)]'
                                            : 'border-nord3/30 focus:border-nord8/40'
                                            }`}
                                        disabled={loading}
                                    />
                                ))}
                            </div>

                            {error && (
                                <p className="text-nord11 text-xs text-center animate-fade-in-up">{error}</p>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setStep('username'); setPasscode(['', '', '', '']); setError(''); }}
                                    className="px-4 py-2.5 rounded-xl text-xs font-medium text-nord4/50 border border-nord3/20 hover:border-nord3/40 transition-all"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => handleLogin(passcode.join(''))}
                                    disabled={loading || passcode.join('').length !== 4}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${loading || passcode.join('').length !== 4
                                        ? 'bg-nord3/20 text-nord4/25 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-nord8 to-nord9 text-nord0 hover:from-nord7 hover:to-nord8 hover:shadow-[0_0_20px_rgba(136,192,208,0.3)]'
                                        }`}
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-nord0/30 border-t-nord0 rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <KeyRound size={14} />
                                            <span>Login</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Features - only show on username step */}
                    {step === 'username' && (
                        <div className="grid grid-cols-2 gap-2 mt-6">
                            {features.map((feat, i) => {
                                const Icon = feat.icon;
                                return (
                                    <div key={i} className="p-2.5 rounded-lg bg-nord0/25 border border-nord3/10">
                                        <Icon size={14} className="text-nord8/50 mb-1" />
                                        <p className="text-[10px] font-semibold text-nord5">{feat.label}</p>
                                        <p className="text-[9px] text-nord4/25">{feat.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <p className="text-center text-[9px] text-nord4/15 mt-3">
                    Stored locally + synced to Firebase • 4-digit PIN protected
                </p>
            </div>
        </div>
    );
}
