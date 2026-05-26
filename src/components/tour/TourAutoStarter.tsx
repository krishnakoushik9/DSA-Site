'use client';

// ============================================================
// TourAutoStarter — fires the onboarding tour once per (user × version)
// after the cloud sync completes. Must live inside <GuideProvider>.
// ============================================================
import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useTour } from './useTour';
import { onboardingTour } from './steps';

export default function TourAutoStarter() {
    const { start } = useTour();
    const isLoggedIn = useAppStore((s) => s.isLoggedIn);
    const cloudReady = useAppStore((s) => s._cloudReady);
    const triggeredRef = useRef(false);

    useEffect(() => {
        if (triggeredRef.current) return;
        if (!isLoggedIn || !cloudReady) return;

        const completed = useAppStore.getState().completedTours ?? {};
        if (completed[onboardingTour.id] === onboardingTour.version) {
            triggeredRef.current = true;
            return;
        }

        triggeredRef.current = true;
        // Small delay so data-tour targets are mounted and the dashboard has
        // settled before we start spotlighting.
        const t = setTimeout(() => start(onboardingTour.id), 900);
        return () => clearTimeout(t);
    }, [isLoggedIn, cloudReady, start]);

    return null;
}
