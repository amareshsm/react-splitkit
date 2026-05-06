import { useCallback } from 'react';
import { useLayoutContext } from '../state/context';
import { useLayoutStoreSelector } from './useStoreSelector';
import { LayoutAction } from '../state/actions';
import { LayoutNode } from '../core/types';

/**
 * Returns the full layout tree and the dispatch function. Use this for tree-wide
 * concerns; for individual panels prefer `usePanel(panelId)` to avoid re-renders
 * on unrelated changes.
 */
export const useLayout = (): { layout: LayoutNode; dispatch: (action: LayoutAction) => void } => {
  const layout = useLayoutStoreSelector((s) => s.layout);
  const { store } = useLayoutContext();
  const dispatch = useCallback(
    (action: LayoutAction) => store.getState().dispatch(action),
    [store],
  );
  return { layout, dispatch };
};
