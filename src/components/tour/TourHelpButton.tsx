'use client';

// ============================================================
// TourHelpButton — floating "?" affordance, bottom-right. Hidden while
// a tour is running so it never overlaps the tooltip.
// ============================================================
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { useTour } from './useTour';

interface Props {
    tourId?: string;
}

export default function TourHelpButton({ tourId = 'onboarding' }: Props) {
    const { isActive, start } = useTour();

    return (
        <AnimatePresence>
            {!isActive && (
                <motion.button
                    type="button"
                    onClick={() => start(tourId)}
                    aria-label="Replay the guided tour"
                    title="Guided tour (replay)"
                    initial={{ opacity: 0, scale: 0.85, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: 8 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    className="fixed bottom-6 right-6 z-[9000] flex items-center justify-center w-11 h-11 rounded-full"
                    style={{
                        background:
                            'linear-gradient(135deg, color-mix(in srgb, var(--color-nord0, #2E3440) 90%, transparent), color-mix(in srgb, var(--color-nord1, #3B4252) 90%, transparent))',
                        color: 'var(--color-nord8, #88C0D0)',
                        border: '1px solid color-mix(in srgb, var(--color-nord8, #88C0D0) 35%, transparent)',
                        boxShadow:
                            '0 6px 22px rgba(0,0,0,0.35), 0 0 16px color-mix(in srgb, var(--color-nord8, #88C0D0) 30%, transparent)',
                        backdropFilter: 'blur(14px) saturate(160%)',
                        WebkitBackdropFilter: 'blur(14px) saturate(160%)',
                    }}
                >
                    <HelpCircle size={20} />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
