import type { ReactNode } from 'react';
import { RootProvider } from 'fumadocs-ui/provider';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s — react-splitkit',
    default: 'react-splitkit',
  },
  description:
    'Headless, resizable, tabbed, splittable layout primitives for React.',
  metadataBase: new URL('https://react-splitkit.vercel.app'),
  openGraph: {
    siteName: 'react-splitkit',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
