'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

const Sandpack = dynamic(
  () => import('@codesandbox/sandpack-react').then((m) => m.Sandpack),
  { ssr: false, loading: () => <Placeholder /> },
);

type SandpackTemplate = 'react-ts' | 'vite-react-ts';

interface LiveExampleProps {
  /** Map of file path → contents. The first key is the file shown by default. */
  files: Record<string, string>;
  /** Override or extend the default dependencies. `react-splitkit` is included by default. */
  dependencies?: Record<string, string>;
  /** Editor + preview height in px. Default 480. */
  height?: number;
  /** Split percentage for the editor. 50 means 50/50 split. */
  editorWidthPercentage?: number;
  /**
   * Sandpack template. Default 'react-ts' for the simple case.
   * Use 'vite-react-ts' when overriding /index.html (e.g. to inject a CDN script
   * like Tailwind) — Vite preserves external <script> tags reliably; CRA does not.
   */
  template?: SandpackTemplate;
}

const DEFAULT_DEPENDENCIES = {
  // Pulled from the npm registry inside Sandpack's in-browser bundler.
  // Use 'latest' so docs always reflect the current published API.
  'react-splitkit': 'latest',
};

export function LiveExample({
  files,
  dependencies,
  height = 480,
  editorWidthPercentage = 50,
  template = 'react-ts',
}: LiveExampleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const check = () =>
      setTheme(
        document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      );
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="my-6 not-prose">
      {visible ? (
        <Sandpack
          template={template}
          files={files}
          customSetup={{
            dependencies: { ...DEFAULT_DEPENDENCIES, ...dependencies },
          }}
          theme={theme}
          options={{
            editorHeight: height,
            editorWidthPercentage,
            showLineNumbers: true,
            showTabs: Object.keys(files).length > 1,
            showNavigator: false,
            showRefreshButton: true,
            wrapContent: true,
          }}
        />
      ) : (
        <Placeholder height={height} />
      )}
    </div>
  );
}

function Placeholder({ height = 480 }: { height?: number }) {
  return (
    <div
      className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 grid place-items-center text-sm text-neutral-500 dark:text-neutral-400"
      style={{ height }}
      aria-label="Interactive example loading"
    >
      <div className="flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
        Loading interactive example…
      </div>
    </div>
  );
}
