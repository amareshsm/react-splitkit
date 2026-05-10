type CellValue = 'yes' | 'no' | { partial: number };

const rows: { feature: string; splitkit: CellValue; panels: CellValue; allotment: CellValue }[] = [
  { feature: 'Fully headless (zero CSS)',    splitkit: 'yes', panels: 'yes',          allotment: 'no'           },
  { feature: 'Resizable panels',             splitkit: 'yes', panels: 'yes',          allotment: 'yes'          },
  { feature: 'Tabbed panels',                splitkit: 'yes', panels: 'no',           allotment: 'no'           },
  { feature: 'Split panels at runtime',      splitkit: 'yes', panels: 'no',           allotment: 'no'           },
  { feature: 'Collapse & Maximize',          splitkit: 'yes', panels: { partial: 1 }, allotment: 'no'           },
  { feature: 'Serializable JSON layout',     splitkit: 'yes', panels: { partial: 2 }, allotment: 'no'           },
  { feature: 'Multiple independent layouts', splitkit: 'yes', panels: 'yes',          allotment: 'yes'          },
  { feature: 'Full keyboard + ARIA',         splitkit: 'yes', panels: 'yes',          allotment: { partial: 3 } },
  { feature: 'TypeScript-first',             splitkit: 'yes', panels: 'yes',          allotment: 'yes'          },
];

const notes: Record<number, string> = {
  1: 'Has a collapsible prop but no maximize.',
  2: 'onLayout saves panel sizes only — the full panel tree structure is defined in JSX, not serializable.',
  3: 'Resize handle has basic keyboard navigation; lacks full aria-value* attributes.',
};

const Check = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="7.5" className="fill-emerald-50 dark:fill-emerald-500/10 stroke-emerald-200 dark:stroke-emerald-500/30" strokeWidth={1} />
    <path d="M5 8l2 2 4-4" stroke="#10b981" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Cross = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="7.5" className="fill-neutral-50 dark:fill-neutral-800 stroke-neutral-200 dark:stroke-neutral-700" strokeWidth={1} />
    <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" className="text-neutral-300 dark:text-neutral-600" />
  </svg>
);

const PartialBadge = ({ n }: { n: number }) => (
  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
    Partial
    <sup className="text-[9px] leading-none">{n}</sup>
  </span>
);

const Cell = ({ value, highlight }: { value: CellValue; highlight?: boolean }) => (
  <td className={`px-5 py-4 text-center ${highlight ? 'bg-neutral-50 dark:bg-neutral-800/60' : ''}`}>
    <span className="inline-flex justify-center items-center">
      {value === 'yes'
        ? <Check />
        : value === 'no'
        ? <Cross />
        : <PartialBadge n={(value as { partial: number }).partial} />}
    </span>
  </td>
);

export const Comparison = () => (
  <section className="bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800">
    <div className="max-w-6xl mx-auto px-6 py-14 md:py-16">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
        Comparison
      </p>
      <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight mb-3">
        How it compares.
      </h2>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-10 py-4 leading-relaxed">
        react-splitkit is the right pick when you need tabs, runtime splitting, and a fully serializable layout. For pure resize-only use cases, react-resizable-panels is a mature alternative.
      </p>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <table className="w-full min-w-[600px] text-sm border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800">
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900">
                Feature
              </th>
              <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-50 bg-neutral-50 dark:bg-neutral-800/60 w-36">
                <span className="inline-flex flex-col items-center gap-1.5">
                  react-splitkit
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-[9px] font-semibold tracking-widest text-neutral-500 dark:text-neutral-400">
                    NEW
                  </span>
                </span>
              </th>
              <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 w-44">
                react-resizable-panels
              </th>
              <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 w-32">
                allotment
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.feature}
                className={`border-b border-neutral-100 dark:border-neutral-800/70 last:border-0 ${
                  i % 2 === 0 ? '' : 'bg-neutral-50/50 dark:bg-neutral-900/20'
                }`}
              >
                <td className="px-5 py-4 text-neutral-700 dark:text-neutral-300 font-medium">
                  {row.feature}
                </td>
                <Cell value={row.splitkit} highlight />
                <Cell value={row.panels} />
                <Cell value={row.allotment} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Numbered footnotes */}
      <div className="pt-4">
        <ol className="space-y-1.5 list-none">
          {Object.entries(notes).map(([n, text]) => (
            <li key={n} className="flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-500 leading-relaxed">
              <span className="flex-shrink-0 inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 text-[9px] font-bold mt-0.5">
                {n}
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Early release note */}
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 px-5 py-4">

        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">Note: </span>{' '}
          react-splitkit is newly released. The core is working and the API is stable, but as with any early-stage library you may encounter rough edges.
          If you run into anything unexpected, please{' '}
          <a
            href="https://github.com/amareshsm/react-splitkit/issues/new?labels=bug"
            className="underline underline-offset-2 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            open an issue
          </a>
          {' '}— it helps a lot.
        </p>
      </div>
    </div>
  </section>
);
