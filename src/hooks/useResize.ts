import React, { useCallback, useEffect, useRef, useState, RefObject } from 'react';

export interface UseResizeOptions {
  /** Current size of the first sibling as a percentage (0-100). */
  size1: number;
  /** Size of the second sibling. */
  size2: number;
  /** 'horizontal' (left-right) or 'vertical' (up-down). */
  direction: 'horizontal' | 'vertical';
  /** Min size for sibling 1 as a percentage. */
  minSize1?: number;
  /** Max size for sibling 1. */
  maxSize1?: number;
  /** Min size for sibling 2. */
  minSize2?: number;
  /** Max size for sibling 2. */
  maxSize2?: number;
  /** Ref to the container element (parent of the resizer). Measured on demand. */
  containerRef?: RefObject<HTMLElement>;
  /** Called with new sizes (both as percentages) when resizing. */
  onResize: (newSize1: number, newSize2: number) => void;
}

export interface UseResizeResult {
  /** Bind to onPointerDown on the resizer element. */
  onPointerDown: (e: React.PointerEvent) => void;
  /** Bind to onKeyDown on the resizer element. */
  onKeyDown: (e: React.KeyboardEvent) => void;
  /** Whether the user is currently resizing. */
  isResizing: boolean;
  /** Whether the user is in resize mode (after pressing Enter). */
  isResizeMode: boolean;
  /** Call to exit resize mode. */
  exitResizeMode: () => void;
}

/**
 * Handles pointer-based resizing of two adjacent split siblings. Supports
 * mouse, touch, and pen. Includes keyboard navigation and min/max constraints.
 */
export const useResize = ({
  size1,
  size2,
  direction,
  minSize1 = 0,
  maxSize1 = 100,
  minSize2 = 0,
  maxSize2 = 100,
  containerRef,
  onResize,
}: UseResizeOptions): UseResizeResult => {
  const [isResizing, setIsResizing] = useState(false);
  const [isResizeMode, setIsResizeMode] = useState(false);

  const stateRef = useRef({
    startPointer: 0,
    startSize1: 0,
    startSize2: 0,
  });

  const getContainerSize = useCallback((): number => {
    if (!containerRef?.current) return 0;
    return direction === 'horizontal'
      ? containerRef.current.clientWidth
      : containerRef.current.clientHeight;
  }, [containerRef, direction]);

  /**
   * Compute new sizes given a pixel delta and the *start* sizes of both
   * siblings. Sizes are passed explicitly (not read from a shared ref) so
   * both pointer and keyboard paths can call this correctly.
   *
   * The math: clamp the delta itself so neither side leaves [min, max].
   * Then `start1 + d` and `start2 - d` automatically sum to `start1 + start2`
   * (which is 100). No post-hoc renormalize needed, and constraints are never
   * violated.
   */
  const computeNewSizes = useCallback(
    (delta: number, start1: number, start2: number): [number, number] | null => {
      const containerSize = getContainerSize();
      if (containerSize === 0) return null;

      const deltaPercent = (delta / containerSize) * 100;
      // Lower bound: don't push start1 below min1, don't push start2 above max2.
      const minDelta = Math.max(minSize1 - start1, start2 - maxSize2);
      // Upper bound: don't push start1 above max1, don't push start2 below min2.
      const maxDelta = Math.min(maxSize1 - start1, start2 - minSize2);
      // If the constraints are jointly infeasible (e.g. min1+min2 > 100),
      // prefer the lower bound. Callers are expected to keep min1+min2 ≤ 100.
      const d = Math.max(minDelta, Math.min(maxDelta, deltaPercent));
      return [start1 + d, start2 - d];
    },
    [getContainerSize, minSize1, maxSize1, minSize2, maxSize2],
  );

  // Tracks the listeners attached for the current drag so we can tear them
  // down from anywhere — pointerup, pointercancel, escape, or unmount.
  const dragCleanupRef = useRef<(() => void) | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<Element>) => {
      const containerSize = getContainerSize();
      if (containerSize === 0) return;

      // Tear down any prior drag in case a previous pointerup never fired
      // (e.g. element re-mounted mid-drag, or a stray captured pointer).
      dragCleanupRef.current?.();

      // Capture stable references — `e.currentTarget` is a React synthetic
      // property that can be nulled out after the dispatch returns. Reading
      // it inside an async pointerup handler would throw, leaving the move
      // listener permanently attached and resizing the panel after release.
      const captureTarget = e.currentTarget as HTMLElement | null;
      const pointerId: number = e.pointerId;

      stateRef.current = {
        startPointer: direction === 'horizontal' ? e.clientX : e.clientY,
        startSize1: size1,
        startSize2: size2,
      };

      setIsResizing(true);
      try {
        captureTarget?.setPointerCapture(pointerId);
      } catch {
        // setPointerCapture can throw e.g. if the pointer isn't active.
        // We don't depend on capture for correctness — the document
        // listeners below handle move/up regardless.
      }

      const handlePointerMove = (moveEvent: PointerEvent) => {
        // Ignore unrelated pointers (multi-touch, secondary mice).
        if (moveEvent.pointerId !== pointerId) return;
        const { startPointer, startSize1, startSize2 } = stateRef.current;
        const delta =
          direction === 'horizontal'
            ? moveEvent.clientX - startPointer
            : moveEvent.clientY - startPointer;

        const result = computeNewSizes(delta, startSize1, startSize2);
        if (result) {
          onResize(result[0], result[1]);
        }
      };

      const cleanup = () => {
        try {
          captureTarget?.releasePointerCapture(pointerId);
        } catch {
          // Capture may already be released — safe to ignore.
        }
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
        document.removeEventListener('pointercancel', handlePointerUp);
        dragCleanupRef.current = null;
        setIsResizing(false);
      };

      const handlePointerUp = (upEvent: PointerEvent) => {
        if (upEvent.pointerId !== pointerId) return;
        cleanup();
      };

      dragCleanupRef.current = cleanup;
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
      document.addEventListener('pointercancel', handlePointerUp);
    },
    [direction, size1, size2, computeNewSizes, getContainerSize, onResize],
  );

  // If the consumer unmounts mid-drag, make sure we don't leave document-level
  // listeners attached forever.
  useEffect(
    () => () => {
      dragCleanupRef.current?.();
    },
    [],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<Element>) => {
      const step = e.shiftKey ? 10 : 5; // 5% or 10% per step.
      const containerSize = getContainerSize();

      // Compute a signed step % for the relevant arrow, or 0 if the arrow
      // doesn't apply to this split's direction.
      const stepFor = (key: string): number => {
        if (direction === 'horizontal' && key === 'ArrowRight') return step;
        if (direction === 'horizontal' && key === 'ArrowLeft') return -step;
        if (direction === 'vertical' && key === 'ArrowDown') return step;
        if (direction === 'vertical' && key === 'ArrowUp') return -step;
        return 0;
      };

      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          setIsResizeMode((m) => !m);
          break;
        case 'ArrowRight':
        case 'ArrowLeft':
        case 'ArrowDown':
        case 'ArrowUp': {
          if (!(isResizeMode || e.altKey)) break;
          const deltaPercent = stepFor(e.key);
          if (deltaPercent === 0) break;
          e.preventDefault();
          // Pass current size1/size2 explicitly — keyboard paths must not
          // depend on stateRef (which is only seeded by pointerdown).
          const result = computeNewSizes((deltaPercent / 100) * containerSize, size1, size2);
          if (result) onResize(result[0], result[1]);
          break;
        }
        case 'Escape':
          if (isResizeMode) {
            e.preventDefault();
            setIsResizeMode(false);
          }
          break;
      }
    },
    [direction, isResizeMode, computeNewSizes, getContainerSize, onResize, size1, size2],
  );

  return {
    onPointerDown,
    onKeyDown,
    isResizing,
    isResizeMode,
    exitResizeMode: () => setIsResizeMode(false),
  };
};
