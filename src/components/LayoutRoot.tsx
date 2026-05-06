import { CSSProperties, Fragment, ReactNode, useEffect, useMemo, useRef } from 'react';
import { useLayout } from '../hooks/useLayout';
import { LayoutNode, PanelNode, SplitNode, isPanel } from '../core/types';
import { Resizer } from './Resizer';

export interface RenderPanelProps {
  panel: PanelNode;
  /** Inline styles the renderer should spread onto the panel root for sizing/collapse to work. */
  style: CSSProperties;
}

export interface RenderResizerProps {
  splitId: string;
  /** Index of the resizer between children (0 = between child 0 and child 1). */
  index: number;
  direction: 'horizontal' | 'vertical';
}

export interface LayoutRootProps {
  /** Required: render the chrome around a panel (tablist, content area, etc.). */
  renderPanel: (props: RenderPanelProps) => ReactNode;
  /**
   * Optional resizer renderer. Phase 3 will ship a built-in pointer-aware one.
   * For Phase 2 we render a non-interactive separator if this is omitted.
   */
  renderResizer?: (props: RenderResizerProps) => ReactNode;
  /** Class applied to the root container. */
  className?: string;
  /** Inline style merged into the root container. */
  style?: CSSProperties;
  /**
   * How to render a maximized panel:
   *  - 'overlay' (default): the maximized panel covers the LayoutRoot bounds,
   *    other panels are unmounted from view (kept in state).
   *  - 'inline': maximize is ignored at this layer; consumer handles it.
   */
  maximizeMode?: 'overlay' | 'inline';
}

const COLLAPSED_PX = 36;

export const LayoutRoot = ({
  renderPanel,
  renderResizer,
  className,
  style,
  maximizeMode = 'overlay',
}: LayoutRootProps) => {
  const { layout } = useLayout();

  const maximizedPanel = useMemo(
    () => (maximizeMode === 'overlay' ? findMaximized(layout) : null),
    [layout, maximizeMode],
  );

  // Toggle the `inert` attribute on the underlying tree when an overlay is
  // showing. We use a ref+effect because `inert` isn't in stable React JSX
  // types yet (it is in experimental). Browser support: Chrome 102+, FF 112+,
  // Safari 15.5+ — universal in modern environments.
  const treeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = treeRef.current;
    if (!el) return;
    if (maximizedPanel) el.setAttribute('inert', '');
    else el.removeAttribute('inert');
  }, [maximizedPanel]);

  return (
    <div
      data-splitkit-root
      className={className}
      style={{
        position: 'relative',
        display: 'flex',
        width: '100%',
        height: '100%',
        ...style,
      }}
    >
      {/* Underlying tree. When a panel is maximized, this is visually covered
          by the overlay below and made non-interactive via `inert` (set in an
          effect) plus `aria-hidden` for screen readers. We keep it mounted so
          un-maximizing restores any local component state (scroll, caret,
          etc.) rather than remounting the whole tree. */}
      <div
        ref={treeRef}
        data-splitkit-tree
        aria-hidden={maximizedPanel ? true : undefined}
        style={{ display: 'flex', flex: 1, minWidth: 0, minHeight: 0 }}
      >
        <LayoutTree node={layout} renderPanel={renderPanel} renderResizer={renderResizer} />
      </div>
      {maximizedPanel && (
        <MaximizedOverlay panel={maximizedPanel} renderPanel={renderPanel} />
      )}
    </div>
  );
};

/**
 * Renders the overlay shown when a panel is maximized. Wrapping the
 * `renderPanel` call in its own component is load-bearing: `renderPanel` is
 * commonly a function with its own hooks (e.g. `usePanel`), and calling it
 * directly inside `LayoutRoot` would attach those hooks to LayoutRoot's hook
 * list — so toggling maximize would change LayoutRoot's hook count and React
 * would throw "Rendered more hooks than during the previous render."
 */
interface MaximizedOverlayProps {
  panel: PanelNode;
  renderPanel: (props: RenderPanelProps) => ReactNode;
}

const MaximizedOverlay = ({ panel, renderPanel }: MaximizedOverlayProps) => (
  <div
    data-splitkit-maximized-overlay
    role="dialog"
    aria-modal="true"
    aria-label="Maximized panel"
    style={{ position: 'absolute', inset: 0, display: 'flex', background: 'inherit' }}
  >
    {renderPanel({ panel, style: { flex: 1, minWidth: 0, minHeight: 0 } })}
  </div>
);

interface LayoutTreeProps {
  node: LayoutNode;
  renderPanel: (props: RenderPanelProps) => ReactNode;
  renderResizer?: (props: RenderResizerProps) => ReactNode;
}

const LayoutTree = ({ node, renderPanel, renderResizer }: LayoutTreeProps) => {
  if (isPanel(node)) {
    return (
      <>
        {renderPanel({
          panel: node,
          style: panelStyle(node),
        })}
      </>
    );
  }
  return <SplitContainer split={node} renderPanel={renderPanel} renderResizer={renderResizer} />;
};

interface SplitContainerProps {
  split: SplitNode;
  renderPanel: (props: RenderPanelProps) => ReactNode;
  renderResizer?: (props: RenderResizerProps) => ReactNode;
}

const SplitContainer = ({ split, renderPanel, renderResizer }: SplitContainerProps) => {
  const flexDirection = split.direction === 'horizontal' ? 'row' : 'column';
  const sizes = effectiveSizes(split);

  return (
    <div
      data-splitkit-split
      data-split-id={split.id}
      data-direction={split.direction}
      style={{
        display: 'flex',
        flexDirection,
        flex: 1,
        minWidth: 0,
        minHeight: 0,
      }}
    >
      {split.children.map((child, i) => {
        const size = sizes[i] ?? 100 / split.children.length;
        const collapsed = isPanel(child) && child.collapsed;
        const flexBasis = collapsed ? `${COLLAPSED_PX}px` : `${size}%`;
        const flexGrow = collapsed ? 0 : size;
        const flexShrink = collapsed ? 0 : 1;

        // Skip the resizer between this child and the next when either side
        // is collapsed: the collapsed panel is pinned to a fixed pixel width,
        // so dragging the divider would mutate sizes that the layout ignores.
        const next = split.children[i + 1];
        const nextCollapsed = !!next && isPanel(next) && next.collapsed;
        const showResizer =
          i < split.children.length - 1 && !collapsed && !nextCollapsed;

        return (
          <Fragment key={child.id}>
            <div
              data-splitkit-cell
              data-collapsed={collapsed || undefined}
              data-direction={split.direction}
              style={{
                flexBasis,
                flexGrow,
                flexShrink,
                display: 'flex',
                minWidth: 0,
                minHeight: 0,
                overflow: 'hidden',
              }}
            >
              <LayoutTree node={child} renderPanel={renderPanel} renderResizer={renderResizer} />
            </div>
            {showResizer &&
              (renderResizer ? (
                renderResizer({ splitId: split.id, index: i, direction: split.direction })
              ) : (
                <Resizer splitId={split.id} index={i} />
              ))}
          </Fragment>
        );
      })}
    </div>
  );
};

const panelStyle = (panel: PanelNode): CSSProperties => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  minHeight: 0,
  ...(panel.collapsed && { overflow: 'hidden' }),
});

const effectiveSizes = (split: SplitNode): number[] => {
  // If any child is collapsed, that child's slot is fixed-width (handled in
  // the cell style); the others share the remaining space proportionally to
  // their declared sizes.
  return split.sizes;
};

const findMaximized = (node: LayoutNode): PanelNode | null => {
  if (isPanel(node)) return node.maximized ? node : null;
  for (const child of node.children) {
    const found = findMaximized(child);
    if (found) return found;
  }
  return null;
};
