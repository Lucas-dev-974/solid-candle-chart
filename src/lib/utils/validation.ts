import type { OHLCData } from '../core/types';

/**
 * Validates a single OHLC candle data point
 * @param candle - The candle data to validate
 * @returns true if valid, false otherwise
 */
function isValidCandle(candle: OHLCData): boolean {
  // Check all values are finite numbers (not NaN or Infinity)
  if (
    !Number.isFinite(candle.time) ||
    !Number.isFinite(candle.open) ||
    !Number.isFinite(candle.high) ||
    !Number.isFinite(candle.low) ||
    !Number.isFinite(candle.close)
  ) {
    return false;
  }

  // Check high >= low (fundamental OHLC rule)
  if (candle.high < candle.low) {
    return false;
  }

  // Check high >= max(open, close) (high must be at least as high as open or close)
  if (candle.high < Math.max(candle.open, candle.close)) {
    return false;
  }

  // Check low <= min(open, close) (low must be at least as low as open or close)
  if (candle.low > Math.min(candle.open, candle.close)) {
    return false;
  }

  return true;
}

/**
 * Validates and filters OHLC data, removing invalid candles
 * @param data - Array of OHLC data to validate
 * @param onInvalid - Optional callback called for each invalid candle (for logging)
 * @returns Filtered array containing only valid candles
 * 
 * @example
 * ```typescript
 * const validData = validateOHLCData(rawData, (invalid, index) => {
 *   console.warn(`Invalid candle at index ${index}:`, invalid);
 * });
 * ```
 */
export function validateOHLCData(
  data: OHLCData[],
  onInvalid?: (candle: OHLCData, index: number) => void
): OHLCData[] {
  if (!Array.isArray(data)) {
    console.warn('validateOHLCData: data must be an array');
    return [];
  }

  const validData: OHLCData[] = [];

  for (let i = 0; i < data.length; i++) {
    const candle = data[i];
    
    if (!candle || typeof candle !== 'object') {
      onInvalid?.(candle as any, i);
      continue;
    }

    if (isValidCandle(candle)) {
      validData.push(candle);
    } else {
      onInvalid?.(candle, i);
    }
  }

  if (onInvalid && validData.length < data.length) {
    console.warn(
      `validateOHLCData: Filtered out ${data.length - validData.length} invalid candles out of ${data.length} total`
    );
  }

  return validData;
}

/**
 * Validates that OHLC data is sorted by time (ascending)
 * @param data - Array of OHLC data to check
 * @returns true if sorted, false otherwise
 */
export function isDataSorted(data: OHLCData[]): boolean {
  if (data.length <= 1) return true;

  for (let i = 1; i < data.length; i++) {
    if (data[i].time < data[i - 1].time) {
      return false;
    }
  }

  return true;
}

/**
 * Sorts OHLC data by time (ascending) if not already sorted
 * @param data - Array of OHLC data to sort
 * @returns Sorted array (new array if sorting was needed, same array if already sorted)
 */
export function sortOHLCDataByTime(data: OHLCData[]): OHLCData[] {
  if (isDataSorted(data)) {
    return data;
  }

  return [...data].sort((a, b) => a.time - b.time);
}
