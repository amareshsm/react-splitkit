import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'react-splitkit — Headless resizable panel layouts for React';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '48px' }}>
          <svg width={52} height={52} viewBox="0 0 20 20" fill="none">
            <rect x="2" y="2" width="7" height="16" rx="1.5" fill="white" />
            <rect x="11" y="2" width="7" height="7" rx="1.5" fill="white" />
            <rect x="11" y="11" width="7" height="7" rx="1.5" fill="white" fillOpacity="0.5" />
          </svg>
          <span style={{ color: '#a3a3a3', fontSize: '28px', fontWeight: 600, letterSpacing: '-0.5px' }}>
            react-splitkit
          </span>
        </div>

        <div
          style={{
            color: 'white',
            fontSize: '64px',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-2px',
            marginBottom: '28px',
            maxWidth: '900px',
          }}
        >
          Build IDE-grade layouts for React.
        </div>

        <div
          style={{
            color: '#737373',
            fontSize: '28px',
            lineHeight: 1.5,
            maxWidth: '760px',
          }}
        >
          Headless, resizable, tabbed panel splits. No imposed styles — you own every pixel.
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '64px',
            right: '80px',
            color: '#404040',
            fontSize: '22px',
            fontWeight: 500,
          }}
        >
          react-splitkit.vercel.app
        </div>
      </div>
    ),
    size,
  );
}
