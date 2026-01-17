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
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: props.theme.background,
              border: `1px solid ${props.theme.axisLine}`,
              'border-radius': '4px',
              padding: '8px 12px',
              'font-family': 'monospace',
              'font-size': '12px',
              color: props.theme.axisText,
              'z-index': 1000,
              'min-width': '200px',
              'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.3)',
              'pointer-events': 'none',
            }}
          >
            <div style={{ 'margin-bottom': '6px', 'font-weight': 'bold', 'border-bottom': `1px solid ${props.theme.axisLine}`, 'padding-bottom': '4px' }}>
              {formatTime(candle().time)}
            </div>
            
            <div style={{ display: 'flex', 'justify-content': 'space-between', 'margin-bottom': '4px' }}>
              <span style={{ color: props.theme.axisText }}>O:</span>
              <span style={{ color: props.theme.axisText }}>{candle().open.toFixed(pricePrecision)}</span>
            </div>
            
            <div style={{ display: 'flex', 'justify-content': 'space-between', 'margin-bottom': '4px' }}>
              <span style={{ color: props.theme.axisText }}>H:</span>
              <span style={{ color: props.theme.bullCandle }}>{candle().high.toFixed(pricePrecision)}</span>
            </div>
            
            <div style={{ display: 'flex', 'justify-content': 'space-between', 'margin-bottom': '4px' }}>
              <span style={{ color: props.theme.axisText }}>L:</span>
              <span style={{ color: props.theme.bearCandle }}>{candle().low.toFixed(pricePrecision)}</span>
            </div>
            
            <div style={{ display: 'flex', 'justify-content': 'space-between', 'margin-bottom': '4px' }}>
              <span style={{ color: props.theme.axisText }}>C:</span>
              <span style={{ color: isBull ? props.theme.bullCandle : props.theme.bearCandle }}>
                {candle().close.toFixed(pricePrecision)}
              </span>
            </div>
            
            <div style={{ display: 'flex', 'justify-content': 'space-between', 'margin-top': '6px', 'padding-top': '4px', 'border-top': `1px solid ${props.theme.axisLine}` }}>
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
