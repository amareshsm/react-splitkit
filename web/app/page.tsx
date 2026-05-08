import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { InstallCommand } from '@/components/InstallCommand';
import { CodeBlock } from '@/components/CodeBlock';
import { FAQ } from '@/components/FAQ';
import { ArrowRightIcon } from '@/components/icons';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'react-splitkit — Headless resizable panel layouts for React',
  description:
    'Headless, resizable, tabbed, splittable layout primitives for React. Build IDE-grade panel layouts without any imposed styling.',
};

const features = [
  {
    icon: (
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="18" rx="1.5" />
        <rect x="14" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
    title: 'Infinitely composable',
    body: 'Nest horizontal and vertical splits as deep as you need. The layout tree is plain data — serialise it to JSON and restore it later.',
  },
  {
    icon: (
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
      </svg>
    ),
    title: 'Headless by design',
    body: 'Zero imposed styles. You own every pixel — use Tailwind, CSS Modules, or plain CSS. The library wires up behaviour, you bring the look.',
  },
  {
    icon: (
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18" />
      </svg>
    ),
    title: 'Full tab management',
    body: 'Add, close, reorder, and drag tabs between panels. A registry maps tab types to render functions so your tabs are declarative and type-safe.',
  },
  {
    icon: (
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    title: 'TypeScript-first',
    body: 'Every hook, component, and registry entry is fully typed. Autocomplete works end to end — from createSplit all the way into your render functions.',
  },
  {
    icon: (
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: 'Programmatic control',
    body: 'usePanel gives you split, collapse, maximize, and close from any component. Build your own panel chrome with full control over every action.',
  },
  {
    icon: (
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    ),
    title: 'Lightweight',
    body: 'No heavy dependencies. Zustand handles layout state. No CSS frameworks required at runtime — you bring everything, the library wires it up.',
  },
];

const examples = [
  {
    to: '/examples/two-column',
    title: 'Two-column split',
    tag: 'Basic',
    description: 'A notes app with a list + detail split — clean horizontal layout with multi-tab panels.',
  },
  {
    to: '/examples/nested',
    title: 'Nested IDE layout',
    tag: 'Intermediate',
    description: 'Infrastructure dashboard — sidebar, metrics chart, and live request log composited from nested splits.',
  },
  {
    to: '/examples/gfe-layout',
    title: 'GreatFrontend layout',
    tag: 'Advanced',
    description: 'Full coding-platform UI: description, editor, browser preview, and console — all resizable and collapsible.',
  },
  {
    to: '/examples/cursor-ui',
    title: 'Cursor UI layout',
    tag: 'Advanced',
    description: 'Cursor-style IDE clone — file explorer, multi-tab editor, terminal pane, and AI agent sidebar.',
  },
];

const PanelIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <rect x="2" y="2" width="7" height="16" rx="1.5" fill="currentColor" fillOpacity="0.9" />
    <rect x="11" y="2" width="7" height="7" rx="1.5" fill="currentColor" fillOpacity="0.9" />
    <rect x="11" y="11" width="7" height="7" rx="1.5" fill="currentColor" fillOpacity="0.5" />
  </svg>
);

const primaryBtn =
  'inline-flex items-center gap-2 h-11 px-6 rounded-full text-sm font-semibold transition-colors btn-primary';

const secondaryBtn =
  'inline-flex items-center gap-2 h-11 px-6 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">

      {/* ── nav ── */}
      <header className="sticky top-0 z-40 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="inline-grid place-items-center w-8 h-8 rounded-lg bg-neutral-900 dark:bg-neutral-800 text-white">
              <PanelIcon size={16} />
            </span>
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">react-splitkit</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-600 dark:text-neutral-400">
            <Link href="/docs" className="hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors">Docs</Link>
            <Link href="/examples" className="hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors">Examples</Link>
            <a href="https://www.npmjs.com/package/react-splitkit" className="hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors">npm</a>
            <a
              href="https://github.com/amareshsm/react-splitkit"
              className="inline-flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors"
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.2 22 16.447 22 12.021 22 6.484 17.522 2 12 2z" />
              </svg>
              Star on GitHub
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/docs"
              className="hidden md:inline-flex items-center gap-1.5 h-8 px-4 rounded-full bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 text-[13px] font-medium transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ── hero ── */}
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-600 dark:text-neutral-400 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            v0.1.0 — open source on npm
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 max-w-3xl leading-[1.1] mb-6">
            Build IDE-grade layouts for React.
          </h1>
          <p className="text-lg md:text-xl text-neutral-500 dark:text-neutral-400 max-w-2xl leading-relaxed mb-8">
            Headless, resizable, tabbed panel splits. No imposed styles — you own every pixel.
            Ship complex multi-panel UIs in hours, not weeks.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/docs" className={primaryBtn}>
              Read the docs <ArrowRightIcon />
            </Link>
            <a href="#examples" className={secondaryBtn}>
              View live demo
            </a>
            <a
              href="https://github.com/amareshsm/react-splitkit"
              className={secondaryBtn}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="flex-shrink-0">
                <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.2 22 16.447 22 12.021 22 6.484 17.522 2 12 2z" />
              </svg>
              Star on GitHub
            </a>
          </div>

          <InstallCommand />
        </section>

        {/* ── features ── */}
        <section className="bg-neutral-50 dark:bg-neutral-900/30 border-y border-neutral-200 dark:border-neutral-800">
          <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">Why react-splitkit</p>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-12 max-w-xl tracking-tight">
              Everything you need to build panel-based apps.
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div key={f.title}>
                  <div className="w-9 h-9 grid place-items-center rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 mb-3 shadow-sm">
                    {f.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 mb-1">{f.title}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── code snippet ── */}
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">Simple API</p>
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-4 tracking-tight">
                Describe the layout.<br />We handle the rest.
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6 text-sm">
                Define your layout as plain data with{' '}
                <code className="font-mono text-[12px] text-neutral-800 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">createSplit</code>
                {' '}and{' '}
                <code className="font-mono text-[12px] text-neutral-800 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">createPanel</code>
                . Map tab types to render functions in a registry. Wrap with{' '}
                <code className="font-mono text-[12px] text-neutral-800 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">LayoutProvider</code>
                {' '}and you&apos;re done.
              </p>
              <ul className="space-y-2.5 text-sm text-neutral-500 dark:text-neutral-400">
                {[
                  'No CSS required at runtime',
                  'Full drag-to-resize out of the box',
                  'Keyboard accessible tab navigation',
                  'Persist and restore layout from JSON',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                      <svg width={9} height={9} viewBox="0 0 12 12" fill="none" className="text-neutral-700 dark:text-neutral-200">
                        <path d="M10 3 5 8.5 2 5.5" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <CodeBlock />
          </div>
        </section>

        {/* ── examples ── */}
        <section id="examples" className="scroll-mt-16 bg-neutral-50 dark:bg-neutral-900/30 border-t border-neutral-200 dark:border-neutral-800">
          <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">Live examples</p>
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">See it in action.</h2>
              </div>
              <Link href="/examples" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors hidden md:flex items-center gap-1">
                View all <ArrowRightIcon />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {examples.map((ex) => (
                <Link
                  key={ex.to}
                  href={ex.to}
                  className="group block rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 hover:border-neutral-400 dark:hover:border-neutral-600 hover:shadow-xl hover:shadow-neutral-900/5 dark:hover:shadow-black/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded mb-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">{ex.tag}</span>
                      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">{ex.title}</h3>
                    </div>
                    <span className="text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 group-hover:translate-x-0.5 transition-all mt-1">
                      <ArrowRightIcon />
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{ex.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── faq ── */}
        <FAQ />

        {/* ── cta banner — always dark, monochrome ── */}
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-20">
          <div className="relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 px-8 py-14 md:px-14">
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />
            <div className="relative flex text-center flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">
                  Ready to build?
                </h2>
                <p className="text-neutral-400 text-sm md:text-base">
                  Read the docs and ship your first panel layout in under 5 minutes.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 flex-shrink-0">
                <Link
                  href="/docs/quick-start"
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-full text-sm font-semibold transition-colors shadow-sm btn-cta-primary"
                >
                  Quick start <ArrowRightIcon />
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-full border border-neutral-600 text-sm font-medium hover:bg-neutral-800 hover:border-neutral-500 transition-colors btn-cta-secondary"
                >
                  Full docs
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="inline-grid place-items-center w-6 h-6 rounded-md bg-neutral-900 dark:bg-neutral-800 text-white">
              <PanelIcon size={12} />
            </span>
            <span>react-splitkit — MIT licence · Built by Amaresh S M</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/docs" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Docs</Link>
            <Link href="/examples" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Examples</Link>
            <a href="https://www.npmjs.com/package/react-splitkit" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">npm</a>
            <a href="https://github.com/amareshsm/react-splitkit" aria-label="GitHub" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.2 22 16.447 22 12.021 22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
