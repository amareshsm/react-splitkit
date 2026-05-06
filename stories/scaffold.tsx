import { ButtonHTMLAttributes, ReactNode, useEffect, useRef, useState } from 'react';
import {
  TabList,
  TabPanel,
  usePanel,
  useTabRegistry,
  type RenderPanelProps,
  type RenderTabProps,
  type TabRegistry,
  type TabRegistryEntry,
  type TabDescriptor,
} from '../src';

/* -------------------------------------------------------------------------- */
/* SVG icons                                                                   */
/* -------------------------------------------------------------------------- */

const base = {
  width: 14,
  height: 14,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const PlusIcon = () => (
  <svg {...base} width={16} height={16}>
    <path d="M8 3v10M3 8h10" />
  </svg>
);

const MaximizeIcon = () => (
  <svg {...base}>
    <path d="M2.5 5.5V2.5H5.5M13.5 5.5V2.5H10.5M2.5 10.5V13.5H5.5M13.5 10.5V13.5H10.5" />
  </svg>
);

const CollapseIcon = () => (
  <svg {...base}>
    <path d="M5 6L2.5 8L5 10M11 6L13.5 8L11 10M8 2.5v11" />
  </svg>
);

const SplitRightIcon = () => (
  <svg {...base}>
    <rect x="2.25" y="2.5" width="11.5" height="11" rx="1.5" />
    <path d="M8 2.5v11" />
  </svg>
);

const SplitDownIcon = () => (
  <svg {...base}>
    <rect x="2.5" y="2.25" width="11" height="11.5" rx="1.5" />
    <path d="M2.5 8h11" />
  </svg>
);

const ClosePaneIcon = () => (
  <svg {...base}>
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
);

/* Per-type tab icons (shown in the tab strip and the chooser chips). */

const IconEditor = () => (
  <svg {...base}>
    <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" />
    <path d="M5.5 6h5M5.5 8.5h3.5" />
  </svg>
);

const IconConsole = () => (
  <svg {...base}>
    <rect x="1.75" y="3.5" width="12.5" height="9" rx="1.5" />
    <path d="M4.5 7l2 1.5-2 1.5M8 10.5h3" />
  </svg>
);

const IconProblems = () => (
  <svg {...base}>
    <path d="M8 2L14 13H2L8 2Z" />
    <path d="M8 6.5V9" />
    <circle cx="8" cy="11" r="0.5" fill="currentColor" />
  </svg>
);

const IconBrowser = () => (
  <svg {...base}>
    <rect x="2.5" y="3" width="11" height="10" rx="1.5" />
    <path d="M2.5 6.5h11" />
    <circle cx="5" cy="4.75" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="7" cy="4.75" r="0.6" fill="currentColor" stroke="none" />
  </svg>
);

const IconDescription = () => (
  <svg {...base}>
    <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" />
    <path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" />
  </svg>
);

const IconSolution = () => (
  <svg {...base}>
    <circle cx="8" cy="8" r="5.5" />
    <path d="M5.5 8l2 2 3.5-3.5" />
  </svg>
);

const IconFiles = () => (
  <svg {...base}>
    <path d="M4 2.5h5l2.5 2.5v8.5H4V2.5Z" />
    <path d="M9 2.5V5H11.5" />
  </svg>
);

const IconShortcuts = () => (
  <svg {...base}>
    <rect x="2.5" y="5.5" width="4" height="3" rx="1" />
    <rect x="9.5" y="5.5" width="4" height="3" rx="1" />
    <path d="M6.5 7h3M8 5.5V4M8 10.5V12" />
  </svg>
);

/* File-type icons for the Files section. */
const IconFileJson = () => (
  <svg {...base}>
    <path d="M4 2.5h5l2.5 2.5v8.5H4V2.5Z" />
    <path d="M9 2.5V5H11.5" />
    <path d="M6 8.5c0 1.5-1 1.5-1 1.5M10 8.5c0 1.5 1 1.5 1 1.5M7.5 7.5l1 3" />
  </svg>
);
const IconFileHtml = () => (
  <svg {...base}>
    <path d="M4 2.5h5l2.5 2.5v8.5H4V2.5Z" />
    <path d="M9 2.5V5H11.5" />
    <path d="M6 7.5h4M6 9.5h4" strokeWidth={1.2} />
  </svg>
);
const IconFileTsx = () => (
  <svg {...base}>
    <path d="M4 2.5h5l2.5 2.5v8.5H4V2.5Z" />
    <path d="M9 2.5V5H11.5" />
    <path d="M6 8h4M8 7v3" strokeWidth={1.2} />
  </svg>
);

/* -------------------------------------------------------------------------- */
/* Demo registry                                                               */
/* -------------------------------------------------------------------------- */

export const demoRegistry: TabRegistry = {
  description: {
    tabType: 'description',
    title: 'Description',
    icon: <IconDescription />,
    minSize: 20,
    render: (tab) => (
      <div style={{ padding: '20px 24px', overflowY: 'auto', height: '100%' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 600 }}>{tab.title}</h2>
        <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--sk-tab-fg)', lineHeight: 1.6 }}>
          This is a short warm-up question meant to help you familiarise yourself with the coding
          workspace. Actual UI coding interview questions will be more complex.
        </p>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600 }}>Requirements</h3>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--sk-tab-fg)', lineHeight: 1.6 }}>
          Make the text within the button display the number of times the button has been clicked.
        </p>
      </div>
    ),
  },
  solution: {
    tabType: 'solution',
    title: 'Solution',
    icon: <IconSolution />,
    minSize: 20,
    render: () => (
      <div style={{ padding: '20px 24px', overflowY: 'auto', height: '100%' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600 }}>Solution</h2>
        <pre
          style={{
            margin: 0,
            padding: '12px 16px',
            borderRadius: 8,
            background: 'rgba(0,0,0,0.04)',
            fontFamily: 'ui-monospace, monospace',
            fontSize: 13,
            lineHeight: 1.6,
            overflowX: 'auto',
          }}
        >
          {`import { useState } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <button onClick={() => setCount(c => c + 1)}>\n      Clicks: {count}\n    </button>\n  );\n}`}
        </pre>
      </div>
    ),
  },
  editor: {
    tabType: 'editor',
    title: 'Editor',
    icon: <IconEditor />,
    minSize: 25,
    render: (tab) => (
      <pre
        style={{
          margin: 0,
          padding: '16px 20px',
          height: '100%',
          overflowY: 'auto',
          fontFamily: 'ui-monospace, monospace',
          fontSize: 13,
          lineHeight: 1.7,
          background: 'transparent',
          color: 'var(--sk-tab-fg-active)',
        }}
      >
        {`// ${tab.title}\nimport { useState } from 'react';\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <button onClick={() => setCount(c => c + 1)}>\n        Clicks: {count}\n      </button>\n    </div>\n  );\n}`}
      </pre>
    ),
  },
  browser: {
    tabType: 'browser',
    title: 'Browser',
    icon: <IconBrowser />,
    minSize: 20,
    render: () => (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            borderBottom: '1px solid var(--sk-border)',
            background: 'var(--sk-bg)',
          }}
        >
          <button
            style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--sk-tab-fg)', padding: 4 }}
          >
            ‹
          </button>
          <button
            style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--sk-tab-fg)', padding: 4 }}
          >
            ›
          </button>
          <button
            style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--sk-tab-fg)', padding: 4 }}
          >
            ↻
          </button>
          <div
            style={{
              flex: 1,
              padding: '4px 10px',
              borderRadius: 6,
              background: 'rgba(0,0,0,0.04)',
              fontSize: 12,
              color: 'var(--sk-tab-fg)',
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            /
          </div>
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fff',
          }}
        >
          <button
            style={{
              padding: '8px 20px',
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              background: '#fff',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Clicks: 0
          </button>
        </div>
      </div>
    ),
  },
  console: {
    tabType: 'console',
    title: 'Console',
    icon: <IconConsole />,
    minSize: 15,
    render: () => (
      <div
        style={{
          padding: '12px 16px',
          fontFamily: 'ui-monospace, monospace',
          fontSize: 13,
          lineHeight: 1.6,
          color: 'var(--sk-tab-fg)',
          height: '100%',
          overflowY: 'auto',
        }}
      >
        <div>$ npm run dev</div>
        <div style={{ color: '#22c55e' }}>✓ ready in 248 ms</div>
        <div>→ http://localhost:5173</div>
      </div>
    ),
  },
  problems: {
    tabType: 'problems',
    title: 'Problems',
    icon: <IconProblems />,
    minSize: 15,
    render: () => (
      <div style={{ padding: '12px 16px', fontSize: 13 }}>
        <div style={{ color: '#22c55e' }}>0 errors, 0 warnings — looks good.</div>
      </div>
    ),
  },
  files: {
    tabType: 'files',
    title: 'Files',
    icon: <IconFiles />,
    minSize: 15,
    render: () => (
      <div style={{ padding: '8px 0', fontSize: 13 }}>
        {['package.json', 'index.html', 'index.tsx', 'styles.css', 'tsconfig.json'].map((f) => (
          <div
            key={f}
            style={{
              padding: '5px 16px',
              cursor: 'pointer',
              color: 'var(--sk-tab-fg-active)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{ color: 'var(--sk-tab-fg)', fontSize: 11 }}>
              {f.endsWith('.json') ? '{ }' : f.endsWith('.html') ? '<>' : '</>'}
            </span>
            {f}
          </div>
        ))}
      </div>
    ),
  },
  'editor-shortcuts': {
    tabType: 'editor-shortcuts',
    title: 'Editor shortcuts',
    icon: <IconShortcuts />,
    minSize: 15,
    render: () => (
      <div style={{ padding: '16px 20px', fontSize: 13, lineHeight: 1.8 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Keyboard shortcuts</div>
        {[
          ['Cmd+S', 'Save'],
          ['Cmd+Z', 'Undo'],
          ['Cmd+Shift+Z', 'Redo'],
          ['Cmd+/', 'Toggle comment'],
          ['Alt+↑/↓', 'Move line'],
        ].map(([key, desc]) => (
          <div key={key} style={{ display: 'flex', gap: 16, marginBottom: 4 }}>
            <code
              style={{
                minWidth: 120,
                padding: '1px 6px',
                borderRadius: 4,
                background: 'rgba(0,0,0,0.06)',
                fontFamily: 'ui-monospace, monospace',
              }}
            >
              {key}
            </code>
            <span style={{ color: 'var(--sk-tab-fg)' }}>{desc}</span>
          </div>
        ))}
      </div>
    ),
  },
  // Hidden placeholder — selecting a kind inside it converts this tab via
  // remove + add (see NewTabChooser below).
  'new-tab': {
    tabType: 'new-tab',
    title: 'New tab',
    availableInAddMenu: false,
    render: (descriptor, ctx) =>
      ctx ? <NewTabChooser placeholderId={descriptor.id} panelId={ctx.panelId} /> : null,
  },
};

/* Predefined file chips shown in the "Files" section of the new-tab chooser. */
const demoFiles: Array<{ descriptor: TabDescriptor; icon: ReactNode }> = [
  { descriptor: { id: 'file-pkg', tabType: 'editor', title: 'package.json' }, icon: <IconFileJson /> },
  { descriptor: { id: 'file-html', tabType: 'editor', title: 'index.html' }, icon: <IconFileHtml /> },
  { descriptor: { id: 'file-tsx', tabType: 'editor', title: 'index.tsx' }, icon: <IconFileTsx /> },
  { descriptor: { id: 'file-ts', tabType: 'editor', title: 'styles.css' }, icon: <IconFileHtml /> },
  { descriptor: { id: 'file-tsc', tabType: 'editor', title: 'tsconfig.json' }, icon: <IconFileJson /> },
];

/* -------------------------------------------------------------------------- */
/* New-tab chooser                                                             */
/* -------------------------------------------------------------------------- */

const NewTabChooser = ({
  placeholderId,
  panelId,
}: {
  placeholderId: string;
  panelId: string;
}) => {
  const registry = useTabRegistry();
  const { panel, addTab, removeTab } = usePanel(panelId);

  const tabChoices: TabRegistryEntry[] = Object.values(registry).filter(
    (e) => e.availableInAddMenu !== false,
  );

  const pick = (descriptor: TabDescriptor) => {
    if (!panel) return;
    const index = panel.tabs.findIndex((t) => t.id === placeholderId);
    // Ensure the new tab gets a unique id so multiple copies can coexist.
    const uniqueDescriptor: TabDescriptor = {
      ...descriptor,
      id: `${descriptor.tabType}-${Math.random().toString(36).slice(2, 8)}`,
    };
    // Add FIRST then remove the placeholder (removing first would delete the
    // panel if it was the only tab, making the subsequent addTab a no-op).
    addTab(uniqueDescriptor, { activate: true, index: index >= 0 ? index + 1 : undefined });
    removeTab(placeholderId);
  };

  const pickEntry = (entry: TabRegistryEntry) => {
    pick({ id: entry.tabType, tabType: entry.tabType, title: entry.title });
  };

  const sectionStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: 'var(--sk-tab-fg)',
    marginBottom: 10,
  };

  const chipStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    padding: '6px 12px',
    background: 'transparent',
    border: '1px solid var(--sk-border)',
    borderRadius: 999,
    color: 'var(--sk-tab-fg-active)',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: 13,
    whiteSpace: 'nowrap',
    transition: 'background 100ms, border-color 100ms',
  };

  return (
    <div style={{ padding: 24, overflowY: 'auto', height: '100%' }}>
      {/* Tabs section */}
      <div style={{ marginBottom: 24 }}>
        <div style={sectionStyle}>Tabs</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {tabChoices.map((entry) => (
            <button
              key={entry.tabType}
              type="button"
              onClick={() => pickEntry(entry)}
              style={chipStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {entry.icon && (
                <span style={{ display: 'inline-flex', color: 'var(--sk-tab-fg)' }}>
                  {entry.icon}
                </span>
              )}
              {entry.title}
            </button>
          ))}
        </div>
      </div>

      {/* Files section */}
      <div>
        <div style={sectionStyle}>Files</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {demoFiles.map((f) => (
            <button
              key={f.descriptor.title}
              type="button"
              onClick={() => pick(f.descriptor)}
              style={{ ...chipStyle, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ display: 'inline-flex', color: 'var(--sk-tab-fg)' }}>
                {f.icon}
              </span>
              {f.descriptor.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Tab strip rendering                                                         */
/* -------------------------------------------------------------------------- */

export const renderTab = ({ tab, tabProps, label, closable, close }: RenderTabProps) => (
  <button {...tabProps} type="button">
    {label}
    {closable && (
      <span
        role="button"
        aria-label={`Close ${tab.title}`}
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
        style={{ marginLeft: 6, opacity: 0.5, padding: '0 2px', borderRadius: 3 }}
      >
        ×
      </span>
    )}
  </button>
);

/* -------------------------------------------------------------------------- */
/* Panel chrome                                                                */
/* -------------------------------------------------------------------------- */

export const PanelChrome = ({ panel, style }: RenderPanelProps) => {
  const { toggleCollapse, addTab } = usePanel(panel.id);

  if (panel.collapsed) {
    return (
      <div
        style={{
          ...style,
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--sk-bg)',
          borderRight: '1px solid var(--sk-border)',
          cursor: 'pointer',
          display: 'flex',
        }}
        onClick={() => toggleCollapse()}
        title="Expand"
      >
        <span style={{ writingMode: 'vertical-rl', fontSize: 11, opacity: 0.55 }}>
          {panel.tabs[0]?.title ?? 'panel'}
        </span>
      </div>
    );
  }

  const addPlaceholder = () => {
    const id = `new-${Math.random().toString(36).slice(2, 8)}`;
    addTab({ id, tabType: 'new-tab', title: 'New tab' }, { activate: true });
  };

  return (
    <div style={{ ...style, display: 'flex', flexDirection: 'column' }}>
      <TabList
        panelId={panel.id}
        renderTab={renderTab}
        leading={
          <IconButton onClick={addPlaceholder} aria-label="New tab" title="New tab">
            <PlusIcon />
          </IconButton>
        }
        trailing={<ActionsMenu panelId={panel.id} maximized={!!panel.maximized} />}
      />
      <TabPanel panelId={panel.id} />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Actions menu                                                                */
/* -------------------------------------------------------------------------- */

interface MenuItem {
  key: string;
  label: string;
  icon: ReactNode;
  run: () => void;
  danger?: boolean;
}

const ActionsMenu = ({ panelId, maximized }: { panelId: string; maximized: boolean }) => {
  const { toggleCollapse, toggleMaximize, split, closePanel } = usePanel(panelId);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const items: MenuItem[] = [
    {
      key: 'maximize',
      label: maximized ? 'Restore' : 'Maximize',
      icon: <MaximizeIcon />,
      run: () => toggleMaximize(),
    },
    {
      key: 'collapse',
      label: 'Collapse',
      icon: <CollapseIcon />,
      run: () => toggleCollapse(),
    },
    {
      key: 'split-right',
      label: 'Split right',
      icon: <SplitRightIcon />,
      run: () => split('right'),
    },
    {
      key: 'split-down',
      label: 'Split down',
      icon: <SplitDownIcon />,
      run: () => split('bottom'),
    },
    {
      key: 'close-pane',
      label: 'Close pane',
      icon: <ClosePaneIcon />,
      run: () => closePanel(),
      danger: true,
    },
  ];

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <IconButton
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Panel actions"
        title="Panel actions"
      >
        ⋯
      </IconButton>
      {open && (
        <ul
          role="menu"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            margin: 0,
            marginTop: 4,
            padding: 4,
            listStyle: 'none',
            background: 'var(--sk-bg, #fff)',
            border: '1px solid var(--sk-border)',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
            minWidth: 200,
            zIndex: 100,
          }}
        >
          {items.map((item) => (
            <li key={item.key} role="none">
              <button
                role="menuitem"
                type="button"
                onClick={() => {
                  item.run();
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '7px 12px',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 0,
                  borderRadius: 7,
                  color: item.danger ? '#ef4444' : 'var(--sk-tab-fg-active)',
                  cursor: 'pointer',
                  font: 'inherit',
                  fontSize: 13,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = item.danger
                    ? 'rgba(239,68,68,0.06)'
                    : 'rgba(0,0,0,0.05)')
                }
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    width: 14,
                    height: 14,
                    color: item.danger ? '#ef4444' : 'var(--sk-tab-fg)',
                  }}
                >
                  {item.icon}
                </span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Primitives                                                                  */
/* -------------------------------------------------------------------------- */

const IconButton = ({
  children,
  ...rest
}: { children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...rest}
    type="button"
    style={{
      width: 28,
      height: 28,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      border: 0,
      borderRadius: 'var(--sk-radius, 6px)',
      color: 'var(--sk-tab-fg)',
      cursor: 'pointer',
      fontSize: 14,
      lineHeight: 1,
    }}
  >
    {children}
  </button>
);

export const StoryFrame = ({ children }: { children: ReactNode }) => (
  <div style={{ height: '100vh', width: '100vw', display: 'flex', overflow: 'hidden' }}>
    {children}
  </div>
);
