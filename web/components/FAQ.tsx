'use client';

import { useState, type ReactNode } from 'react';

interface FAQItem {
  q: string;
  a: ReactNode;
}

const faqs: FAQItem[] = [
  {
    q: 'Does react-splitkit allow customizing the UI?',
    a: (
      <>
        Yes — completely. react-splitkit is <strong>fully headless</strong>: it ships zero CSS and no opinionated markup. You pass{' '}
        <code className="font-mono text-[12px] px-1.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">
          renderPanel
        </code>{' '}
        and{' '}
        <code className="font-mono text-[12px] px-1.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">
          renderTab
        </code>{' '}
        functions and return whatever JSX you want. The library only owns state, ARIA, keyboard handlers, and resize math — Tailwind, CSS Modules, or plain CSS, your choice.
      </>
    ),
  },
  {
    q: 'Can I set default tab configurations?',
    a: (
      <>
        Yes. The <strong>tab registry</strong> declares per-<code className="font-mono text-[12px] px-1.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">tabType</code> defaults — title, min/max size, whether it&apos;s closable, custom label rendering. You set sensible defaults once in the registry, and individual tab descriptors can override them when needed.
      </>
    ),
  },
  {
    q: 'Does it support multiple layouts on the same page?',
    a: (
      <>
        Yes. You can render multiple <code className="font-mono text-[12px] px-1.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">{'<LayoutProvider>'}</code> instances anywhere — each owns an independent store and registry, and panel/tab DOM ids are auto-prefixed per provider so they never collide. Useful for dashboards with multiple panel groups, comparison views, modal layouts, or demo pages.
      </>
    ),
  },
  {
    q: 'Can I persist and restore the layout?',
    a: (
      <>
        Yes — the layout tree is plain serializable JSON. Use the{' '}
        <code className="font-mono text-[12px] px-1.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">
          onChange
        </code>{' '}
        callback to save it to localStorage or a database, and pass the saved tree as{' '}
        <code className="font-mono text-[12px] px-1.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">
          initialLayout
        </code>{' '}
        on next mount. No imperative refs to wrangle — just{' '}
        <code className="font-mono text-[12px] px-1.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">
          JSON.stringify
        </code>
        .
      </>
    ),
  },
  {
    q: 'Does it work with SSR and Next.js?',
    a: (
      <>
        Yes. The layout tree is plain data, so it serializes cleanly across the server/client boundary. The interactive bits (drag-resize, keyboard handlers, the maximized overlay) only attach on the client. If your layout is dynamic per-user, you can hydrate it on the server and pass it to{' '}
        <code className="font-mono text-[12px] px-1.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">
          LayoutProvider
        </code>{' '}
        — it just works.
      </>
    ),
  },
  {
    q: 'Can users drag tabs between panels?',
    a: (
      <>
        The state mutation is built in — dispatch the{' '}
        <code className="font-mono text-[12px] px-1.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">
          MOVE_TAB
        </code>{' '}
        action with{' '}
        <code className="font-mono text-[12px] px-1.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">
          fromPanelId
        </code>
        ,{' '}
        <code className="font-mono text-[12px] px-1.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">
          toPanelId
        </code>
        , and{' '}
        <code className="font-mono text-[12px] px-1.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">
          tabId
        </code>
        . Wiring up the drag interaction is left to you, so you can use HTML5 DnD, dnd-kit, react-dnd — whatever your project already uses. The library handles the tree mutation; you handle the visual feedback.
      </>
    ),
  },
  {
    q: 'Is react-splitkit accessible?',
    a: (
      <>
        Yes — accessibility is built in. Tabs use{' '}
        <code className="font-mono text-[12px] px-1.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">
          role=&quot;tablist&quot;
        </code>{' '}
        +{' '}
        <code className="font-mono text-[12px] px-1.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">aria-selected</code>{' '}
        with roving tabindex. Resizers use{' '}
        <code className="font-mono text-[12px] px-1.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">
          role=&quot;separator&quot;
        </code>{' '}
        with full{' '}
        <code className="font-mono text-[12px] px-1.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">aria-value*</code>{' '}
        attributes. Maximized panels render in an{' '}
        <code className="font-mono text-[12px] px-1.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">
          aria-modal
        </code>{' '}
        dialog. Full keyboard nav: arrows/Home/End/Delete on tabs; Alt+Arrow nudges resizers (Shift+Alt = 10%), Enter for sticky resize mode.
      </>
    ),
  },
];

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-16 bg-white dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-6 py-14 md:py-16">
        <div className="grid md:grid-cols-12 gap-10 md:gap-14">
          {/* Left column — heading */}
          <div className="md:col-span-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
              FAQ
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight mb-4">
              Frequently asked questions
            </h2>
            <p className="text-base text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Everything you need to know about react-splitkit&apos;s capabilities — customisation, accessibility, persistence, and SSR support.
            </p>
          </div>

          {/* Right column — accordion (DaisyUI-style: one card per item) */}
          <div className="md:col-span-7 flex flex-col gap-3">
            {faqs.map((item, i) => {
              const isOpen = openIndex === i;
              return (
                <div
                  key={item.q}
                  className="p-4 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-trigger-${i}`}
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-semibold text-neutral-900 dark:text-neutral-50 text-[15px] leading-snug">
                      {item.q}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`flex-shrink-0 text-xl leading-none font-light select-none transition-colors ${
                        isOpen
                          ? 'text-neutral-800 dark:text-neutral-100'
                          : 'text-neutral-400 dark:text-neutral-500'
                      }`}
                    >
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>

                  {isOpen && (
                    <div
                      id={`faq-panel-${i}`}
                      role="region"
                      aria-labelledby={`faq-trigger-${i}`}
                      className="pt-2 pb-2 pr-2 text-sm leading-7 text-neutral-600 dark:text-neutral-300"
                    >
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
