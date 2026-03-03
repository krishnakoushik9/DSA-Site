'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
    Shield,
    AlertTriangle,
    CheckCircle2,
    GraduationCap,
    Mail,
    Hash,
    Sparkles,
    XCircle,
    Lock,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

// ─── Year Prefixes ──────────────────────────────────────────────────────────
const YEAR_CONFIG = {
    '3rd': { prefix: '23H51', emailPrefix: '23h51' },
    '2nd': { prefix: '24H51', emailPrefix: '24h51' },
    '1st': { prefix: '25H51', emailPrefix: '25h51' },
} as const;

type YearOption = '1st' | '2nd' | '3rd';

const EMAIL_DOMAIN = '@cmrcet.ac.in';

// ─── Validation Helpers ─────────────────────────────────────────────────────
function validateRollNumber(roll: string, year: YearOption): { valid: boolean; error: string } {
    if (roll.length !== 10) return { valid: false, error: 'Roll number must be exactly 10 characters' };
    const prefix = YEAR_CONFIG[year].prefix.toUpperCase();
    const rollUpper = roll.toUpperCase();
    if (!rollUpper.startsWith(prefix)) {
        return { valid: false, error: `Roll number for ${year} year must start with ${prefix}` };
    }
    // Remaining 5 chars should be alphanumeric
    const suffix = rollUpper.substring(5);
    if (!/^[A-Z0-9]{5}$/.test(suffix)) {
        return { valid: false, error: 'Remaining characters must be alphanumeric (A-Z, 0-9)' };
    }
    return { valid: true, error: '' };
}

function validateEmail(email: string, roll: string, year: YearOption): { valid: boolean; error: string } {
    if (!email) return { valid: false, error: 'Email is required' };
    const emailLower = email.toLowerCase().trim();
    const expectedPrefix = roll.toLowerCase();
    const expectedEmail = `${expectedPrefix}${EMAIL_DOMAIN}`;
    if (emailLower !== expectedEmail) {
        return { valid: false, error: `Email must be ${expectedPrefix}${EMAIL_DOMAIN}` };
    }
    return { valid: true, error: '' };
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function ProfileVerificationModal() {
    const { profile, updateProfile, syncToFirestore, username } = useAppStore();
    const [year, setYear] = useState<YearOption | ''>(profile.yearOfStudy || '');
    const [rollDigits, setRollDigits] = useState<string[]>(
        profile.rollNumber ? profile.rollNumber.toUpperCase().split('') : Array(10).fill('')
    );
    const [email, setEmail] = useState(profile.collegeEmail || '');
    const [errors, setErrors] = useState<string[]>([]);
    const [showWarning, setShowWarning] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const digitRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [shakeFields, setShakeFields] = useState(false);

    // When year changes, auto-fill the prefix
    useEffect(() => {
        if (!year) return;
        const prefix = YEAR_CONFIG[year].prefix.toUpperCase().split('');
        setRollDigits(prev => {
            const newDigits = [...prev];
            prefix.forEach((ch, i) => {
                newDigits[i] = ch;
            });
            return newDigits;
        });
        // Auto-focus first editable digit
        setTimeout(() => digitRefs.current[5]?.focus(), 100);
    }, [year]);

    // Auto-fill email when roll number is complete
    useEffect(() => {
        const roll = rollDigits.join('');
        if (roll.length === 10 && year) {
            const validation = validateRollNumber(roll, year);
            if (validation.valid) {
                setEmail(`${roll.toLowerCase()}${EMAIL_DOMAIN}`);
            }
        }
    }, [rollDigits, year]);

    const handleDigitChange = useCallback((index: number, value: string) => {
        // First 5 chars locked when year is selected
        if (year && index < 5) return;
        const char = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-1);
        setRollDigits(prev => {
            const newDigits = [...prev];
            newDigits[index] = char;
            return newDigits;
        });
        setErrors([]);
        if (char && index < 9) {
            digitRefs.current[index + 1]?.focus();
        }
    }, [year]);

    const handleDigitKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
        if (year && index < 5) return;
        if (e.key === 'Backspace' && !rollDigits[index] && index > 5) {
            digitRefs.current[index - 1]?.focus();
        }
    }, [year, rollDigits]);

    const handleDigitPaste = useCallback((e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (!year) return;
        // Fill from position 5 onwards
        const prefix = YEAR_CONFIG[year].prefix.toUpperCase();
        let startIdx = 5;
        let pasteStr = pasted;
        // If they pasted the full roll number
        if (pasted.startsWith(prefix)) {
            pasteStr = pasted.substring(5);
        }
        setRollDigits(prev => {
            const newDigits = [...prev];
            for (let i = 0; i < pasteStr.length && startIdx + i < 10; i++) {
                newDigits[startIdx + i] = pasteStr[i];
            }
            return newDigits;
        });
        const focusIdx = Math.min(startIdx + pasteStr.length, 9);
        setTimeout(() => digitRefs.current[focusIdx]?.focus(), 50);
    }, [year]);

    const handleSubmit = async () => {
        const newErrors: string[] = [];

        if (!year) {
            newErrors.push('Please select your year of study');
        }

        const roll = rollDigits.join('');
        if (year) {
            const rollResult = validateRollNumber(roll, year);
            if (!rollResult.valid) newErrors.push(rollResult.error);
        }

        if (year && roll.length === 10) {
            const emailResult = validateEmail(email, roll, year);
            if (!emailResult.valid) newErrors.push(emailResult.error);
        } else if (!email) {
            newErrors.push('Email is required');
        }

        if (newErrors.length > 0) {
            setErrors(newErrors);
            setShowWarning(true);
            setShakeFields(true);
            setTimeout(() => setShakeFields(false), 600);
            return;
        }

        setSubmitting(true);
        setErrors([]);
        setShowWarning(false);

        try {
            updateProfile({
                rollNumber: roll.toUpperCase(),
                collegeEmail: email.toLowerCase().trim(),
                yearOfStudy: year as YearOption,
                profileVerified: true,
            });
            // Force sync immediately
            await syncToFirestore();
            setSubmitted(true);
            setTimeout(() => {
                // The modal will automatically disappear because profileVerified is now true
            }, 1500);
        } catch {
            setErrors(['Failed to save. Please try again.']);
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.92)' }}>
                <div className="text-center space-y-4 animate-pulse">
                    <CheckCircle2 size={64} style={{ color: '#a3e635' }} className="mx-auto" />
                    <h2 className="text-2xl font-bold" style={{ color: '#a3e635' }}>Verified Successfully! ✅</h2>
                    <p className="text-sm opacity-60" style={{ color: 'var(--th-nord4)' }}>Redirecting to your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto py-6" style={{ background: 'rgba(0,0,0,0.92)' }}>
            {/* Ambient glow effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[180px] opacity-20" style={{ background: 'var(--th-nord8)' }} />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-[160px] opacity-15" style={{ background: 'var(--th-nord11)' }} />

            <div
                className={`relative w-full max-w-lg mx-4 rounded-2xl border p-6 space-y-5 shadow-2xl ${shakeFields ? 'animate-shake' : ''}`}
                style={{
                    background: 'color-mix(in srgb, var(--th-nord0) 95%, transparent)',
                    borderColor: showWarning
                        ? 'color-mix(in srgb, var(--th-nord11) 60%, transparent)'
                        : 'color-mix(in srgb, var(--th-nord3) 20%, transparent)',
                    backdropFilter: 'blur(24px)',
                    transition: 'border-color 0.3s ease',
                }}
            >
                {/* Warning banner for violations */}
                {showWarning && (
                    <div
                        className="flex items-center gap-3 p-3 rounded-xl border animate-pulse"
                        style={{
                            background: 'color-mix(in srgb, var(--th-nord11) 12%, transparent)',
                            borderColor: 'color-mix(in srgb, var(--th-nord11) 30%, transparent)',
                        }}
                    >
                        <AlertTriangle size={20} style={{ color: 'var(--th-nord11)' }} className="shrink-0" />
                        <div>
                            <p className="text-xs font-bold" style={{ color: 'var(--th-nord11)' }}>
                                ⚠ VERIFICATION FAILED
                            </p>
                            <p className="text-[10px] opacity-70" style={{ color: 'var(--th-nord11)' }}>
                                You cannot access any services until your college identity is verified.
                            </p>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--th-nord8), var(--th-nord9))' }}>
                        <Shield size={28} style={{ color: 'var(--th-nord0)' }} />
                    </div>
                    <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--th-nord6)' }}>
                        College Identity Verification
                    </h1>
                    <p className="text-xs opacity-50" style={{ color: 'var(--th-nord4)' }}>
                        Hey <span className="font-semibold" style={{ color: 'var(--th-nord8)', opacity: 1 }}>@{username}</span> — verify your CMRCET credentials to continue
                    </p>
                    <div className="flex items-center justify-center gap-1.5 pt-1">
                        <Lock size={10} style={{ color: 'var(--th-nord11)' }} />
                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--th-nord11)' }}>
                            MANDATORY — Services blocked until verified
                        </p>
                    </div>
                </div>

                {/* ── Year Selection ──────────────────────────────────────────── */}
                <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider mb-2 opacity-60" style={{ color: 'var(--th-nord4)' }}>
                        <GraduationCap size={12} className="inline mr-1.5" style={{ color: 'var(--th-nord9)' }} />
                        Year of Study
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['1st', '2nd', '3rd'] as YearOption[]).map((y) => (
                            <button
                                key={y}
                                onClick={() => { setYear(y); setErrors([]); setShowWarning(false); }}
                                className="py-2.5 rounded-xl text-xs font-bold border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                style={year === y ? {
                                    background: 'linear-gradient(135deg, var(--th-nord8), var(--th-nord9))',
                                    borderColor: 'var(--th-nord8)',
                                    color: 'var(--th-nord0)',
                                    boxShadow: '0 4px 16px color-mix(in srgb, var(--th-nord8) 30%, transparent)',
                                } : {
                                    background: 'color-mix(in srgb, var(--th-nord1) 60%, transparent)',
                                    borderColor: 'color-mix(in srgb, var(--th-nord3) 20%, transparent)',
                                    color: 'var(--th-nord4)',
                                }}
                            >
                                {y} Year
                                <br />
                                <span className="text-[9px] opacity-70" style={year === y ? {} : {}}>
                                    {YEAR_CONFIG[y].prefix}*****
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Roll Number — OTP style ─────────────────────────────────── */}
                <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider mb-2 opacity-60" style={{ color: 'var(--th-nord4)' }}>
                        <Hash size={12} className="inline mr-1.5" style={{ color: 'var(--th-nord9)' }} />
                        Roll Number (10 characters)
                    </label>
                    <div className="flex justify-center gap-1 flex-wrap" onPaste={handleDigitPaste}>
                        {rollDigits.map((digit, i) => {
                            const isLocked = year && i < 5;
                            const isFilled = digit !== '';
                            const isGroupBreak = i === 4; // break after prefix "23H51"
                            return (
                                <div key={i} className="flex items-center">
                                    <input
                                        ref={el => { digitRefs.current[i] = el; }}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleDigitChange(i, e.target.value)}
                                        onKeyDown={(e) => handleDigitKeyDown(i, e)}
                                        readOnly={!!isLocked}
                                        className="w-9 h-11 text-center text-sm font-bold rounded-lg border-2 focus:outline-none transition-all duration-200 uppercase"
                                        style={{
                                            background: isLocked
                                                ? 'color-mix(in srgb, var(--th-nord8) 15%, var(--th-nord1))'
                                                : 'color-mix(in srgb, var(--th-nord1) 70%, transparent)',
                                            color: isLocked ? 'var(--th-nord8)' : 'var(--th-nord6)',
                                            borderColor: isLocked
                                                ? 'color-mix(in srgb, var(--th-nord8) 30%, transparent)'
                                                : isFilled
                                                    ? 'color-mix(in srgb, var(--th-nord14) 50%, transparent)'
                                                    : 'color-mix(in srgb, var(--th-nord3) 20%, transparent)',
                                            boxShadow: isFilled && !isLocked ? '0 0 8px color-mix(in srgb, var(--th-nord14) 15%, transparent)' : 'none',
                                            cursor: isLocked ? 'not-allowed' : 'text',
                                            opacity: isLocked ? 0.85 : 1,
                                        }}
                                    />
                                    {isGroupBreak && (
                                        <div className="w-2 flex items-center justify-center">
                                            <div className="w-1.5 h-0.5 rounded-full" style={{ background: 'var(--th-nord3)' }} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {year && (
                        <p className="text-[10px] text-center mt-2 opacity-40" style={{ color: 'var(--th-nord4)' }}>
                            <span style={{ color: 'var(--th-nord8)' }}>🔒 {YEAR_CONFIG[year].prefix}</span> is auto-filled for {year} year students
                        </p>
                    )}
                </div>

                {/* ── College Email ───────────────────────────────────────────── */}
                <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider mb-2 opacity-60" style={{ color: 'var(--th-nord4)' }}>
                        <Mail size={12} className="inline mr-1.5" style={{ color: 'var(--th-nord9)' }} />
                        College Email ID
                    </label>
                    <div className="relative">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setErrors([]); setShowWarning(false); }}
                            placeholder={year ? `${YEAR_CONFIG[year].emailPrefix}xxxxx${EMAIL_DOMAIN}` : `your_roll${EMAIL_DOMAIN}`}
                            className="w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-2 transition-all"
                            style={{
                                background: 'color-mix(in srgb, var(--th-nord1) 70%, transparent)',
                                borderColor: email && year && rollDigits.join('').length === 10
                                    ? validateEmail(email, rollDigits.join(''), year).valid
                                        ? 'color-mix(in srgb, var(--th-nord14) 50%, transparent)'
                                        : 'color-mix(in srgb, var(--th-nord11) 50%, transparent)'
                                    : 'color-mix(in srgb, var(--th-nord3) 25%, transparent)',
                                color: 'var(--th-nord5)',
                            }}
                        />
                        {email && year && rollDigits.join('').length === 10 && (
                            validateEmail(email, rollDigits.join(''), year).valid ? (
                                <CheckCircle2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--th-nord14)' }} />
                            ) : (
                                <XCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--th-nord11)' }} />
                            )
                        )}
                    </div>
                    <p className="text-[10px] mt-1.5 opacity-40" style={{ color: 'var(--th-nord4)' }}>
                        Must match pattern: <span className="font-mono" style={{ color: 'var(--th-nord8)' }}>rollnumber{EMAIL_DOMAIN}</span>
                    </p>
                </div>

                {/* ── Error list ──────────────────────────────────────────────── */}
                {errors.length > 0 && (
                    <div className="space-y-1.5 p-3 rounded-xl border" style={{
                        background: 'color-mix(in srgb, var(--th-nord11) 8%, transparent)',
                        borderColor: 'color-mix(in srgb, var(--th-nord11) 25%, transparent)',
                    }}>
                        {errors.map((err, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <XCircle size={12} className="mt-0.5 shrink-0" style={{ color: 'var(--th-nord11)' }} />
                                <p className="text-[11px]" style={{ color: 'var(--th-nord11)' }}>{err}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Submit ──────────────────────────────────────────────────── */}
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] hover:shadow-lg"
                    style={submitting ? {
                        background: 'color-mix(in srgb, var(--th-nord3) 20%, transparent)',
                        color: 'color-mix(in srgb, var(--th-nord4) 25%, transparent)',
                        cursor: 'not-allowed',
                    } : {
                        background: 'linear-gradient(90deg, var(--th-nord8), var(--th-nord9))',
                        color: 'var(--th-nord0)',
                        boxShadow: '0 4px 20px color-mix(in srgb, var(--th-nord8) 25%, transparent)',
                    }}
                >
                    {submitting ? (
                        <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'color-mix(in srgb, var(--th-nord0) 30%, transparent)', borderTopColor: 'var(--th-nord0)' }} />
                    ) : (
                        <>
                            <Sparkles size={16} />
                            <span>Verify & Continue</span>
                        </>
                    )}
                </button>

                {/* Footer warning */}
                <div className="text-center pt-1">
                    <p className="text-[9px] opacity-30" style={{ color: 'var(--th-nord4)' }}>
                        🔒 All CMRCET students must verify their identity · Data synced via Firebase
                    </p>
                </div>
            </div>

            {/* Custom shake animation style */}
            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                    20%, 40%, 60%, 80% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </div>
    );
}
