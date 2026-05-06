import type { ReactNode } from 'react';

// Examples are full-screen; strip all navigation chrome.
export default function ExamplesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
