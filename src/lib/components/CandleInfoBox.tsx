import { Show } from 'solid-js';
import type { OHLCData, ChartTheme } from '../core/types';

interface CandleInfoBoxProps {
  candle: OHLCData | null;
  theme: ChartTheme;
  timeframe: number;
}

export function CandleInfoBox(props: CandleInfoBoxProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Show when={props.candle}>
      {(candle) => {
        const priceRange = candle().high - candle().low;
        const pricePrecision = priceRange < 0.01 ? 6 : priceRange < 0.1 ? 4 : priceRange < 10 ? 2 : priceRange < 1000 ? 1 : 0;
        const isBull = candle().close >= candle().open;
        const change = candle().close - candle().open;
        const changePercent = candle().open !== 0 ? (change / candle().open) * 100 : 0;

        return (
          <div
            class="absolute top-[10px] left-[10px] rounded border min-w-[200px] px-3 py-2 font-mono text-xs z-[1000] pointer-events-none shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
            style={{
              background: props.theme.background,
              "border-color": props.theme.axisLine,
              color: props.theme.axisText,
            }}
          >
            <div class="mb-1.5 font-bold pb-1 border-b" style={{ "border-color": props.theme.axisLine }}>
              {formatTime(candle().time)}
            </div>

            <div class="flex justify-between mb-1">
              <span style={{ color: props.theme.axisText }}>O:</span>
              <span style={{ color: props.theme.axisText }}>{candle().open.toFixed(pricePrecision)}</span>
            </div>

            <div class="flex justify-between mb-1">
              <span style={{ color: props.theme.axisText }}>H:</span>
              <span style={{ color: props.theme.bullCandle }}>{candle().high.toFixed(pricePrecision)}</span>
            </div>

            <div class="flex justify-between mb-1">
              <span style={{ color: props.theme.axisText }}>L:</span>
              <span style={{ color: props.theme.bearCandle }}>{candle().low.toFixed(pricePrecision)}</span>
            </div>

            <div class="flex justify-between mb-1">
              <span style={{ color: props.theme.axisText }}>C:</span>
              <span style={{ color: isBull ? props.theme.bullCandle : props.theme.bearCandle }}>
                {candle().close.toFixed(pricePrecision)}
              </span>
            </div>

            <div class="flex justify-between mt-1.5 pt-1 border-t" style={{ "border-color": props.theme.axisLine }}>
              <span style={{ color: props.theme.axisText }}>Change:</span>
              <span style={{ color: isBull ? props.theme.bullCandle : props.theme.bearCandle }}>
                {change >= 0 ? '+' : ''}{change.toFixed(pricePrecision)} ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        );
      }}
    </Show>
  );
}
