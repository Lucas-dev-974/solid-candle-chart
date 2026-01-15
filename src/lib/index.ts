// Main component
export { OHLCChart } from './components/OHLCChart';

// Types
export type {
  OHLCData,
  Viewport,
  Dimensions,
  ChartTheme,
  OHLCChartProps,
} from './core/types';
export { DEFAULT_THEME } from './core/types';

// Utilities
export { createScale } from './core/scale';
export type { Scale } from './core/scale';
export { fitToData } from './utils/viewport';
export { aggregateOHLC, TIMEFRAMES } from './utils/timeframe';
export type { Timeframe, TimeframeMinutes } from './utils/timeframe';
