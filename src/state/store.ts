import { createStore as createVanillaStore, StoreApi } from 'zustand/vanilla';
import { LayoutNode } from '../core/types';
import { LayoutAction } from './actions';
import { layoutReducer, ReducerContext } from './reducer';
import { createId, IdGenerator } from '../utils/ids';

export interface LayoutState {
  layout: LayoutNode;
  dispatch: (action: LayoutAction) => void;
}

export interface CreateLayoutStoreOptions {
  initialLayout: LayoutNode;
  generateId?: IdGenerator;
  /**
   * Read the latest onChange callback at dispatch time. We accept a getter
   * (not the callback itself) so consumers can swap their callback between
   * renders without rebuilding the store. The provider points this at a ref.
   */
  getOnChange?: () => ((layout: LayoutNode, action: LayoutAction) => void) | undefined;
}

export type LayoutStore = StoreApi<LayoutState>;

/**
 * Creates a self-contained Zustand store. One per `<LayoutProvider>` so
 * multiple independent layouts can co-exist on a page without colliding.
 */
export const createLayoutStore = (opts: CreateLayoutStoreOptions): LayoutStore => {
  const ctx: ReducerContext = { generateId: opts.generateId ?? createId };

  return createVanillaStore<LayoutState>((set, get) => ({
    layout: opts.initialLayout,
    dispatch: (action) => {
      const prev = get().layout;
      const next = layoutReducer(prev, action, ctx);
      if (next === prev) return;
      set({ layout: next });
      opts.getOnChange?.()?.(next, action);
    },
  }));
};
