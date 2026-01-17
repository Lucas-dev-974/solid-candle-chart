import { createSignal, createMemo } from 'solid-js';
import type { ChartTheme } from '../core/types';
import { DEFAULT_THEME } from '../core/types';

export interface UseThemeOptions {
  initialTheme?: Partial<ChartTheme>;
}

export function useTheme(options: UseThemeOptions = {}) {
  const [localThemeOverride, setLocalThemeOverride] = createSignal<ChartTheme | null>(null);

  const theme = createMemo<ChartTheme>(() => {
    const baseTheme = {
      ...DEFAULT_THEME,
      ...options.initialTheme,
    };
    const override = localThemeOverride();
    return override ? { ...baseTheme, ...override } : baseTheme;
  });

  return {
    theme,
    setLocalThemeOverride,
  };
}
