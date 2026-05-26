'use client';

// ============================================================
// useTour — public hook. Thin selector over GuideContext.
// ============================================================
import { useGuideContext } from './GuideProvider';

export function useTour() {
    const { state, start, next, prev, skip, stop, currentStep, currentTour, totalSteps } = useGuideContext();
    return {
        isActive: state.status !== 'idle',
        status: state.status,
        currentStep,
        currentTour,
        stepIndex: state.stepIndex,
        totalSteps,
        targetMissing: state.targetMissing,
        resolvedTarget: state.resolvedTarget,
        start,
        next,
        prev,
        skip,
        stop,
    };
}
