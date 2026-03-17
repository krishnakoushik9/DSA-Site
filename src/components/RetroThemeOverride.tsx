'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function RetroThemeOverride() {
    const pathname = usePathname();
    const [showAnnouncement, setShowAnnouncement] = useState(false);
    const [isBlooming, setIsBlooming] = useState(false);
    const [particles, setParticles] = useState<{ id: number, left: string, delay: string, duration: string, color: string }[]>([]);

    useEffect(() => {
        const isRunnerPage = pathname === '/runner' || pathname?.startsWith('/runner/');

        // If we are on runner page, ensure retro is OFF
        if (isRunnerPage) {
            if (document.documentElement.dataset.theme === 'retro') {
                const saved = localStorage.getItem('dsa-theme') || 'slate-lime';
                document.documentElement.dataset.theme = saved;
            }
            return;
        }

        // 1. Date Check: March 17th - March 21st
        const now = new Date();
        const month = now.getMonth() + 1; // 0-indexed to 1-indexed
        const day = now.getDate();

        // Match the requirement: March 17 to March 21
        const isRetroWindow = month === 3 && day >= 17 && day <= 21;

        if (!isRetroWindow) return;

        // 2. Theme Check: ONLY if "Slate + Lime" (id: slate-lime)
        // Wait a bit to ensure theme is loaded from localStorage
        const checkTheme = () => {
            const currentTheme = document.documentElement.dataset.theme;
            if (currentTheme === 'slate-lime' && !isRunnerPage) {
                triggerRetro();
            }
        };

        // Delay slightly to ensure theme is applied by ThemeToggle's useEffect
        const timeout = setTimeout(checkTheme, 100);
        return () => clearTimeout(timeout);
    }, [pathname]);

    const triggerRetro = () => {
        setIsBlooming(true);
        document.documentElement.classList.add('bloom-active');

        // At the peak of the bloom (0.5s), swap the theme
        setTimeout(() => {
            document.documentElement.dataset.theme = 'retro';
        }, 500);

        // After bloom finishes (1s), reveal retro dashboard and show announcement
        setTimeout(() => {
            setIsBlooming(false);
            document.documentElement.classList.remove('bloom-active');
            setShowAnnouncement(true);
            generateParticles();
        }, 1000);
    };

    const generateParticles = () => {
        const colors = ['#000080', '#FF0000', '#FFFF00', '#00AA00', '#AA00AA', '#FFAA00'];
        const pChars = Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 5}s`,
            duration: `${3 + Math.random() * 4}s`,
            color: colors[i % colors.length]
        }));
        setParticles(pChars);
    };

    return (
        <>
            {/* Bloom Overlay */}
            {isBlooming && (
                <div className="fixed inset-0 z-[99999] bg-white animate-bloom pointer-events-none" />
            )}

            {/* Retro Particles */}
            {showAnnouncement && particles.map(p => (
                <div
                    key={p.id}
                    className="retro-particle"
                    style={{
                        left: p.left,
                        top: '100%',
                        backgroundColor: p.color,
                        //@ts-ignore
                        '--duration': p.duration,
                        animationDelay: p.delay
                    }}
                />
            ))}

            {/* Announcement Modal (Classic 90s Style) */}
            {showAnnouncement && (
                <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 font-mono overflow-hidden">
                    <div className="announcement-modal bg-[#c0c0c0] p-1 border-t-2 border-l-2 border-white border-b-2 border-r-2 border-[#808080] shadow-[12px_12px_0px_#000000] w-[90%] max-w-[700px] transform scale-110">
                        {/* Title Bar */}
                        <div className="retro-title-bar bg-[#000080] text-white px-2 py-1.5 flex justify-between items-center mb-10">
                            <span className="text-sm font-bold flex items-center gap-3 !text-white">
                                <div className="w-5 h-5 bg-[#c0c0c0] border border-white flex items-center justify-center">
                                    <div className="w-3 h-3 bg-[#000080]" />
                                </div>
                                THE TECHNOLOGY OF 1980'S - FESTIVAL ALERT
                            </span>
                            <button
                                onClick={() => setShowAnnouncement(false)}
                                className="retro-close-btn bg-[#c0c0c0] text-black w-5 h-5 flex items-center justify-center text-[12px] border-t border-l border-white border-b border-r border-[#808080] active:border-[#808080] active:border-r-white active:border-b-white"
                            >
                                <X size={12} strokeWidth={4} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="px-12 py-10 flex flex-col items-center gap-12 text-center">
                            <div className="flex flex-col items-center gap-6">
                                <div className="w-16 h-16 bg-yellow-400 border-x-4 border-y-4 border-black rounded-full flex items-center justify-center text-black font-bold text-4xl shadow-[4px_4px_0px_#808080] animate-bounce">
                                    !
                                </div>
                                <h1 className="text-black text-3xl font-black tracking-tighter uppercase !bg-transparent !text-black !p-0">
                                    Celebrating the Technology of 1980's
                                </h1>
                                <p className="text-black text-lg font-bold border-2 border-dashed border-black p-4 bg-white/50">
                                    Welcome to the brutalist era. Sharper edges, simpler colors, and the dawn of the digital revolution!
                                    <br />
                                    <span className="block mt-4 text-blue-800 text-sm uppercase px-2 py-1 bg-[#c0c0c0] border border-blue-800">
                                        Festival Window: March 17th — March 21st
                                    </span>
                                </p>
                            </div>

                            <button
                                onClick={() => setShowAnnouncement(false)}
                                className="bg-[#c0c0c0] px-16 py-3 border-t-4 border-l-4 border-white border-b-4 border-r-4 border-[#808080] active:border-t-4 active:border-l-4 active:border-[#808080] active:border-b-4 active:border-r-4 border-white outline-none text-xl font-black shadow-[6px_6px_0px_#404040] hover:bg-nord8"
                            >
                                DISMISS TO SYSTEM
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
