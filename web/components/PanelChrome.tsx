'use client';

import { useRef, useState, useEffect } from 'react';
import {
  usePanel,
  TabList,
  TabPanel,
  TabAddMenu,
  type RenderPanelProps,
} from 'react-splitkit';
import { PlusIcon, MoreIcon, CloseIcon, SplitRightIcon, SplitDownIcon, MaximizeIcon, RestoreIcon } from './icons';

function useClickOutside(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, cb]);
}

export const PanelChrome = ({ panel, style }: RenderPanelProps) => {
  const { toggleMaximize, split } = usePanel(panel.id);
  const isMaximized = panel.maximized ?? false;

  const [addOpen, setAddOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const addRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useClickOutside(addRef, () => setAddOpen(false));
  useClickOutside(moreRef, () => setMoreOpen(false));

  return (
    <div
      style={style}
      className="flex flex-col rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm"
    >
      <TabList
        panelId={panel.id}
        className="flex items-stretch h-10 bg-neutral-50 dark:bg-neutral-950/60 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0"
        leading={
          <div ref={addRef} className="relative flex items-center pl-2 pr-1">
            <button
              type="button"
              aria-label="Add tab"
              onClick={() => { setAddOpen((v) => !v); setMoreOpen(false); }}
              className="p-1 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200 dark:text-neutral-600 dark:hover:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
            >
              <PlusIcon />
            </button>
            {addOpen && (
              <TabAddMenu
                panelId={panel.id}
                render={(items) => (
                  <div className="absolute top-full left-0 mt-1 z-50 min-w-[160px] rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg py-1">
                    {items.length === 0 && (
                      <span className="block px-3 py-2 text-xs text-neutral-400">No tabs available</span>
                    )}
                    {items.map(({ entry, alreadyAdded, add }) => (
                      <button
                        key={entry.tabType}
                        type="button"
                        disabled={alreadyAdded}
                        onClick={() => { add(); setAddOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[13px] text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {entry.title}
                        {alreadyAdded && <span className="ml-auto text-[10px] text-neutral-400">added</span>}
                      </button>
                    ))}
                  </div>
                )}
              />
            )}
          </div>
        }
        trailing={
          <div ref={moreRef} className="relative flex items-center pl-1 pr-2">
            <button
              type="button"
              aria-label="More options"
              onClick={() => { setMoreOpen((v) => !v); setAddOpen(false); }}
              className="p-1 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200 dark:text-neutral-600 dark:hover:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
            >
              <MoreIcon />
            </button>
            {moreOpen && (
              <div className="absolute top-full right-0 mt-1 z-50 min-w-[168px] rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg py-1">
                <MenuItem icon={<SplitRightIcon />} label="Split right" onClick={() => { split('right'); setMoreOpen(false); }} />
                <MenuItem icon={<SplitDownIcon />} label="Split down" onClick={() => { split('bottom'); setMoreOpen(false); }} />
                <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />
                <MenuItem
                  icon={isMaximized ? <RestoreIcon /> : <MaximizeIcon />}
                  label={isMaximized ? 'Restore panel' : 'Maximize panel'}
                  onClick={() => { toggleMaximize(); setMoreOpen(false); }}
                />
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

const MenuItem = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-[13px] text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
  >
    <span className="text-neutral-500 dark:text-neutral-400">{icon}</span>
    {label}
  </button>
);
