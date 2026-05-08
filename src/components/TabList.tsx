import {
  CSSProperties,
  Fragment,
  KeyboardEvent,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { usePanel } from '../hooks/usePanel';
import { useTabRegistry } from '../hooks/useTabRegistry';
import { useLayoutContext } from '../state/context';
import { TabDescriptor, NodeId, TabId } from '../core/types';

export interface RenderTabProps {
  tab: TabDescriptor;
  isActive: boolean;
  /** ARIA + interaction props the renderer should spread onto its tab element. */
  tabProps: {
    role: 'tab';
    id: string;
    tabIndex: 0 | -1;
    'aria-selected': boolean;
    'aria-controls': string;
    onClick: () => void;
    onKeyDown: (e: KeyboardEvent) => void;
  };
  /** Optional default label rendered by the registry's `renderLabel` (or descriptor.title). */
  label: ReactNode;
  /** Whether this tab can be closed (registry default OR descriptor override). */
  closable: boolean;
  /** Call to remove this tab. */
  close: () => void;
}

export interface TabListProps {
  panelId: NodeId;
  /** Render a single tab. Headless: the consumer supplies the markup. */
  renderTab: (props: RenderTabProps) => ReactNode;
  /** Optional trailing slot (e.g. the "+" add-tab menu trigger). */
  trailing?: ReactNode;
  /** Optional leading slot. */
  leading?: ReactNode;
  /** Accessible label for the tablist. Recommended when multiple panels exist on the same page. Defaults to "Tabs". */
  'aria-label'?: string;
  className?: string;
  style?: CSSProperties;
}

export const TabList = ({
  panelId,
  renderTab,
  leading,
  trailing,
  'aria-label': ariaLabel = 'Tabs',
  className,
  style,
}: TabListProps) => {
  const { panel, setActiveTab, removeTab } = usePanel(panelId);
  const registry = useTabRegistry();
  const { idPrefix } = useLayoutContext();

  const onTabKeyDown = useCallback(
    (e: KeyboardEvent, tabId: TabId) => {
      if (!panel) return;
      const tabs = panel.tabs;
      const idx = tabs.findIndex((t) => t.id === tabId);
      if (idx < 0) return;

      let nextIdx: number | null = null;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          nextIdx = (idx + 1) % tabs.length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          nextIdx = (idx - 1 + tabs.length) % tabs.length;
          break;
        case 'Home':
          nextIdx = 0;
          break;
        case 'End':
          nextIdx = tabs.length - 1;
          break;
        case 'Delete': {
          const target = tabs[idx];
          if (target && (target.closable ?? registry[target.tabType]?.closable ?? true)) {
            removeTab(tabId);
            e.preventDefault();
          }
          return;
        }
      }
      if (nextIdx !== null) {
        e.preventDefault();
        const next = tabs[nextIdx];
        if (next) setActiveTab(next.id);
      }
    },
    [panel, setActiveTab, removeTab, registry],
  );

  const items = useMemo(() => {
    if (!panel) return null;
    return panel.tabs.map((tab) => {
      const isActive = panel.activeTabId === tab.id;
      const entry = registry[tab.tabType];
      const closable = tab.closable ?? entry?.closable ?? true;
      const label: ReactNode = entry?.renderLabel?.(tab) ?? tab.title;
      return (
        <Fragment key={tab.id}>
          {renderTab({
            tab,
            isActive,
            tabProps: {
              role: 'tab',
              id: tabElementId(panelId, tab.id, idPrefix),
              tabIndex: isActive ? 0 : -1,
              'aria-selected': isActive,
              'aria-controls': tabPanelElementId(panelId, tab.id, idPrefix),
              onClick: () => setActiveTab(tab.id),
              onKeyDown: (e) => onTabKeyDown(e, tab.id),
            },
            label,
            closable,
            close: () => removeTab(tab.id),
          })}
        </Fragment>
      );
    });
  }, [panel, registry, renderTab, setActiveTab, removeTab, onTabKeyDown, panelId, idPrefix]);

  if (!panel) return null;

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      data-panel-tablist
      data-panel-id={panelId}
      className={className}
      style={style}
    >
      {leading != null && <div data-panel-tablist-leading>{leading}</div>}
      {/* Scrolling is scoped to this inner wrapper so dropdowns rendered in
          the leading/trailing slots aren't clipped by the tablist's overflow. */}
      <div data-panel-tablist-items>{items}</div>
      {trailing != null && <div data-panel-tablist-trailing>{trailing}</div>}
    </div>
  );
};

// ID helpers — exported so TabPanel can reference them.
// The optional `prefix` makes ids unique across multiple LayoutProviders on
// the same page. Inside the library, TabList and TabPanel read a prefix from
// LayoutContext (sourced from React's useId()). External callers can pass
// the same prefix to look up DOM elements; omitting it falls back to "sk"
// for backward compatibility with single-provider apps.
export const tabElementId = (panelId: NodeId, tabId: TabId, prefix = 'sk'): string =>
  `${prefix}-tab-${panelId}-${tabId}`;
export const tabPanelElementId = (panelId: NodeId, tabId: TabId, prefix = 'sk'): string =>
  `${prefix}-tabpanel-${panelId}-${tabId}`;
