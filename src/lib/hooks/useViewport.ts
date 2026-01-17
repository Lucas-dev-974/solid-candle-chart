import { createSignal, createEffect, createMemo } from 'solid-js';
import type { Viewport, OHLCData } from '../core/types';
import { fitToData } from '../utils/viewport';

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
      setInternalViewport({
        timeRange: options.initialTimeRange,
        priceRange: options.initialPriceRange,
      });
    } else {
      setInternalViewport(fitToData(data));
    }
  });

  // Current viewport (internal or computed from data)
  const viewport = createMemo<Viewport>(() => {
    return internalViewport() ?? fitToData(options.data());
  });

  // Update viewport and notify parent
  const updateViewport = (newViewport: Viewport) => {
    setInternalViewport(newViewport);
    options.onViewportChange?.(newViewport);
  };

  return {
    viewport,
    updateViewport,
  };
}
