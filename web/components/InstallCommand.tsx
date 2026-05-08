'use client';

import { useState } from 'react';

const managers = [
  { label: 'npm', cmd: 'npm install react-splitkit' },
  { label: 'pnpm', cmd: 'pnpm add react-splitkit' },
  { label: 'yarn', cmd: 'yarn add react-splitkit' },
  { label: 'bun', cmd: 'bun add react-splitkit' },
] as const;

export function InstallCommand() {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(managers[active].cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-10 inline-flex flex-col rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 px-3 pt-2 gap-1">
        {managers.map((m, i) => (
          <button
            key={m.label}
            type="button"
            onClick={() => setActive(i)}
            className={`relative px-3 py-1.5 text-xs font-semibold rounded-t transition-colors ${
              active === i
                ? 'text-neutral-900 dark:text-white'
                : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300'
            }`}
          >
            {m.label}
            {active === i && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-neutral-900 dark:bg-white" />
            )}
          </button>
        ))}
      </div>

      {/* Command row */}
      <div className="flex items-center gap-3 pl-4 pr-2 h-11">
        <span className="text-neutral-400 dark:text-neutral-500 text-sm select-none font-mono">$</span>
        <code className="text-sm font-mono text-neutral-700 dark:text-neutral-200 flex-1">{managers[active].cmd}</code>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy install command"
          className="flex items-center justify-center w-8 h-8 rounded-lg text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
        >
          {copied ? (
            <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 4 6 11 3 8" />
            </svg>
          ) : (
            <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="5" width="9" height="9" rx="1.5" />
              <path d="M11 5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
