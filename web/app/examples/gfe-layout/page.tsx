'use client';

import { useRef, useState, useEffect } from 'react';
import {
  LayoutProvider,
  LayoutRoot,
  Resizer,
  TabList,
  TabPanel,
  usePanel,
  useTabRegistry,
  createPanel,
  createSplit,
  type RenderPanelProps,
  type RenderResizerProps,
  type TabDescriptor,
  type TabRegistryEntry,
} from 'react-splitkit';
import { demoRegistry } from '@/registry';
import { PageShell } from '@/components/PageShell';
import { LiveExample } from '@/components/LiveExample';
import { gfeFiles } from '@/lib/examples/gfe-layout';
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
} from '@/components/icons';

const layout = createSplit(
  'root',
  'horizontal',
  [
    createPanel('left', [
      { id: 'desc', tabType: 'description', title: 'Description' },
      { id: 'sol', tabType: 'solution', title: 'Solution' },
    ]),
    createSplit(
      'right',
      'vertical',
      [
        createPanel('code', [
          { id: 'files', tabType: 'files', title: 'Files' },
          { id: 'code', tabType: 'code', title: 'index.ts' },
        ]),
        createPanel('bottom', [
          { id: 'browser', tabType: 'browser', title: 'Browser' },
          { id: 'console', tabType: 'console', title: 'Console' },
        ]),
      ],
      [58, 42],
    ),
  ],
  [36, 64],
);

function useClickOutside(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, cb]);
}

const demoFiles: Array<{ descriptor: TabDescriptor; label: string }> = [
  { descriptor: { id: 'file-pkg', tabType: 'code', title: 'package.json' }, label: 'package.json' },
  { descriptor: { id: 'file-html', tabType: 'code', title: 'index.html' }, label: 'index.html' },
  { descriptor: { id: 'file-tsx', tabType: 'code', title: 'index.tsx' }, label: 'index.tsx' },
  { descriptor: { id: 'file-tsconfig', tabType: 'code', title: 'tsconfig.json' }, label: 'tsconfig.json' },
];

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
      id: `${descriptor.tabType}-${Math.random().toString(36).slice(2, 8)}`,
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
              className={`${chipCls} font-mono text-[12px]`}
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

const GFEChrome = ({ panel, style }: RenderPanelProps) => {
  const { toggleMaximize, toggleCollapse, split, closePanel } = usePanel(panel.id);
  const registry = useTabRegistry();
  const isMaximized = panel.maximized ?? false;

  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  useClickOutside(moreRef, () => setMoreOpen(false));

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
              const isActive = t.id === (panel as { activeTabId?: string }).activeTabId;
              const entry = registry[t.tabType];
              return (
                <span
                  key={t.id}
                  className={`inline-flex items-center gap-1.5 text-[13px] whitespace-nowrap ${
                    isActive
                      ? 'text-neutral-900 dark:text-neutral-50 font-medium'
                      : 'text-neutral-400 dark:text-neutral-500'
                  }`}
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
            className={`group inline-flex items-center gap-1.5 px-3 h-full text-[13px] select-none transition-colors border-b-2 -mb-px ${
              isActive
                ? 'border-neutral-900 dark:border-neutral-100 font-medium text-neutral-900 dark:text-neutral-50 bg-white dark:bg-neutral-900'
                : 'border-transparent text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
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
        const id = `new-${Math.random().toString(36).slice(2, 8)}`;
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

const GFEMenuItem = ({ icon, label, onClick, danger = false }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-[13px] transition-colors ${danger ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10' : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
  >
    <span className={danger ? 'text-red-400' : 'text-neutral-400 dark:text-neutral-500'}>{icon}</span>
    {label}
  </button>
);

const GFEResizer = (p: RenderResizerProps) => (
  <Resizer splitId={p.splitId} index={p.index} className="bg-transparent" />
);

export default function GFELayoutPage() {
  return (
    <PageShell
      title="GreatFrontend Layout"
      description="Coding-platform UI · description / editor / browser / console"
      source={<LiveExample files={gfeFiles} template="vite-react-ts" height={580} />}
    >
      <LayoutProvider initialLayout={layout} registry={demoRegistry}>
        <LayoutRoot
          renderPanel={(p) => <GFEChrome {...p} />}
          renderResizer={GFEResizer}
          style={{ height: '100%' }}
        />
      </LayoutProvider>
    </PageShell>
  );
}
