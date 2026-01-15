import type { OHLCData, ChartTheme, Viewport } from '../core/types';
import type { Scale } from '../core/scale';

/**
 * Draw a single candle on the canvas
 */
export function drawCandle(
  ctx: CanvasRenderingContext2D,
  candle: OHLCData,
  scale: Scale,
  candleWidth: number,
  theme: ChartTheme
): void {
  const isBull = candle.close >= candle.open;
  const color = isBull ? theme.bullCandle : theme.bearCandle;
  const wickColor = isBull ? theme.bullWick : theme.bearWick;

  const x = scale.xToPixel(candle.time);
  const halfWidth = candleWidth / 2;

  const openY = scale.yToPixel(candle.open);
  const closeY = scale.yToPixel(candle.close);
  const highY = scale.yToPixel(candle.high);
  const lowY = scale.yToPixel(candle.low);

  // Draw wick
  ctx.strokeStyle = wickColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, highY);
  ctx.lineTo(x, lowY);
  ctx.stroke();

  // Draw body
  const bodyTop = Math.min(openY, closeY);
  const bodyHeight = Math.abs(closeY - openY) || 1;

  ctx.fillStyle = color;
  ctx.fillRect(x - halfWidth, bodyTop, candleWidth, bodyHeight);
}

/**
 * Draw all visible candles
 */
export function drawCandles(
  ctx: CanvasRenderingContext2D,
  data: OHLCData[],
  scale: Scale,
  width: number,
  theme: ChartTheme,
  viewport: Viewport,
  timeframeMinutes: number
): void {
  if (data.length === 0) return;

  const [timeMin, timeMax] = viewport.timeRange;
  const timeSpan = timeMax - timeMin;
  
  // Calculate candle width based on timeframe and visible time range
  const tfMs = timeframeMinutes * 60 * 1000;
  const visibleCandles = timeSpan / tfMs;
  
  // Width per candle in pixels, with 80% fill (20% gap)
  const candleWidth = Math.max(1, Math.min(50, (width / visibleCandles) * 0.8));

  // Only draw visible candles
  for (const candle of data) {
    if (candle.time < timeMin - tfMs || candle.time > timeMax + tfMs) continue;
    drawCandle(ctx, candle, scale, candleWidth, theme);
  }
}
