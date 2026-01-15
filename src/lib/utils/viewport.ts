import type { OHLCData, Viewport } from '../core/types';

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
