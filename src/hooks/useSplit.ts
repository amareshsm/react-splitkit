import { useCallback } from 'react';
import { useLayoutContext } from '../state/context';
import { useLayoutStoreSelector } from './useStoreSelector';
import { findNode } from '../core/tree';
import { isSplit } from '../core/types';
import { NodeId, SplitNode } from '../core/types';

export interface UseSplitResult {
  split: SplitNode | null;
  setSizes: (sizes: number[]) => void;
}

export const useSplit = (splitId: NodeId): UseSplitResult => {
  const { store } = useLayoutContext();

  const split = useLayoutStoreSelector((s) => {
    const found = findNode(s.layout, splitId);
    return found && isSplit(found.node) ? found.node : null;
  });

  const setSizes = useCallback(
    (sizes: number[]) => store.getState().dispatch({ type: 'RESIZE_SPLIT', splitId, sizes }),
    [store, splitId],
  );

  return { split, setSizes };
};
