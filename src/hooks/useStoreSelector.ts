import { useSyncExternalStore, useRef, useCallback } from 'react';
import { useLayoutContext } from '../state/context';
import { LayoutState } from '../state/store';

/**
 * Subscribes to the nearest LayoutProvider's store with a selector. Re-renders
 * only when the selected slice changes.
 *
 * Built on `useSyncExternalStore` directly rather than `zustand/react` because
 * the latter's `create` binds to a module-level store; we want one store per
 * `<LayoutProvider>` so multiple roots can co-exist on a page.
 */
export const useLayoutStoreSelector = <T,>(
  selector: (state: LayoutState) => T,
  isEqual: (a: T, b: T) => boolean = Object.is,
): T => {
  const { store } = useLayoutContext();
  const cacheRef = useRef<{ has: boolean; value: T }>({ has: false, value: undefined as T });

  const getSnapshot = useCallback((): T => {
    const next = selector(store.getState());
    const cache = cacheRef.current;
    if (cache.has && isEqual(cache.value, next)) return cache.value;
    cacheRef.current = { has: true, value: next };
    return next;
  }, [store, selector, isEqual]);

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
};
