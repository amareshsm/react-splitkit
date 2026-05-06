import { CSSProperties, useCallback, useRef } from 'react';
import { useSplit } from '../hooks/useSplit';
import { usePanelMinMax } from '../hooks/usePanelMinMax';
import { useResize } from '../hooks/useResize';
import { NodeId } from '../core/types';

export interface ResizerProps {
  /** ID of the split node this resizer belongs to. */
  splitId: NodeId;
  /** Index of the resizer (0 = between child 0 and 1, 1 = between child 1 and 2, etc.). */
  index: number;
  /**
   * Optional className for styling.
   * Default styling includes invisible touch hit area and visual feedback.
   */
  className?: string;
  /**
   * Optional inline styles. Will be merged with defaults.
   * Good for tweaking colors, cursor, etc.
   */
  style?: CSSProperties;
  /**
   * Mobile touch hit area in pixels. Defaults to 24.
   * The visible resizer is typically 4px; the invisible touch target expands
   * around it for easy grabbing on touch devices.
   */
  touchHitAreaPx?: number;
}

/**
 * Interactive resizer between two split siblings. Handles:
 *  - Pointer events (mouse, touch, pen) with smooth resize
 *  - Keyboard: Alt+Arrow, or Enter to enter resize mode then arrows
 *  - Min/max constraints from panel + tab registry
 *  - Touch-friendly hit area for mobile
 *
 * Renders a separator div with ARIA attributes and visual feedback states.
 */
export const Resizer = ({
  splitId,
  index,
  className,
  style,
  touchHitAreaPx = 24,
}: ResizerProps) => {
  // All hooks must run unconditionally, in the same order, every render —
  // even when the resizer doesn't have a valid split to attach to. The early
  // return that decides whether to render lives below all hooks.
  const { split, setSizes } = useSplit(splitId);
  // `containerRef` must point to the *parent* split element — that's the
  // element whose clientWidth/Height represents 100% during a drag. The
  // resizer itself is only ~4px wide, so measuring against it would scale
  // every drag by ~25× and produce the jumpy/hacky feel. We capture the
  // parent via a callback ref on mount.
  const containerRef = useRef<HTMLElement | null>(null);
  const setResizerNode = useCallback((el: HTMLDivElement | null) => {
    containerRef.current = el?.parentElement ?? null;
  }, []);

  // Safe accessors — fall back to no-op values if the split has gone away.
  // `usePanelMinMax` already returns defaults for unknown ids.
  const child1Id = split?.children[index]?.id ?? '__splitkit-no-panel__';
  const child2Id = split?.children[index + 1]?.id ?? '__splitkit-no-panel__';
  const min1 = usePanelMinMax(child1Id);
  const min2 = usePanelMinMax(child2Id);

  const { onPointerDown, onKeyDown, isResizing, isResizeMode, exitResizeMode } = useResize({
    size1: split?.sizes[index] ?? 50,
    size2: split?.sizes[index + 1] ?? 50,
    direction: split?.direction ?? 'horizontal',
    minSize1: min1.minSize,
    maxSize1: min1.maxSize,
    minSize2: min2.minSize,
    maxSize2: min2.maxSize,
    containerRef,
    onResize: (newSize1, newSize2) => {
      if (!split) return;
      const newSizes = [...split.sizes];
      newSizes[index] = newSize1;
      newSizes[index + 1] = newSize2;
      setSizes(newSizes);
    },
  });

  // Now safe to bail out — every hook above ran unconditionally.
  if (!split || index < 0 || index >= split.children.length - 1) {
    return null;
  }

  const isHorizontal = split.direction === 'horizontal';
  const hitAreaOffset = (touchHitAreaPx - 4) / 2; // Assume visible is 4px, expand equally around.

  // Structural styles only — visual presentation (background, transition) is
  // left to consumer CSS. Import 'react-splitkit/styles.css' for defaults.
  const resizerStyle: CSSProperties = {
    flex: '0 0 4px',
    cursor: isHorizontal ? 'col-resize' : 'row-resize',
    userSelect: 'none',
    position: 'relative',
    ...style,
  };

  const hitAreaStyle: CSSProperties = {
    position: 'absolute',
    inset: isHorizontal ? `0 -${hitAreaOffset}px` : `-${hitAreaOffset}px 0`,
    cursor: 'inherit',
    zIndex: 10,
  };

  return (
    <div
      ref={setResizerNode}
      data-splitkit-resizer
      data-split-id={splitId}
      data-resizer-index={index}
      data-direction={split.direction}
      data-resizing={isResizing || undefined}
      data-resize-mode={isResizeMode || undefined}
      role="separator"
      aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
      aria-valuenow={Math.round(split.sizes[index]!)}
      aria-valuemin={Math.round(min1.minSize)}
      aria-valuemax={Math.round(min1.maxSize)}
      aria-label={`Resize ${split.direction === 'horizontal' ? 'columns' : 'rows'}`}
      tabIndex={0}
      className={className}
      style={resizerStyle}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      onBlur={() => exitResizeMode()}
    >
      {/* Invisible touch-friendly hit area. */}
      <div
        data-panel-resizer-hit-area
        style={hitAreaStyle}
        onPointerDown={(e) => {
          // Prevent bubbling to the container.
          e.stopPropagation();
          onPointerDown(e);
        }}
      />
    </div>
  );
};
