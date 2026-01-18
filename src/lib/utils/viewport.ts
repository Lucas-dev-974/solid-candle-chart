import type { OHLCData, Viewport } from '../core/types';

/**
 * Minimum time span in milliseconds to avoid division by zero
 */
const MIN_TIME_SPAN = 1000; // 1 second

/**
 * Minimum price span to avoid division by zero
 */
const MIN_PRICE_SPAN = 0.0001;

/**
 * Validates and normalizes a viewport, ensuring valid ranges and minimum spans
 * @param viewport - The viewport to validate
 * @returns Validated and normalized viewport
 * @throws Error if viewport is invalid and cannot be fixed
 * 
 * @example
 * ```typescript
 * const valid = validateViewport({
 *   timeRange: [1000, 2000],
 *   priceRange: [100, 200]
 * });
 * ```
 */
export function validateViewport(viewport: Viewport): Viewport {
  const [timeMin, timeMax] = viewport.timeRange;
  const [priceMin, priceMax] = viewport.priceRange;

  // Check all values are finite
  if (
    !Number.isFinite(timeMin) ||
    !Number.isFinite(timeMax) ||
    !Number.isFinite(priceMin) ||
    !Number.isFinite(priceMax)
  ) {
    throw new Error('Invalid viewport: all values must be finite numbers');
  }

  // Check timeRange[0] < timeRange[1]
  if (timeMin >= timeMax) {
    throw new Error(
      `Invalid viewport: timeRange[0] (${timeMin}) must be less than timeRange[1] (${timeMax})`
    );
  }

  // Check priceRange[0] < priceRange[1]
  if (priceMin >= priceMax) {
    throw new Error(
      `Invalid viewport: priceRange[0] (${priceMin}) must be less than priceRange[1] (${priceMax})`
    );
  }

  // Ensure minimum spans to avoid division by zero
  const timeSpan = timeMax - timeMin;
  const priceSpan = priceMax - priceMin;

  const validatedTimeRange: [number, number] =
    timeSpan < MIN_TIME_SPAN
      ? [timeMin, timeMin + MIN_TIME_SPAN]
      : [timeMin, timeMax];

  const validatedPriceRange: [number, number] =
    priceSpan < MIN_PRICE_SPAN
      ? [priceMin, priceMin + MIN_PRICE_SPAN]
      : [priceMin, priceMax];

  return {
    timeRange: validatedTimeRange,
    priceRange: validatedPriceRange,
  };
}

/**
 * Calculate viewport that fits all data with optional padding
 */
export function fitToData(data: OHLCData[], paddingPercent = 0.05): Viewport {
  if (data.length === 0) {
    return {
      timeRange: [0, 1],
      priceRange: [0, 1],
    };
  }

  let minTime = data[0].time;
  let maxTime = data[0].time;
  let minPrice = data[0].low;
  let maxPrice = data[0].high;

  for (const candle of data) {
    if (candle.time < minTime) minTime = candle.time;
    if (candle.time > maxTime) maxTime = candle.time;
    if (candle.low < minPrice) minPrice = candle.low;
    if (candle.high > maxPrice) maxPrice = candle.high;
  }

  // Add padding
  const timeSpan = maxTime - minTime;
  const priceSpan = maxPrice - minPrice;

  const timePadding = timeSpan * paddingPercent;
  const pricePadding = priceSpan * paddingPercent;

  return {
    timeRange: [minTime - timePadding, maxTime + timePadding],
    priceRange: [minPrice - pricePadding, maxPrice + pricePadding],
  };
}
