'use client';

import { useEffect, useState } from 'react';
import { Highlight, themes, type PrismTheme } from 'prism-react-renderer';

const code = `import { createSplit, createPanel, LayoutProvider, LayoutRoot } from 'react-splitkit';

const layout = createSplit('root', 'horizontal', [
  createPanel('left',  [{ id: 'a', tabType: 'editor'  }]),
  createPanel('right', [{ id: 'b', tabType: 'preview' }]),
]);

const registry = {
  editor:  { tabType: 'editor',  render: () => <Editor />  },
  preview: { tabType: 'preview', render: () => <Preview /> },
};

export default function App() {
  return (
    <LayoutProvider initialLayout={layout} registry={registry}>
      <LayoutRoot renderPanel={({ panel }) => <Panel panel={panel} />} />
    </LayoutProvider>
  );
}`;

const HighlightBlock = ({ theme, bg }: { theme: PrismTheme; bg: string }) => (
  <Highlight code={code} language="tsx" theme={theme}>
    {({ tokens, getLineProps, getTokenProps }) => (
      <pre
        className="overflow-x-auto text-[13px] leading-[1.7] font-mono px-5 py-5 m-0"
        style={{ background: bg }}
      >
        {tokens.map((line, i) => {
          const { key: _lk, ...lineProps } = getLineProps({ line });
          void _lk;
          return (
            <div key={i} {...lineProps} style={{ ...lineProps.style, minHeight: '1em' }}>
              {line.map((token, j) => {
                const { key: _tk, ...tokenProps } = getTokenProps({ token });
                void _tk;
                return <span key={j} {...tokenProps} />;
              })}
            </div>
          );
        })}
      </pre>
    )}
  </Highlight>
);

function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();

    // ThemeToggle directly mutates document.documentElement.classList — watch it.
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

export function CodeBlock() {
  const isDark = useDarkMode();

  return (
    <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-lg shadow-neutral-900/5 dark:shadow-black/40">
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#161b22]">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-3 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">App.tsx</span>
      </div>
      <HighlightBlock
        theme={isDark ? themes.oneDark : themes.github}
        bg={isDark ? '#0d1117' : '#ffffff'}
      />
    </div>
  );
}
