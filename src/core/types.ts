export type NodeId = string;
export type TabId = string;

export type SplitDirection = 'horizontal' | 'vertical';

export type SplitTarget = 'right' | 'bottom' | 'left' | 'top';

export interface TabDescriptor {
  id: TabId;
  /** Consumer-defined tab kind (e.g. 'console', 'description'). Used to look up renderers in the tab registry. */
  tabType: string;
  title: string;
  closable?: boolean;
  /** Per-tab override of panel min/max sizing constraints. */
  minSize?: number;
  maxSize?: number;
  /** Arbitrary consumer data attached to the tab. */
  meta?: unknown;
}

export interface PanelNode {
  id: NodeId;
  type: 'panel';
  tabs: TabDescriptor[];
  activeTabId: TabId | null;
  collapsed?: boolean;
  /** Only one panel in a tree may be maximized at a time. */
  maximized?: boolean;
  /** Min/max as a percentage (0-100) of the parent split's available size. */
  minSize?: number;
  maxSize?: number;
}

export interface SplitNode {
  id: NodeId;
  type: 'split';
  direction: SplitDirection;
  children: LayoutNode[];
  /** Percentages, length === children.length, sum === 100. */
  sizes: number[];
}

export type LayoutNode = PanelNode | SplitNode;

export const isPanel = (n: LayoutNode): n is PanelNode => n.type === 'panel';
export const isSplit = (n: LayoutNode): n is SplitNode => n.type === 'split';
