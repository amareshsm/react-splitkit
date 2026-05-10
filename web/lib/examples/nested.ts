// Sandpack files for the Nested IDE Layout example.
// Mirrors /examples/nested/page.tsx (and the shared PanelChrome) — same chrome
// functionality (Add tab, Split right/down, Maximize/Restore, close-on-hover),
// same content. The only differences from the live page are: no PageShell
// wrapper (Sandpack provides its own iframe) and Tailwind via CDN.

const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Nested IDE layout — react-splitkit</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      /* Structural layout for react-splitkit's tablist slots.
         In a real app you'd typically get these from 'react-splitkit/styles.css'
         (which also adds default theming we override here with Tailwind). */
      [data-panel-tablist-leading],
      [data-panel-tablist-trailing] {
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }
      [data-panel-tablist-trailing] {
        margin-left: auto;
      }
      [data-panel-tablist-items] {
        display: flex;
        align-items: stretch;
        flex: 1 1 auto;
        min-width: 0;
        overflow-x: auto;
        overflow-y: hidden;
        scrollbar-width: none;
      }
      [data-panel-tablist-items]::-webkit-scrollbar { display: none; }
    </style>
  </head>
  <body class="bg-neutral-100 dark:bg-neutral-950">
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
`;

const appCode = `import {
  LayoutProvider,
  LayoutRoot,
  Resizer,
  createPanel,
  createSplit,
  type RenderResizerProps,
  type TabRegistry,
} from 'react-splitkit';
import { PanelChrome } from './PanelChrome';
import { Nav, Metrics, Requests, Logs } from './content';

// ── registry: one entry per tabType ───────────────────────────
const registry: TabRegistry = {
  nav:      { tabType: 'nav',      title: 'Services', render: () => <Nav /> },
  metrics:  { tabType: 'metrics',  title: 'Metrics',  render: () => <Metrics /> },
  requests: { tabType: 'requests', title: 'Requests', render: () => <Requests /> },
  logs:     { tabType: 'logs',     title: 'Logs',     render: () => <Logs /> },
};

// ── layout shape: sidebar + (metrics/requests over logs) ──────
const layout = createSplit('root', 'horizontal', [
  createPanel('sidebar', [
    { id: 'nav', tabType: 'nav', title: 'Services' },
  ]),
  createSplit('main', 'vertical', [
    createPanel('top', [
      { id: 'metrics',  tabType: 'metrics',  title: 'Metrics' },
      { id: 'requests', tabType: 'requests', title: 'Requests' },
    ], 'requests'),
    createPanel('bottom', [
      { id: 'logs', tabType: 'logs', title: 'Logs' },
    ]),
  ], [58, 42]),
], [22, 78]);

const ThemedResizer = (p: RenderResizerProps) => (
  <Resizer
    splitId={p.splitId}
    index={p.index}
    className="bg-transparent hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
  />
);

export default function App() {
  return (
    <div className="h-screen p-3 bg-neutral-100 dark:bg-neutral-950">
      <LayoutProvider initialLayout={layout} registry={registry}>
        <LayoutRoot
          renderPanel={(p) => <PanelChrome {...p} />}
          renderResizer={ThemedResizer}
          style={{ height: '100%' }}
        />
      </LayoutProvider>
    </div>
  );
}
`;

const panelChromeCode = `import { useRef, useState, useEffect, type RefObject, type ReactNode } from 'react';
import {
  usePanel,
  TabList,
  TabPanel,
  TabAddMenu,
  type RenderPanelProps,
} from 'react-splitkit';
import {
  PlusIcon,
  MoreIcon,
  CloseIcon,
  SplitRightIcon,
  SplitDownIcon,
  MaximizeIcon,
  RestoreIcon,
} from './icons';

// Close a popover when the user clicks anywhere outside it.
function useClickOutside(ref: RefObject<HTMLElement | null>, cb: () => void) {
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
            className={\`group inline-flex items-center gap-1.5 h-full px-3 text-[13px] cursor-pointer select-none transition-colors border-b-2 -mb-px \${
              isActive
                ? 'border-neutral-900 dark:border-neutral-100 font-medium text-neutral-900 dark:text-neutral-50 bg-white dark:bg-neutral-900'
                : 'border-transparent text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }\`}
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

const MenuItem = ({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-[13px] text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
  >
    <span className="text-neutral-500 dark:text-neutral-400">{icon}</span>
    {label}
  </button>
);
`;

const iconsCode = `import type { SVGProps } from 'react';

const base = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const PlusIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>
);

export const MoreIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" />
  </svg>
);

export const CloseIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M18 6 6 18M6 6l12 12" /></svg>
);

export const SplitRightIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} width={14} height={14} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="12" y1="3" x2="12" y2="21" />
  </svg>
);

export const SplitDownIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} width={14} height={14} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="12" x2="21" y2="12" />
  </svg>
);

export const MaximizeIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} width={14} height={14} {...p}>
    <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

export const RestoreIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} width={14} height={14} {...p}>
    <polyline points="8 3 3 3 3 8" /><polyline points="21 16 21 21 16 21" />
    <line x1="3" y1="3" x2="10" y2="10" /><line x1="21" y1="21" x2="14" y2="14" />
  </svg>
);
`;

const contentCode = `// Demo content for each tab type. Just plain components — react-splitkit
// only cares about the registry mapping tabType → render function.

const services = [
  { name: 'api-gateway',   status: 'healthy',  cpu: 12, mem: 38 },
  { name: 'auth-service',  status: 'healthy',  cpu: 4,  mem: 21 },
  { name: 'worker-queue',  status: 'warning',  cpu: 78, mem: 65 },
  { name: 'postgres-main', status: 'healthy',  cpu: 9,  mem: 54 },
  { name: 'redis-cache',   status: 'healthy',  cpu: 2,  mem: 18 },
  { name: 'image-resize',  status: 'error',    cpu: 0,  mem: 0  },
];

const statusDot: Record<string, string> = {
  healthy: 'bg-emerald-500',
  warning: 'bg-amber-400',
  error:   'bg-red-500',
};

export const Nav = () => (
  <div className="h-full overflow-auto bg-white dark:bg-neutral-900 py-3">
    <p className="px-4 text-[11px] uppercase tracking-wider font-semibold text-neutral-400 dark:text-neutral-500 mb-2">
      Services
    </p>
    {services.map((s) => (
      <div
        key={s.name}
        className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
      >
        <span className={\`w-2 h-2 rounded-full flex-shrink-0 \${statusDot[s.status]}\`} />
        <span className="text-[13px] font-mono text-neutral-700 dark:text-neutral-200 truncate">{s.name}</span>
      </div>
    ))}
    <div className="mt-4 mx-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
      <p className="px-1 text-[11px] uppercase tracking-wider font-semibold text-neutral-400 dark:text-neutral-500 mb-2">
        Alerts
      </p>
      <div className="space-y-1">
        <div className="flex items-center gap-2 px-1 py-1 rounded hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
          <span className="text-[12px] text-neutral-600 dark:text-neutral-300">worker-queue CPU spike</span>
        </div>
        <div className="flex items-center gap-2 px-1 py-1 rounded hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
          <span className="text-[12px] text-neutral-600 dark:text-neutral-300">image-resize down</span>
        </div>
      </div>
    </div>
  </div>
);

export const Metrics = () => {
  const bars = [42, 58, 33, 71, 55, 90, 62, 48, 75, 38, 85, 60];
  const labels = ['12:00', '', '', '15:00', '', '', '18:00', '', '', '21:00', '', 'Now'];
  const maxVal = Math.max(...bars);
  return (
    <div className="h-full overflow-auto bg-white dark:bg-neutral-900 p-5">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400 dark:text-neutral-500 mb-0.5">CPU Usage</p>
          <p className="text-3xl font-semibold text-neutral-900 dark:text-neutral-50">
            78<span className="text-lg text-neutral-400">%</span>
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Requests/s', value: '1,284' },
            { label: 'Avg latency', value: '42 ms' },
            { label: 'Error rate', value: '0.3%' },
          ].map((m) => (
            <div key={m.label} className="text-right">
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mb-0.5">{m.label}</p>
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{m.value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-end gap-1 h-28">
        {bars.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end">
            <div
              style={{ height: \`\${(v / maxVal) * 100}%\` }}
              className={\`rounded-sm transition-all \${
                v > 80 ? 'bg-red-400 dark:bg-red-500' :
                v > 60 ? 'bg-amber-400 dark:bg-amber-500' :
                'bg-violet-400 dark:bg-violet-500'
              }\`}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1 mt-1">
        {labels.map((l, i) => (
          <div key={i} className="flex-1 text-[9px] text-neutral-400 dark:text-neutral-500 text-center">{l}</div>
        ))}
      </div>
    </div>
  );
};

const requests = [
  { method: 'GET',    path: '/api/users',         status: 200, latency: '12 ms', time: '0s ago'  },
  { method: 'POST',   path: '/api/auth/login',    status: 200, latency: '38 ms', time: '1s ago'  },
  { method: 'GET',    path: '/api/jobs/492',      status: 404, latency: '5 ms',  time: '2s ago'  },
  { method: 'PUT',    path: '/api/users/31',      status: 200, latency: '21 ms', time: '3s ago'  },
  { method: 'DELETE', path: '/api/sessions/8f2',  status: 204, latency: '8 ms',  time: '5s ago'  },
  { method: 'GET',    path: '/api/metrics',       status: 200, latency: '44 ms', time: '6s ago'  },
  { method: 'POST',   path: '/api/images/upload', status: 503, latency: '—',     time: '9s ago'  },
  { method: 'GET',    path: '/api/health',        status: 200, latency: '3 ms',  time: '11s ago' },
];

const statusColor = (s: number) =>
  s >= 500 ? 'text-red-500 dark:text-red-400' :
  s >= 400 ? 'text-amber-500 dark:text-amber-400' :
  'text-emerald-600 dark:text-emerald-400';

const methodColor = (m: string) =>
  m === 'GET'    ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300' :
  m === 'POST'   ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' :
  m === 'PUT'    ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' :
                   'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300';

export const Requests = () => (
  <div className="h-full overflow-auto bg-white dark:bg-neutral-900">
    <table className="w-full text-[12.5px]">
      <thead className="sticky top-0 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
        <tr>
          {['Method', 'Path', 'Status', 'Latency', 'Time'].map((h) => (
            <th key={h} className="px-4 py-2 text-left text-[10px] uppercase tracking-wider font-semibold text-neutral-400 dark:text-neutral-500">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800/60">
        {requests.map((r, i) => (
          <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
            <td className="px-4 py-2">
              <span className={\`inline-block text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded \${methodColor(r.method)}\`}>{r.method}</span>
            </td>
            <td className="px-4 py-2 font-mono text-neutral-700 dark:text-neutral-300">{r.path}</td>
            <td className={\`px-4 py-2 font-mono font-medium \${statusColor(r.status)}\`}>{r.status}</td>
            <td className="px-4 py-2 text-neutral-500 dark:text-neutral-400">{r.latency}</td>
            <td className="px-4 py-2 text-neutral-400 dark:text-neutral-500">{r.time}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const logs = [
  { t: '21:42:11', level: 'INFO',  msg: 'api-gateway  → GET /api/users 200 12ms' },
  { t: '21:42:10', level: 'INFO',  msg: 'auth-service → POST /api/auth/login 200 38ms' },
  { t: '21:42:09', level: 'WARN',  msg: 'worker-queue → CPU 78% — approaching threshold' },
  { t: '21:42:08', level: 'INFO',  msg: 'api-gateway  → GET /api/jobs/492 404 5ms' },
  { t: '21:42:07', level: 'INFO',  msg: 'api-gateway  → PUT /api/users/31 200 21ms' },
  { t: '21:42:05', level: 'ERROR', msg: 'image-resize → health check failed (exit 1)' },
  { t: '21:42:04', level: 'INFO',  msg: 'redis-cache  → PING PONG 1ms' },
  { t: '21:42:02', level: 'ERROR', msg: 'image-resize → OOMKilled — restarting (attempt 3)' },
  { t: '21:41:58', level: 'INFO',  msg: 'api-gateway  → GET /api/health 200 3ms' },
];

const levelColor: Record<string, string> = {
  INFO:  'text-neutral-500 dark:text-neutral-500',
  WARN:  'text-amber-500 dark:text-amber-400',
  ERROR: 'text-red-500 dark:text-red-400',
};

export const Logs = () => (
  <div className="h-full overflow-auto bg-[#0d1117] px-4 py-3 font-mono text-[12px] leading-6">
    {logs.map((l, i) => (
      <div key={i} className="flex gap-3">
        <span className="text-neutral-600 select-none shrink-0">{l.t}</span>
        <span className={\`w-10 shrink-0 \${levelColor[l.level]}\`}>{l.level}</span>
        <span className="text-neutral-300">{l.msg}</span>
      </div>
    ))}
    <div className="mt-1 flex gap-3">
      <span className="text-neutral-600 select-none shrink-0">21:42:12</span>
      <span className="text-emerald-500">▌</span>
    </div>
  </div>
);
`;

export const nestedFiles = {
  '/App.tsx': appCode,
  '/PanelChrome.tsx': panelChromeCode,
  '/icons.tsx': iconsCode,
  '/content.tsx': contentCode,
  '/index.html': indexHtml,
};
