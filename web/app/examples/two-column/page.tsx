'use client';

import { useRef, useState, useEffect } from 'react';
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
import { CloseIcon, MoreIcon, SplitRightIcon, SplitDownIcon, MaximizeIcon, RestoreIcon } from '@/components/icons';
import { usePanel } from 'react-splitkit';

// ── content ────────────────────────────────────────────────

const notes = [
  { id: 1, title: 'Weekly sync notes', body: 'Discussed Q3 roadmap, aligned on priorities for the auth refactor. Need to follow up with design on the new onboarding flow.', tag: 'Work', time: '2 min ago' },
  { id: 2, title: 'React patterns', body: 'Compound components, render props, custom hooks — documenting patterns worth reusing across the codebase.', tag: 'Dev', time: '1 hr ago' },
  { id: 3, title: 'Book notes: SICP', body: 'Chapter 3 covers mutable state. The idea that "sameness" is complicated by mutation is worth revisiting.', tag: 'Reading', time: 'Yesterday' },
  { id: 4, title: 'Grocery list', body: 'Oat milk, sourdough, cherry tomatoes, mozzarella, olive oil, pasta. Check the freezer before buying chicken.', tag: 'Personal', time: '2 days ago' },
];

const tagColor: Record<string, string> = {
  Work: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  Dev: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  Reading: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  Personal: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
};

const AllNotesContent = () => {
  const [active, setActive] = useState(1);
  return (
    <div className="h-full flex flex-col bg-white dark:bg-neutral-900 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
        <input
          readOnly
          placeholder="Search notes…"
          className="flex-1 h-7 px-3 rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-[13px] text-neutral-500 placeholder-neutral-400 focus:outline-none"
        />
      </div>
      <div className="flex-1 overflow-auto divide-y divide-neutral-100 dark:divide-neutral-800">
        {notes.map((n) => (
          <div
            key={n.id}
            onClick={() => setActive(n.id)}
            className={`px-4 py-3 cursor-pointer transition-colors ${active === n.id ? 'bg-violet-50 dark:bg-violet-500/10' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/60'}`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className={`text-[13px] font-medium ${active === n.id ? 'text-violet-700 dark:text-violet-300' : 'text-neutral-900 dark:text-neutral-50'}`}>{n.title}</span>
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500 ml-2 shrink-0">{n.time}</span>
            </div>
            <p className="text-[12px] text-neutral-500 dark:text-neutral-400 leading-5 line-clamp-2">{n.body}</p>
            <span className={`mt-1.5 inline-block text-[10px] font-medium px-1.5 py-0.5 rounded ${tagColor[n.tag]}`}>{n.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const FavoritesContent = () => (
  <div className="h-full flex flex-col items-center justify-center gap-3 bg-white dark:bg-neutral-900 text-neutral-400 dark:text-neutral-500">
    <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
    <p className="text-sm">No favourites yet</p>
    <p className="text-xs max-w-[200px] text-center">Star a note to pin it here for quick access.</p>
  </div>
);

const PreviewContent = () => {
  const note = notes[0];
  return (
    <div className="h-full overflow-auto bg-white dark:bg-neutral-900 px-8 py-6">
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${tagColor[note.tag]}`}>{note.tag}</span>
        <span className="text-[11px] text-neutral-400 dark:text-neutral-500">{note.time}</span>
      </div>
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-4">{note.title}</h1>
      <p className="text-[14px] leading-7 text-neutral-600 dark:text-neutral-400 mb-6">{note.body}</p>
      <hr className="border-neutral-100 dark:border-neutral-800 mb-6" />
      <div className="space-y-2">
        {['- Align on auth timeline with backend team', '- Share Figma link with design review', '- Update onboarding ticket with new specs'].map((line) => (
          <p key={line} className="text-[13px] leading-6 text-neutral-600 dark:text-neutral-400 font-mono">{line}</p>
        ))}
      </div>
    </div>
  );
};

const HistoryContent = () => {
  const entries = [
    { action: 'Edited', note: 'Weekly sync notes', time: '2 min ago', color: 'bg-blue-500' },
    { action: 'Created', note: 'React patterns', time: '1 hr ago', color: 'bg-emerald-500' },
    { action: 'Deleted', note: 'Old todo list', time: '3 hr ago', color: 'bg-red-400' },
    { action: 'Edited', note: 'Book notes: SICP', time: 'Yesterday', color: 'bg-blue-500' },
    { action: 'Created', note: 'Grocery list', time: '2 days ago', color: 'bg-emerald-500' },
    { action: 'Edited', note: 'Book notes: SICP', time: '3 days ago', color: 'bg-blue-500' },
  ];
  return (
    <div className="h-full overflow-auto bg-white dark:bg-neutral-900 px-4 py-4">
      <p className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400 dark:text-neutral-500 mb-4 px-2">Recent activity</p>
      <div className="relative pl-7">
        <div className="absolute left-[18px] top-2 bottom-2 w-px bg-neutral-100 dark:bg-neutral-800" />
        <div className="space-y-4">
          {entries.map((e, i) => (
            <div key={i} className="relative">
              <div className={`absolute -left-4 top-1.5 w-2 h-2 rounded-full ${e.color}`} />
              <p className="text-[13px] text-neutral-700 dark:text-neutral-200">
                {e.action} <span className="font-medium">{e.note}</span>
              </p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">{e.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── registry ───────────────────────────────────────────────

const noteRegistry: TabRegistry = {
  'all-notes':  { tabType: 'all-notes',  title: 'All Notes',  render: () => <AllNotesContent /> },
  favorites:    { tabType: 'favorites',  title: 'Favourites', render: () => <FavoritesContent /> },
  preview:      { tabType: 'preview',    title: 'Preview',    render: () => <PreviewContent /> },
  history:      { tabType: 'history',    title: 'History',    render: () => <HistoryContent /> },
};

// ── layout ─────────────────────────────────────────────────

const layout = createSplit('root', 'horizontal', [
  createPanel('left', [
    { id: 'all', tabType: 'all-notes', title: 'All Notes' },
    { id: 'fav', tabType: 'favorites', title: 'Favourites' },
  ], 'all'),
  createPanel('right', [
    { id: 'prev', tabType: 'preview', title: 'Preview' },
    { id: 'hist', tabType: 'history', title: 'History' },
  ], 'prev'),
]);

// ── chrome ─────────────────────────────────────────────────

function useClickOutside(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, cb]);
}

const NoteChrome = ({ panel, style }: RenderPanelProps) => {
  const { toggleMaximize, split } = usePanel(panel.id);
  const isMaximized = panel.maximized ?? false;
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  useClickOutside(moreRef, () => setMoreOpen(false));

  return (
    <div
      style={style}
      className="flex flex-col border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden"
    >
      <TabList
        panelId={panel.id}
        className="flex items-stretch h-9 bg-neutral-50 dark:bg-neutral-950/60 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0"
        trailing={
          <div ref={moreRef} className="relative flex items-center pl-1 pr-2">
            <button
              type="button"
              aria-label="More options"
              onClick={() => setMoreOpen((v) => !v)}
              className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:text-neutral-600 dark:hover:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
            >
              <MoreIcon width={14} height={14} />
            </button>
            {moreOpen && (
              <div className="absolute top-full right-0 mt-1 z-50 min-w-[168px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg py-1">
                {[
                  { icon: <SplitRightIcon />, label: 'Split right', action: () => split('right') },
                  { icon: <SplitDownIcon />, label: 'Split down', action: () => split('bottom') },
                  null,
                  { icon: isMaximized ? <RestoreIcon /> : <MaximizeIcon />, label: isMaximized ? 'Restore' : 'Maximize', action: toggleMaximize },
                ].map((item, i) =>
                  item === null ? (
                    <div key={i} className="my-1 border-t border-neutral-100 dark:border-neutral-800" />
                  ) : (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => { item.action(); setMoreOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-[13px] text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <span className="text-neutral-400 dark:text-neutral-500">{item.icon}</span>
                      {item.label}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        }
        renderTab={({ isActive, tabProps, label, closable, close }) => (
          <div
            {...tabProps}
            role="tab"
            className={`group inline-flex items-center gap-1.5 h-full px-3 text-[13px] cursor-pointer select-none transition-colors border-b-2 -mb-px ${
              isActive
                ? 'border-neutral-900 dark:border-neutral-100 font-medium text-neutral-900 dark:text-neutral-50 bg-white dark:bg-neutral-900'
                : 'border-transparent text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <span>{label}</span>
            {closable && (
              <span
                role="button"
                aria-label="Close tab"
                onClick={(e) => { e.stopPropagation(); close(); }}
                className="opacity-0 group-hover:opacity-100 rounded p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-opacity"
              >
                <CloseIcon width={11} height={11} />
              </span>
            )}
          </div>
        )}
      />
      <div className="flex-1 min-h-0 relative">
        <TabPanel
          panelId={panel.id}
          mode="mount-all-hide-inactive"
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
          className="flex flex-col"
        />
      </div>
    </div>
  );
};

const NoteResizer = (p: RenderResizerProps) => (
  <Resizer
    splitId={p.splitId}
    index={p.index}
    className="bg-transparent hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
  />
);

export default function TwoColumnPage() {
  return (
    <PageShell
      title="Two-column split"
      description="Notes app layout · drag the divider to resize"
      bgClassName="bg-neutral-50 dark:bg-neutral-950"
    >
      <LayoutProvider initialLayout={layout} registry={noteRegistry}>
        <LayoutRoot
          renderPanel={(p) => <NoteChrome {...p} />}
          renderResizer={NoteResizer}
        />
      </LayoutProvider>
    </PageShell>
  );
}
