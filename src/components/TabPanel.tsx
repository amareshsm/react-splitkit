import { CSSProperties, ReactNode } from 'react';
import { usePanel } from '../hooks/usePanel';
import { useTabRegistry } from '../hooks/useTabRegistry';
import { useLayoutContext } from '../state/context';
import { NodeId, TabDescriptor } from '../core/types';
import { TabRegistry, TabRenderContext } from '../core/registry';
import { tabElementId, tabPanelElementId } from './TabList';

export interface TabPanelProps {
  panelId: NodeId;
  /**
   * How to render inactive tabs:
   *  - 'mount-active' (default): only the active tab is mounted; switching unmounts the previous.
   *  - 'mount-all-hide-inactive': every tab is mounted; inactive ones get `hidden`. Use when
   *    tab content is expensive to recreate (e.g. an editor with unsaved state).
   */
  mode?: 'mount-active' | 'mount-all-hide-inactive';
  /**
   * Optional override of the registry's `render`. Receives the full descriptor
   * and a context object with the current panelId. If omitted, the registry
   * entry's `render` is called with the same arguments.
   */
  renderContent?: (
    descriptor: import('../core/types').TabDescriptor,
    ctx: import('../core/registry').TabRenderContext,
  ) => ReactNode;
  /** Fallback rendered when a descriptor's tabType isn't in the registry. */
  fallback?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const TabPanel = ({
  panelId,
  mode = 'mount-active',
  renderContent,
  fallback = null,
  className,
  style,
}: TabPanelProps) => {
  const { panel } = usePanel(panelId);
  const registry = useTabRegistry();
  const { idPrefix } = useLayoutContext();

  if (!panel || panel.tabs.length === 0) return null;

  const wrapperStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    overflow: 'auto',
    ...style,
  };

  const ctx = { panelId };

  if (mode === 'mount-active') {
    const active = panel.tabs.find((t) => t.id === panel.activeTabId) ?? panel.tabs[0]!;
    return (
      <div
        role="tabpanel"
        id={tabPanelElementId(panelId, active.id, idPrefix)}
        aria-labelledby={tabElementId(panelId, active.id, idPrefix)}
        data-panel-tabpanel
        className={className}
        style={wrapperStyle}
      >
        <TabContent
          descriptor={active}
          registry={registry}
          ctx={ctx}
          renderContent={renderContent}
          fallback={fallback}
        />
      </div>
    );
  }

  return (
    <>
      {panel.tabs.map((tab) => {
        const isActive = tab.id === panel.activeTabId;
        return (
          <div
            key={tab.id}
            role="tabpanel"
            id={tabPanelElementId(panelId, tab.id, idPrefix)}
            aria-labelledby={tabElementId(panelId, tab.id, idPrefix)}
            data-panel-tabpanel
            hidden={!isActive}
            className={className}
            style={{ ...wrapperStyle, display: isActive ? wrapperStyle.display ?? 'flex' : 'none' }}
          >
            <TabContent
              descriptor={tab}
              registry={registry}
              ctx={ctx}
              renderContent={renderContent}
              fallback={fallback}
            />
          </div>
        );
      })}
    </>
  );
};

/**
 * Wrapping the consumer's `render` call in a stable component scopes any
 * hooks they call inside `render` to *this* component's lifecycle. Without
 * this wrapper, hooks inside `render` would attach to TabPanel's hook list
 * — and switching the active tab (different render) would change TabPanel's
 * hook count, which React forbids.
 */
interface TabContentProps {
  descriptor: TabDescriptor;
  registry: TabRegistry;
  ctx: TabRenderContext;
  renderContent?: (descriptor: TabDescriptor, ctx: TabRenderContext) => ReactNode;
  fallback: ReactNode;
}

const TabContent = ({ descriptor, registry, ctx, renderContent, fallback }: TabContentProps) => {
  const entry = registry[descriptor.tabType];
  if (renderContent) return <>{renderContent(descriptor, ctx)}</>;
  return <>{entry?.render(descriptor, ctx) ?? fallback}</>;
};
