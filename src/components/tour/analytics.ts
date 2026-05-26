// ============================================================
// Tour analytics — stub. Swap the body of `track` to wire up
// PostHog / Plausible / a custom backend later.
// ============================================================
import type { TourEvent } from './types';

export function track(event: TourEvent): void {
    if (typeof window === 'undefined') return;
    if (process.env.NODE_ENV !== 'production') {
        console.log('[tour]', event.type, event);
    }
    // TODO: forward to real analytics sink when available.
}
