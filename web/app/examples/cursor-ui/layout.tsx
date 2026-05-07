import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Cursor UI layout',
  description:
    'Cursor-style IDE clone — file explorer, multi-tab editor, terminal pane, and AI agent sidebar. All resizable. Built with react-splitkit.',
};

export default function CursorUILayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
