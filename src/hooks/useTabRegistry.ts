import { useLayoutContext } from '../state/context';
import { TabRegistry, TabRegistryEntry } from '../core/registry';

export const useTabRegistry = (): TabRegistry => useLayoutContext().registry;

export const useTabRegistryEntry = (tabType: string): TabRegistryEntry | undefined =>
  useLayoutContext().registry[tabType];
