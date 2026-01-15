import type { ChartTheme } from '../core/types';
import type { Scale } from '../core/scale';
import { calculateGraduations, calculateTimeGraduations, formatPrice, formatTime } from '../utils/graduations';

/**
 * Draw price axis (Y) graduations
 */
export function drawPriceAxis(
  ctx: CanvasRenderingContext2D,
  priceRange: [number, number],
  scale: Scale,
  width: number,
  height: number,
  theme: ChartTheme
): void {
  const [minPrice, maxPrice] = priceRange;
  const range = maxPrice - minPrice;
  const graduations = calculateGraduations(minPrice, maxPrice, Math.floor(height / 50));

  ctx.fillStyle = theme.axisText;
  ctx.font = '11px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  for (const price of graduations) {
    const y = scale.yToPixel(price);
    
    // Draw tick line
    ctx.strokeStyle = theme.axisLine;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(5, y);
    ctx.stroke();

    // Draw label
    const label = formatPrice(price, range);
    ctx.fillText(label, 8, y);
  }
}

/**
 * Draw time axis (X) graduations
 */
export function drawTimeAxis(
  ctx: CanvasRenderingContext2D,
  timeRange: [number, number],
  scale: Scale,
  width: number,
  height: number,
  theme: ChartTheme,
  timeframeMinutes = 1
): void {
  const [minTime, maxTime] = timeRange;
  const range = maxTime - minTime;
  const graduations = calculateTimeGraduations(minTime, maxTime, Math.floor(width / 120), timeframeMinutes);

  ctx.fillStyle = theme.axisText;
  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  for (const time of graduations) {
    const x = scale.xToPixel(time);

    // Draw tick line
    ctx.strokeStyle = theme.axisLine;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 5);
    ctx.stroke();

    // Draw label
    const label = formatTime(time, range, timeframeMinutes);
    ctx.fillText(label, x, 8);
  }
}

/**
 * Draw grid lines on main canvas
 */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  timeRange: [number, number],
  priceRange: [number, number],
  scale: Scale,
  width: number,
  height: number,
  theme: ChartTheme
): void {
  ctx.strokeStyle = theme.gridLine;
  ctx.lineWidth = 0.5;

  // Horizontal lines (price)
  const priceGraduations = calculateGraduations(priceRange[0], priceRange[1], Math.floor(height / 50));
  for (const price of priceGraduations) {
    const y = scale.yToPixel(price);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Vertical lines (time)
  const timeGraduations = calculateGraduations(timeRange[0], timeRange[1], Math.floor(width / 100));
  for (const time of timeGraduations) {
    const x = scale.xToPixel(time);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
}
