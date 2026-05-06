import { NodeId, TabId, TabDescriptor, SplitTarget } from '../core/types';

export type LayoutAction =
  | { type: 'SPLIT_PANEL'; panelId: NodeId; target: SplitTarget; newPanelId?: NodeId; newTabs?: TabDescriptor[] }
  | { type: 'ADD_TAB'; panelId: NodeId; tab: TabDescriptor; activate?: boolean; index?: number }
  | { type: 'REMOVE_TAB'; panelId: NodeId; tabId: TabId }
  | { type: 'MOVE_TAB'; fromPanelId: NodeId; toPanelId: NodeId; tabId: TabId; index?: number }
  | { type: 'REORDER_TAB'; panelId: NodeId; tabId: TabId; toIndex: number }
  | { type: 'SET_ACTIVE_TAB'; panelId: NodeId; tabId: TabId }
  | { type: 'RESIZE_SPLIT'; splitId: NodeId; sizes: number[] }
  | { type: 'TOGGLE_COLLAPSE'; panelId: NodeId; collapsed?: boolean }
  | { type: 'TOGGLE_MAXIMIZE'; panelId: NodeId; maximized?: boolean }
  | { type: 'REMOVE_PANEL'; panelId: NodeId }
  | { type: 'REPLACE_LAYOUT'; layout: import('../core/types').LayoutNode };
