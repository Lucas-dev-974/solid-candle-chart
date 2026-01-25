import { createSignal } from 'solid-js';
import type { Viewport, OHLCData } from '../core/types';
import { createScale } from '../core/scale';

export interface UseChartInteractionsOptions {
  viewport: () => Viewport;
  mainWidth: () => number;
  mainHeight: () => number;
  data: () => OHLCData[];
  timeframe: () => number;
  onViewportChange: (viewport: Viewport) => void;
  onPanningChange?: (isPanning: boolean) => void;
  zoomFactor?: number;
}

const DEFAULT_ZOOM_FACTOR = 0.1;

export function useChartInteractions(options: UseChartInteractionsOptions) {
  const zoomFactor = options.zoomFactor ?? DEFAULT_ZOOM_FACTOR;
  
  // Pan state
  const [isPanning, setIsPanning] = createSignal(false);
  const [panStart, setPanStart] = createSignal({ x: 0, y: 0 });
  const [viewportAtPanStart, setViewportAtPanStart] = createSignal<Viewport | null>(null);
  
  // Mouse tracking for crosshair and candle info
  const [mousePosition, setMousePosition] = createSignal<{ x: number; y: number } | null>(null);
  const [hoveredCandle, setHoveredCandle] = createSignal<OHLCData | null>(null);

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const current = options.viewport();
    const scale = createScale(current, {
      width: options.mainWidth(),
      height: options.mainHeight(),
    });

    // Get data coordinates at mouse position
    const timeAtMouse = scale.pixelToX(x);
    const priceAtMouse = scale.pixelToY(y);

    // Zoom direction
    const zoomIn = e.deltaY < 0;
    const factor = zoomIn ? (1 - zoomFactor) : (1 + zoomFactor);

    const [timeMin, timeMax] = current.timeRange;
    const [priceMin, priceMax] = current.priceRange;

    // Determine zoom axes based on modifiers:
    // - Default (no modifier): zoom X only
    // - Alt: zoom Y only
    // - Ctrl: zoom both X and Y
    const zoomX = !e.altKey;
    const zoomY = e.altKey || e.ctrlKey;

    const newTimeMin = zoomX ? timeAtMouse - (timeAtMouse - timeMin) * factor : timeMin;
    const newTimeMax = zoomX ? timeAtMouse + (timeMax - timeAtMouse) * factor : timeMax;
    const newPriceMin = zoomY ? priceAtMouse - (priceAtMouse - priceMin) * factor : priceMin;
    const newPriceMax = zoomY ? priceAtMouse + (priceMax - priceAtMouse) * factor : priceMax;

    options.onViewportChange({
      timeRange: [newTimeMin, newTimeMax],
      priceRange: [newPriceMin, newPriceMax],
    });
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
    setViewportAtPanStart(options.viewport());
    options.onPanningChange?.(true);
  };

  const findNearestCandle = (x: number, y: number): OHLCData | null => {
    const viewport = options.viewport();
    const scale = createScale(viewport, {
      width: options.mainWidth(),
      height: options.mainHeight(),
    });

    const data = options.data();
    const timeframe = options.timeframe();
    const tfMs = timeframe * 60 * 1000;

    if (data.length === 0) return null;

    // Calculate approximate candle width in pixels
    const [timeMin, timeMax] = viewport.timeRange;
    const timeSpan = timeMax - timeMin;
    const visibleCandles = timeSpan / tfMs;
    const candleWidth = Math.max(1, Math.min(50, (options.mainWidth() / visibleCandles) * 0.8));
    const maxDistance = Math.max(candleWidth * 2, 50); // Consider candles within 200% of candle width or at least 50px

    // Find the candle closest to the mouse X position
    let nearestCandle: OHLCData | null = null;
    let minDistance = Infinity;

    for (const candle of data) {
      // Skip candles outside viewport (with some margin)
      if (candle.time < timeMin - tfMs * 2 || candle.time > timeMax + tfMs * 2) continue;

      const candleX = scale.xToPixel(candle.time);
      const distance = Math.abs(candleX - x);

      // Always track the closest candle, but only return it if within maxDistance
      if (distance < minDistance) {
        minDistance = distance;
        nearestCandle = candle;
      }
    }

    // Return the nearest candle if it's within reasonable distance
    return minDistance < maxDistance ? nearestCandle : null;
  };

  const handleMouseMove = (e: MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update mouse position for crosshair
    setMousePosition({ x, y });

    // Find nearest candle
    const candle = findNearestCandle(x, y);
    setHoveredCandle(candle);

    // Handle panning if active
    if (!isPanning() || !viewportAtPanStart()) return;

    const start = panStart();
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;

    const viewport = viewportAtPanStart()!;
    const [timeMin, timeMax] = viewport.timeRange;
    const [priceMin, priceMax] = viewport.priceRange;

    const timeSpan = timeMax - timeMin;
    const priceSpan = priceMax - priceMin;

    // Convert pixel delta to data delta
    const timeDelta = -(dx / options.mainWidth()) * timeSpan;
    const priceDelta = (dy / options.mainHeight()) * priceSpan;

    options.onViewportChange({
      timeRange: [timeMin + timeDelta, timeMax + timeDelta],
      priceRange: [priceMin + priceDelta, priceMax + priceDelta],
    });
  };

  const handleMouseUp = (e: MouseEvent) => {
    setIsPanning(false);
    setViewportAtPanStart(null);
    options.onPanningChange?.(false);
  };

  const handleMouseLeave = (e: MouseEvent) => {
    // Clear mouse position when leaving, but keep the last hovered candle
    setMousePosition(null);
    // Don't clear hoveredCandle - keep it visible
    
    if (isPanning()) {
      setIsPanning(false);
      setViewportAtPanStart(null);
      options.onPanningChange?.(false);
    }
  };

  return {
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    mousePosition,
    hoveredCandle,
  };
}
