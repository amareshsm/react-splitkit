'use client';

import { useState } from 'react';
import {
  LayoutProvider,
  LayoutRoot,
  Resizer,
  TabList,
  TabPanel,
  createPanel,
  createSplit,
  type RenderPanelProps,
  type RenderResizerProps,
  type TabRegistry,
} from 'react-splitkit';
import { PageShell } from '@/components/PageShell';
import { LiveExample } from '@/components/LiveExample';
import { cursorFiles } from '@/lib/examples/cursor-ui';
import { CloseIcon, FileIcon, FolderIcon } from '@/components/icons';

// ── layout shape ────────────────────────────────────────────

const layout = createSplit(
  'root',
  'horizontal',
  [
    createPanel('explorer', [
      { id: 'files', tabType: 'explorer', title: 'Explorer', closable: false },
    ]),
    createSplit(
      'center',
      'vertical',
      [
        createPanel(
          'editor',
          [
            { id: 'pkg-root', tabType: 'editor', title: 'package.json' },
            { id: 'index-ts', tabType: 'editor', title: 'index.ts' },
            { id: 'pkg-web', tabType: 'editor', title: 'package.json (web)' },
          ],
          'pkg-web',
        ),
        createPanel(
          'terminal',
          [
            { id: 'problems', tabType: 'problems', title: 'Problems' },
            { id: 'output', tabType: 'output', title: 'Output' },
            { id: 'term', tabType: 'terminal', title: 'Terminal' },
            { id: 'ports', tabType: 'ports', title: 'Ports' },
          ],
          'term',
        ),
      ],
      [70, 30],
    ),
    createPanel('agent', [
      { id: 'agent-chat', tabType: 'agent', title: 'New Agent', closable: false },
    ]),
  ],
  [16, 60, 24],
);

// ── content components ──────────────────────────────────────

const fileTree = [
  { name: '.claude', type: 'folder', depth: 0 },
  { name: '.storybook', type: 'folder', depth: 0 },
  { name: 'dist', type: 'folder', depth: 0 },
  { name: 'node_modules', type: 'folder', depth: 0 },
  { name: 'src', type: 'folder', depth: 0, open: true },
  { name: 'components', type: 'folder', depth: 1 },
  { name: 'core', type: 'folder', depth: 1 },
  { name: 'hooks', type: 'folder', depth: 1 },
  { name: 'state', type: 'folder', depth: 1 },
  { name: 'index.ts', type: 'file', depth: 1 },
  { name: 'stories', type: 'folder', depth: 0 },
  { name: 'tests', type: 'folder', depth: 0 },
  { name: 'web', type: 'folder', depth: 0, open: true },
  { name: 'app', type: 'folder', depth: 1 },
  { name: 'components', type: 'folder', depth: 1 },
  { name: 'content', type: 'folder', depth: 1 },
  { name: 'lib', type: 'folder', depth: 1 },
  { name: 'next.config.ts', type: 'file', depth: 1 },
  { name: 'package.json', type: 'file', depth: 1 },
  { name: 'tsconfig.json', type: 'file', depth: 1 },
  { name: '.gitignore', type: 'file', depth: 0 },
  { name: '.npmrc', type: 'file', depth: 0 },
  { name: 'eslint.config.js', type: 'file', depth: 0 },
  { name: 'LICENSE', type: 'file', depth: 0 },
  { name: 'package.json', type: 'file', depth: 0 },
  { name: 'README.md', type: 'file', depth: 0 },
  { name: 'tsconfig.json', type: 'file', depth: 0 },
  { name: 'tsup.config.ts', type: 'file', depth: 0 },
  { name: 'vitest.config.ts', type: 'file', depth: 0 },
] as const;

const ExplorerContent = () => (
  <div className="h-full overflow-auto bg-neutral-50 dark:bg-neutral-950 text-[12px]">
    <div className="px-3 pt-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
      React-splitkit
    </div>
    <div className="pb-4">
      {fileTree.map((node, i) => (
        <div
          key={i}
          className="flex items-center gap-1.5 px-3 h-[22px] hover:bg-neutral-200/60 dark:hover:bg-neutral-800/70 cursor-pointer text-neutral-700 dark:text-neutral-300"
          style={{ paddingLeft: `${12 + node.depth * 14}px` }}
        >
          {node.type === 'folder' ? (
            <>
              <svg
                width={10}
                height={10}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                className={`text-neutral-400 dark:text-neutral-500 transition-transform ${('open' in node && node.open) ? 'rotate-90' : ''}`}
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
              <FolderIcon width={12} height={12} className="text-blue-500/80 dark:text-blue-400/80" />
            </>
          ) : (
            <>
              <span className="w-[10px]" />
              <FileIcon width={12} height={12} className="text-neutral-400 dark:text-neutral-500" />
            </>
          )}
          <span className="truncate">{node.name}</span>
        </div>
      ))}
    </div>
  </div>
);

const editorContent: Record<string, { lang: string; lines: Array<{ no: number; text: string; tone?: 'comment' | 'keyword' | 'string' | 'fn' | 'plain' }> }> = {
  'pkg-root': {
    lang: 'json',
    lines: [
      { no: 1, text: '{' },
      { no: 2, text: '  "name": "react-splitkit",', tone: 'string' },
      { no: 3, text: '  "version": "0.1.0",', tone: 'string' },
      { no: 4, text: '  "description": "Headless layouts",', tone: 'string' },
      { no: 5, text: '  "main": "./dist/index.cjs",', tone: 'string' },
      { no: 6, text: '  "module": "./dist/index.js",', tone: 'string' },
      { no: 7, text: '  "types": "./dist/index.d.ts",', tone: 'string' },
      { no: 8, text: '  "license": "MIT",', tone: 'string' },
      { no: 9, text: '  "workspaces": ["web"]', tone: 'string' },
      { no: 10, text: '}' },
    ],
  },
  'index-ts': {
    lang: 'ts',
    lines: [
      { no: 1, text: '// Public entry — re-exports the headless API', tone: 'comment' },
      { no: 2, text: 'export * from "./core/types";' },
      { no: 3, text: 'export * from "./core/tree";' },
      { no: 4, text: 'export * from "./core/registry";' },
      { no: 5, text: 'export * from "./state/store";' },
      { no: 6, text: 'export * from "./state/context";' },
      { no: 7, text: 'export * from "./hooks/useLayout";' },
      { no: 8, text: 'export * from "./hooks/usePanel";' },
      { no: 9, text: 'export * from "./components/LayoutRoot";' },
      { no: 10, text: 'export * from "./components/TabList";' },
      { no: 11, text: 'export * from "./components/TabPanel";' },
      { no: 12, text: 'export * from "./components/Resizer";' },
    ],
  },
  'pkg-web': {
    lang: 'json',
    lines: [
      { no: 1, text: '{' },
      { no: 2, text: '  "name": "react-splitkit-web",', tone: 'string' },
      { no: 3, text: '  "version": "0.0.1",', tone: 'string' },
      { no: 4, text: '  "private": true,', tone: 'keyword' },
      { no: 5, text: '  "scripts": {' },
      { no: 6, text: '    "dev": "next dev --turbopack",', tone: 'string' },
      { no: 7, text: '    "build": "next build"', tone: 'string' },
      { no: 8, text: '  },' },
      { no: 9, text: '  "dependencies": {' },
      { no: 10, text: '    "next": "^15.3.0",', tone: 'string' },
      { no: 11, text: '    "react": "^18.3.0",', tone: 'string' },
      { no: 12, text: '    "react-splitkit": "*"', tone: 'string' },
      { no: 13, text: '  }' },
      { no: 14, text: '}' },
    ],
  },
};

const toneClass: Record<string, string> = {
  comment: 'text-neutral-400 dark:text-neutral-500',
  keyword: 'text-purple-600 dark:text-purple-400',
  string: 'text-emerald-600 dark:text-emerald-400',
  fn: 'text-blue-600 dark:text-blue-400',
  plain: 'text-neutral-700 dark:text-neutral-200',
};

const EditorContent = ({ tabId }: { tabId: string }) => {
  const file = editorContent[tabId];
  if (!file) {
    return (
      <div className="h-full grid place-items-center bg-white dark:bg-neutral-950 text-neutral-400 text-[13px]">
        No content
      </div>
    );
  }
  return (
    <div className="h-full overflow-auto bg-white dark:bg-neutral-950 font-mono text-[13px] leading-[20px]">
      <pre className="py-3">
        {file.lines.map((line) => (
          <div key={line.no} className="flex hover:bg-neutral-50 dark:hover:bg-neutral-900/50 px-0">
            <span className="w-12 pr-4 text-right text-neutral-300 dark:text-neutral-600 select-none">
              {line.no}
            </span>
            <span className={`${line.tone ? toneClass[line.tone] : 'text-neutral-700 dark:text-neutral-200'}`}>
              {line.text || ' '}
            </span>
          </div>
        ))}
      </pre>
    </div>
  );
};

const TerminalContent = () => (
  <div className="h-full overflow-auto bg-neutral-50 dark:bg-neutral-950 font-mono text-[12.5px] leading-[18px] px-4 py-3 text-neutral-700 dark:text-neutral-300">
    <div>amaresh@workstation react-splitkit % <span className="text-neutral-500">npm run build</span></div>
    <div className="text-neutral-500">&nbsp;</div>
    <div>&gt; react-splitkit@0.1.0 build</div>
    <div>&gt; tsup</div>
    <div className="text-neutral-500">&nbsp;</div>
    <div className="text-blue-500 dark:text-blue-400">CLI <span className="text-neutral-500">Building entry: src/index.ts</span></div>
    <div className="text-blue-500 dark:text-blue-400">CLI <span className="text-neutral-500">Using tsconfig: tsconfig.json</span></div>
    <div className="text-blue-500 dark:text-blue-400">CLI <span className="text-neutral-500">tsup v8.5.1</span></div>
    <div className="text-blue-500 dark:text-blue-400">CLI <span className="text-neutral-500">Target: es2020</span></div>
    <div className="text-emerald-600 dark:text-emerald-400">ESM <span className="text-neutral-500">dist/index.js     32.4 kB</span></div>
    <div className="text-emerald-600 dark:text-emerald-400">CJS <span className="text-neutral-500">dist/index.cjs    34.1 kB</span></div>
    <div className="text-emerald-600 dark:text-emerald-400">DTS <span className="text-neutral-500">dist/index.d.ts   12.7 kB</span></div>
    <div className="text-neutral-500">&nbsp;</div>
    <div className="text-emerald-600 dark:text-emerald-400">⚡️ Build success in 642ms</div>
    <div className="text-neutral-500">&nbsp;</div>
    <div>amaresh@workstation react-splitkit % <span className="text-neutral-700 dark:text-neutral-200 animate-pulse">▌</span></div>
  </div>
);

const ProblemsContent = () => (
  <div className="h-full grid place-items-center bg-neutral-50 dark:bg-neutral-950 text-neutral-400 dark:text-neutral-500 text-[13px]">
    No problems have been detected in the workspace.
  </div>
);

const OutputContent = () => (
  <div className="h-full overflow-auto bg-neutral-50 dark:bg-neutral-950 font-mono text-[12px] leading-[18px] px-4 py-3 text-neutral-500">
    <div>[Info  - 14:32:01] Initializing TypeScript language service…</div>
    <div>[Info  - 14:32:02] TypeScript Server: 5.6.0</div>
    <div>[Info  - 14:32:02] Loaded 312 files, ready.</div>
    <div>[Info  - 14:34:18] Reanalyzing project after edit (web/app/page.tsx).</div>
    <div>[Info  - 14:34:18] Diagnostics computed in 84ms.</div>
  </div>
);

const PortsContent = () => (
  <div className="h-full overflow-auto bg-neutral-50 dark:bg-neutral-950 text-[13px] px-4 py-3 text-neutral-700 dark:text-neutral-300">
    <div className="grid grid-cols-3 gap-4 text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 pb-2 border-b border-neutral-200 dark:border-neutral-800">
      <span>Port</span><span>Process</span><span>URL</span>
    </div>
    <div className="grid grid-cols-3 gap-4 py-2">
      <span className="font-mono">3000</span>
      <span>next dev</span>
      <span className="text-blue-600 dark:text-blue-400 truncate">localhost:3000</span>
    </div>
    <div className="grid grid-cols-3 gap-4 py-2">
      <span className="font-mono">6006</span>
      <span>storybook</span>
      <span className="text-neutral-400 dark:text-neutral-500">— not running</span>
    </div>
  </div>
);

const AgentMessages = [
  {
    role: 'user',
    text: 'what is react-splitkit and how is it built?',
  },
  {
    role: 'agent',
    text: 'react-splitkit is a headless React layout library for IDE-style multi-pane UIs. The whole layout is a serializable tree of two node types — SplitNode (a container with direction + children + sizes) and PanelNode (a leaf with tabs). Mutations go through a pure reducer wrapped in a Zustand store, so you can split, resize, add/move tabs, collapse, and maximize without touching the DOM.',
  },
  {
    role: 'user',
    text: 'does it handle custom UI? I want my own tab and panel design.',
  },
  {
    role: 'agent',
    text: 'Yes — it\'s fully headless. The library ships zero CSS and no opinionated markup. You pass renderPanel and renderTab functions and return whatever JSX you want. The library only handles state, ARIA, keyboard, and resize math. You own every pixel — Tailwind, CSS Modules, or plain CSS, your choice.',
  },
];

const AgentContent = () => (
  <div className="h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
    <div className="flex-1 overflow-auto px-4 py-4 space-y-4">
      {AgentMessages.map((m, i) => (
        <div key={i} className="space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            {m.role === 'user' ? 'You' : 'Agent'}
          </div>
          <div
            className={`text-[13px] leading-5 rounded-lg p-3 ${
              m.role === 'user'
                ? 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-100'
                : 'text-neutral-700 dark:text-neutral-300'
            }`}
          >
            {m.text}
          </div>
        </div>
      ))}
    </div>
    <div className="flex-shrink-0 border-t border-neutral-200 dark:border-neutral-800 p-3">
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-2.5">
        <div className="text-[13px] text-neutral-400 dark:text-neutral-500 px-1.5 pb-2">
          Plan, Build, / for commands, @ for context
        </div>
        <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 px-1.5">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">
              <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="9" />
              </svg>
              Agent
            </span>
            <span>Auto</span>
          </span>
          <span className="inline-flex items-center gap-2 text-neutral-400 dark:text-neutral-500">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
              <path d="M12 2v20M2 12h20" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  </div>
);

// ── registry ────────────────────────────────────────────────

const registry: TabRegistry = {
  explorer: {
    tabType: 'explorer',
    title: 'Explorer',
    render: () => <ExplorerContent />,
  },
  editor: {
    tabType: 'editor',
    title: 'Editor',
    render: (tab) => <EditorContent tabId={tab.id} />,
  },
  problems: {
    tabType: 'problems',
    title: 'Problems',
    render: () => <ProblemsContent />,
  },
  output: {
    tabType: 'output',
    title: 'Output',
    render: () => <OutputContent />,
  },
  terminal: {
    tabType: 'terminal',
    title: 'Terminal',
    render: () => <TerminalContent />,
  },
  ports: {
    tabType: 'ports',
    title: 'Ports',
    render: () => <PortsContent />,
  },
  agent: {
    tabType: 'agent',
    title: 'New Agent',
    closable: false,
    render: () => <AgentContent />,
  },
};

// ── panel chrome ────────────────────────────────────────────

const editorPanelIds = new Set(['editor']);
const terminalPanelIds = new Set(['terminal']);

const CursorChrome = ({ panel, style }: RenderPanelProps) => {
  const isEditor = editorPanelIds.has(panel.id);
  const isTerminal = terminalPanelIds.has(panel.id);
  const isExplorer = panel.id === 'explorer';
  const isAgent = panel.id === 'agent';

  // Sidebar panels (explorer, agent) get a simple header
  if (isExplorer) {
    return (
      <div
        style={style}
        className="flex flex-col bg-neutral-50 dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 overflow-hidden"
      >
        <div className="flex-shrink-0 h-9 flex items-center justify-between px-3 border-b border-neutral-200 dark:border-neutral-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Explorer
          </span>
        </div>
        <div className="flex-1 min-h-0">
          <ExplorerContent />
        </div>
      </div>
    );
  }

  if (isAgent) {
    return (
      <div
        style={style}
        className="flex flex-col bg-neutral-50 dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800 overflow-hidden"
      >
        <div className="flex-shrink-0 h-9 flex items-center justify-between px-3 border-b border-neutral-200 dark:border-neutral-800">
          <span className="text-[12px] font-semibold text-neutral-700 dark:text-neutral-200">
            New Agent
          </span>
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500">sandbox · 1h ago</span>
        </div>
        <div className="flex-1 min-h-0">
          <AgentContent />
        </div>
      </div>
    );
  }

  // Editor + terminal panels: full tab chrome
  return (
    <div
      style={style}
      className={`flex flex-col bg-white dark:bg-neutral-950 overflow-hidden ${
        isTerminal ? 'border-t border-neutral-200 dark:border-neutral-800' : ''
      }`}
    >
      <TabList
        panelId={panel.id}
        className={`flex items-stretch h-9 flex-shrink-0 ${
          isEditor
            ? 'bg-neutral-50 dark:bg-neutral-900/40 border-b border-neutral-200 dark:border-neutral-800'
            : 'bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800'
        }`}
        renderTab={({ tab, isActive, tabProps, label, closable, close }) => (
          <div
            {...tabProps}
            role="tab"
            className={`group inline-flex items-center gap-1.5 h-full px-3 text-[12px] cursor-pointer select-none transition-colors ${
              isEditor
                ? isActive
                  ? 'bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 border-r border-neutral-200 dark:border-neutral-800'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-100 border-r border-neutral-200 dark:border-neutral-800'
                : isActive
                  ? 'text-neutral-900 dark:text-neutral-50 border-b-2 border-neutral-900 dark:border-neutral-100 -mb-px font-medium'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-100 border-b-2 border-transparent -mb-px'
            }`}
          >
            {isEditor && (
              <FileIcon
                width={11}
                height={11}
                className={
                  tab.title.endsWith('.json')
                    ? 'text-amber-500'
                    : tab.title.endsWith('.ts') || tab.title.endsWith('.tsx')
                      ? 'text-blue-500'
                      : 'text-neutral-400'
                }
              />
            )}
            <span>{label}</span>
            {closable && (
              <span
                role="button"
                aria-label="Close tab"
                onClick={(e) => {
                  e.stopPropagation();
                  close();
                }}
                className="ml-1 rounded p-0.5 text-neutral-400 dark:text-neutral-500 opacity-60 hover:opacity-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-200 transition-all"
              >
                <CloseIcon width={12} height={12} />
              </span>
            )}
          </div>
        )}
      />
      <div className="flex-1 min-h-0 relative">
        <TabPanel
          panelId={panel.id}
          mode="mount-all-hide-inactive"
          style={{ position: 'absolute', inset: 0 }}
          className="flex flex-col"
        />
      </div>
    </div>
  );
};

const CursorResizer = (p: RenderResizerProps) => (
  <Resizer
    splitId={p.splitId}
    index={p.index}
    className="bg-transparent hover:bg-blue-500/30 transition-colors"
  />
);

// ── status bar ──────────────────────────────────────────────

const StatusBar = () => {
  const [branch] = useState('main');
  return (
    <div className="flex-shrink-0 h-6 flex items-center justify-between px-3 bg-neutral-100 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1">
          <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="6" cy="6" r="3" />
            <circle cx="18" cy="6" r="3" />
            <circle cx="12" cy="18" r="3" />
            <path d="M6 9v6a3 3 0 0 0 3 3h6" />
          </svg>
          {branch}
        </span>
        <span>0 errors · 0 warnings</span>
      </div>
      <div className="flex items-center gap-3">
        <span>UTF-8</span>
        <span>TypeScript React</span>
        <span>Ln 1, Col 1</span>
      </div>
    </div>
  );
};

export default function CursorUIPage() {
  return (
    <PageShell
      title="Cursor UI layout"
      description="IDE clone · file explorer + editor + terminal + AI agent — all resizable"
      bgClassName="bg-white dark:bg-neutral-950"
      source={<LiveExample files={cursorFiles} template="vite-react-ts" height={600} />}
    >
      <div className="h-full flex flex-col rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-950 shadow-sm">
        <div className="flex-1 min-h-0">
          <LayoutProvider initialLayout={layout} registry={registry}>
            <LayoutRoot
              renderPanel={(p) => <CursorChrome {...p} />}
              renderResizer={CursorResizer}
              style={{ height: '100%' }}
            />
          </LayoutProvider>
        </div>
        <StatusBar />
      </div>
    </PageShell>
  );
}
