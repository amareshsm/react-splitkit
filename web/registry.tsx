import type { ReactNode } from 'react';
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
} from '@/components/icons';

const Label = ({ icon, children }: { icon: ReactNode; children: ReactNode }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className="opacity-70">{icon}</span>
    {children}
  </span>
);

const DescriptionContent = () => (
  <div className="h-full overflow-auto px-6 py-5 text-[14px] leading-6 text-neutral-700 dark:text-neutral-300">
    <div className="flex items-center gap-2 mb-1">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Debounce</h2>
    </div>
    <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-4">
      <span className="inline-grid place-items-center w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-300">
        <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </span>
      <span className="font-medium text-neutral-700 dark:text-neutral-200">Amaresh S M</span>
      <span>· Front-end engineer</span>
    </div>
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
      &quot;Door open&quot; button (the debounced function not being called) will
      the elevator door close.
    </p>
  </div>
);

const Line = ({ n, indent, highlight, children }: { n: number; indent: number; highlight?: boolean; children: ReactNode }) => (
  <div className={`flex ${highlight ? 'bg-white/5' : ''}`}>
    <span className="select-none w-10 pr-3 text-right text-neutral-500/70">{n}</span>
    <span style={{ paddingLeft: indent * 8 }} className="text-neutral-200">{children}</span>
  </div>
);

const CodeContent = () => (
  <div className="h-full overflow-auto bg-[#0d1117] text-[13px] font-mono leading-6">
    <pre className="px-4 py-3">
      <Line n={20} indent={2}><span className="text-pink-400">if</span> (timerId === <span className="text-amber-300">null</span>) {'{'}</Line>
      <Line n={21} indent={4} highlight><span className="text-pink-400">return</span>;</Line>
      <Line n={22} indent={2}>{'}'}</Line>
      <Line n={23} indent={2}><span className="text-sky-300">clearTimeout</span>(timerId);</Line>
      <Line n={24} indent={2}>fnArgs = <span className="text-amber-300">null</span>;</Line>
      <Line n={25} indent={2}>thisArgs = <span className="text-amber-300">null</span>;</Line>
      <Line n={26} indent={0}>{'};'}</Line>
      <Line n={27} indent={0}>{' '}</Line>
      <Line n={28} indent={0}>debounced.<span className="text-violet-300">flush</span> = <span className="text-pink-400">function</span> () {'{'}</Line>
      <Line n={29} indent={2}><span className="text-pink-400">if</span> (timerId === <span className="text-amber-300">null</span>) {'{'}</Line>
      <Line n={30} indent={4}><span className="text-pink-400">return</span>;</Line>
      <Line n={31} indent={2}>{'}'}</Line>
      <Line n={32} indent={2}><span className="text-sky-300">clearTimeout</span>(timerId);</Line>
      <Line n={33} indent={2}><span className="text-sky-300">func</span>.<span className="text-violet-300">call</span>(thisArgs, ...fnArgs);</Line>
      <Line n={34} indent={0}>{'};'}</Line>
      <Line n={35} indent={0}><span className="text-pink-400">return</span> debounced;</Line>
      <Line n={36} indent={0}>{'}'}</Line>
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
        Run your code with <span className="underline decoration-dotted">custom test cases</span> before submitting.
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
    {[['src', true], ['  index.ts', false], ['  utils.ts', false], ['  registry.tsx', false], ['package.json', false], ['README.md', false], ['tsconfig.json', false]].map(([name, isFolder]) => (
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
      <button type="button" className="p-1 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
        <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round"><path d="M10 12 6 8l4-4"/></svg>
      </button>
      <button type="button" className="p-1 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
        <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round"><path d="M6 12l4-4-4-4"/></svg>
      </button>
      <button type="button" className="p-1 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
        <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round"><path d="M13 8A5 5 0 1 1 8 3"/><path d="M13 3v5h-5"/></svg>
      </button>
      <div className="flex-1 h-6 px-3 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[12px] text-neutral-500 dark:text-neutral-400 flex items-center">/</div>
    </div>
    <div className="flex-1 overflow-auto p-4">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-700 dark:text-neutral-200">Clicks: 0</div>
    </div>
  </div>
);

const shortcuts = [
  { label: 'Cut line (empty selection)', keys: ['⌘', 'X'] },
  { label: 'Copy line (empty selection)', keys: ['⌘', 'C'] },
  { label: 'Delete line', keys: ['⇧', '⌘', 'K'] },
  { label: 'Undo', keys: ['⌘', 'Z'] },
  { label: 'Redo', keys: ['⇧', '⌘', 'Z'] },
  { label: 'Jump to matching bracket', keys: ['⇧', '⌘', '\\'] },
  { label: 'Indent line', keys: ['⌘', ']'] },
  { label: 'Outdent line', keys: ['⌘', '['] },
  { label: 'Move line down', keys: ['⌥', '↓'] },
  { label: 'Move line up', keys: ['⌥', '↑'] },
  { label: 'Copy line down', keys: ['⇧', '⌥', '↓'] },
  { label: 'Copy line up', keys: ['⇧', '⌥', '↑'] },
  { label: 'Add selection to next match', keys: ['⌘', 'D'] },
  { label: 'Select current line', keys: ['⌘', 'L'] },
  { label: 'Toggle line comment', keys: ['⌘', '/'] },
];

const EditorShortcutsContent = () => (
  <div className="h-full overflow-auto px-6 py-5 text-sm text-neutral-700 dark:text-neutral-300">
    <p className="mb-4 leading-6">
      GreatFrontEnd uses Monaco Editor, the same code editor used in Visual Studio Code (VS Code).
      Most editor shortcuts in VS Code should work here as well.
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
      <Line n={1} indent={0}><span className="text-pink-400">export function</span> <span className="text-sky-300">debounce</span>{'<T extends (...args: unknown[]) => void>('}</Line>
      <Line n={2} indent={2}><span className="text-orange-300">func</span>: T,</Line>
      <Line n={3} indent={2}><span className="text-orange-300">wait</span>: <span className="text-amber-300">number</span>,</Line>
      <Line n={4} indent={0}>{'): T & { cancel(): void; flush(): void } {'}</Line>
      <Line n={5} indent={2}><span className="text-pink-400">let</span> timerId: <span className="text-amber-300">ReturnType</span>{'<typeof setTimeout> | null = null;'}</Line>
      <Line n={6} indent={2}><span className="text-pink-400">let</span> fnArgs: <span className="text-amber-300">Parameters</span>{'<T> | null = null;'}</Line>
      <Line n={7} indent={2}><span className="text-pink-400">let</span> thisArgs: <span className="text-amber-300">unknown</span> = <span className="text-amber-300">null</span>;</Line>
      <Line n={8} indent={0}>{' '}</Line>
      <Line n={9} indent={2}><span className="text-pink-400">function</span> <span className="text-sky-300">debounced</span>(<span className="text-orange-300">this</span>: <span className="text-amber-300">unknown</span>, ...args: <span className="text-amber-300">Parameters</span>{'<T>) {'}</Line>
      <Line n={10} indent={4}>thisArgs = <span className="text-pink-400">this</span>;</Line>
      <Line n={11} indent={4}>fnArgs = args;</Line>
      <Line n={12} indent={4}><span className="text-pink-400">if</span> (timerId !== <span className="text-amber-300">null</span>) <span className="text-sky-300">clearTimeout</span>(timerId);</Line>
      <Line n={13} indent={4}>timerId = <span className="text-sky-300">setTimeout</span>(() {'=> {'}</Line>
      <Line n={14} indent={6}><span className="text-sky-300">func</span>.<span className="text-violet-300">call</span>(thisArgs, ...fnArgs!);</Line>
      <Line n={15} indent={6}>timerId = fnArgs = thisArgs = <span className="text-amber-300">null</span>;</Line>
      <Line n={16} indent={4}>{'}, wait);'}</Line>
      <Line n={17} indent={2}>{'}'}</Line>
      <Line n={18} indent={0}>{' '}</Line>
      <Line n={19} indent={2}>debounced.<span className="text-violet-300">cancel</span> = <span className="text-pink-400">function</span> () {'{'}</Line>
      <Line n={20} indent={4}><span className="text-pink-400">if</span> (timerId === <span className="text-amber-300">null</span>) {'{'}</Line>
      <Line n={21} indent={6} highlight><span className="text-pink-400">return</span>;</Line>
      <Line n={22} indent={4}>{'}'}</Line>
      <Line n={23} indent={4}><span className="text-sky-300">clearTimeout</span>(timerId);</Line>
      <Line n={24} indent={4}>timerId = fnArgs = thisArgs = <span className="text-amber-300">null</span>;</Line>
      <Line n={25} indent={2}>{'};'}</Line>
      <Line n={26} indent={2}><span className="text-pink-400">return</span> debounced <span className="text-pink-400">as</span> T & {'{ cancel(): void; flush(): void }'};</Line>
      <Line n={27} indent={0}>{'}'}</Line>
    </pre>
  </div>
);

const SolutionPreviewContent = () => (
  <div className="h-full flex flex-col bg-white dark:bg-neutral-900">
    <div className="flex items-center gap-1.5 px-3 h-10 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0 bg-neutral-50 dark:bg-neutral-950/50">
      <button type="button" className="p-1 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
        <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round"><path d="M10 12 6 8l4-4"/></svg>
      </button>
      <div className="flex-1 h-6 px-3 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[12px] text-neutral-500 dark:text-neutral-400 flex items-center">/solution</div>
    </div>
    <div className="flex-1 grid place-items-center">
      <div className="text-sm text-neutral-500 dark:text-neutral-400">Solution preview renders here.</div>
    </div>
  </div>
);

export const demoRegistry: TabRegistry = {
  description: { tabType: 'description', title: 'Description', minSize: 20, renderLabel: () => <Label icon={<BookIcon />}>Description</Label>, render: () => <DescriptionContent /> },
  code: { tabType: 'code', title: 'Code', minSize: 20, renderLabel: (tab) => <Label icon={<FileIcon />}>{tab.title}</Label>, render: () => <CodeContent /> },
  testCases: { tabType: 'testCases', title: 'Test cases', renderLabel: () => <Label icon={<FlaskIcon />}>Test cases</Label>, render: () => <TestCasesContent /> },
  console: { tabType: 'console', title: 'Console', renderLabel: () => <Label icon={<ConsoleIcon />}>Console</Label>, render: () => <ConsoleContent /> },
  files: { tabType: 'files', title: 'Files', renderLabel: () => <Label icon={<FolderIcon />}>Files</Label>, render: () => <FilesContent /> },
  preview: { tabType: 'preview', title: 'Preview', renderLabel: () => <Label icon={<SparkleIcon />}>Preview</Label>, render: () => <PreviewContent /> },
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
  browser: { tabType: 'browser', title: 'Browser', renderLabel: () => <Label icon={<GlobeIcon />}>Browser</Label>, render: () => <BrowserContent /> },
  'editor-shortcuts': { tabType: 'editor-shortcuts', title: 'Editor shortcuts', renderLabel: () => <Label icon={<KeyboardIcon />}>Editor shortcuts</Label>, render: () => <EditorShortcutsContent /> },
  'saved-code': { tabType: 'saved-code', title: 'Saved code', renderLabel: (tab) => <Label icon={<DatabaseIcon />}>{tab.title}</Label>, render: () => <SavedCodeContent /> },
  'solution-preview': { tabType: 'solution-preview', title: 'Solution preview', renderLabel: (tab) => <Label icon={<SparkleIcon />}>{tab.title}</Label>, render: () => <SolutionPreviewContent /> },
  'new-tab': { tabType: 'new-tab', title: 'New tab', availableInAddMenu: false, render: () => null },
};
