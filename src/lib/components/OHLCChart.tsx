import { createMemo, createSignal, createEffect } from 'solid-js';
import type { OHLCChartProps, Viewport, ChartTheme } from '../core/types';
import { DEFAULT_THEME } from '../core/types';
import { fitToData } from '../utils/viewport';
import { createScale } from '../core/scale';
import { aggregateOHLC, type TimeframeMinutes } from '../utils/timeframe';
import { MainCanvas } from './MainCanvas';
import { PriceAxisCanvas } from './PriceAxisCanvas';
import { TimeAxisCanvas } from './TimeAxisCanvas';

const PRICE_AXIS_WIDTH = 70;
const TIME_AXIS_HEIGHT = 30;
const ZOOM_FACTOR = 0.1;

export function OHLCChart(props: OHLCChartProps) {
  const width = () => props.width ?? 800;
  const height = () => props.height ?? 400;

  const theme = createMemo<ChartTheme>(() => ({
    ...DEFAULT_THEME,
    ...props.theme,
  }));

  const mainWidth = () => width() - PRICE_AXIS_WIDTH;
  const mainHeight = () => height() - TIME_AXIS_HEIGHT;

  // Aggregate data based on timeframe
  const aggregatedData = createMemo(() => {
    const tf = (props.timeframe ?? 1) as TimeframeMinutes;
    return aggregateOHLC(props.data, tf);
  });

  // Internal viewport state for interactions
  const [internalViewport, setInternalViewport] = createSignal<Viewport | null>(null);

  // Initialize internal viewport when data or timeframe changes
  createEffect(() => {
    const data = aggregatedData();
    if (props.timeRange && props.priceRange) {
      setInternalViewport({
        timeRange: props.timeRange,
        priceRange: props.priceRange,
      });
    } else {
      setInternalViewport(fitToData(data));
    }
  });

  // Current viewport (internal or from props)
  const viewport = createMemo<Viewport>(() => {
    return internalViewport() ?? fitToData(aggregatedData());
  });

  // Notify parent of viewport changes
  const updateViewport = (newViewport: Viewport) => {
    setInternalViewport(newViewport);
    props.onViewportChange?.(newViewport);
  };

  // Pan state
  let isPanning = false;
  let panStart = { x: 0, y: 0 };
  let viewportAtPanStart: Viewport | null = null;

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const current = viewport();
    const scale = createScale(current, { width: mainWidth(), height: mainHeight() });

    // Get data coordinates at mouse position
    const timeAtMouse = scale.pixelToX(x);
    const priceAtMouse = scale.pixelToY(y);

    // Zoom direction
    const zoomIn = e.deltaY < 0;
    const factor = zoomIn ? (1 - ZOOM_FACTOR) : (1 + ZOOM_FACTOR);

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

    updateViewport({
      timeRange: [newTimeMin, newTimeMax],
      priceRange: [newPriceMin, newPriceMax],
    });
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    isPanning = true;
    panStart = { x: e.clientX, y: e.clientY };
    viewportAtPanStart = viewport();
    (e.currentTarget as HTMLElement).style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isPanning || !viewportAtPanStart) return;

    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;

    const [timeMin, timeMax] = viewportAtPanStart.timeRange;
    const [priceMin, priceMax] = viewportAtPanStart.priceRange;

    const timeSpan = timeMax - timeMin;
    const priceSpan = priceMax - priceMin;

    // Convert pixel delta to data delta
    const timeDelta = -(dx / mainWidth()) * timeSpan;
    const priceDelta = (dy / mainHeight()) * priceSpan;

    updateViewport({
      timeRange: [timeMin + timeDelta, timeMax + timeDelta],
      priceRange: [priceMin + priceDelta, priceMax + priceDelta],
    });
  };

  const handleMouseUp = (e: MouseEvent) => {
    isPanning = false;
    viewportAtPanStart = null;
    (e.currentTarget as HTMLElement).style.cursor = 'crosshair';
  };

  const handleMouseLeave = (e: MouseEvent) => {
    if (isPanning) {
      isPanning = false;
      viewportAtPanStart = null;
      (e.currentTarget as HTMLElement).style.cursor = 'crosshair';
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        'grid-template-columns': `${mainWidth()}px ${PRICE_AXIS_WIDTH}px`,
        'grid-template-rows': `${mainHeight()}px ${TIME_AXIS_HEIGHT}px`,
        width: `${width()}px`,
        height: `${height()}px`,
      }}
    >
      <div
        style={{ cursor: 'crosshair' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <MainCanvas
          data={aggregatedData()}
          viewport={viewport()}
          width={mainWidth()}
          height={mainHeight()}
          theme={theme()}
          timeframe={props.timeframe ?? 1}
        />
      </div>
      <PriceAxisCanvas
        viewport={viewport()}
        height={mainHeight()}
        width={PRICE_AXIS_WIDTH}
        theme={theme()}
      />
      <TimeAxisCanvas
        viewport={viewport()}
        width={mainWidth()}
        height={TIME_AXIS_HEIGHT}
        theme={theme()}
        timeframe={props.timeframe ?? 1}
      />
      <div style={{ background: theme().background }} />
    </div>
  );
}
