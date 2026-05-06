import { useMemo } from 'react';
import { usePanel } from './usePanel';
import { useTabRegistry } from './useTabRegistry';
import { NodeId } from '../core/types';

export interface PanelMinMax {
  /** Effective minimum size for the panel (%). */
  minSize: number;
  /** Effective maximum size for the panel (%). */
  maxSize: number;
}

/**
 * Computes the effective min/max size constraints for a panel by considering:
 *  - Panel-level overrides (TabDescriptor.minSize / maxSize)
 *  - Tab-type registry entries (TabRegistryEntry.minSize / maxSize)
 *
 * Logic:
 *  - minSize = max(panel's configured min, largest tab's min)
 *  - maxSize = min(panel's configured max, smallest tab's max)
 *
 * Defaults: minSize = 0, maxSize = 100.
 */
export const usePanelMinMax = (panelId: NodeId): PanelMinMax => {
  const { panel } = usePanel(panelId);
  const registry = useTabRegistry();

  return useMemo(() => {
    if (!panel || panel.tabs.length === 0) {
      return { minSize: 0, maxSize: 100 };
    }

    // Start with panel-level constraints or defaults.
    let minSize = panel.minSize ?? 0;
    let maxSize = panel.maxSize ?? 100;

    // Merge with all tabs' constraints.
    for (const tab of panel.tabs) {
      const entry = registry[tab.tabType];

      // Min: take the max of tab descriptor min and registry min.
      const registryMin = entry?.minSize ?? 0;
      const tabMin = tab.minSize ?? 0;
      const effectiveMin = Math.max(registryMin, tabMin);

      // Max: take the min of tab descriptor max and registry max.
      const registryMax = entry?.maxSize ?? 100;
      const tabMax = tab.maxSize ?? 100;
      const effectiveMax = Math.min(registryMax, tabMax);

      // minSize = strictest lower bound (take the max of all tabs' minimums).
      minSize = Math.max(minSize, effectiveMin);

      // maxSize = most restrictive upper bound (take the min of all tabs' maximums).
      maxSize = Math.min(maxSize, effectiveMax);
    }

    // Sanity: if min > max, clamp max up to min.
    if (minSize > maxSize) {
      maxSize = minSize;
    }

    return { minSize, maxSize };
  }, [panel, registry]);
};
