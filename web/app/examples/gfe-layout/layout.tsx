import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'GreatFrontend layout',
  description:
    'Full coding-platform UI — description, code editor, browser preview, and console pane, all resizable and collapsible. Built with react-splitkit.',
};

export default function GFELayoutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
