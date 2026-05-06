import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Two-column split',
  description:
    'A notes app layout with a list and detail split — clean horizontal layout with multi-tab panels. Built with react-splitkit.',
};

export default function TwoColumnLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
