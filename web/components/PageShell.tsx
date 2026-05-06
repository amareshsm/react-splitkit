'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from './icons';
import { ThemeToggle } from './ThemeToggle';

interface PageShellProps {
  title: string;
  description?: string;
  children: ReactNode;
  bgClassName?: string;
}

export const PageShell = ({ title, description, children, bgClassName }: PageShellProps) => (
  <div className={`min-h-screen flex flex-col ${bgClassName ?? 'bg-neutral-100 dark:bg-neutral-950'}`}>
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/70 backdrop-blur flex-shrink-0">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-md text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeftIcon width={14} height={14} />
            Back
          </Link>
          <span className="h-5 w-px bg-neutral-200 dark:bg-neutral-800" />
          <div>
            <h1 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">{title}</h1>
            {description && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{description}</p>
            )}
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
    <main className="flex-1 min-h-0 p-4 md:p-6">
      <div className="max-w-7xl mx-auto h-[calc(100vh-7rem)]">{children}</div>
    </main>
  </div>
);
