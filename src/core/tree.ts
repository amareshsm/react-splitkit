import {
  LayoutNode,
  PanelNode,
  SplitNode,
  NodeId,
  TabId,
  TabDescriptor,
  SplitDirection,
  isPanel,
  isSplit,
} from './types';

/**
 * Pure tree operations. None of these mutate input nodes — every operation
 * returns a new tree (or subtree) with structural sharing where possible.
 *
 * The tree is the single source of truth; reducer actions are thin wrappers
 * around these primitives plus a `normalize()` pass.
 */

// ---------- Lookup ----------

export interface FoundNode<T extends LayoutNode = LayoutNode> {
  node: T;
  /** Path of indexes from the root to this node. Empty array means root. */
  path: number[];
  parent: SplitNode | null;
  indexInParent: number;
}

export const findNode = (
  root: LayoutNode,
  id: NodeId,
): FoundNode | null => {
  if (root.id === id) {
    return { node: root, path: [], parent: null, indexInParent: -1 };
  }
  if (isPanel(root)) return null;

  for (let i = 0; i < root.children.length; i++) {
    const child = root.children[i]!;
    if (child.id === id) {
      return { node: child, path: [i], parent: root, indexInParent: i };
    }
    const nested = findNode(child, id);
    if (nested) {
      return {
        node: nested.node,
        path: [i, ...nested.path],
        parent: nested.parent ?? root,
        indexInParent: nested.parent ? nested.indexInParent : i,
      };
    }
  }
  return null;
};

export const findPanel = (root: LayoutNode, id: NodeId): FoundNode<PanelNode> | null => {
  const found = findNode(root, id);
  if (!found || !isPanel(found.node)) return null;
  return found as FoundNode<PanelNode>;
};

export const findTab = (
  root: LayoutNode,
  tabId: TabId,
): { panel: PanelNode; tabIndex: number } | null => {
  if (isPanel(root)) {
    const idx = root.tabs.findIndex((t) => t.id === tabId);
    if (idx >= 0) return { panel: root, tabIndex: idx };
    return null;
  }
  for (const child of root.children) {
    const found = findTab(child, tabId);
    if (found) return found;
  }
  return null;
};

// ---------- Replacement ----------

/**
 * Returns a new tree where the node with `id` has been replaced by `replacement`.
 * If `replacement` is null, the node is removed (parent split's children/sizes
 * are recomputed proportionally). Returns null if removal would empty the root.
 */
export const replaceNode = (
  root: LayoutNode,
  id: NodeId,
  replacement: LayoutNode | null,
): LayoutNode | null => {
  if (root.id === id) {
    return replacement;
  }
  if (isPanel(root)) return root;

  let changed = false;
  const newChildren: LayoutNode[] = [];
  const keptIndexes: number[] = [];

  for (let i = 0; i < root.children.length; i++) {
    const child = root.children[i]!;
    if (child.id === id) {
      changed = true;
      if (replacement !== null) {
        newChildren.push(replacement);
        keptIndexes.push(i);
      }
      continue;
    }
    const updated = replaceNode(child, id, replacement);
    if (updated !== child) changed = true;
    if (updated !== null) {
      newChildren.push(updated);
      keptIndexes.push(i);
    }
  }

  if (!changed) return root;
  if (newChildren.length === 0) return null;

  const newSizes = redistributeSizes(root.sizes, keptIndexes);
  return { ...root, children: newChildren, sizes: newSizes };
};

/**
 * When children are removed, redistribute their size share proportionally
 * across the survivors so the total stays at 100.
 */
const redistributeSizes = (oldSizes: number[], keptIndexes: number[]): number[] => {
  if (keptIndexes.length === oldSizes.length) {
    return [...oldSizes];
  }
  const kept = keptIndexes.map((i) => oldSizes[i] ?? 0);
  const total = kept.reduce((a, b) => a + b, 0);
  if (total === 0) {
    // All kept entries were zero — distribute equally.
    return kept.map(() => 100 / kept.length);
  }
  return kept.map((s) => (s / total) * 100);
};

// ---------- Construction ----------

export const createPanel = (
  id: NodeId,
  tabs: TabDescriptor[] = [],
  activeTabId: TabId | null = tabs[0]?.id ?? null,
): PanelNode => ({
  id,
  type: 'panel',
  tabs,
  activeTabId,
});

export const createSplit = (
  id: NodeId,
  direction: SplitDirection,
  children: LayoutNode[],
  sizes?: number[],
): SplitNode => ({
  id,
  type: 'split',
  direction,
  children,
  sizes: sizes ?? children.map(() => 100 / children.length),
});

// ---------- Maximize helpers ----------

/**
 * Walk the tree and clear `maximized` on every panel except `keepId` (if given).
 * Used to enforce the "only one panel maximized at a time" invariant.
 */
export const clearMaximizedExcept = (
  root: LayoutNode,
  keepId: NodeId | null,
): LayoutNode => {
  if (isPanel(root)) {
    if (root.maximized && root.id !== keepId) {
      const { maximized: _maximized, ...rest } = root;
      return rest;
    }
    return root;
  }
  let changed = false;
  const newChildren = root.children.map((c) => {
    const next = clearMaximizedExcept(c, keepId);
    if (next !== c) changed = true;
    return next;
  });
  return changed ? { ...root, children: newChildren } : root;
};

// ---------- Util re-exports ----------

export { isPanel, isSplit };
