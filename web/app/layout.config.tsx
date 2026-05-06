import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <span className="inline-flex items-center gap-2.5 font-semibold">
        <span className="inline-grid place-items-center w-7 h-7 rounded-lg bg-neutral-900 dark:bg-neutral-800 text-white">
          <svg width={14} height={14} viewBox="0 0 20 20" fill="none">
            <rect x="2" y="2" width="7" height="16" rx="1.5" fill="currentColor" fillOpacity="0.9" />
            <rect x="11" y="2" width="7" height="7" rx="1.5" fill="currentColor" fillOpacity="0.9" />
            <rect x="11" y="11" width="7" height="7" rx="1.5" fill="currentColor" fillOpacity="0.5" />
          </svg>
        </span>
        react-splitkit
      </span>
    ),
  },
  links: [],
};
