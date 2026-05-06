// ---------- Types ----------
export type {
  LayoutNode,
  PanelNode,
  SplitNode,
  TabDescriptor,
  NodeId,
  TabId,
  SplitDirection,
  SplitTarget,
} from './core/types';
export { isPanel, isSplit } from './core/types';

// ---------- Tab registry ----------
export type { TabRegistry, TabRegistryEntry, TabRenderContext } from './core/registry';

// ---------- Pure logic (still public — useful for SSR / persistence) ----------
export {
  findNode,
  findPanel,
  findTab,
  replaceNode,
  createPanel,
  createSplit,
} from './core/tree';
export { normalize } from './core/normalize';
export { layoutReducer } from './state/reducer';
export type { LayoutAction } from './state/actions';
export type { ReducerContext } from './state/reducer';
export { createId, resetIdCounter } from './utils/ids';
export type { IdGenerator } from './utils/ids';

// ---------- Provider / store ----------
export { LayoutProvider, useLayoutContext } from './state/context';
export type { LayoutProviderProps } from './state/context';
export { createLayoutStore } from './state/store';
export type { LayoutStore, LayoutState, CreateLayoutStoreOptions } from './state/store';

// ---------- Hooks ----------
export { useLayout } from './hooks/useLayout';
export { usePanel } from './hooks/usePanel';
export type { UsePanelResult } from './hooks/usePanel';
export { useSplit } from './hooks/useSplit';
export type { UseSplitResult } from './hooks/useSplit';
export { useTabRegistry, useTabRegistryEntry } from './hooks/useTabRegistry';
export { useResize } from './hooks/useResize';
export type { UseResizeOptions, UseResizeResult } from './hooks/useResize';
export { usePanelMinMax } from './hooks/usePanelMinMax';
export type { PanelMinMax } from './hooks/usePanelMinMax';
export { useLayoutBreakpoint } from './hooks/useLayoutBreakpoint';

// ---------- Components ----------
export { LayoutRoot } from './components/LayoutRoot';
export type { LayoutRootProps, RenderPanelProps, RenderResizerProps } from './components/LayoutRoot';
export { Resizer } from './components/Resizer';
export type { ResizerProps } from './components/Resizer';
export { TabList, tabElementId, tabPanelElementId } from './components/TabList';
export type { TabListProps, RenderTabProps } from './components/TabList';
export { TabPanel } from './components/TabPanel';
export type { TabPanelProps } from './components/TabPanel';
export { TabAddMenu } from './components/TabAddMenu';
export type { TabAddMenuProps, AddMenuItem } from './components/TabAddMenu';
