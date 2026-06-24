'use client';

// ============================================================
// WeekCelebrationPopup — shown ONCE to brand-new users on the
// dashboard, celebrating their first week on the platform.
//
// Trigger: the login flow writes `dsa_week_celebration = '1'` to
// localStorage when a sign-in returns isNew === true. This popup
// reads & clears that flag on mount so it only ever shows once.
// ============================================================

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper, Sparkles, Gift, X, Rocket } from 'lucide-react';

export const CELEBRATION_FLAG = 'dsa_week_celebration';

const PERKS = [
  { icon: '🎁', label: '7 days of full premium feel — explore everything' },
  { icon: '🔥', label: 'Start a streak today and watch it grow' },
  { icon: '🧠', label: 'Logic Building 101 + 755 curated DSA questions' },
  { icon: '🏆', label: 'Earn credits as you solve — unlock more perks' },
];

export default function WeekCelebrationPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(CELEBRATION_FLAG) === '1') {
        localStorage.removeItem(CELEBRATION_FLAG);
        // Small delay so it lands after the dashboard paints.
        const id = setTimeout(() => setOpen(true), 650);
        return () => clearTimeout(id);
      }
    } catch {
      /* localStorage unavailable — silently skip */
    }
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Confetti dots */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 22 }).map((_, i) => {
              const colors = ['#88C0D0', '#A3BE8C', '#EBCB8B', '#D08770', '#B48EAD', '#BF616A'];
              const left = (i * 37) % 100;
              const delay = (i % 6) * 0.18;
              const dur = 2.6 + (i % 5) * 0.4;
              return (
                <motion.span
                  key={i}
                  initial={{ y: -40, opacity: 0, rotate: 0 }}
                  animate={{ y: '110vh', opacity: [0, 1, 1, 0], rotate: 360 }}
                  transition={{ duration: dur, delay, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    left: `${left}%`,
                    top: 0,
                    width: 8,
                    height: 8,
                    borderRadius: i % 2 ? 2 : 8,
                    background: colors[i % colors.length],
                  }}
                />
              );
            })}
          </div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 24 }}
            transition={{ type: 'spring', damping: 24, stiffness: 320 }}
            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Ambient glow */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-nord8/60 to-transparent pointer-events-none" />
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-40 bg-nord8/15 blur-[70px] rounded-full pointer-events-none" />

            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div className="relative z-10 p-7 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 12, stiffness: 240, delay: 0.1 }}
                className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-nord8/25 to-nord10/25 border border-nord8/30 flex items-center justify-center mb-4"
              >
                <PartyPopper size={30} className="text-nord8" />
              </motion.div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-nord14/30 bg-nord14/10 mb-3">
                <Sparkles size={13} className="text-nord14" />
                <span className="text-nord14 text-[11px] font-bold uppercase tracking-wider">New here</span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-1.5">
                Welcome aboard! 🎉
              </h2>
              <p className="text-zinc-400 text-sm mb-5 max-w-xs mx-auto">
                You just joined — let&apos;s kick off your{' '}
                <span className="text-nord8 font-semibold">1-week celebration</span>. Here&apos;s what&apos;s waiting for you:
              </p>

              <div className="space-y-2 text-left mb-6">
                {PERKS.map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white/4 border border-white/8"
                  >
                    <span className="text-lg shrink-0">{p.icon}</span>
                    <span className="text-xs text-zinc-300">{p.label}</span>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={() => setOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-nord8 text-[#0a0a0a] text-sm font-bold hover:bg-nord8/90 transition-all active:scale-[0.98]"
              >
                <Rocket size={15} />
                Let&apos;s get solving
              </button>
              <p className="mt-3 text-[10px] text-zinc-600 flex items-center justify-center gap-1">
                <Gift size={11} className="text-nord15" /> Tip: hover the little dancer in the corner 👋
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
