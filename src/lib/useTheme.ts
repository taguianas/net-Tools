import { useState, useLayoutEffect } from 'react';

/**
 * Reactively tracks the dark mode class on <html>.
 * Any component using this hook re-renders instantly when the theme changes,
 * eliminating the stale-state flash bug.
 */
export function useTheme(): boolean {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark')
  );

  useLayoutEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  return isDark;
}
