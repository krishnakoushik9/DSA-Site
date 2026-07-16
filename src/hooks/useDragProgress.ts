'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Spring physics configuration for the drag interaction.
 */
interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
}

/**
 * State exposed by the useDragProgress hook.
 */
export interface DragProgressState {
  /** Normalized progress 0 → 1 */
  progress: number;
  /** Whether the user is currently touching the orb */
  isDragging: boolean;
  /** True once progress has settled at 1.0 (login state) */
  isComplete: boolean;
  /** Current pixel-X of the orb center */
  orbPixelX: number;
  /** Current pixel-Y of the orb center (for positioning overlays) */
  orbPixelY: number;
}

const DEFAULT_SPRING: SpringConfig = {
  stiffness: 180,
  damping: 14,
  mass: 1,
};

/** Snap to complete if released above this threshold */
const SNAP_THRESHOLD = 0.45;

/** Maximum travel distance in viewport-height fraction */
const MAX_TRAVEL_VH = 0.55;

/**
 * Custom hook providing spring-physics-based vertical drag progress.
 *
 * Returns:
 *  - `progress`: 0–1 normalized value driving all animations
 *  - `isDragging`: whether touch is active
 *  - `isComplete`: true when settled at 1.0
 *  - `orbPixelX`: current X position in px
 *  - `orbPixelY`: current Y position in px
 *  - `ref`: callback ref to attach to the draggable element
 *  - `reset`: function to reset back to initial state
 */
export function useDragProgress(config?: Partial<SpringConfig>) {
  const spring = { ...DEFAULT_SPRING, ...config };

  const [state, setState] = useState<DragProgressState>({
    progress: 0,
    isDragging: false,
    isComplete: false,
    orbPixelX: 0,
    orbPixelY: 0,
  });

  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const ref = useCallback((node: HTMLDivElement | null) => {
    setElement(node);
  }, []);

  // Home and Top positions (initialized on mount/resize)
  const homeXRef = useRef(0);
  const homeYRef = useRef(0);
  const topYRef = useRef(0);

  // Current spring-interpolated positions
  const xRef = useRef(0);
  const yRef = useRef(0);

  // Targets for spring interpolation
  const targetXRef = useRef(0);
  const targetYRef = useRef(0);

  const velocityXRef = useRef(0);
  const velocityYRef = useRef(0);

  const isDraggingRef = useRef(false);
  const isCompleteRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);

  // Offset between touch point and orb center to prevent jumping
  const touchOffsetRef = useRef({ x: 0, y: 0 });
  const touchHistoryRef = useRef<{ y: number; t: number }[]>([]);

  const updateDimensions = useCallback(() => {
    if (typeof window === 'undefined') return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    homeXRef.current = w * 0.5;
    homeYRef.current = h * 0.82;
    topYRef.current = h * 0.25;

    // Initialize position if not dragging or complete
    if (!isDraggingRef.current) {
      if (isCompleteRef.current) {
        xRef.current = homeXRef.current;
        yRef.current = topYRef.current;
        targetXRef.current = homeXRef.current;
        targetYRef.current = topYRef.current;
      } else {
        xRef.current = homeXRef.current;
        yRef.current = homeYRef.current;
        targetXRef.current = homeXRef.current;
        targetYRef.current = homeYRef.current;
      }
    }
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  // Initial position sync on mount
  useEffect(() => {
    setState({
      progress: isCompleteRef.current ? 1 : 0,
      isDragging: false,
      isComplete: isCompleteRef.current,
      orbPixelX: xRef.current || (typeof window !== 'undefined' ? window.innerWidth * 0.5 : 200),
      orbPixelY: yRef.current || (typeof window !== 'undefined' ? window.innerHeight * 0.82 : 600),
    });
  }, [updateDimensions]);

  /**
   * Spring simulation loop.
   */
  const simulate = useCallback(() => {
    const now = performance.now();
    const dt = Math.min((now - lastTimeRef.current) / 1000, 0.064);
    lastTimeRef.current = now;

    if (!isDraggingRef.current) {
      // Spring simulation for X
      const displacementX = xRef.current - targetXRef.current;
      const springForceX = -spring.stiffness * displacementX;
      const dampingForceX = -spring.damping * velocityXRef.current;
      const accelerationX = (springForceX + dampingForceX) / spring.mass;
      velocityXRef.current += accelerationX * dt;
      xRef.current += velocityXRef.current * dt;

      // Spring simulation for Y
      const displacementY = yRef.current - targetYRef.current;
      const springForceY = -spring.stiffness * displacementY;
      const dampingForceY = -spring.damping * velocityYRef.current;
      const accelerationY = (springForceY + dampingForceY) / spring.mass;
      velocityYRef.current += accelerationY * dt;
      yRef.current += velocityYRef.current * dt;

      // Check if settled
      const settled =
        Math.abs(xRef.current - targetXRef.current) < 0.2 &&
        Math.abs(yRef.current - targetYRef.current) < 0.2 &&
        Math.abs(velocityXRef.current) < 0.1 &&
        Math.abs(velocityYRef.current) < 0.1;

      if (settled) {
        xRef.current = targetXRef.current;
        yRef.current = targetYRef.current;
        velocityXRef.current = 0;
        velocityYRef.current = 0;

        const complete = targetYRef.current === topYRef.current;
        isCompleteRef.current = complete;

        const currentProgress = complete ? 1 : 0;
        setState({
          progress: currentProgress,
          isDragging: false,
          isComplete: complete,
          orbPixelX: xRef.current,
          orbPixelY: yRef.current,
        });
        return;
      }
    }

    // Calculate vertical progress (0 at homeY, 1 at topY)
    const range = homeYRef.current - topYRef.current;
    const progress = range > 0 
      ? Math.max(0, Math.min(1, (homeYRef.current - yRef.current) / range))
      : 0;

    setState({
      progress,
      isDragging: isDraggingRef.current,
      isComplete: isCompleteRef.current,
      orbPixelX: xRef.current,
      orbPixelY: yRef.current,
    });

    rafRef.current = requestAnimationFrame(simulate);
  }, [spring.stiffness, spring.damping, spring.mass]);

  const startSimulation = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(simulate);
  }, [simulate]);

  useEffect(() => {
    if (!element) return;

    const onDragStart = (clientX: number, clientY: number) => {
      isDraggingRef.current = true;
      
      // Calculate offset from touch/mouse down coordinates to orb center coordinates
      touchOffsetRef.current = {
        x: clientX - xRef.current,
        y: clientY - yRef.current,
      };

      touchHistoryRef.current = [{ y: clientY, t: performance.now() }];
      velocityXRef.current = 0;
      velocityYRef.current = 0;

      setState((s) => ({ ...s, isDragging: true }));
      startSimulation();
    };

    const onDragMove = (clientX: number, clientY: number) => {
      if (!isDraggingRef.current) return;
      
      // Move 1:1 with client position minus initial drag offset
      xRef.current = clientX - touchOffsetRef.current.x;
      yRef.current = clientY - touchOffsetRef.current.y;

      const now = performance.now();
      touchHistoryRef.current.push({ y: clientY, t: now });
      if (touchHistoryRef.current.length > 5) {
        touchHistoryRef.current.shift();
      }
    };

    const onDragEnd = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      // Determine drag velocity
      const history = touchHistoryRef.current;
      let releaseVelocityY = 0;
      if (history.length >= 2) {
        const last = history[history.length - 1];
        const prev = history[Math.max(0, history.length - 3)];
        const dt = (last.t - prev.t) / 1000;
        if (dt > 0.001) {
          const dy = prev.y - last.y; // Positive is upward
          releaseVelocityY = dy / dt;
        }
      }

      velocityYRef.current = -releaseVelocityY * 0.2; // Map drag velocity to spring velocity

      const range = homeYRef.current - topYRef.current;
      const currentProgress = range > 0 
        ? (homeYRef.current - yRef.current) / range 
        : 0;
      
      // Projected vertical progress based on release velocity
      const projectedProgress = currentProgress + (releaseVelocityY / range) * 0.08;

      if (projectedProgress > SNAP_THRESHOLD) {
        targetXRef.current = homeXRef.current;
        targetYRef.current = topYRef.current;
      } else {
        targetXRef.current = homeXRef.current;
        targetYRef.current = homeYRef.current;
      }

      setState((s) => ({ ...s, isDragging: false }));
      startSimulation();
    };

    // Touch handlers
    const handleTouchStart = (e: TouchEvent) => {
      onDragStart(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingRef.current) {
        e.preventDefault();
        onDragMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchEnd = () => {
      onDragEnd();
    };

    // Mouse handlers
    const handleMouseDown = (e: MouseEvent) => {
      onDragStart(e.clientX, e.clientY);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
      onDragMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      onDragEnd();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    element.addEventListener('mousedown', handleMouseDown);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [element, startSimulation]);

  /**
   * Reset back to initial state.
   */
  const reset = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    
    velocityXRef.current = 0;
    velocityYRef.current = 0;
    targetXRef.current = homeXRef.current;
    targetYRef.current = homeYRef.current;
    
    xRef.current = homeXRef.current;
    yRef.current = homeYRef.current;
    
    isDraggingRef.current = false;
    isCompleteRef.current = false;

    setState({
      progress: 0,
      isDragging: false,
      isComplete: false,
      orbPixelX: homeXRef.current,
      orbPixelY: homeYRef.current,
    });
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { ...state, ref, reset };
}


