'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Sparkles, Zap, ShieldCheck, Check, Clock, X, Flame } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PremiumPopup() {
    const { isPremiumPopupOpen, setPremiumPopupOpen } = useAppStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <AnimatePresence>
            {isPremiumPopupOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8 isolate">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setPremiumPopupOpen(false)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    {/* Island Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Shimmer Effects */}
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-500/5 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />

                        {/* Top Banner / Pitch */}
                        <div className="relative z-10 p-6 md:p-8 pb-4 text-center">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
                                Unfair Advantage for Placements
                            </h2>
                            <p className="text-zinc-400 text-sm md:text-base max-w-2xl mx-auto">
                                You need a high volume of practice to clear interviews. Master DSA, crack companies, and stop panicking before campus drives.
                            </p>

                            <div className="mt-6 flex flex-wrap justify-center items-center gap-3">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold uppercase tracking-widest border border-rose-500/20">
                                    <Flame size={14} /> Founder's Pass
                                </span>
                                <span className="text-xs text-zinc-300 font-medium">
                                    First 50 students from our college get Lifetime Access for <span className="text-amber-400 line-through mr-1 opacity-50">₹2999</span><span className="text-amber-400">₹499</span>
                                </span>
                            </div>
                        </div>

                        {/* Pricing Tiers Grid */}
                        <div className="relative z-10 flex-1 overflow-y-auto p-6 md:p-8 pt-4 scrollbar-thin scrollbar-thumb-white/10">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                {/* Tier 1: Free */}
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col relative overflow-hidden group hover:border-white/20 transition-colors">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                                            The Hook <span className="text-[10px] uppercase tracking-widest text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full">Free</span>
                                        </h3>
                                        <p className="text-sm text-zinc-400 mt-2 min-h-[40px]">Perfect to get your feet wet in the DSA world.</p>
                                    </div>
                                    <div className="text-3xl font-bold text-white mb-6">
                                        ₹0 <span className="text-sm font-normal text-zinc-500">/ forever</span>
                                    </div>
                                    <ul className="space-y-3 mb-8 flex-1">
                                        {[
                                            'Access to 755 core questions',
                                            'Standard Workspace',
                                            'Calendar Tracker',
                                            'Community & Krack Updates'
                                        ].map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                                                <Check size={16} className="text-zinc-500 shrink-0 mt-0.5" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Tier 2: 6 Months (Sweet Spot) */}
                                <div className="bg-gradient-to-b from-amber-500/10 to-amber-500/5 border border-amber-500/30 rounded-2xl p-6 flex flex-col relative overflow-hidden transform md:-translate-y-4 shadow-[0_0_40px_rgba(245,158,11,0.1)]">
                                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-lg font-semibold text-amber-50 flex items-center gap-2">
                                                <Sparkles size={18} className="text-amber-400" /> Placement Pass
                                            </h3>
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-900 bg-amber-400 px-2.5 py-1 rounded-full">Popular</span>
                                        </div>
                                        <p className="text-sm text-amber-200/60 min-h-[40px]">The sweet spot for 6-months campus panic prep.</p>
                                    </div>
                                    <div className="flex items-end gap-2 mb-1">
                                        <div className="text-3xl font-bold text-amber-400">₹299</div>
                                        <div className="text-sm text-amber-200/50 line-through mb-1">₹399</div>
                                    </div>
                                    <div className="text-sm font-medium text-amber-200/70 mb-6">/ 6 Months</div>
                                    <ul className="space-y-3 mb-8 flex-1">
                                        {[
                                            'Everything in Free',
                                            'Cloud Sync across devices',
                                            'Company Mode (LeetCode Scrape)',
                                            'Thrice-a-Week Automated Exams',
                                            'Premium Animations & Themes'
                                        ].map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-amber-100/90">
                                                <Check size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                                <span className={i > 0 ? "font-medium" : ""}>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Tier 3: 1 Month */}
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col relative overflow-hidden group hover:border-white/20 transition-colors">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold text-zinc-100">
                                            Canteen Budget
                                        </h3>
                                        <p className="text-sm text-zinc-400 mt-2 min-h-[40px]">Cramming for a specific company visiting next week.</p>
                                    </div>
                                    <div className="flex items-end gap-2 mb-1">
                                        <div className="text-3xl font-bold text-white">₹79</div>
                                        <div className="text-sm text-zinc-600 line-through mb-1">₹99</div>
                                    </div>
                                    <div className="text-sm font-normal text-zinc-500 mb-6">/ month</div>
                                    <ul className="space-y-3 mb-8 flex-1">
                                        {[
                                            'All Premium Features',
                                            'Billed Monthly',
                                            'Cancel Anytime'
                                        ].map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                                                <Check size={16} className="text-zinc-500 shrink-0 mt-0.5" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Footer (Fake Gate) */}
                        <div className="relative z-10 border-t border-white/10 bg-black/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
                            <div className="flex items-center gap-3 text-emerald-400">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                    <Clock size={16} />
                                </div>
                                <p className="text-sm font-medium tracking-wide">
                                    For a limited period, <span className="font-bold">everything is freely available!</span>
                                </p>
                            </div>

                            <button
                                onClick={() => setPremiumPopupOpen(false)}
                                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10 active:scale-95 flex items-center justify-center gap-2"
                            >
                                Continue for Free
                            </button>
                        </div>

                        {/* Close button top right */}
                        <button
                            onClick={() => setPremiumPopupOpen(false)}
                            className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
