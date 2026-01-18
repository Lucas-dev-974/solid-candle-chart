import { createMemo, createSignal } from 'solid-js';
import type { OHLCChartProps, ChartTheme } from '../core/types';
import { aggregateOHLC, type TimeframeMinutes } from '../utils/timeframe';
import { validateOHLCData, sortOHLCDataByTime } from '../utils/validation';
import { useViewport } from '../hooks/useViewport';
import { useChartInteractions } from '../hooks/useChartInteractions';
import { useTheme } from '../hooks/useTheme';
import { MainCanvas } from './MainCanvas';
import { PriceAxisCanvas } from './PriceAxisCanvas';
import { TimeAxisCanvas } from './TimeAxisCanvas';
import { SettingsButton } from './SettingsButton';
import { CrosshairCanvas } from './CrosshairCanvas';
import { CandleInfoBox } from './CandleInfoBox';

const PRICE_AXIS_WIDTH = 70;
const TIME_AXIS_HEIGHT = 30;

export function OHLCChart(props: OHLCChartProps) {
  const width = () => props.width ?? 800;
  const height = () => props.height ?? 400;
  const mainWidth = () => width() - PRICE_AXIS_WIDTH;
  const mainHeight = () => height() - TIME_AXIS_HEIGHT;

  // Validate and prepare data
  const validatedData = createMemo(() => {
    const valid = validateOHLCData(props.data);
    return sortOHLCDataByTime(valid);
  });

  // Aggregate data based on timeframe
  const aggregatedData = createMemo(() => {
    const tf = (props.timeframe ?? 1) as TimeframeMinutes;
    return aggregateOHLC(validatedData(), tf);
  });

  // Theme management
  const { theme, setLocalThemeOverride } = useTheme({ initialTheme: props.theme });

  // Viewport management
  const { viewport, updateViewport } = useViewport({
    data: aggregatedData,
    initialTimeRange: props.timeRange,
    initialPriceRange: props.priceRange,
    onViewportChange: props.onViewportChange,
  });

  // Chart interactions (zoom and pan)
  const [isPanning, setIsPanning] = createSignal(false);
  const interactions = useChartInteractions({
    viewport,
    mainWidth,
    mainHeight,
    data: aggregatedData,
    timeframe: () => props.timeframe ?? 1,
    onViewportChange: updateViewport,
    onPanningChange: setIsPanning,
  });

  return (
    <div
      class="grid"
      style={{
        'grid-template-columns': `${mainWidth()}px ${PRICE_AXIS_WIDTH}px`,
        'grid-template-rows': `${mainHeight()}px ${TIME_AXIS_HEIGHT}px`,
        width: `${width()}px`,
        height: `${height()}px`,
      }}
    >
      <div
        classList={{ 'cursor-crosshair': !isPanning(), 'cursor-grabbing': isPanning() }}
        style={{ position: 'relative' }}
        onWheel={interactions.handleWheel}
        onMouseDown={interactions.handleMouseDown}
        onMouseMove={interactions.handleMouseMove}
        onMouseUp={interactions.handleMouseUp}
        onMouseLeave={interactions.handleMouseLeave}
      >
        <MainCanvas
          data={aggregatedData()}
          viewport={viewport()}
          width={mainWidth()}
          height={mainHeight()}
          theme={theme()}
          timeframe={props.timeframe ?? 1}
        />
        <CrosshairCanvas
          viewport={viewport()}
          width={mainWidth()}
          height={mainHeight()}
          theme={theme()}
          mouseX={interactions.mousePosition()?.x ?? null}
          mouseY={interactions.mousePosition()?.y ?? null}
          visible={!isPanning() && interactions.mousePosition() !== null}
        />
        <CandleInfoBox
          candle={interactions.hoveredCandle()}
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
      <SettingsButton theme={theme()} onThemeChange={setLocalThemeOverride} />
    </div>
  );
}
