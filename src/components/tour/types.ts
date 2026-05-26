// ============================================================
// Tour Engine — Public Types
// ============================================================
import type { ReactNode } from 'react';

export type Placement = 'top' | 'bottom' | 'left' | 'right' | 'center';

export interface WaitContext {
    step: TourStep;
    element: HTMLElement | null;
    next: () => void;
    abort: () => void;
}

export interface TourStep {
    id: string;
    /** CSS selector, e.g. '[data-tour="theme-toggle"]'. null = centered modal, no spotlight. */
    target: string | null;
    title: string;
    body: ReactNode;
    placement?: Placement;
    spotlightPadding?: number;
    spotlightRadius?: number;
    /** When true and target is missing after 5s, abort the tour. Default false → skip step. */
    required?: boolean;
    /** Skip step if !isLoggedIn. */
    requiresAuth?: boolean;
    /** Optional async gate. Resolve to advance, reject/throw to abort. */
    waitFor?: (ctx: WaitContext) => Promise<void>;
    onEnter?: () => void;
    onExit?: () => void;
}

export interface Tour {
    id: string;
    /** Bump when steps change. Users with stored version < current re-see the tour. */
    version: number;
    steps: TourStep[];
    allowSkip?: boolean;
}

export type TourStatus =
    | 'idle'
    | 'starting'
    | 'active'
    | 'resolving'
    | 'completing';

export interface GuideState {
    activeTourId: string | null;
    stepIndex: number;
    status: TourStatus;
    resolvedTarget: HTMLElement | null;
    /** True when the current step's target lookup timed out. */
    targetMissing: boolean;
}

export type TourEvent =
    | { type: 'tour_started'; tourId: string; version: number }
    | { type: 'tour_step_viewed'; tourId: string; stepId: string; index: number }
    | { type: 'tour_step_skipped'; tourId: string; stepId: string; reason: 'user' | 'target_missing' | 'requires_auth' }
    | { type: 'tour_abandoned'; tourId: string; atStep: string }
    | { type: 'tour_completed'; tourId: string; version: number };

export interface TourProgress {
    tourId: string;
    version: number;
    stepIndex: number;
    startedAt: string;
}
