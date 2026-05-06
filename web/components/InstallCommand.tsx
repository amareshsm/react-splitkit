'use client';

import { useState } from 'react';

export function InstallCommand() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText('npm install react-splitkit');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-10 inline-flex items-center gap-3 pl-4 pr-2 h-11 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
      <span className="text-neutral-400 dark:text-neutral-500 text-sm select-none font-mono">$</span>
      <code className="text-sm font-mono text-neutral-700 dark:text-neutral-200">npm install react-splitkit</code>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy install command"
        className="ml-1 flex items-center justify-center w-8 h-8 rounded-lg text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
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
  );
}
