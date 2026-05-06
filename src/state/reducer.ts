import {
  LayoutNode,
  PanelNode,
  SplitNode,
  SplitDirection,
  SplitTarget,
  isSplit,
} from '../core/types';
import {
  findNode,
  findPanel,
  replaceNode,
  createPanel,
  createSplit,
  clearMaximizedExcept,
} from '../core/tree';
import { normalize } from '../core/normalize';
import { LayoutAction } from './actions';
import { IdGenerator, createId } from '../utils/ids';

// Declared ambient so the lib doesn't need @types/node. Bundlers (tsup,
// vite, webpack) replace `process.env.NODE_ENV` at build time, so this
// reference vanishes in production output.
declare const process: { env: { NODE_ENV?: string } } | undefined;
const isDev = (): boolean =>
  typeof process !== 'undefined' && process?.env?.NODE_ENV !== 'production';

export interface ReducerContext {
  generateId: IdGenerator;
}

const defaultCtx: ReducerContext = { generateId: createId };

/**
 * Pure reducer. Every action returns a new tree (or the same tree reference
 * if no change applied). Always passes the result through `normalize()` so
 * callers never see a non-canonical tree.
 */
export const layoutReducer = (
  state: LayoutNode,
  action: LayoutAction,
  ctx: ReducerContext = defaultCtx,
): LayoutNode => {
  const next = applyAction(state, action, ctx);
  if (next === state) return state;
  const normalized = normalize(next);
  // Root must never be null in a valid layout — fall back to original if
  // an action would have emptied the tree.
  return normalized ?? state;
};

const applyAction = (
  state: LayoutNode,
  action: LayoutAction,
  ctx: ReducerContext,
): LayoutNode => {
  switch (action.type) {
    case 'REPLACE_LAYOUT':
      return action.layout;

    case 'SPLIT_PANEL':
      return splitPanel(state, action, ctx);

    case 'ADD_TAB':
      return updatePanel(state, action.panelId, (p) => {
        if (p.tabs.some((t) => t.id === action.tab.id)) return p;
        const insertAt = action.index ?? p.tabs.length;
        const tabs = [...p.tabs.slice(0, insertAt), action.tab, ...p.tabs.slice(insertAt)];
        const activeTabId = action.activate || p.activeTabId === null ? action.tab.id : p.activeTabId;
        return { ...p, tabs, activeTabId };
      });

    case 'REMOVE_TAB':
      return removeTab(state, action.panelId, action.tabId);

    case 'MOVE_TAB':
      return moveTab(state, action.fromPanelId, action.toPanelId, action.tabId, action.index);

    case 'REORDER_TAB':
      return updatePanel(state, action.panelId, (p) => {
        const from = p.tabs.findIndex((t) => t.id === action.tabId);
        if (from < 0) return p;
        const tab = p.tabs[from]!;
        const without = [...p.tabs.slice(0, from), ...p.tabs.slice(from + 1)];
        const to = Math.max(0, Math.min(action.toIndex, without.length));
        return { ...p, tabs: [...without.slice(0, to), tab, ...without.slice(to)] };
      });

    case 'SET_ACTIVE_TAB':
      return updatePanel(state, action.panelId, (p) =>
        p.tabs.some((t) => t.id === action.tabId) ? { ...p, activeTabId: action.tabId } : p,
      );

    case 'RESIZE_SPLIT': {
      const found = findNode(state, action.splitId);
      if (!found || !isSplit(found.node)) return state;
      if (action.sizes.length !== found.node.children.length) return state;
      const total = action.sizes.reduce((a, b) => a + b, 0);
      const sizes = total === 0 ? action.sizes : action.sizes.map((s) => (s / total) * 100);
      const updated: SplitNode = { ...found.node, sizes };
      return replaceNode(state, action.splitId, updated) ?? state;
    }

    case 'TOGGLE_COLLAPSE':
      return updatePanel(state, action.panelId, (p) => {
        const next = action.collapsed ?? !p.collapsed;
        if (next === !!p.collapsed) return p;
        // Collapsing a maximized panel doesn't make sense — clear the
        // maximize flag in the same step so the two states stay mutually
        // exclusive.
        return {
          ...p,
          collapsed: next || undefined,
          ...(next && p.maximized ? { maximized: undefined } : {}),
        };
      });

    case 'REMOVE_PANEL': {
      // Keep the root intact if removing it would empty the entire tree.
      if (state.id === action.panelId) return state;
      return replaceNode(state, action.panelId, null) ?? state;
    }

    case 'TOGGLE_MAXIMIZE': {
      const found = findPanel(state, action.panelId);
      if (!found) return state;
      const next = action.maximized ?? !found.node.maximized;
      // Clear any other maximized panel first; one-at-a-time invariant.
      const cleared = clearMaximizedExcept(state, next ? action.panelId : null);
      return updatePanel(cleared, action.panelId, (p) => {
        if (next === !!p.maximized) return p;
        // Maximizing a collapsed panel auto-expands it. Otherwise the overlay
        // would render a thin collapsed strip, which is nonsense.
        return {
          ...p,
          maximized: next || undefined,
          ...(next && p.collapsed ? { collapsed: undefined } : {}),
        };
      });
    }
  }
};

// ---------- Helpers ----------

const updatePanel = (
  state: LayoutNode,
  panelId: string,
  updater: (p: PanelNode) => PanelNode,
): LayoutNode => {
  const found = findPanel(state, panelId);
  if (!found) return state;
  const updated = updater(found.node);
  if (updated === found.node) return state;
  return replaceNode(state, panelId, updated) ?? state;
};

const splitTargetToDirection = (target: SplitTarget): SplitDirection =>
  target === 'right' || target === 'left' ? 'horizontal' : 'vertical';

const splitTargetIsAfter = (target: SplitTarget): boolean =>
  target === 'right' || target === 'bottom';

const splitPanel = (
  state: LayoutNode,
  action: Extract<LayoutAction, { type: 'SPLIT_PANEL' }>,
  ctx: ReducerContext,
): LayoutNode => {
  const found = findPanel(state, action.panelId);
  if (!found) return state;

  // Reject (and warn in dev) if the caller-supplied newPanelId already exists
  // somewhere in the tree. Otherwise the tree would have two nodes with the
  // same id and `findNode` would return whichever it walks into first —
  // every subsequent dispatch becomes ambiguous and the layout silently
  // corrupts itself.
  if (action.newPanelId && findNode(state, action.newPanelId)) {
    if (isDev()) {
      console.warn(
        `[react-splitkit] SPLIT_PANEL ignored: newPanelId "${action.newPanelId}" already exists in the layout.`,
      );
    }
    return state;
  }

  // Reject duplicate tab ids inside the new panel's tab list.
  if (action.newTabs && hasDuplicateIds(action.newTabs.map((t) => t.id))) {
    if (isDev()) {
      console.warn(
        `[react-splitkit] SPLIT_PANEL ignored: newTabs contains duplicate tab ids.`,
      );
    }
    return state;
  }

  const direction = splitTargetToDirection(action.target);
  const after = splitTargetIsAfter(action.target);

  const newPanel = createPanel(
    action.newPanelId ?? ctx.generateId('panel'),
    action.newTabs ?? [],
  );

  const ordered = after ? [found.node, newPanel] : [newPanel, found.node];
  const newSplit = createSplit(ctx.generateId('split'), direction, ordered, [50, 50]);

  return replaceNode(state, action.panelId, newSplit) ?? state;
};

const hasDuplicateIds = (ids: string[]): boolean => new Set(ids).size !== ids.length;

const removeTab = (state: LayoutNode, panelId: string, tabId: string): LayoutNode => {
  const found = findPanel(state, panelId);
  if (!found) return state;
  const tabIndex = found.node.tabs.findIndex((t) => t.id === tabId);
  if (tabIndex < 0) return state;

  const remaining = [
    ...found.node.tabs.slice(0, tabIndex),
    ...found.node.tabs.slice(tabIndex + 1),
  ];

  // If the panel still has tabs, just update it.
  if (remaining.length > 0) {
    let activeTabId = found.node.activeTabId;
    if (activeTabId === tabId) {
      // Activate the neighbor (prefer the one to the left).
      const neighborIndex = Math.max(0, tabIndex - 1);
      activeTabId = remaining[neighborIndex]?.id ?? null;
    }
    return replaceNode(state, panelId, { ...found.node, tabs: remaining, activeTabId }) ?? state;
  }

  // Panel is empty. Remove it entirely — but never let the root vanish.
  // If this is the only panel, keep it as an empty panel rather than emptying the tree.
  if (state.id === panelId) {
    return { ...found.node, tabs: [], activeTabId: null };
  }
  return replaceNode(state, panelId, null) ?? state;
};

const moveTab = (
  state: LayoutNode,
  fromPanelId: string,
  toPanelId: string,
  tabId: string,
  index?: number,
): LayoutNode => {
  if (fromPanelId === toPanelId) return state;
  const from = findPanel(state, fromPanelId);
  const to = findPanel(state, toPanelId);
  if (!from || !to) return state;
  const tab = from.node.tabs.find((t) => t.id === tabId);
  if (!tab) return state;

  const intermediate = removeTab(state, fromPanelId, tabId);
  // After removal, the destination panel may have moved or its tab list is unchanged.
  const toAfter = findPanel(intermediate, toPanelId);
  if (!toAfter) return state;

  const insertAt = index ?? toAfter.node.tabs.length;
  const newTabs = [
    ...toAfter.node.tabs.slice(0, insertAt),
    tab,
    ...toAfter.node.tabs.slice(insertAt),
  ];
  return replaceNode(intermediate, toPanelId, {
    ...toAfter.node,
    tabs: newTabs,
    activeTabId: tab.id,
  }) ?? state;
};
