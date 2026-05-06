import { createContext, useContext, useEffect, useId, useRef, ReactNode } from 'react';
import { createLayoutStore, LayoutStore } from './store';
import { LayoutNode } from '../core/types';
import { LayoutAction } from './actions';
import { TabRegistry } from '../core/registry';
import { IdGenerator } from '../utils/ids';

interface LayoutContextValue {
  store: LayoutStore;
  registry: TabRegistry;
  /**
   * Stable per-provider DOM id prefix. Used by TabList/TabPanel so multiple
   * LayoutProviders on the same page don't produce duplicate `id` attributes
   * (which would silently break aria-controls / aria-labelledby linkage).
   */
  idPrefix: string;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export interface LayoutProviderProps {
  initialLayout: LayoutNode;
  registry: TabRegistry;
  /** Called after every successful action with the new layout. Use this to persist. */
  onChange?: (layout: LayoutNode, action: LayoutAction) => void;
  /** Custom id generator — useful for SSR or cross-instance uniqueness. */
  generateId?: IdGenerator;
  children: ReactNode;
}

/**
 * Provides a scoped Zustand store + tab registry to all descendants.
 * Multiple `<LayoutProvider>`s can co-exist on a page; each has its own store.
 */
export const LayoutProvider = ({
  initialLayout,
  registry,
  onChange,
  generateId,
  children,
}: LayoutProviderProps) => {
  // Hold the latest onChange in a ref. The store reads it via getOnChange()
  // each dispatch so consumers can swap closures between renders without
  // rebuilding the store.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Stable store across renders. We deliberately ignore `initialLayout` changes
  // after mount — consumers wanting external control should dispatch
  // REPLACE_LAYOUT or remount with a new `key` prop.
  const storeRef = useRef<LayoutStore | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createLayoutStore({
      initialLayout,
      generateId,
      getOnChange: () => onChangeRef.current,
    });
  }

  // React's useId returns characters like ":r0:" which are valid in HTML
  // id attributes. Sanitize for safety in attribute selectors / class names.
  const rawId = useId();
  const idPrefix = `sk${rawId.replace(/[^a-zA-Z0-9-_]/g, '')}`;

  return (
    <LayoutContext.Provider value={{ store: storeRef.current, registry, idPrefix }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayoutContext = (): LayoutContextValue => {
  const ctx = useContext(LayoutContext);
  if (!ctx) {
    throw new Error('useLayoutContext must be used inside <LayoutProvider>');
  }
  return ctx;
};
