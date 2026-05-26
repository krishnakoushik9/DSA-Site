'use client';

// ============================================================
// GuideProvider — context, reducer, state machine, persistence.
// Renders <TourOverlay/> as part of its tree so consumers only mount
// <GuideProvider tours={[...]}>.
// ============================================================
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    type ReactNode,
} from 'react';
import { useAppStore } from '@/store/useAppStore';
import { resolveTarget, TargetTimeoutError } from './resolveTarget';
import { track } from './analytics';
import TourOverlay from './TourOverlay';
import type { GuideState, Tour, TourProgress, TourStep } from './types';

const PROGRESS_KEY = 'tour:progress:v1';

type Action =
    | { type: 'START'; tourId: string }
    | { type: 'NEXT' }
    | { type: 'PREV' }
    | { type: 'SKIP' }
    | { type: 'STOP' }
    | { type: 'TARGET_RESOLVED'; el: HTMLElement | null }
    | { type: 'TARGET_TIMEOUT' }
    | { type: 'COMPLETED' };

const initialState: GuideState = {
    activeTourId: null,
    stepIndex: 0,
    status: 'idle',
    resolvedTarget: null,
    targetMissing: false,
};

function reducer(state: GuideState, action: Action): GuideState {
    switch (action.type) {
        case 'START':
            return {
                activeTourId: action.tourId,
                stepIndex: 0,
                status: 'resolving',
                resolvedTarget: null,
                targetMissing: false,
            };
        case 'NEXT':
            if (state.status !== 'active' && state.status !== 'resolving') return state;
            return {
                ...state,
                stepIndex: state.stepIndex + 1,
                status: 'resolving',
                resolvedTarget: null,
                targetMissing: false,
            };
        case 'PREV':
            if (state.stepIndex === 0) return state;
            return {
                ...state,
                stepIndex: state.stepIndex - 1,
                status: 'resolving',
                resolvedTarget: null,
                targetMissing: false,
            };
        case 'SKIP':
            return {
                ...state,
                stepIndex: state.stepIndex + 1,
                status: 'resolving',
                resolvedTarget: null,
                targetMissing: false,
            };
        case 'TARGET_RESOLVED':
            return { ...state, resolvedTarget: action.el, status: 'active', targetMissing: false };
        case 'TARGET_TIMEOUT':
            return { ...state, resolvedTarget: null, status: 'active', targetMissing: true };
        case 'STOP':
        case 'COMPLETED':
            return { ...initialState };
        default:
            return state;
    }
}

interface GuideContextValue {
    state: GuideState;
    tours: Map<string, Tour>;
    start: (tourId: string) => void;
    next: () => void;
    prev: () => void;
    skip: () => void;
    stop: () => void;
    currentStep: TourStep | null;
    currentTour: Tour | null;
    totalSteps: number;
}

const GuideContext = createContext<GuideContextValue | null>(null);

export function useGuideContext(): GuideContextValue {
    const ctx = useContext(GuideContext);
    if (!ctx) {
        throw new Error('useGuideContext must be used inside <GuideProvider>');
    }
    return ctx;
}

function writeProgress(progress: TourProgress | null) {
    if (typeof window === 'undefined') return;
    try {
        if (progress) localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
        else localStorage.removeItem(PROGRESS_KEY);
    } catch {
        /* quota / private mode — non-fatal */
    }
}

interface GuideProviderProps {
    tours: Tour[];
    children: ReactNode;
}

export function GuideProvider({ tours, children }: GuideProviderProps) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const registry = useMemo(() => {
        const m = new Map<string, Tour>();
        tours.forEach((t) => m.set(t.id, t));
        return m;
    }, [tours]);

    const currentTour = state.activeTourId ? registry.get(state.activeTourId) ?? null : null;
    const currentStep = currentTour && state.stepIndex < currentTour.steps.length
        ? currentTour.steps[state.stepIndex]
        : null;
    const totalSteps = currentTour?.steps.length ?? 0;

    const startedAtRef = useRef<string | null>(null);
    const lastViewedRef = useRef<string | null>(null);

    // ---- Auto-completion when we step past the last index --------------
    useEffect(() => {
        if (!currentTour) return;
        if (state.stepIndex >= currentTour.steps.length) {
            const { id, version } = currentTour;
            track({ type: 'tour_completed', tourId: id, version });
            try {
                useAppStore.getState().setTourCompleted(id, version);
            } catch {
                /* store may not be ready in edge cases */
            }
            writeProgress(null);
            startedAtRef.current = null;
            lastViewedRef.current = null;
            dispatch({ type: 'COMPLETED' });
        }
    }, [state.stepIndex, currentTour]);

    // ---- Target resolution ------------------------------------------------
    useEffect(() => {
        if (!currentStep || state.status !== 'resolving') return;

        // requiresAuth gate
        if (currentStep.requiresAuth && !useAppStore.getState().isLoggedIn) {
            track({
                type: 'tour_step_skipped',
                tourId: currentTour!.id,
                stepId: currentStep.id,
                reason: 'requires_auth',
            });
            dispatch({ type: 'SKIP' });
            return;
        }

        if (currentStep.target === null) {
            dispatch({ type: 'TARGET_RESOLVED', el: null });
            return;
        }

        const controller = new AbortController();
        resolveTarget(currentStep.target, { signal: controller.signal })
            .then((el) => {
                dispatch({ type: 'TARGET_RESOLVED', el });
                // smooth scroll into view if needed
                try {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                } catch {
                    /* older browsers */
                }
            })
            .catch((err) => {
                if (err instanceof DOMException && err.name === 'AbortError') return;
                if (err instanceof TargetTimeoutError) {
                    track({
                        type: 'tour_step_skipped',
                        tourId: currentTour!.id,
                        stepId: currentStep.id,
                        reason: 'target_missing',
                    });
                    if (currentStep.required) {
                        dispatch({ type: 'STOP' });
                    } else {
                        // Show centered fallback for one beat, then advance.
                        // Easier UX: advance immediately so the tour doesn't stall.
                        dispatch({ type: 'TARGET_TIMEOUT' });
                    }
                }
            });

        return () => controller.abort();
    }, [currentStep, state.status, currentTour]);

    // ---- onEnter / onExit lifecycle + step_viewed analytics --------------
    useEffect(() => {
        if (!currentStep || !currentTour) return;
        if (state.status !== 'active') return;

        const viewedKey = `${currentTour.id}:${currentStep.id}`;
        if (lastViewedRef.current !== viewedKey) {
            lastViewedRef.current = viewedKey;
            track({
                type: 'tour_step_viewed',
                tourId: currentTour.id,
                stepId: currentStep.id,
                index: state.stepIndex,
            });
        }

        currentStep.onEnter?.();
        writeProgress({
            tourId: currentTour.id,
            version: currentTour.version,
            stepIndex: state.stepIndex,
            startedAt: startedAtRef.current ?? new Date().toISOString(),
        });

        return () => {
            currentStep.onExit?.();
        };
    }, [currentStep, currentTour, state.status, state.stepIndex]);

    // ---- ESC at capture phase, suppressed in text inputs -----------------
    useEffect(() => {
        if (state.status === 'idle') return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            const t = document.activeElement as HTMLElement | null;
            if (t) {
                const tag = t.tagName;
                if (tag === 'INPUT' || tag === 'TEXTAREA' || t.isContentEditable) return;
            }
            e.preventDefault();
            e.stopPropagation();
            dispatch({ type: 'STOP' });
            if (currentTour && currentStep) {
                track({
                    type: 'tour_abandoned',
                    tourId: currentTour.id,
                    atStep: currentStep.id,
                });
            }
            writeProgress(null);
            startedAtRef.current = null;
            lastViewedRef.current = null;
        };
        window.addEventListener('keydown', onKey, { capture: true });
        return () => window.removeEventListener('keydown', onKey, { capture: true });
    }, [state.status, currentTour, currentStep]);

    // ---- Public API ------------------------------------------------------
    const start = useCallback(
        (tourId: string) => {
            const tour = registry.get(tourId);
            if (!tour) {
                if (process.env.NODE_ENV !== 'production') {
                    console.warn(`[tour] unknown tour id: ${tourId}`);
                }
                return;
            }
            if (state.status !== 'idle') return; // one tour at a time
            startedAtRef.current = new Date().toISOString();
            lastViewedRef.current = null;
            track({ type: 'tour_started', tourId: tour.id, version: tour.version });
            dispatch({ type: 'START', tourId });
        },
        [registry, state.status],
    );

    const next = useCallback(() => dispatch({ type: 'NEXT' }), []);
    const prev = useCallback(() => dispatch({ type: 'PREV' }), []);
    const skip = useCallback(() => {
        if (currentTour && currentStep) {
            track({
                type: 'tour_step_skipped',
                tourId: currentTour.id,
                stepId: currentStep.id,
                reason: 'user',
            });
        }
        dispatch({ type: 'SKIP' });
    }, [currentTour, currentStep]);
    const stop = useCallback(() => {
        if (currentTour && currentStep) {
            track({
                type: 'tour_abandoned',
                tourId: currentTour.id,
                atStep: currentStep.id,
            });
        }
        writeProgress(null);
        startedAtRef.current = null;
        lastViewedRef.current = null;
        dispatch({ type: 'STOP' });
    }, [currentTour, currentStep]);

    const value = useMemo<GuideContextValue>(
        () => ({ state, tours: registry, start, next, prev, skip, stop, currentStep, currentTour, totalSteps }),
        [state, registry, start, next, prev, skip, stop, currentStep, currentTour, totalSteps],
    );

    return (
        <GuideContext.Provider value={value}>
            {children}
            <TourOverlay />
        </GuideContext.Provider>
    );
}
