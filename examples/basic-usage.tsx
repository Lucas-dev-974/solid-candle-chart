/**
 * Exemple basique d'utilisation de ohlc-chart-solid
 * 
 * Pour utiliser cet exemple :
 * 1. Copiez ce fichier dans votre projet SolidJS
 * 2. Importez-le dans votre App.tsx ou route
 */

import { createSignal } from 'solid-js';
import { OHLCChart, TIMEFRAMES, DEFAULT_THEME } from 'ohlc-chart-solid';
import type { OHLCData, TimeframeMinutes, ChartTheme } from 'ohlc-chart-solid';

// Fonction pour générer des données d'exemple
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

export default function BasicUsageExample() {
  // État pour le timeframe
  const [timeframe, setTimeframe] = createSignal<TimeframeMinutes>(1);

  // Générer 500 bougies d'exemple
  const data = generateSampleData(500);

  // Thème personnalisé (optionnel)
  const customTheme: Partial<ChartTheme> = {
    ...DEFAULT_THEME,
    // Vous pouvez personnaliser ici
  };

  return (
    <div class="min-h-screen bg-[#0a0a14] p-5 text-white font-sans">
      <h1 class="mb-5 text-2xl font-semibold">
        Exemple d'utilisation - OHLC Chart
      </h1>

      {/* Sélecteur de timeframe */}
      <div class="mb-4 flex flex-wrap gap-2">
        {TIMEFRAMES.slice(0, 8).map((tf) => (
          <button
            onClick={() => setTimeframe(tf.value)}
            class={`rounded px-4 py-2 text-sm transition-colors ${timeframe() === tf.value
                ? 'bg-emerald-500 font-semibold text-white'
                : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Graphique OHLC */}
      <OHLCChart
        data={data}
        width={900}
        height={500}
        timeframe={timeframe()}
        theme={customTheme}
      />

      {/* Informations */}
      <div class="mt-5 text-sm text-slate-300 space-y-1.5">
        <p>💡 Utilisez la molette de la souris pour zoomer</p>
        <p>💡 Cliquez et glissez pour déplacer le graphique</p>
        <p>💡 Survolez une bougie pour voir ses détails</p>
      </div>
    </div>
  );
}
