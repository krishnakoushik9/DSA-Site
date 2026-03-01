'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, BrainCircuit, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LearnAIPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Wait a few seconds before potentially showing the popup
        const timer = setTimeout(() => {
            const today = new Date().toDateString();
            const storedDate = localStorage.getItem('learnAiPopupDate');
            const storedCount = parseInt(localStorage.getItem('learnAiPopupCount') || '0', 10);

            let countForToday = storedCount;

            // Reset count if it's a new day
            if (storedDate !== today) {
                countForToday = 0;
                localStorage.setItem('learnAiPopupDate', today);
            }

            // Show popup if limit not reached (max twice a day)
            // We'll use a 30% random chance to show it so it feels organic
            if (countForToday < 2 && Math.random() < 0.3) {
                setIsVisible(true);
                localStorage.setItem('learnAiPopupCount', (countForToday + 1).toString());
            }
        }, 5000); // 5 second delay

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    const handleExplore = () => {
        setIsVisible(false);
        router.push('/learnings/learn-ai');
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
            <div className="relative overflow-hidden rounded-2xl bg-[#0F172A] border border-nord8/40 shadow-2xl shadow-nord8/20 w-[320px] backdrop-blur-xl">
                {/* Glow effects */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-nord8/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-nord14/20 rounded-full blur-2xl" />

                {/* Close Button */}
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-3 right-3 p-1 rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-10"
                >
                    <X size={16} />
                </button>

                <div className="p-6 relative z-10 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-nord8 to-nord9 flex items-center justify-center mb-4 shadow-lg shadow-nord8/30 animate-pulse-glow">
                        <BrainCircuit size={24} className="text-white" />
                    </div>

                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-nord4 mb-2">
                        Master AI Engineering
                    </h3>

                    <p className="text-sm text-slate-300 mb-5 leading-relaxed">
                        Ready to level up? Discover our curated masterclass of free resources to learn everything about AI, LLMs, and Agents.
                    </p>

                    <button
                        onClick={handleExplore}
                        className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-nord8 to-nord9 p-[1px] transition-all hover:shadow-[0_0_20px_rgba(136,192,208,0.4)]"
                    >
                        <div className="relative bg-[#0F172A] px-4 py-2.5 rounded-xl transition-all group-hover:bg-opacity-0 flex items-center justify-center gap-2">
                            <Sparkles size={16} className="text-nord8 group-hover:text-white transition-colors" />
                            <span className="font-semibold text-nord8 group-hover:text-white transition-colors text-sm">
                                Start Learning
                            </span>
                            <ArrowRight size={16} className="text-nord8 group-hover:text-white transition-colors group-hover:translate-x-1 duration-300" />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
