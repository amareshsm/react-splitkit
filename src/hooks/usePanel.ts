import { useCallback, useMemo } from 'react';
import { useLayoutContext } from '../state/context';
import { useLayoutStoreSelector } from './useStoreSelector';
import { findPanel } from '../core/tree';
import { NodeId, PanelNode, TabDescriptor, TabId, SplitTarget } from '../core/types';

export interface UsePanelResult {
  panel: PanelNode | null;
  setActiveTab: (tabId: TabId) => void;
  addTab: (tab: TabDescriptor, opts?: { activate?: boolean; index?: number }) => void;
  removeTab: (tabId: TabId) => void;
  reorderTab: (tabId: TabId, toIndex: number) => void;
  split: (target: SplitTarget) => void;
  toggleCollapse: (collapsed?: boolean) => void;
  toggleMaximize: (maximized?: boolean) => void;
  /** Remove the entire panel from the layout. No-op if it is the root panel. */
  closePanel: () => void;
}

/**
 * Scoped to a single panel. Re-renders only when *this* panel's slice of the
 * tree changes — courtesy of `findPanel`-based selector + reference equality.
 */
export const usePanel = (panelId: NodeId): UsePanelResult => {
  const { store } = useLayoutContext();

  const panel = useLayoutStoreSelector(
    (s) => findPanel(s.layout, panelId)?.node ?? null,
  );

  const dispatch = store.getState().dispatch;

  const setActiveTab = useCallback(
    (tabId: TabId) => dispatch({ type: 'SET_ACTIVE_TAB', panelId, tabId }),
    [dispatch, panelId],
  );

  const addTab = useCallback<UsePanelResult['addTab']>(
    (tab, opts) =>
      dispatch({ type: 'ADD_TAB', panelId, tab, activate: opts?.activate, index: opts?.index }),
    [dispatch, panelId],
  );

  const removeTab = useCallback(
    (tabId: TabId) => dispatch({ type: 'REMOVE_TAB', panelId, tabId }),
    [dispatch, panelId],
  );

  const reorderTab = useCallback(
    (tabId: TabId, toIndex: number) =>
      dispatch({ type: 'REORDER_TAB', panelId, tabId, toIndex }),
    [dispatch, panelId],
  );

  const split = useCallback(
    (target: SplitTarget) => dispatch({ type: 'SPLIT_PANEL', panelId, target }),
    [dispatch, panelId],
  );

  const toggleCollapse = useCallback(
    (collapsed?: boolean) => dispatch({ type: 'TOGGLE_COLLAPSE', panelId, collapsed }),
    [dispatch, panelId],
  );

  const toggleMaximize = useCallback(
    (maximized?: boolean) => dispatch({ type: 'TOGGLE_MAXIMIZE', panelId, maximized }),
    [dispatch, panelId],
  );

  const closePanel = useCallback(
    () => dispatch({ type: 'REMOVE_PANEL', panelId }),
    [dispatch, panelId],
  );

  return useMemo(
    () => ({ panel, setActiveTab, addTab, removeTab, reorderTab, split, toggleCollapse, toggleMaximize, closePanel }),
    [panel, setActiveTab, addTab, removeTab, reorderTab, split, toggleCollapse, toggleMaximize, closePanel],
  );
};
