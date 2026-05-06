import { ReactNode } from 'react';
import { NodeId, TabDescriptor } from './types';

/**
 * Context passed to a tab's `render` so the content can know which panel
 * it's mounted in. Useful for tabs that need to mutate their own tab list
 * (e.g. a "new tab" placeholder that replaces itself with a chosen type).
 */
export interface TabRenderContext {
  /** Id of the panel currently rendering this tab. */
  panelId: NodeId;
}

/**
 * Consumers register every renderable tab kind here. The library uses this to:
 *   - render tab content (`render`)
 *   - render tab labels in the tablist (`renderLabel` falls back to `title` / descriptor.title)
 *   - power the "+" add-tab menu (which lists every entry whose `availableInAddMenu !== false`)
 *
 * Keep entries serializable-ish: anything that needs runtime data (e.g. the
 * problem id for a Description tab) should come from the descriptor's `meta`,
 * which `render` receives.
 */
export interface TabRegistryEntry {
  /** Stable kind id, matches `TabDescriptor.tabType`. */
  tabType: string;
  /** Default title used when adding a tab via the "+" menu. */
  title: string;
  /** Optional icon slot the consumer's UI can read. */
  icon?: ReactNode;
  /**
   * Render the tab's content. Receives the descriptor and an optional
   * context (currently { panelId }). Single-argument renderers still work.
   */
  render: (descriptor: TabDescriptor, ctx?: TabRenderContext) => ReactNode;
  /** Optional custom label rendering (icon + title). Defaults to descriptor.title. */
  renderLabel?: (descriptor: TabDescriptor) => ReactNode;
  /** Hide from the "+" menu (e.g. a singleton tab that's already added). Defaults to true. */
  availableInAddMenu?: boolean;
  /** Whether the user is allowed to close instances of this tab. Defaults to true. */
  closable?: boolean;
  /** Default tab descriptor factory used by the "+" menu. */
  createDescriptor?: () => TabDescriptor;
  /** Optional minimum panel size (as %) when a tab of this type is present. */
  minSize?: number;
  /** Optional maximum panel size (as %) when a tab of this type is present. */
  maxSize?: number;
}

export type TabRegistry = Record<string, TabRegistryEntry>;
