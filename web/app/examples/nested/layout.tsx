import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Nested IDE layout',
  description:
    'Infrastructure dashboard layout — sidebar, metrics chart, and live request log composed from nested splits. Built with react-splitkit.',
};

export default function NestedLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
