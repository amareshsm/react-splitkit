'use client';

import {
  LayoutProvider,
  LayoutRoot,
  createPanel,
  createSplit,
  type RenderResizerProps,
  type TabRegistry,
  Resizer,
} from 'react-splitkit';
import { PanelChrome } from '@/components/PanelChrome';
import { PageShell } from '@/components/PageShell';
import { LiveExample } from '@/components/LiveExample';
import { nestedFiles } from '@/lib/examples/nested';

// ── content ────────────────────────────────────────────────

const services = [
  { name: 'api-gateway',   status: 'healthy',  cpu: 12,  mem: 38 },
  { name: 'auth-service',  status: 'healthy',  cpu: 4,   mem: 21 },
  { name: 'worker-queue',  status: 'warning',  cpu: 78,  mem: 65 },
  { name: 'postgres-main', status: 'healthy',  cpu: 9,   mem: 54 },
  { name: 'redis-cache',   status: 'healthy',  cpu: 2,   mem: 18 },
  { name: 'image-resize',  status: 'error',    cpu: 0,   mem: 0  },
];

const statusDot: Record<string, string> = {
  healthy: 'bg-emerald-500',
  warning: 'bg-amber-400',
  error:   'bg-red-500',
};

const NavContent = () => (
  <div className="h-full overflow-auto bg-white dark:bg-neutral-900 py-3">
    <p className="px-4 text-[11px] uppercase tracking-wider font-semibold text-neutral-400 dark:text-neutral-500 mb-2">Services</p>
    {services.map((s) => (
      <div
        key={s.name}
        className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
      >
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[s.status]}`} />
        <span className="text-[13px] font-mono text-neutral-700 dark:text-neutral-200 truncate">{s.name}</span>
      </div>
    ))}
    <div className="mt-4 mx-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
      <p className="px-1 text-[11px] uppercase tracking-wider font-semibold text-neutral-400 dark:text-neutral-500 mb-2">Alerts</p>
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

const MetricsContent = () => {
  const bars = [42, 58, 33, 71, 55, 90, 62, 48, 75, 38, 85, 60];
  const labels = ['12:00', '', '', '15:00', '', '', '18:00', '', '', '21:00', '', 'Now'];
  const maxVal = Math.max(...bars);
  return (
    <div className="h-full overflow-auto bg-white dark:bg-neutral-900 p-5">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400 dark:text-neutral-500 mb-0.5">CPU Usage</p>
          <p className="text-3xl font-semibold text-neutral-900 dark:text-neutral-50">78<span className="text-lg text-neutral-400">%</span></p>
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
              style={{ height: `${(v / maxVal) * 100}%` }}
              className={`rounded-sm transition-all ${v > 80 ? 'bg-red-400 dark:bg-red-500' : v > 60 ? 'bg-amber-400 dark:bg-amber-500' : 'bg-violet-400 dark:bg-violet-500'}`}
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

const RequestsContent = () => {
  const rows = [
    { method: 'GET',    path: '/api/users',        status: 200, latency: '12 ms', time: '0s ago' },
    { method: 'POST',   path: '/api/auth/login',   status: 200, latency: '38 ms', time: '1s ago' },
    { method: 'GET',    path: '/api/jobs/492',     status: 404, latency: '5 ms',  time: '2s ago' },
    { method: 'PUT',    path: '/api/users/31',     status: 200, latency: '21 ms', time: '3s ago' },
    { method: 'DELETE', path: '/api/sessions/8f2', status: 204, latency: '8 ms',  time: '5s ago' },
    { method: 'GET',    path: '/api/metrics',      status: 200, latency: '44 ms', time: '6s ago' },
    { method: 'POST',   path: '/api/images/upload',status: 503, latency: '—',    time: '9s ago' },
    { method: 'GET',    path: '/api/health',       status: 200, latency: '3 ms',  time: '11s ago' },
  ];
  const statusColor = (s: number) =>
    s >= 500 ? 'text-red-500 dark:text-red-400' :
    s >= 400 ? 'text-amber-500 dark:text-amber-400' :
    'text-emerald-600 dark:text-emerald-400';
  const methodColor = (m: string) =>
    m === 'GET' ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300' :
    m === 'POST' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' :
    m === 'PUT' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' :
    'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300';

  return (
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
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
              <td className="px-4 py-2">
                <span className={`inline-block text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${methodColor(r.method)}`}>{r.method}</span>
              </td>
              <td className="px-4 py-2 font-mono text-neutral-700 dark:text-neutral-300">{r.path}</td>
              <td className={`px-4 py-2 font-mono font-medium ${statusColor(r.status)}`}>{r.status}</td>
              <td className="px-4 py-2 text-neutral-500 dark:text-neutral-400">{r.latency}</td>
              <td className="px-4 py-2 text-neutral-400 dark:text-neutral-500">{r.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const LogsContent = () => {
  const lines = [
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
  return (
    <div className="h-full overflow-auto bg-[#0d1117] px-4 py-3 font-mono text-[12px] leading-6">
      {lines.map((l, i) => (
        <div key={i} className="flex gap-3">
          <span className="text-neutral-600 select-none shrink-0">{l.t}</span>
          <span className={`w-10 shrink-0 ${levelColor[l.level]}`}>{l.level}</span>
          <span className="text-neutral-300">{l.msg}</span>
        </div>
      ))}
      <div className="mt-1 flex gap-3">
        <span className="text-neutral-600 select-none shrink-0">21:42:12</span>
        <span className="text-emerald-500">▌</span>
      </div>
    </div>
  );
};

// ── registry ───────────────────────────────────────────────

const infraRegistry: TabRegistry = {
  nav:      { tabType: 'nav',      title: 'Services',  render: () => <NavContent /> },
  metrics:  { tabType: 'metrics',  title: 'Metrics',   render: () => <MetricsContent /> },
  requests: { tabType: 'requests', title: 'Requests',  render: () => <RequestsContent /> },
  logs:     { tabType: 'logs',     title: 'Logs',      render: () => <LogsContent /> },
};

// ── layout ─────────────────────────────────────────────────

const layout = createSplit(
  'root',
  'horizontal',
  [
    createPanel('sidebar', [
      { id: 'nav', tabType: 'nav', title: 'Services' },
    ]),
    createSplit(
      'main',
      'vertical',
      [
        createPanel('top', [
          { id: 'metrics',  tabType: 'metrics',  title: 'Metrics' },
          { id: 'requests', tabType: 'requests', title: 'Requests' },
        ], 'requests'),
        createPanel('bottom', [
          { id: 'logs', tabType: 'logs', title: 'Logs' },
        ]),
      ],
      [58, 42],
    ),
  ],
  [22, 78],
);

const ThemedResizer = (p: RenderResizerProps) => (
  <Resizer
    splitId={p.splitId}
    index={p.index}
    className="bg-transparent hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
  />
);

export default function NestedPage() {
  return (
    <PageShell
      title="Nested IDE layout"
      description="Infrastructure dashboard · sidebar + (metrics / logs) split"
      source={<LiveExample files={nestedFiles} template="vite-react-ts" height={560} />}
    >
      <LayoutProvider initialLayout={layout} registry={infraRegistry}>
        <LayoutRoot
          renderPanel={(p) => <PanelChrome {...p} />}
          renderResizer={ThemedResizer}
        />
      </LayoutProvider>
    </PageShell>
  );
}
