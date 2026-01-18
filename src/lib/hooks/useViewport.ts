import { createSignal, createEffect, createMemo } from 'solid-js';
import type { Viewport, OHLCData } from '../core/types';
import { fitToData, validateViewport } from '../utils/viewport';

export interface UseViewportOptions {
  data: () => OHLCData[];
  initialTimeRange?: [number, number];
  initialPriceRange?: [number, number];
  onViewportChange?: (viewport: Viewport) => void;
}

export function useViewport(options: UseViewportOptions) {
  const [internalViewport, setInternalViewport] = createSignal<Viewport | null>(null);

  // Initialize internal viewport when data changes
  createEffect(() => {
    const data = options.data();
    if (options.initialTimeRange && options.initialPriceRange) {
      try {
        const validated = validateViewport({
          timeRange: options.initialTimeRange,
          priceRange: options.initialPriceRange,
        });
        setInternalViewport(validated);
      } catch (error) {
        console.warn('useViewport: Invalid initial viewport, using fitToData instead', error);
        setInternalViewport(fitToData(data));
      }
    } else {
      setInternalViewport(fitToData(data));
    }
  });

  // Current viewport (internal or computed from data)
  const viewport = createMemo<Viewport>(() => {
    const vp = internalViewport() ?? fitToData(options.data());
    try {
      return validateViewport(vp);
    } catch (error) {
      console.warn('useViewport: Invalid viewport detected, using fitToData instead', error);
      return fitToData(options.data());
    }
  });

  // Update viewport and notify parent
  const updateViewport = (newViewport: Viewport) => {
    try {
      const validated = validateViewport(newViewport);
      setInternalViewport(validated);
      options.onViewportChange?.(validated);
    } catch (error) {
      console.warn('useViewport: Invalid viewport update ignored', error);
    }
  };

  return {
    viewport,
    updateViewport,
  };
}
