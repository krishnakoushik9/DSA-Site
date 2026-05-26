'use client';

// ============================================================
// TourOverlay — portal-mounted overlay (backdrop + SVG-mask spotlight +
// glow ring + floating-ui tooltip). Handles reduced motion, focus
// trapping, and click-outside-to-skip.
// ============================================================
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { autoUpdate, computePosition, flip, offset, shift, arrow as fuiArrow } from '@floating-ui/dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useGuideContext } from './GuideProvider';
import type { Placement } from './types';

interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

const DEFAULT_PADDING = 8;
const DEFAULT_RADIUS = 12;

function fuiPlacement(p: Placement | undefined): 'top' | 'bottom' | 'left' | 'right' {
    if (p === 'top' || p === 'left' || p === 'right') return p;
    return 'bottom';
}

export default function TourOverlay() {
    const {
        state,
        currentStep,
        currentTour,
        totalSteps,
        next,
        prev,
        skip,
        stop,
    } = useGuideContext();

    const reduce = useReducedMotion();
    const [portalEl, setPortalEl] = useState<HTMLDivElement | null>(null);

    // Establish portal container once. Genuine DOM subscription — the
    // div is owned by document.body, not by React state.
    useLayoutEffect(() => {
        if (typeof document === 'undefined') return;
        const div = document.createElement('div');
        div.setAttribute('data-tour-portal', 'true');
        // Sits above FloatingDock (z-9999) so the spotlight can dim it and
        // cut a hole; below RetroThemeOverride bloom (z-99999) so theme
        // transitions still bloom over the tour.
        div.style.position = 'fixed';
        div.style.inset = '0';
        div.style.zIndex = '10000';
        div.style.pointerEvents = 'none';
        document.body.appendChild(div);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time external DOM mount
        setPortalEl(div);
        return () => {
            div.remove();
            // eslint-disable-next-line react-hooks/set-state-in-effect -- portal teardown
            setPortalEl(null);
        };
    }, []);

    const isActive = state.status === 'active' && currentStep !== null;

    // Track target rect (drives spotlight + tooltip reference).
    // Clearing rect on target change prevents the SVG mask from rendering a stale hole.
    const [rect, setRect] = useState<Rect | null>(null);
    useEffect(() => {
        if (!isActive) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- clear stale rect when tour ends
            setRect(null);
            return;
        }
        const el = state.resolvedTarget;
        if (!el) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- clear stale rect when target lost
            setRect(null);
            return;
        }

        let rafId = 0;
        const update = () => {
            const r = el.getBoundingClientRect();
            setRect({ x: r.left, y: r.top, width: r.width, height: r.height });
        };
        const schedule = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(update);
        };

        update();
        const ro = new ResizeObserver(schedule);
        ro.observe(el);
        window.addEventListener('scroll', schedule, { passive: true, capture: true });
        window.addEventListener('resize', schedule, { passive: true });

        return () => {
            cancelAnimationFrame(rafId);
            ro.disconnect();
            window.removeEventListener('scroll', schedule, { capture: true } as EventListenerOptions);
            window.removeEventListener('resize', schedule);
        };
    }, [isActive, state.resolvedTarget]);

    // Tooltip positioning via floating-ui.
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const arrowRef = useRef<HTMLDivElement | null>(null);
    const [tipPos, setTipPos] = useState<{
        x: number;
        y: number;
        placement: 'top' | 'bottom' | 'left' | 'right';
        arrowX?: number;
        arrowY?: number;
    } | null>(null);

    useEffect(() => {
        if (!isActive || !currentStep) return;
        const tipEl = tooltipRef.current;
        if (!tipEl) return;

        // Centered placement (no target, or target_missing) — pin to viewport center.
        if (currentStep.placement === 'center' || !state.resolvedTarget || state.targetMissing) {
            const cx = window.innerWidth / 2 - tipEl.offsetWidth / 2;
            const cy = window.innerHeight / 2 - tipEl.offsetHeight / 2;
            setTipPos({ x: cx, y: cy, placement: 'bottom' });
            return;
        }

        const referenceEl = state.resolvedTarget;

        const compute = () => {
            const arrowEl = arrowRef.current;
            const middleware = [
                offset(16),
                flip({ padding: 12 }),
                shift({ padding: 12 }),
            ];
            if (arrowEl) middleware.push(fuiArrow({ element: arrowEl, padding: 8 }));
            return computePosition(referenceEl, tipEl, {
                placement: fuiPlacement(currentStep.placement),
                middleware,
            }).then(({ x, y, placement, middlewareData }) => {
                const side = placement.split('-')[0] as 'top' | 'bottom' | 'left' | 'right';
                setTipPos({
                    x,
                    y,
                    placement: side,
                    arrowX: middlewareData.arrow?.x,
                    arrowY: middlewareData.arrow?.y,
                });
            });
        };

        const cleanup = autoUpdate(referenceEl, tipEl, compute);
        return cleanup;
    }, [isActive, currentStep, state.resolvedTarget, state.targetMissing]);

    // Focus management + inert on the rest of the app.
    const lastFocusedRef = useRef<HTMLElement | null>(null);
    useEffect(() => {
        if (!isActive) return;
        lastFocusedRef.current = document.activeElement as HTMLElement | null;

        const dimmedSiblings: HTMLElement[] = [];
        if (portalEl) {
            for (const child of Array.from(document.body.children)) {
                if (child === portalEl) continue;
                if (child instanceof HTMLElement) {
                    if (!child.hasAttribute('inert')) {
                        child.setAttribute('inert', '');
                        dimmedSiblings.push(child);
                    }
                }
            }
        }

        const focusTimer = setTimeout(() => {
            const tipEl = tooltipRef.current;
            if (!tipEl) return;
            const first = tipEl.querySelector<HTMLElement>('button[data-tour-primary], button');
            first?.focus();
        }, 50);

        return () => {
            clearTimeout(focusTimer);
            dimmedSiblings.forEach((el) => el.removeAttribute('inert'));
            lastFocusedRef.current?.focus?.();
        };
    }, [isActive, portalEl]);

    // Tab / Shift+Tab trap within the tooltip.
    useEffect(() => {
        if (!isActive) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;
            const tipEl = tooltipRef.current;
            if (!tipEl) return;
            const focusables = tipEl.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            );
            if (focusables.length === 0) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const active = document.activeElement as HTMLElement | null;

            if (!tipEl.contains(active)) {
                e.preventDefault();
                first.focus();
                return;
            }
            if (e.shiftKey && active === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && active === last) {
                e.preventDefault();
                first.focus();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isActive]);

    const spotlightPadding = currentStep?.spotlightPadding ?? DEFAULT_PADDING;
    const spotlightRadius = currentStep?.spotlightRadius ?? DEFAULT_RADIUS;
    const showSpotlight = isActive && !!rect && currentStep?.placement !== 'center' && !state.targetMissing;

    const transition = useMemo(
        () => (reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 320, damping: 30 }),
        [reduce],
    );

    if (!portalEl) return null;

    const isLast = currentTour ? state.stepIndex >= currentTour.steps.length - 1 : false;
    const isFirst = state.stepIndex === 0;
    const allowSkip = currentTour?.allowSkip ?? true;

    return createPortal(
        <AnimatePresence>
            {isActive && currentStep && (
                <motion.div
                    key="tour-root"
                    className="fixed inset-0"
                    style={{ pointerEvents: 'auto' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduce ? 0 : 0.25 }}
                >
                    {/* SVG mask backdrop */}
                    <svg
                        className="fixed inset-0 w-screen h-screen"
                        width="100%"
                        height="100%"
                        aria-hidden
                        onClick={() => allowSkip && stop()}
                        style={{ cursor: allowSkip ? 'default' : 'auto' }}
                    >
                        <defs>
                            <mask id="tour-spotlight-mask">
                                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                                {showSpotlight && rect && (
                                    <motion.rect
                                        initial={false}
                                        animate={{
                                            x: rect.x - spotlightPadding,
                                            y: rect.y - spotlightPadding,
                                            width: rect.width + spotlightPadding * 2,
                                            height: rect.height + spotlightPadding * 2,
                                            rx: spotlightRadius,
                                            ry: spotlightRadius,
                                        }}
                                        transition={transition}
                                        fill="black"
                                    />
                                )}
                            </mask>
                        </defs>
                        <rect
                            x="0"
                            y="0"
                            width="100%"
                            height="100%"
                            fill="rgba(8, 10, 16, 0.74)"
                            mask="url(#tour-spotlight-mask)"
                        />
                    </svg>

                    {/* Glow ring around the spotlight */}
                    {showSpotlight && rect && (
                        <motion.div
                            aria-hidden
                            className="fixed pointer-events-none"
                            initial={false}
                            animate={{
                                x: rect.x - spotlightPadding,
                                y: rect.y - spotlightPadding,
                                width: rect.width + spotlightPadding * 2,
                                height: rect.height + spotlightPadding * 2,
                            }}
                            transition={transition}
                            style={{
                                top: 0,
                                left: 0,
                                borderRadius: spotlightRadius,
                                boxShadow:
                                    '0 0 0 1px var(--color-nord8, #88C0D0), 0 0 24px 2px color-mix(in srgb, var(--color-nord8, #88C0D0) 60%, transparent), inset 0 0 12px color-mix(in srgb, var(--color-nord8, #88C0D0) 40%, transparent)',
                            }}
                        />
                    )}

                    {/* Tooltip */}
                    <motion.div
                        ref={tooltipRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="tour-title"
                        aria-describedby="tour-body"
                        className="acrylic-heavy fixed max-w-[380px] w-[min(380px,calc(100vw-32px))] rounded-2xl p-5 shadow-2xl"
                        style={{
                            top: 0,
                            left: 0,
                            transform: tipPos ? `translate3d(${tipPos.x}px, ${tipPos.y}px, 0)` : 'translate3d(-9999px, -9999px, 0)',
                            border: '1px solid color-mix(in srgb, var(--color-nord8, #88C0D0) 35%, transparent)',
                            background:
                                'linear-gradient(135deg, color-mix(in srgb, var(--color-nord0, #2E3440) 92%, transparent), color-mix(in srgb, var(--color-nord1, #3B4252) 92%, transparent))',
                            backdropFilter: 'blur(20px) saturate(160%)',
                            WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                        }}
                        initial={{ opacity: 0, scale: 0.96, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 8 }}
                        transition={transition}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close (top-right) */}
                        <button
                            type="button"
                            onClick={stop}
                            aria-label="Close tour"
                            className="absolute top-3 right-3 p-1 rounded-md opacity-60 hover:opacity-100 hover:bg-white/10 transition"
                        >
                            <X size={16} />
                        </button>

                        <div className="flex items-center gap-2 mb-2">
                            <span
                                className="inline-block w-2 h-2 rounded-full"
                                style={{ background: 'var(--color-nord8, #88C0D0)', boxShadow: '0 0 8px var(--color-nord8, #88C0D0)' }}
                            />
                            <span
                                id="tour-title"
                                className="font-mono text-[11px] tracking-[0.18em] uppercase"
                                style={{ color: 'var(--color-nord8, #88C0D0)' }}
                            >
                                {currentStep.title}
                            </span>
                        </div>

                        <div
                            id="tour-body"
                            className="text-sm leading-relaxed mb-4"
                            style={{ color: 'var(--color-nord4, #D8DEE9)' }}
                        >
                            {currentStep.body}
                        </div>

                        {/* Progress dots */}
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-1.5">
                                {Array.from({ length: totalSteps }).map((_, i) => (
                                    <span
                                        key={i}
                                        className="rounded-full transition-all"
                                        style={{
                                            width: i === state.stepIndex ? 18 : 6,
                                            height: 6,
                                            background:
                                                i === state.stepIndex
                                                    ? 'var(--color-nord8, #88C0D0)'
                                                    : i < state.stepIndex
                                                        ? 'color-mix(in srgb, var(--color-nord8, #88C0D0) 50%, transparent)'
                                                        : 'color-mix(in srgb, var(--color-nord4, #D8DEE9) 20%, transparent)',
                                            boxShadow:
                                                i === state.stepIndex
                                                    ? '0 0 8px var(--color-nord8, #88C0D0)'
                                                    : 'none',
                                        }}
                                    />
                                ))}
                            </div>

                            <div className="flex items-center gap-2">
                                {!isFirst && (
                                    <button
                                        type="button"
                                        onClick={prev}
                                        aria-label="Previous step"
                                        className="flex items-center justify-center w-8 h-8 rounded-md text-sm hover:bg-white/10 transition opacity-80 hover:opacity-100"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                )}
                                {allowSkip && !isLast && (
                                    <button
                                        type="button"
                                        onClick={skip}
                                        className="text-xs px-2 py-1 rounded-md opacity-60 hover:opacity-100 transition"
                                    >
                                        skip
                                    </button>
                                )}
                                <button
                                    type="button"
                                    data-tour-primary
                                    onClick={next}
                                    aria-label={isLast ? 'Finish tour' : 'Next step'}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition"
                                    style={{
                                        background: 'var(--color-nord8, #88C0D0)',
                                        color: 'var(--color-nord0, #2E3440)',
                                        boxShadow: '0 0 18px color-mix(in srgb, var(--color-nord8, #88C0D0) 55%, transparent)',
                                    }}
                                >
                                    {isLast ? 'finish' : 'next'}
                                    {!isLast && <ChevronRight size={14} />}
                                </button>
                            </div>
                        </div>

                        {/* Arrow — always rendered for non-center placements so the ref is
                            stable on the first compute pass. Hidden until tipPos resolves. */}
                        {currentStep.placement !== 'center' && (
                            <div
                                ref={arrowRef}
                                aria-hidden
                                className="absolute w-3 h-3 rotate-45"
                                style={{
                                    visibility: tipPos && state.resolvedTarget && !state.targetMissing ? 'visible' : 'hidden',
                                    left: tipPos?.arrowX,
                                    top: tipPos?.arrowY,
                                    ...(tipPos
                                        ? {
                                            [tipPos.placement === 'top'
                                                ? 'bottom'
                                                : tipPos.placement === 'bottom'
                                                    ? 'top'
                                                    : tipPos.placement === 'left'
                                                        ? 'right'
                                                        : 'left']: -6,
                                        }
                                        : {}),
                                    background:
                                        'linear-gradient(135deg, color-mix(in srgb, var(--color-nord0, #2E3440) 92%, transparent), color-mix(in srgb, var(--color-nord1, #3B4252) 92%, transparent))',
                                    borderLeft: tipPos?.placement === 'right' ? '1px solid color-mix(in srgb, var(--color-nord8, #88C0D0) 35%, transparent)' : 'none',
                                    borderTop: tipPos?.placement === 'bottom' ? '1px solid color-mix(in srgb, var(--color-nord8, #88C0D0) 35%, transparent)' : 'none',
                                    borderRight: tipPos?.placement === 'left' ? '1px solid color-mix(in srgb, var(--color-nord8, #88C0D0) 35%, transparent)' : 'none',
                                    borderBottom: tipPos?.placement === 'top' ? '1px solid color-mix(in srgb, var(--color-nord8, #88C0D0) 35%, transparent)' : 'none',
                                }}
                            />
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        portalEl,
    );
}
