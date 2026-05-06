import { useState, useEffect } from 'react';

/**
 * Returns whether the viewport is below a given breakpoint width (in px).
 * Useful for enabling mobile behavior (e.g., stacked layout instead of side-by-side splits).
 *
 * Example: `const isMobile = useLayoutBreakpoint(768); // true if < 768px wide`
 */
export const useLayoutBreakpoint = (breakpointPx: number): boolean => {
  const [isBelowBreakpoint, setIsBelowBreakpoint] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpointPx;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsBelowBreakpoint(window.innerWidth < breakpointPx);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpointPx]);

  return isBelowBreakpoint;
};
