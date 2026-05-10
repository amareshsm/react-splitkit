// Sandpack files for the GreatFrontend Layout example.
// Mirrors /examples/gfe-layout/page.tsx + web/registry.tsx (the shared demo
// registry). Same chrome (collapse / maximize / split / close pane / new-tab
// chooser), same content (Description, Code, Browser, Console, etc.).

const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>GreatFrontend Layout — react-splitkit</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      /* Structural rules for react-splitkit's tablist slots — see comment in
         the nested example for full context. */
      [data-panel-tablist-leading],
      [data-panel-tablist-trailing] {
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }
      [data-panel-tablist-trailing] { margin-left: auto; }
      [data-panel-tablist-items] {
        display: flex;
        align-items: stretch;
        flex: 1 1 auto;
        min-width: 0;
        overflow-x: auto;
        overflow-y: hidden;
        scrollbar-width: none;
      }
      [data-panel-tablist-items]::-webkit-scrollbar { display: none; }
    </style>
  </head>
  <body class="bg-neutral-100 dark:bg-neutral-950">
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
`;

const appCode = `import {
  LayoutProvider,
  LayoutRoot,
  Resizer,
  createPanel,
  createSplit,
  type RenderResizerProps,
} from 'react-splitkit';
import { GFEChrome } from './GFEChrome';
import { demoRegistry } from './registry';

// ── layout shape ──────────────────────────────────────────────
// Left: description / solution. Right: editor on top, browser/console below.
const layout = createSplit('root', 'horizontal', [
  createPanel('left', [
    { id: 'desc', tabType: 'description', title: 'Description' },
    { id: 'sol',  tabType: 'solution',    title: 'Solution' },
  ]),
  createSplit('right', 'vertical', [
    createPanel('code', [
      { id: 'files', tabType: 'files', title: 'Files' },
      { id: 'code',  tabType: 'code',  title: 'index.ts' },
    ]),
    createPanel('bottom', [
      { id: 'browser', tabType: 'browser', title: 'Browser' },
      { id: 'console', tabType: 'console', title: 'Console' },
    ]),
  ], [58, 42]),
], [36, 64]);

const GFEResizer = (p: RenderResizerProps) => (
  <Resizer splitId={p.splitId} index={p.index} className="bg-transparent" />
);

export default function App() {
  return (
    <div className="h-screen p-3 bg-neutral-100 dark:bg-neutral-950">
      <LayoutProvider initialLayout={layout} registry={demoRegistry}>
        <LayoutRoot
          renderPanel={(p) => <GFEChrome {...p} />}
          renderResizer={GFEResizer}
          style={{ height: '100%' }}
        />
      </LayoutProvider>
    </div>
  );
}
`;

const gfeChromeCode = `import { useRef, useState, useEffect, type RefObject, type ReactNode } from 'react';
import {
  TabList,
  TabPanel,
  usePanel,
  useTabRegistry,
  type RenderPanelProps,
  type TabDescriptor,
  type TabRegistryEntry,
} from 'react-splitkit';
import { demoRegistry } from './registry';
import {
  CloseIcon,
  CollapseIcon,
  FileIcon,
  FolderIcon,
  MoreIcon,
  MaximizeIcon,
  RestoreIcon,
  SplitRightIcon,
  SplitDownIcon,
} from './icons';

function useClickOutside(ref: RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, cb]);
}

const demoFiles: Array<{ descriptor: TabDescriptor; label: string }> = [
  { descriptor: { id: 'file-pkg',      tabType: 'code', title: 'package.json' },  label: 'package.json' },
  { descriptor: { id: 'file-html',     tabType: 'code', title: 'index.html' },    label: 'index.html' },
  { descriptor: { id: 'file-tsx',      tabType: 'code', title: 'index.tsx' },     label: 'index.tsx' },
  { descriptor: { id: 'file-tsconfig', tabType: 'code', title: 'tsconfig.json' }, label: 'tsconfig.json' },
];

// Full-panel chooser shown when the user clicks "+ New tab" — replaces a
// placeholder tab with whichever real tab type the user picks.
const NewTabChooser = ({ placeholderId, panelId }: { placeholderId: string; panelId: string }) => {
  const registry = useTabRegistry();
  const { panel, addTab, removeTab } = usePanel(panelId);

  const choices: TabRegistryEntry[] = Object.values(registry).filter(
    (e) => e.availableInAddMenu !== false,
  );

  const pick = (descriptor: TabDescriptor) => {
    if (!panel) return;
    const index = panel.tabs.findIndex((t) => t.id === placeholderId);
    const unique: TabDescriptor = {
      ...descriptor,
      id: \`\${descriptor.tabType}-\${Math.random().toString(36).slice(2, 8)}\`,
    };
    addTab(unique, { activate: true, index: index >= 0 ? index + 1 : undefined });
    removeTab(placeholderId);
  };

  const pickEntry = (entry: TabRegistryEntry) =>
    pick({ id: entry.tabType, tabType: entry.tabType, title: entry.title });

  const chipCls =
    'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 text-[13px] text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer bg-white dark:bg-neutral-900';

  return (
    <div className="h-full overflow-y-auto p-6 bg-white dark:bg-neutral-900">
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
          Tabs
        </p>
        <div className="flex flex-wrap gap-2">
          {choices.map((entry) => (
            <button key={entry.tabType} type="button" onClick={() => pickEntry(entry)} className={chipCls}>
              {entry.renderLabel?.({ id: entry.tabType, tabType: entry.tabType, title: entry.title }) ?? entry.title}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
          Files
        </p>
        <div className="flex flex-wrap gap-2">
          {demoFiles.map((f) => (
            <button
              key={f.descriptor.title}
              type="button"
              onClick={() => pick(f.descriptor)}
              className={\`\${chipCls} font-mono text-[12px]\`}
            >
              <span className="text-neutral-400 dark:text-neutral-500">
                {f.label.endsWith('.json') ? <FolderIcon width={13} height={13} /> : <FileIcon width={13} height={13} />}
              </span>
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const GFEChrome = ({ panel, style }: RenderPanelProps) => {
  const { toggleMaximize, toggleCollapse, split, closePanel } = usePanel(panel.id);
  const registry = useTabRegistry();
  const isMaximized = panel.maximized ?? false;

  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  useClickOutside(moreRef, () => setMoreOpen(false));

  // Collapsed view: a thin strip with the tab labels and a chevron to expand.
  if (panel.collapsed) {
    return (
      <div
        style={style}
        className="flex flex-col rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm"
      >
        <div
          className="flex items-center h-[42px] px-4 bg-white dark:bg-neutral-900 cursor-pointer select-none"
          onClick={() => toggleCollapse()}
          title="Expand panel"
        >
          <div className="flex items-center gap-5 min-w-0 flex-1 overflow-hidden">
            {panel.tabs.map((t) => {
              const isActive = t.id === panel.activeTabId;
              const entry = registry[t.tabType];
              return (
                <span
                  key={t.id}
                  className={\`inline-flex items-center gap-1.5 text-[13px] whitespace-nowrap \${
                    isActive ? 'text-neutral-900 dark:text-neutral-50 font-medium' : 'text-neutral-400 dark:text-neutral-500'
                  }\`}
                >
                  {isActive && entry?.renderLabel ? entry.renderLabel(t) : t.title}
                </span>
              );
            })}
          </div>
          <svg className="flex-shrink-0 ml-3 text-neutral-400 dark:text-neutral-500" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
            <path d="m7 15 5 5 5-5" />
            <path d="m7 9 5-5 5 5" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div
      style={style}
      className="flex flex-col rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm"
    >
      <TabList
        panelId={panel.id}
        className="flex items-stretch h-[38px] border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0 bg-neutral-50 dark:bg-neutral-950/50"
        leading={<AddTabButton panelId={panel.id} />}
        trailing={
          <div ref={moreRef} className="relative flex items-center px-1.5">
            <button
              type="button"
              aria-label="More options"
              onClick={() => setMoreOpen((v) => !v)}
              className="w-7 h-7 flex items-center justify-center rounded text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
            >
              <MoreIcon />
            </button>
            {moreOpen && (
              <div className="absolute top-full right-0 mt-1 z-50 min-w-[192px] rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg py-1.5 overflow-hidden">
                <GFEMenuItem icon={isMaximized ? <RestoreIcon /> : <MaximizeIcon />} label={isMaximized ? 'Restore' : 'Maximize'} onClick={() => { toggleMaximize(); setMoreOpen(false); }} />
                <GFEMenuItem icon={<CollapseIcon />} label="Collapse" onClick={() => { toggleCollapse(); setMoreOpen(false); }} />
                <div className="my-1 mx-2 border-t border-neutral-100 dark:border-neutral-800" />
                <GFEMenuItem icon={<SplitRightIcon />} label="Split right" onClick={() => { split('right'); setMoreOpen(false); }} />
                <GFEMenuItem icon={<SplitDownIcon />} label="Split down" onClick={() => { split('bottom'); setMoreOpen(false); }} />
                <div className="my-1 mx-2 border-t border-neutral-100 dark:border-neutral-800" />
                <GFEMenuItem icon={<CloseIcon width={13} height={13} />} label="Close pane" danger onClick={() => { closePanel(); setMoreOpen(false); }} />
              </div>
            )}
          </div>
        }
        renderTab={({ isActive, tabProps, label, closable, close }) => (
          <button
            {...tabProps}
            type="button"
            className={\`group inline-flex items-center gap-1.5 px-3 h-full text-[13px] select-none transition-colors border-b-2 -mb-px \${
              isActive
                ? 'border-neutral-900 dark:border-neutral-100 font-medium text-neutral-900 dark:text-neutral-50 bg-white dark:bg-neutral-900'
                : 'border-transparent text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }\`}
          >
            <span>{label}</span>
            {closable && (
              <span role="button" aria-label="Close tab" onClick={(e) => { e.stopPropagation(); close(); }} className="opacity-50 rounded p-0.5 hover:opacity-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-opacity">
                <CloseIcon width={11} height={11} />
              </span>
            )}
          </button>
        )}
      />
      <div className="flex-1 min-h-0 relative">
        <TabPanel
          panelId={panel.id}
          mode="mount-all-hide-inactive"
          style={{ position: 'absolute', inset: 0 }}
          className="flex flex-col overflow-hidden"
          renderContent={(tab, ctx) => {
            // Replace the placeholder 'new-tab' tab with the chooser UI; otherwise
            // delegate to the registry's render function.
            if (tab.tabType === 'new-tab') {
              return <NewTabChooser placeholderId={tab.id} panelId={ctx.panelId} />;
            }
            const entry = demoRegistry[tab.tabType];
            return entry?.render(tab, ctx) ?? null;
          }}
        />
      </div>
    </div>
  );
};

const AddTabButton = ({ panelId }: { panelId: string }) => {
  const { addTab } = usePanel(panelId);
  return (
    <button
      type="button"
      aria-label="New tab"
      onClick={() => {
        const id = \`new-\${Math.random().toString(36).slice(2, 8)}\`;
        addTab({ id, tabType: 'new-tab', title: 'New tab' }, { activate: true });
      }}
      className="flex items-center justify-center w-[30px] h-[30px] mx-1.5 my-auto rounded-full border border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
    >
      <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round">
        <path d="M8 3v10M3 8h10" />
      </svg>
    </button>
  );
};

const GFEMenuItem = ({ icon, label, onClick, danger = false }: { icon: ReactNode; label: string; onClick: () => void; danger?: boolean }) => (
  <button
    type="button"
    onClick={onClick}
    className={\`w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-[13px] transition-colors \${
      danger ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10' : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
    }\`}
  >
    <span className={danger ? 'text-red-400' : 'text-neutral-400 dark:text-neutral-500'}>{icon}</span>
    {label}
  </button>
);
`;

const registryCode = `import type { ReactNode } from 'react';
import type { TabRegistry } from 'react-splitkit';
import {
  BookIcon,
  BulbIcon,
  ConsoleIcon,
  DatabaseIcon,
  FileIcon,
  FlaskIcon,
  FolderIcon,
  GlobeIcon,
  KeyboardIcon,
  PlayIcon,
  SparkleIcon,
} from './icons';

const Label = ({ icon, children }: { icon: ReactNode; children: ReactNode }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className="opacity-70">{icon}</span>
    {children}
  </span>
);

const DescriptionContent = () => (
  <div className="h-full overflow-auto px-6 py-5 text-[14px] leading-6 text-neutral-700 dark:text-neutral-300">
    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-1">Debounce</h2>
    <div className="flex items-center gap-3 mb-5 text-xs text-neutral-500 dark:text-neutral-400">
      <span className="inline-flex gap-1">
        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 font-mono">JS</span>
        <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 font-mono">TS</span>
      </span>
      <span>·</span>
      <span className="text-amber-600 dark:text-amber-400">Medium</span>
      <span>·</span>
      <span>15 mins</span>
    </div>
    <p className="mb-3">
      Debouncing is a technique used to control how many times we allow a function
      to be executed over time. When a JavaScript function is debounced with a
      wait time of X milliseconds, it must wait until after X milliseconds have
      elapsed since the debounced function was last called.
    </p>
    <p>
      You almost certainly have encountered debouncing in your daily lives before
      (e.g. when entering an elevator). Only after X duration of not pressing the
      "Door open" button (the debounced function not being called) will the
      elevator door close.
    </p>
  </div>
);

const Line = ({ n, indent, highlight, children }: { n: number; indent: number; highlight?: boolean; children: ReactNode }) => (
  <div className={\`flex \${highlight ? 'bg-white/5' : ''}\`}>
    <span className="select-none w-10 pr-3 text-right text-neutral-500/70">{n}</span>
    <span style={{ paddingLeft: indent * 8 }} className="text-neutral-200">{children}</span>
  </div>
);

const CodeContent = () => (
  <div className="h-full overflow-auto bg-[#0d1117] text-[13px] font-mono leading-6">
    <pre className="px-4 py-3">
      <Line n={1} indent={0}><span className="text-pink-400">export function</span> <span className="text-sky-300">debounce</span>(func, wait) {'{'}</Line>
      <Line n={2} indent={2}><span className="text-pink-400">let</span> timerId = <span className="text-amber-300">null</span>;</Line>
      <Line n={3} indent={2}><span className="text-pink-400">return function</span> (...args) {'{'}</Line>
      <Line n={4} indent={4}><span className="text-pink-400">if</span> (timerId !== <span className="text-amber-300">null</span>) <span className="text-sky-300">clearTimeout</span>(timerId);</Line>
      <Line n={5} indent={4}>timerId = <span className="text-sky-300">setTimeout</span>(() {'=> func.call(this, ...args), wait);'}</Line>
      <Line n={6} indent={2}>{'};'}</Line>
      <Line n={7} indent={0}>{'}'}</Line>
    </pre>
  </div>
);

const TestCasesContent = () => (
  <div className="h-full grid place-items-center bg-white dark:bg-neutral-900">
    <div className="flex flex-col items-center text-center max-w-xs px-6">
      <div className="w-14 h-14 grid place-items-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 mb-4">
        <FlaskIcon width={26} height={26} />
      </div>
      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">Test your code</h3>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Run your code with custom test cases before submitting.
      </p>
      <button type="button" className="mt-5 inline-flex items-center gap-1.5 px-4 h-9 rounded-full border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-medium text-neutral-800 dark:text-neutral-100 transition-colors">
        <PlayIcon width={12} height={12} /> Run
      </button>
    </div>
  </div>
);

const ConsoleContent = () => (
  <div className="h-full bg-[#0d1117] text-[12.5px] font-mono leading-5 overflow-auto px-4 py-3">
    <div className="text-emerald-400">› build successful</div>
    <div className="text-neutral-400">› watching for changes…</div>
    <div className="text-amber-400">! deprecation warning at line 42</div>
    <div className="text-neutral-400">› ready in 248ms</div>
    <div className="text-sky-300 mt-2">$ <span className="text-neutral-200">npm test</span></div>
    <div className="text-neutral-400">› running 67 tests</div>
    <div className="text-emerald-400">✓ all tests passed (812ms)</div>
  </div>
);

const FilesContent = () => (
  <div className="h-full overflow-auto px-2 py-3 text-sm bg-white dark:bg-neutral-900">
    <div className="px-2 mb-2 text-[11px] uppercase tracking-wider font-semibold text-neutral-500 dark:text-neutral-400">Project</div>
    {[
      ['src',            true],
      ['  index.ts',     false],
      ['  utils.ts',     false],
      ['  registry.tsx', false],
      ['package.json',   false],
      ['README.md',      false],
      ['tsconfig.json',  false],
    ].map(([name, isFolder]) => (
      <div key={String(name)} className="flex items-center gap-2 px-2 h-7 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-default text-neutral-700 dark:text-neutral-200">
        <span className="text-neutral-400">{isFolder ? <FolderIcon /> : <FileIcon />}</span>
        <span className="font-mono text-[13px]">{name}</span>
      </div>
    ))}
  </div>
);

const PreviewContent = () => (
  <div className="h-full grid place-items-center bg-gradient-to-br from-violet-50 via-white to-pink-50 dark:from-violet-950/40 dark:via-neutral-900 dark:to-pink-950/40">
    <div className="flex flex-col items-center text-center">
      <div className="w-12 h-12 grid place-items-center rounded-full bg-white/70 dark:bg-neutral-900/70 backdrop-blur shadow-sm text-violet-500 mb-3">
        <SparkleIcon width={22} height={22} />
      </div>
      <div className="text-base font-semibold text-neutral-900 dark:text-neutral-50">Live preview</div>
      <div className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Renders here on every save.</div>
    </div>
  </div>
);

const BrowserContent = () => (
  <div className="h-full flex flex-col bg-white dark:bg-neutral-900">
    <div className="flex items-center gap-1.5 px-3 h-10 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0 bg-neutral-50 dark:bg-neutral-950/50">
      <div className="flex-1 h-6 px-3 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[12px] text-neutral-500 dark:text-neutral-400 flex items-center">/</div>
    </div>
    <div className="flex-1 overflow-auto p-4">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-700 dark:text-neutral-200">Clicks: 0</div>
    </div>
  </div>
);

const shortcuts = [
  { label: 'Cut line (empty selection)',  keys: ['⌘', 'X'] },
  { label: 'Copy line (empty selection)', keys: ['⌘', 'C'] },
  { label: 'Delete line',                 keys: ['⇧', '⌘', 'K'] },
  { label: 'Undo',                        keys: ['⌘', 'Z'] },
  { label: 'Redo',                        keys: ['⇧', '⌘', 'Z'] },
  { label: 'Indent line',                 keys: ['⌘', ']'] },
  { label: 'Outdent line',                keys: ['⌘', '['] },
  { label: 'Move line down',              keys: ['⌥', '↓'] },
  { label: 'Move line up',                keys: ['⌥', '↑'] },
  { label: 'Toggle line comment',         keys: ['⌘', '/'] },
];

const EditorShortcutsContent = () => (
  <div className="h-full overflow-auto px-6 py-5 text-sm text-neutral-700 dark:text-neutral-300">
    <p className="mb-4 leading-6">
      GreatFrontEnd uses Monaco Editor, the same code editor used in Visual Studio Code (VS Code).
    </p>
    <div className="border-t border-neutral-200 dark:border-neutral-800">
      {shortcuts.map(({ label, keys }) => (
        <div key={label} className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-800/60">
          <span className="text-neutral-700 dark:text-neutral-200">{label}</span>
          <span className="flex items-center gap-1">
            {keys.map((k) => (
              <kbd key={k} className="inline-flex items-center justify-center min-w-[22px] h-5 px-1 rounded text-[11px] font-mono text-neutral-500 dark:text-neutral-400">{k}</kbd>
            ))}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const SavedCodeContent = () => (
  <div className="h-full overflow-auto bg-[#0d1117] text-[13px] font-mono leading-6">
    <pre className="px-4 py-3">
      <Line n={1} indent={0}><span className="text-neutral-500">// Saved at 2024-04-12 21:42</span></Line>
      <Line n={2} indent={0}><span className="text-pink-400">export function</span> <span className="text-sky-300">debounce</span>(func, wait) {'{'}</Line>
      <Line n={3} indent={2}><span className="text-pink-400">let</span> id = <span className="text-amber-300">null</span>;</Line>
      <Line n={4} indent={2}><span className="text-pink-400">return</span> (...args) {'=> {'}</Line>
      <Line n={5} indent={4}><span className="text-sky-300">clearTimeout</span>(id);</Line>
      <Line n={6} indent={4}>id = <span className="text-sky-300">setTimeout</span>(() {'=> func(...args), wait);'}</Line>
      <Line n={7} indent={2}>{'};'}</Line>
      <Line n={8} indent={0}>{'}'}</Line>
    </pre>
  </div>
);

const SolutionPreviewContent = () => (
  <div className="h-full flex flex-col bg-white dark:bg-neutral-900">
    <div className="flex items-center gap-1.5 px-3 h-10 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0 bg-neutral-50 dark:bg-neutral-950/50">
      <div className="flex-1 h-6 px-3 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[12px] text-neutral-500 dark:text-neutral-400 flex items-center">/solution</div>
    </div>
    <div className="flex-1 grid place-items-center">
      <div className="text-sm text-neutral-500 dark:text-neutral-400">Solution preview renders here.</div>
    </div>
  </div>
);

export const demoRegistry: TabRegistry = {
  description:        { tabType: 'description',        title: 'Description',        minSize: 20, renderLabel: () => <Label icon={<BookIcon />}>Description</Label>,                render: () => <DescriptionContent /> },
  code:               { tabType: 'code',               title: 'Code',               minSize: 20, renderLabel: (tab) => <Label icon={<FileIcon />}>{tab.title}</Label>,           render: () => <CodeContent /> },
  testCases:          { tabType: 'testCases',          title: 'Test cases',         renderLabel: () => <Label icon={<FlaskIcon />}>Test cases</Label>,                            render: () => <TestCasesContent /> },
  console:            { tabType: 'console',            title: 'Console',            renderLabel: () => <Label icon={<ConsoleIcon />}>Console</Label>,                             render: () => <ConsoleContent /> },
  files:              { tabType: 'files',              title: 'Files',              renderLabel: () => <Label icon={<FolderIcon />}>Files</Label>,                                render: () => <FilesContent /> },
  preview:            { tabType: 'preview',            title: 'Preview',            renderLabel: () => <Label icon={<SparkleIcon />}>Preview</Label>,                             render: () => <PreviewContent /> },
  solution: {
    tabType: 'solution',
    title: 'Solution',
    renderLabel: () => <Label icon={<BulbIcon />}>Solution</Label>,
    render: () => (
      <div className="h-full px-6 py-5 text-sm text-neutral-700 dark:text-neutral-300 overflow-auto">
        <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50 mb-2">Approach</h3>
        <p>Use a closure to retain the latest <code>timerId</code>. On every call, clear the previous timeout and schedule a new one so the wrapped function only fires once activity has settled.</p>
      </div>
    ),
  },
  browser:            { tabType: 'browser',            title: 'Browser',            renderLabel: () => <Label icon={<GlobeIcon />}>Browser</Label>,                               render: () => <BrowserContent /> },
  'editor-shortcuts': { tabType: 'editor-shortcuts',   title: 'Editor shortcuts',   renderLabel: () => <Label icon={<KeyboardIcon />}>Editor shortcuts</Label>,                  render: () => <EditorShortcutsContent /> },
  'saved-code':       { tabType: 'saved-code',         title: 'Saved code',         renderLabel: (tab) => <Label icon={<DatabaseIcon />}>{tab.title}</Label>,                    render: () => <SavedCodeContent /> },
  'solution-preview': { tabType: 'solution-preview',   title: 'Solution preview',   renderLabel: (tab) => <Label icon={<SparkleIcon />}>{tab.title}</Label>,                     render: () => <SolutionPreviewContent /> },
  'new-tab':          { tabType: 'new-tab',            title: 'New tab',            availableInAddMenu: false,                                                                    render: () => null },
};
`;

const iconsCode = `import type { SVGProps } from 'react';

const base = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const CloseIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M18 6 6 18M6 6l12 12" /></svg>
);

export const MoreIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" />
  </svg>
);

export const PlayIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><polygon points="6 4 20 12 6 20 6 4" fill="currentColor" /></svg>
);

export const FlaskIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M9 3h6" />
    <path d="M10 3v6.4L4.5 18.6A1 1 0 0 0 5.36 20h13.28a1 1 0 0 0 .86-1.4L14 9.4V3" />
  </svg>
);

export const ConsoleIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="m7 9 3 3-3 3M13 15h4" />
  </svg>
);

export const FileIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  </svg>
);

export const BookIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z" /></svg>
);

export const BulbIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M9 18h6" /><path d="M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .8 1.6V17h5.4v-1.5c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3z" />
  </svg>
);

export const FolderIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
);

export const SparkleIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
  </svg>
);

export const CollapseIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} width={14} height={14} {...p}>
    <path d="m15 9-3-3-3 3" /><path d="m15 15-3 3-3-3" />
    <line x1="12" y1="6" x2="12" y2="18" />
  </svg>
);

export const SplitRightIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} width={14} height={14} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="12" y1="3" x2="12" y2="21" />
  </svg>
);

export const SplitDownIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} width={14} height={14} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="12" x2="21" y2="12" />
  </svg>
);

export const MaximizeIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} width={14} height={14} {...p}>
    <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

export const RestoreIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} width={14} height={14} {...p}>
    <polyline points="8 3 3 3 3 8" /><polyline points="21 16 21 21 16 21" />
    <line x1="3" y1="3" x2="10" y2="10" /><line x1="21" y1="21" x2="14" y2="14" />
  </svg>
);

export const KeyboardIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" />
  </svg>
);

export const DatabaseIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
    <path d="M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6" />
  </svg>
);

export const GlobeIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3c-2.5 2.5-4 6-4 9s1.5 6.5 4 9M12 3c2.5 2.5 4 6 4 9s-1.5 6.5-4 9M3 12h18" />
  </svg>
);
`;

export const gfeFiles = {
  '/App.tsx': appCode,
  '/GFEChrome.tsx': gfeChromeCode,
  '/registry.tsx': registryCode,
  '/icons.tsx': iconsCode,
  '/index.html': indexHtml,
};
