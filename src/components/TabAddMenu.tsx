import { ReactNode, useMemo } from 'react';
import { usePanel } from '../hooks/usePanel';
import { useTabRegistry } from '../hooks/useTabRegistry';
import { TabRegistryEntry } from '../core/registry';
import { NodeId, TabDescriptor } from '../core/types';
import { createId } from '../utils/ids';

export interface AddMenuItem {
  entry: TabRegistryEntry;
  /** Whether this item is already present in the panel — consumers can grey it out. */
  alreadyAdded: boolean;
  /** Click handler; adds the tab to the panel and activates it. */
  add: () => void;
}

export interface TabAddMenuProps {
  panelId: NodeId;
  /** Render the menu UI given the available items. Headless: no default chrome. */
  render: (items: AddMenuItem[]) => ReactNode;
  /**
   * Filter which registry entries appear. Defaults to entries with
   * `availableInAddMenu !== false`.
   */
  filter?: (entry: TabRegistryEntry) => boolean;
}

/**
 * Renders the "+" menu (e.g. image 2 in your reference). It's headless: this
 * component does no UI, it just hands a list of items to your `render` prop.
 * Compose with a popover/dropdown of your choice.
 */
export const TabAddMenu = ({ panelId, render, filter }: TabAddMenuProps) => {
  const { panel, addTab } = usePanel(panelId);
  const registry = useTabRegistry();

  const items = useMemo<AddMenuItem[]>(() => {
    if (!panel) return [];
    const existingTypes = new Set(panel.tabs.map((t) => t.tabType));
    return Object.values(registry)
      .filter((entry) => entry.availableInAddMenu !== false)
      .filter((entry) => (filter ? filter(entry) : true))
      .map((entry) => ({
        entry,
        alreadyAdded: existingTypes.has(entry.tabType),
        add: () => {
          const descriptor: TabDescriptor = entry.createDescriptor
            ? entry.createDescriptor()
            : { id: createId('tab'), tabType: entry.tabType, title: entry.title };
          addTab(descriptor, { activate: true });
        },
      }));
  }, [panel, registry, filter, addTab]);

  return <AddMenuRender render={render} items={items} />;
};

/**
 * Stable wrapper so hooks the consumer calls inside `render` are scoped to
 * this component's lifecycle, not TabAddMenu's. Mirrors the pattern used by
 * TabPanel's TabContent and LayoutRoot's MaximizedOverlay.
 */
const AddMenuRender = ({
  render,
  items,
}: {
  render: TabAddMenuProps['render'];
  items: AddMenuItem[];
}) => <>{render(items)}</>;
