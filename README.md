# react-splitkit

Headless, resizable, tabbed, splittable layout primitives for React. Build IDE-style multi-pane UIs with nested splits, tabs per pane, drag-resize, collapse, and full-screen maximize — without prescribing any styling.

## Install

```sh
npm install react-splitkit
```

Peer dependency: `react >= 18`.

## Quick start

```tsx
import {
  LayoutProvider,
  LayoutRoot,
  TabList,
  TabPanel,
  createPanel,
  createSplit,
  type TabRegistry,
  type RenderPanelProps,
} from 'react-splitkit';

const registry: TabRegistry = {
  editor: {
    tabType: 'editor',
    title: 'Editor',
    render: (tab) => <div>Editor: {tab.id}</div>,
  },
  console: {
    tabType: 'console',
    title: 'Console',
    render: () => <div>Console output…</div>,
  },
};

const initialLayout = createSplit('root', 'horizontal', [
  createPanel('p1', [{ id: 't1', tabType: 'editor', title: 'main.ts' }]),
  createPanel('p2', [{ id: 't2', tabType: 'console', title: 'Output' }]),
]);

const PanelChrome = ({ panel, style }: RenderPanelProps) => (
  <div style={{ ...style, display: 'flex', flexDirection: 'column' }}>
    <TabList
      panelId={panel.id}
      renderTab={({ tab, isActive, tabProps, label }) => (
        <button {...tabProps} style={{ fontWeight: isActive ? 600 : 400 }}>
          {label}
        </button>
      )}
    />
    <TabPanel panelId={panel.id} />
  </div>
);

export const App = () => (
  <LayoutProvider initialLayout={initialLayout} registry={registry}>
    <LayoutRoot renderPanel={PanelChrome} />
  </LayoutProvider>
);
```

## Optional default styles

The components ship headless. To opt in to a sensible default look (light + dark mode aware):

```ts
import 'react-splitkit/styles.css';
```

Defaults are wrapped in `@layer splitkit`, so any unlayered consumer rule wins without specificity battles.

Theme via CSS custom properties on `[data-splitkit-root]`:

```css
[data-splitkit-root] {
  --sk-bg: #0a0a0a;
  --sk-accent: #ec4899;
  --sk-border: rgba(255, 255, 255, 0.08);
}
```

Available variables: `--sk-bg`, `--sk-border`, `--sk-tab-bg`, `--sk-tab-bg-active`, `--sk-tab-fg`, `--sk-tab-fg-active`, `--sk-accent`, `--sk-resizer-bg`, `--sk-resizer-bg-hover`, `--sk-resizer-bg-active`, `--sk-radius`, `--sk-overlay-shadow`.

For fully custom styling, target the data-attributes directly: `[data-splitkit-root]`, `[data-splitkit-split]`, `[data-splitkit-cell]`, `[data-splitkit-resizer]`, `[data-splitkit-maximized-overlay]`, `[data-panel-tablist]`, `[data-panel-tabpanel]`.

## API

### Provider

| Export | Purpose |
| --- | --- |
| `LayoutProvider` | Wraps your layout. Creates an isolated store + registry. |
| `createLayoutStore` | Vanilla Zustand store factory (advanced). |
| `useLayoutContext` | Access the underlying store + registry. |

`LayoutProvider` props:

```ts
interface LayoutProviderProps {
  initialLayout: LayoutNode;
  registry: TabRegistry;
  onChange?: (layout: LayoutNode, action: LayoutAction) => void;
  generateId?: IdGenerator;
}
```

### Components

| Export | Purpose |
| --- | --- |
| `LayoutRoot` | Recursively renders the tree. Accepts `renderPanel` and optional `renderResizer`. |
| `Resizer` | Default interactive resizer with ARIA + touch hit area. |
| `TabList` | Headless tab list. Consumer renders each tab via `renderTab`. |
| `TabPanel` | Renders the active tab's content via the registry. |
| `TabAddMenu` | Optional "+" menu for adding registered tab types. |

### Hooks

| Hook | Returns |
| --- | --- |
| `useLayout()` | `{ layout, dispatch }` |
| `usePanel(panelId)` | Panel state + bound actions: `setActiveTab`, `addTab`, `removeTab`, `reorderTab`, `split`, `toggleCollapse`, `toggleMaximize`. |
| `useSplit(splitId)` | `{ split, setSizes }` |
| `useTabRegistry()` | The full registry. |
| `useTabRegistryEntry(tabType)` | A single registry entry. |
| `useResize(options)` | Low-level pointer + keyboard resize logic. |
| `usePanelMinMax(panelId)` | Effective `minSize` / `maxSize` for a panel. |
| `useLayoutBreakpoint()` | Responsive breakpoint helper. |

### Pure logic (SSR + persistence safe)

| Export | Purpose |
| --- | --- |
| `createPanel(id, tabs?)` | Build a `PanelNode`. |
| `createSplit(id, direction, children, sizes?)` | Build a `SplitNode`. |
| `findNode`, `findPanel`, `findTab` | Tree lookups. |
| `replaceNode(tree, id, replacement)` | Immutable replace. |
| `normalize(tree)` | Collapse single-child splits and flatten same-direction nesting. |
| `layoutReducer(state, action, ctx?)` | Pure reducer for every `LayoutAction`. |
| `createId`, `resetIdCounter` | Deterministic ID generation. |

### Tab registry

Define one entry per `tabType`:

```ts
const registry: TabRegistry = {
  editor: {
    tabType: 'editor',
    title: 'Editor',
    minSize: 30,        // % min for any panel hosting this tab
    maxSize: 80,        // % max
    closable: true,
    render: (tab, ctx) => <Editor file={tab.id} />,
    renderLabel: (tab) => <span>{tab.title}</span>,
  },
};
```

Per-tab descriptor overrides win over the registry entry.

### Actions

Dispatch via `useLayout().dispatch(action)`:

- `REPLACE_LAYOUT`
- `SPLIT_PANEL` — split into `target` of `'left' | 'right' | 'top' | 'bottom'`
- `ADD_TAB`, `REMOVE_TAB`, `MOVE_TAB`, `REORDER_TAB`, `SET_ACTIVE_TAB`
- `RESIZE_SPLIT`
- `TOGGLE_COLLAPSE`, `TOGGLE_MAXIMIZE`

## Constraints

`minSize` / `maxSize` (percentages) can be set on a panel descriptor and on a tab registry entry. The effective min is `max(panelMin, max of all tab mins)`; the effective max is the symmetric `min`. The default `Resizer` enforces these during drag and keyboard resize.

## Keyboard

- **Tabs:** ←/→ or ↑/↓ navigate, Home/End jump, Delete closes (when closable).
- **Resizer:** Alt+Arrow nudges by 5% (Shift+Alt+Arrow = 10%). Enter toggles a sticky resize mode where plain arrows resize. Escape exits.

## Multiple roots

Render multiple `<LayoutProvider>`s on the same page. Each owns an independent store; ids are auto-prefixed per provider so DOM ids stay unique.

## Persistence

The tree is plain JSON. Persist via `onChange` and rehydrate by passing the serialized tree as `initialLayout`:

```tsx
<LayoutProvider
  initialLayout={savedLayout ?? initialLayout}
  registry={registry}
  onChange={(layout) => localStorage.setItem('layout', JSON.stringify(layout))}
/>
```

## Run the demo

A fully-styled Tailwind demo lives in [`demo/`](demo/). It showcases the two-column, nested IDE, and custom-themed layouts with light/dark mode.

```sh
cd demo
npm install
npm run dev
```

The demo opens at http://localhost:5173. It imports the library directly from `../src` via a Vite alias, so any change to the library hot-reloads instantly.

## Storybook

Component playgrounds live under [`stories/`](stories/). Each story exposes interactive controls (layout preset, `maximizeMode`, custom theme toggle) via the Storybook Controls panel.

```sh
npm run storybook         # dev server on http://localhost:6006
npm run build-storybook   # static build into storybook-static/
```

## License

MIT © Amaresh S M
