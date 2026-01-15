import type { OHLCData } from '../core/types';

/** Available timeframe values in minutes */
export type TimeframeMinutes = 1 | 2 | 3 | 5 | 10 | 15 | 30 | 60 | 120 | 240 | 1440;

export interface Timeframe {
  value: TimeframeMinutes;
  label: string;
}

/** Predefined timeframes */
export const TIMEFRAMES: Timeframe[] = [
  { value: 1, label: '1m' },
  { value: 2, label: '2m' },
  { value: 3, label: '3m' },
  { value: 5, label: '5m' },
  { value: 10, label: '10m' },
  { value: 15, label: '15m' },
  { value: 30, label: '30m' },
  { value: 60, label: '1h' },
  { value: 120, label: '2h' },
  { value: 240, label: '4h' },
  { value: 1440, label: '1D' },
];

/**
 * Aggregate OHLC data to a higher timeframe
 * @param data Source data (assumed to be 1m candles)
 * @param targetMinutes Target timeframe in minutes
 */
export function aggregateOHLC(data: OHLCData[], targetMinutes: TimeframeMinutes): OHLCData[] {
  if (data.length === 0 || targetMinutes === 1) return data;

  const intervalMs = targetMinutes * 60 * 1000;
  const aggregated: OHLCData[] = [];
  
  let currentCandle: OHLCData | null = null;
  let currentBucket = 0;

  for (const candle of data) {
    const bucket = Math.floor(candle.time / intervalMs);

    if (bucket !== currentBucket || currentCandle === null) {
      // Start new candle
      if (currentCandle) {
        aggregated.push(currentCandle);
      }
      currentBucket = bucket;
      currentCandle = {
        time: bucket * intervalMs,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      };
    } else {
      // Update current candle
      currentCandle.high = Math.max(currentCandle.high, candle.high);
      currentCandle.low = Math.min(currentCandle.low, candle.low);
      currentCandle.close = candle.close;
    }
  }

  // Push last candle
  if (currentCandle) {
    aggregated.push(currentCandle);
  }

  return aggregated;
}
