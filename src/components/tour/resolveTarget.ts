// ============================================================
// resolveTarget — wait for a DOM element matching `selector` to exist.
// Resolves immediately if present; otherwise observes mutations on
// document.body until the element appears or the timeout elapses.
// ============================================================

export interface ResolveOptions {
    /** Max time to wait before rejecting. Default 5000ms. */
    timeoutMs?: number;
    /** Optional AbortSignal — when aborted, the promise rejects with AbortError. */
    signal?: AbortSignal;
}

export class TargetTimeoutError extends Error {
    constructor(public selector: string, public timeoutMs: number) {
        super(`Tour target "${selector}" not found within ${timeoutMs}ms`);
        this.name = 'TargetTimeoutError';
    }
}

export function resolveTarget(
    selector: string,
    { timeoutMs = 5000, signal }: ResolveOptions = {},
): Promise<HTMLElement> {
    return new Promise((resolve, reject) => {
        if (typeof document === 'undefined') {
            reject(new Error('resolveTarget called outside the browser'));
            return;
        }

        // Fast path
        const immediate = document.querySelector<HTMLElement>(selector);
        if (immediate) {
            resolve(immediate);
            return;
        }

        let timer: ReturnType<typeof setTimeout> | null = null;
        let observer: MutationObserver | null = null;

        const cleanup = () => {
            if (timer) clearTimeout(timer);
            if (observer) observer.disconnect();
            if (signal) signal.removeEventListener('abort', onAbort);
        };

        const onAbort = () => {
            cleanup();
            reject(new DOMException('Aborted', 'AbortError'));
        };

        if (signal) {
            if (signal.aborted) {
                reject(new DOMException('Aborted', 'AbortError'));
                return;
            }
            signal.addEventListener('abort', onAbort, { once: true });
        }

        observer = new MutationObserver(() => {
            const el = document.querySelector<HTMLElement>(selector);
            if (el) {
                cleanup();
                resolve(el);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-tour', 'class', 'id'],
        });

        timer = setTimeout(() => {
            cleanup();
            reject(new TargetTimeoutError(selector, timeoutMs));
        }, timeoutMs);
    });
}
