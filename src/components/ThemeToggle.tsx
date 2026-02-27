'use client';

import { useState, useEffect, useRef } from 'react';
import { Palette, Check } from 'lucide-react';

const THEMES = [
    { id: 'nord', label: 'Nord (Default)', colors: ['bg-[#2E3440]', 'bg-[#88C0D0]'] },
    { id: 'light', label: 'Soft Light', colors: ['bg-[#F8FAFC]', 'bg-[#2563EB]'] },
    { id: 'slate-lime', label: 'Slate + Lime', colors: ['bg-[#0F172A]', 'bg-[#84CC16]'] },
    { id: 'amoled', label: 'Pure AMOLED', colors: ['bg-[#000000]', 'bg-[#6366F1]'] },
];

export default function ThemeToggle() {
    const [theme, setTheme] = useState('nord');
    const [open, setOpen] = useState(false);
    const [installingTarget, setInstallingTarget] = useState<typeof THEMES[0] | null>(null);
    const [progress, setProgress] = useState(0);
    const [isBoom, setIsBoom] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Load initial theme
    useEffect(() => {
        const saved = localStorage.getItem('dsa-theme') || 'nord';
        setTheme(saved);
        document.documentElement.dataset.theme = saved;
    }, []);

    // Outer click handler
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                if (!installingTarget) {
                    setOpen(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [installingTarget]);

    const handleSelect = (t: typeof THEMES[0]) => {
        if (theme === t.id) {
            setOpen(false);
            return;
        }
        setInstallingTarget(t);
        setProgress(0);

        const audio = new Audio('/audio/mixkit-happy-bell-alert-601.wav');
        audio.load();

        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += Math.random() * 25 + 10;
            if (currentProgress >= 100) {
                currentProgress = 100;
                clearInterval(interval);
                finishInstall(t, audio);
            }
            setProgress(currentProgress);
        }, 200);
    };

    const finishInstall = (t: typeof THEMES[0], audio: HTMLAudioElement) => {
        setIsBoom(true);
        setTimeout(() => {
            // Apply new theme right after boom starts
            setTheme(t.id);
            localStorage.setItem('dsa-theme', t.id);
            document.documentElement.dataset.theme = t.id;

            audio.play().catch(console.error);

            setTimeout(() => {
                // Return to normal scale opacity 0 then close
                setIsBoom(false);
                setInstallingTarget(null);
                setOpen(false);
                setProgress(0);
            }, 300);
        }, 150);
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => { if (!installingTarget) setOpen(!open); }}
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 relative group"
                style={{
                    backgroundColor: 'var(--th-nord1)',
                    border: '1px solid color-mix(in srgb, var(--th-nord3) 40%, transparent)',
                    color: 'var(--th-nord4)'
                }}
                title="Theme Center"
            >
                <Palette size={20} className="group-hover:scale-110 transition-transform duration-300" />
            </button>

            {open && (
                <div
                    className={`absolute right-0 mt-3 w-[280px] rounded-3xl border shadow-2xl overflow-hidden py-1 z-50 transform origin-top transition-all duration-300 ease-in-out ${isBoom ? 'scale-125 opacity-0 blur-md' : 'scale-100 opacity-100 blur-0'} ${installingTarget ? '' : 'animate-fade-in-down'}`}
                    style={{
                        backgroundColor: 'var(--th-nord1)',
                        borderColor: 'color-mix(in srgb, var(--th-nord3) 40%, transparent)',
                    }}
                >
                    {!installingTarget ? (
                        <>
                            <div className="px-4 py-3 flex items-center justify-center border-b gap-2 mb-1"
                                style={{
                                    borderColor: 'color-mix(in srgb, var(--th-nord3) 30%, transparent)',
                                    color: 'var(--th-nord4)',
                                }}
                            >
                                <Palette size={18} />
                                <span className="font-bold tracking-wide uppercase text-xs">Theme Center</span>
                            </div>
                            <div className="p-2 space-y-1">
                                {THEMES.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => handleSelect(t)}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${theme === t.id ? 'bg-nord8/10 font-medium' : 'hover:bg-nord2/50'}`}
                                        style={{
                                            color: theme === t.id ? 'var(--th-nord8)' : 'var(--th-nord4)'
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex -space-x-1 border border-nord3/20 rounded-full p-0.5 shadow-sm bg-nord1/50">
                                                <div className={`w-3.5 h-3.5 rounded-full shadow-inner ${t.colors[0]}`} />
                                                <div className={`w-3.5 h-3.5 rounded-full shadow-inner ${t.colors[1]}`} />
                                            </div>
                                            {t.label}
                                        </div>
                                        {theme === t.id && <Check size={16} />}
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="px-6 py-10 flex flex-col items-center justify-center gap-5 relative overflow-hidden">
                            {/* Animated background rings */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                                <div className="w-48 h-48 rounded-full border-4 border-nord8 animate-ping" style={{ animationDuration: '2s' }}></div>
                                <div className="absolute w-32 h-32 rounded-full border-4 border-nord8 animate-ping" style={{ animationDuration: '1.5s' }}></div>
                            </div>

                            <div className="relative z-10 flex flex-col items-center gap-4">
                                <Palette className="animate-pulse" style={{ color: 'var(--th-nord8)' }} size={36} />
                                <div className="text-sm font-semibold tracking-wide uppercase animate-pulse" style={{ color: 'var(--th-nord4)' }}>
                                    Installing {installingTarget.label}
                                </div>
                                <div className="w-full h-2.5 bg-nord0/50 rounded-full overflow-hidden shadow-inner mt-2 min-w-[200px]" style={{ backgroundColor: 'color-mix(in srgb, var(--th-nord0) 60%, transparent)' }}>
                                    <div className="h-full rounded-full transition-all duration-200 ease-out relative overflow-hidden bg-nord8"
                                        style={{
                                            width: `${progress}%`,
                                            backgroundColor: 'var(--th-nord8)'
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-white/30 skew-x-12 animate-shimmer" style={{ width: '200%' }} />
                                    </div>
                                </div>
                                <div className="text-xs mt-1" style={{ color: 'var(--th-nord3)' }}>
                                    {Math.floor(progress)}% Complete
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
