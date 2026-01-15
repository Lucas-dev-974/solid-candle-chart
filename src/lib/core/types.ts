/** Single OHLC candle data */
export interface OHLCData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

/** Visible range for time (X) and price (Y) axes */
export interface Viewport {
  timeRange: [number, number];
  priceRange: [number, number];
}

/** Canvas dimensions in pixels */
export interface Dimensions {
  width: number;
  height: number;
}

/** Theme colors for the chart */
export interface ChartTheme {
  background: string;
  bullCandle: string;
  bearCandle: string;
  bullWick: string;
  bearWick: string;
  axisLine: string;
  axisText: string;
  gridLine: string;
  crosshair: string;
}

/** Chart component props */
export interface OHLCChartProps {
  data: OHLCData[];
  width?: number;
  height?: number;
  timeRange?: [number, number];
  priceRange?: [number, number];
  timeframe?: number;
  theme?: Partial<ChartTheme>;
  onViewportChange?: (viewport: Viewport) => void;
  onTimeframeChange?: (timeframe: number) => void;
}

/** Default theme */
export const DEFAULT_THEME: ChartTheme = {
  background: '#1a1a2e',
  bullCandle: '#26a69a',
  bearCandle: '#ef5350',
  bullWick: '#26a69a',
  bearWick: '#ef5350',
  axisLine: '#404040',
  axisText: '#a0a0a0',
  gridLine: '#2a2a3e',
  crosshair: '#606060',
};
