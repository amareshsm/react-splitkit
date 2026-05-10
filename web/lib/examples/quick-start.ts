const appCode = `import {
  LayoutProvider,
  LayoutRoot,
  TabList,
  TabPanel,
  createPanel,
  createSplit,
  type RenderPanelProps,
  type TabRegistry,
} from 'react-splitkit';
import 'react-splitkit/styles.css';
import './styles.css';

const registry: TabRegistry = {
  description: {
    tabType: 'description',
    title: 'Description',
    render: () => (
      <div className="content welcome">
        <h3>Welcome 👋</h3>
        <p>
          Drag the divider to resize. Click between the Preview and
          Console tabs on the right.
        </p>
      </div>
    ),
  },
  preview: {
    tabType: 'preview',
    title: 'Preview',
    render: () => <div className="content preview">Preview pane</div>,
  },
  console: {
    tabType: 'console',
    title: 'Console',
    render: () => (
      <pre className="content console">
        {'> react-splitkit ready\\n> hello world'}
      </pre>
    ),
  },
};

const layout = createSplit('root', 'horizontal', [
  createPanel('left', [
    { id: 'desc', tabType: 'description', title: 'Description' },
  ]),
  createPanel('right', [
    { id: 'prev', tabType: 'preview', title: 'Preview' },
    { id: 'cons', tabType: 'console', title: 'Console' },
  ]),
]);

const Panel = ({ panel, style }: RenderPanelProps) => (
  <div style={style}>
    <TabList
      panelId={panel.id}
      renderTab={({ tabProps, label }) => (
        <button {...tabProps}>{label}</button>
      )}
    />
    <TabPanel panelId={panel.id} style={{ flex: 1 }} />
  </div>
);

export default function App() {
  return (
    <div className="app">
      <LayoutProvider initialLayout={layout} registry={registry}>
        <LayoutRoot renderPanel={(p) => <Panel {...p} />} />
      </LayoutProvider>
    </div>
  );
}
`;

const stylesCode = `/* Reset — keep the body from showing white around the layout */
body {
  margin: 0;
  background: #fff;
  color: rgba(0, 0, 0, 0.95);
}

/* App container fills the iframe */
.app {
  height: 100vh;
}

/* Tab content — the library handles tab + panel chrome via
   react-splitkit/styles.css. We only style the tab CONTENT here. */
.content {
  padding: 1rem;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 14px;
  line-height: 1.5;
}

.welcome h3 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.welcome p {
  margin: 0;
  color: rgba(0, 0, 0, 0.65);
}

.preview {
  height: 100%;
  background: #f3f4f6;
  display: grid;
  place-items: center;
  font-weight: 600;
}

.console {
  margin: 0;
  font-family: ui-monospace, Menlo, monospace;
  font-size: 13px;
}

/* Dark mode — palette matches the library's --sk-* dark theme so
   our content blends with the dark tabs/panels above. */
@media (prefers-color-scheme: dark) {
  body {
    background: #1e1e1e;
    color: rgba(255, 255, 255, 0.95);
  }
  .welcome p {
    color: rgba(255, 255, 255, 0.65);
  }
  .preview {
    background: #2a2a2a;
  }
}
`;

export const quickStartFiles = {
  '/App.tsx': appCode,
  '/styles.css': stylesCode,
};
