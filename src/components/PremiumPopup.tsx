'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import {
    Sparkles,
    Zap,
    Check,
    X,
    Flame,
    Coins,
    ShieldCheck,
    TrendingUp,
    Lock,
    Unlock,
    ChevronRight,
    Star,
    AlertTriangle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const PLANS = [
    {
        id: 'placement' as const,
        name: 'Placement Pass',
        tagline: '6-month campus panic prep',
        costCredits: 299,
        badge: 'POPULAR',
        badgeColor: 'bg-amber-400 text-amber-900',
        accentColor: 'amber',
        borderClass: 'border-amber-500/40',
        bgClass: 'bg-gradient-to-b from-amber-500/10 to-amber-500/5',
        highlightBar: 'bg-gradient-to-r from-amber-400 to-amber-600',
        priceColor: 'text-amber-400',
        features: [
            'Cloud Sync across devices',
            'Company Mode (LeetCode Scrape)',
            'Thrice-a-Week Automated Exams',
            'Premium Animations & Themes',
            'Priority Community Access',
        ],
    },
    {
        id: 'monthly' as const,
        name: 'Canteen Budget',
        tagline: 'Crunch mode for one month',
        costCredits: 79,
        badge: null,
        accentColor: 'zinc',
        borderClass: 'border-white/10',
        bgClass: 'bg-white/5',
        highlightBar: null,
        priceColor: 'text-white',
        features: [
            'All Premium Features',
            'Active for 30 days',
            'Renew anytime with credits',
        ],
    },
] as const;

const CREDIT_EARNS = [
    { icon: '✅', label: 'Solve a question', amount: '+5 credits' },
    { icon: '📅', label: 'Full day complete', amount: '+0 bonus*' },
    { icon: '🔥', label: 'Solve streak bonus', amount: 'included' },
    { icon: '📊', label: 'Complete a monthly plan', amount: '600+ credits/month' },
];

export default function PremiumPopup() {
    const {
        isPremiumPopupOpen,
        setPremiumPopupOpen,
        credits,
        isPremium,
        premiumPlan,
        spendCredits,
    } = useAppStore();

    const [mounted, setMounted] = useState(false);
    const [confirmPlan, setConfirmPlan] = useState<'placement' | 'monthly' | null>(null);
    const [justPurchased, setJustPurchased] = useState<string | null>(null);
    const [purchaseError, setPurchaseError] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    if (!mounted) return null;

    const handleBuy = (plan: 'placement' | 'monthly') => {
        const planObj = PLANS.find(p => p.id === plan)!;
        if ((credits ?? 0) < planObj.costCredits) {
            setPurchaseError(true);
            setTimeout(() => setPurchaseError(false), 2500);
            return;
        }
        setConfirmPlan(plan);
    };

    const handleConfirm = () => {
        if (!confirmPlan) return;
        const success = spendCredits(
            PLANS.find(p => p.id === confirmPlan)!.costCredits,
            confirmPlan
        );
        if (success) {
            setJustPurchased(confirmPlan);
            setConfirmPlan(null);
            setTimeout(() => setJustPurchased(null), 4000);
        }
    };

    const safeCredits = credits ?? 0;

    return (
        <AnimatePresence>
            {isPremiumPopupOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8 isolate">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => { setPremiumPopupOpen(false); setConfirmPlan(null); }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 24 }}
                        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                        className="relative w-full max-w-3xl bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
                    >
                        {/* Ambient glows */}
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent pointer-events-none" />
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/8 blur-[90px] rounded-full mix-blend-screen pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/5 blur-[90px] rounded-full mix-blend-screen pointer-events-none" />

                        {/* ── Success Toast ── */}
                        <AnimatePresence>
                            {justPurchased && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl backdrop-blur-lg"
                                >
                                    <ShieldCheck size={16} className="text-emerald-400" />
                                    <span className="text-sm font-semibold text-emerald-300">
                                        Premium unlocked! You&apos;re all set 🎉
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ── Confirm Dialog overlay ── */}
                        <AnimatePresence>
                            {confirmPlan && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                                >
                                    <motion.div
                                        initial={{ scale: 0.88, y: 16 }}
                                        animate={{ scale: 1, y: 0 }}
                                        exit={{ scale: 0.88, y: 16 }}
                                        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                                        className="bg-[#111] border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                                                <Coins size={20} className="text-amber-400" />
                                            </div>
                                            <div>
                                                <p className="text-white font-semibold text-sm">Confirm Purchase</p>
                                                <p className="text-zinc-400 text-xs">This will deduct credits from your balance</p>
                                            </div>
                                        </div>
                                        {(() => {
                                            const plan = PLANS.find(p => p.id === confirmPlan)!;
                                            return (
                                                <div className="bg-white/5 rounded-xl p-3 mb-4 flex items-center justify-between">
                                                    <span className="text-zinc-300 text-sm font-medium">{plan.name}</span>
                                                    <span className="text-amber-400 font-bold text-sm flex items-center gap-1">
                                                        <Coins size={12} /> {plan.costCredits} credits
                                                    </span>
                                                </div>
                                            );
                                        })()}
                                        <div className="flex items-center justify-between text-xs text-zinc-500 mb-4 px-1">
                                            <span>Your balance: <span className="text-amber-300 font-bold">{safeCredits} credits</span></span>
                                            <span>After: <span className="text-zinc-300 font-bold">{safeCredits - PLANS.find(p => p.id === confirmPlan)!.costCredits} credits</span></span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setConfirmPlan(null)}
                                                className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 text-sm font-medium hover:bg-white/10 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleConfirm}
                                                className="flex-1 py-2 rounded-xl bg-amber-500 text-black text-sm font-bold hover:bg-amber-400 transition-colors active:scale-95"
                                            >
                                                Confirm & Unlock
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ── Header ── */}
                        <div className="relative z-10 p-6 pb-3 text-center">
                            {/* Credit Balance Chip */}
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 mb-4">
                                <Coins size={14} className="text-amber-400" />
                                <span className="text-amber-300 text-sm font-bold">{safeCredits.toLocaleString()} credits</span>
                                <span className="text-amber-600 text-xs">in your wallet</span>
                            </div>

                            {isPremium ? (
                                <>
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <ShieldCheck size={22} className="text-emerald-400" />
                                        <h2 className="text-2xl font-bold text-white">You&apos;re Premium! 🎉</h2>
                                    </div>
                                    <p className="text-zinc-400 text-sm">
                                        {premiumPlan === 'placement'
                                            ? 'Placement Pass active — enjoy all features.'
                                            : 'Monthly pass active — all features unlocked.'}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
                                        Unlock the Full Site
                                    </h2>
                                    <p className="text-zinc-400 text-sm max-w-lg mx-auto">
                                        No real money needed. Spend your <span className="text-amber-400 font-semibold">credit balance</span> to unlock premium.
                                        Earn more by solving your daily questions.
                                    </p>

                                    {/* Error flash */}
                                    <AnimatePresence>
                                        {purchaseError && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium"
                                            >
                                                <AlertTriangle size={13} /> Not enough credits — solve more questions!
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </>
                            )}
                        </div>

                        {/* ── Main Content ── */}
                        <div className="relative z-10 flex-1 overflow-y-auto p-5 pt-2 space-y-4">

                            {/* Plans grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {PLANS.map((plan) => {
                                    const canAfford = safeCredits >= plan.costCredits;
                                    const alreadyActive = isPremium && premiumPlan === plan.id;
                                    return (
                                        <div
                                            key={plan.id}
                                            className={`relative rounded-2xl border p-5 flex flex-col ${plan.bgClass} ${plan.borderClass} overflow-hidden transition-all duration-200 ${!canAfford && !alreadyActive ? 'opacity-60' : ''}`}
                                        >
                                            {plan.highlightBar && (
                                                <div className={`absolute top-0 inset-x-0 h-0.5 ${plan.highlightBar}`} />
                                            )}
                                            {plan.badge && (
                                                <span className={`absolute top-3 right-3 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${plan.badgeColor}`}>
                                                    {plan.badge}
                                                </span>
                                            )}

                                            <h3 className="text-base font-bold text-white mb-0.5">{plan.name}</h3>
                                            <p className="text-xs text-zinc-400 mb-3">{plan.tagline}</p>

                                            {/* Price */}
                                            <div className={`flex items-center gap-1.5 mb-4 ${plan.priceColor}`}>
                                                <Coins size={18} />
                                                <span className="text-2xl font-bold">{plan.costCredits}</span>
                                                <span className="text-xs text-zinc-500 font-normal mt-1">credits</span>
                                            </div>

                                            {/* Features */}
                                            <ul className="space-y-2 mb-5 flex-1">
                                                {plan.features.map((f, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                                                        <Check size={13} className="text-amber-500 shrink-0 mt-0.5" />
                                                        <span>{f}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            {/* CTA */}
                                            {alreadyActive ? (
                                                <div className="flex items-center gap-2 justify-center py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
                                                    <ShieldCheck size={14} /> Currently Active
                                                </div>
                                            ) : canAfford ? (
                                                <button
                                                    onClick={() => handleBuy(plan.id)}
                                                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-all active:scale-95 group"
                                                >
                                                    <Unlock size={13} />
                                                    Unlock for {plan.costCredits} credits
                                                    <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                                                </button>
                                            ) : (
                                                <button
                                                    disabled
                                                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-500 text-xs font-semibold cursor-not-allowed"
                                                >
                                                    <Lock size={13} />
                                                    Need {plan.costCredits - safeCredits} more credits
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* How to earn credits */}
                            <div className="bg-white/3 border border-white/8 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <TrendingUp size={14} className="text-amber-400" />
                                    <p className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">How to earn credits</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {CREDIT_EARNS.map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-white/3">
                                            <span className="text-base">{item.icon}</span>
                                            <div className="min-w-0">
                                                <p className="text-[10px] text-zinc-400 truncate">{item.label}</p>
                                                <p className="text-[10px] font-bold text-amber-400">{item.amount}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[9px] text-zinc-600 mt-2 text-center">
                                    * Complete all assigned questions in a month → earn 600+ credits (enough for another Placement Pass!)
                                </p>
                            </div>

                            {/* Free tier reminder */}
                            <div className="bg-white/3 border border-white/8 rounded-2xl p-4 flex items-start gap-3">
                                <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                                    <Star size={14} className="text-zinc-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-zinc-300 mb-0.5">Free tier is still powerful</p>
                                    <p className="text-xs text-zinc-500">755 core questions, calendar tracker, community & workspace — all free, forever.</p>
                                </div>
                            </div>
                        </div>

                        {/* ── Footer ── */}
                        <div className="relative z-10 border-t border-white/8 bg-black/40 p-4 flex items-center justify-between gap-4 backdrop-blur-md">
                            <div className="flex items-center gap-2 text-zinc-500">
                                <Flame size={13} className="text-rose-400/70" />
                                <p className="text-xs">
                                    <span className="text-rose-400/80 font-semibold">No real money involved.</span>
                                    {' '}Credits are earned by solving questions.
                                </p>
                            </div>
                            <button
                                onClick={() => { setPremiumPopupOpen(false); setConfirmPlan(null); }}
                                className="px-5 py-2 rounded-xl bg-white/8 border border-white/10 text-zinc-300 text-sm font-medium hover:bg-white/15 transition-colors shrink-0"
                            >
                                Close
                            </button>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={() => { setPremiumPopupOpen(false); setConfirmPlan(null); }}
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
