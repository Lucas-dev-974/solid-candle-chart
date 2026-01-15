import { createSignal } from 'solid-js';
import { OHLCChart, TIMEFRAMES, type OHLCData, type TimeframeMinutes } from './lib';

// Generate sample OHLC data (1 minute candles)
function generateSampleData(count: number): OHLCData[] {
  const data: OHLCData[] = [];
  const now = Date.now();
  const interval = 60 * 1000; // 1 minute
  let price = 100;

  for (let i = 0; i < count; i++) {
    const volatility = 0.5 + Math.random() * 1;
    const open = price;
    const change = (Math.random() - 0.5) * volatility;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.3;
    const low = Math.min(open, close) - Math.random() * volatility * 0.3;

    data.push({
      time: now - (count - i) * interval,
      open,
      high,
      low,
      close,
    });

    price = close;
  }

  return data;
}

// Generate 500 1-minute candles
const sampleData = generateSampleData(500);

export default function App() {
  const [timeframe, setTimeframe] = createSignal<TimeframeMinutes>(1);

  return (
    <div style={{ padding: '20px', background: '#0a0a14', 'min-height': '100vh' }}>
      <h1 style={{ color: '#fff', 'margin-bottom': '20px' }}>OHLC Chart Demo</h1>
      
      {/* Timeframe selector */}
      <div style={{ 'margin-bottom': '15px', display: 'flex', gap: '8px' }}>
        {TIMEFRAMES.slice(0, 8).map((tf) => (
          <button
            onClick={() => setTimeframe(tf.value)}
            style={{
              padding: '8px 16px',
              background: timeframe() === tf.value ? '#26a69a' : '#2a2a3e',
              color: '#fff',
              border: 'none',
              'border-radius': '4px',
              cursor: 'pointer',
              'font-weight': timeframe() === tf.value ? 'bold' : 'normal',
            }}
          >
            {tf.label}
          </button>
        ))}
      </div>

      <OHLCChart
        data={sampleData}
        width={900}
        height={500}
        timeframe={timeframe()}
      />
    </div>
  );
}
