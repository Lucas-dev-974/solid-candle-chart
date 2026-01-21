/**
 * Exemple de personnalisation du thème
 * 
 * Cet exemple montre comment créer et utiliser des thèmes personnalisés
 */

import { createSignal } from 'solid-js';
import { OHLCChart, DEFAULT_THEME } from 'ohlc-chart-solid';
import type { OHLCData, ChartTheme } from 'ohlc-chart-solid';

// Générer des données d'exemple
function generateSampleData(count: number): OHLCData[] {
  const data: OHLCData[] = [];
  const now = Date.now();
  const interval = 60 * 1000;
  let price = 100;

  for (let i = 0; i < count; i++) {
    const volatility = 0.5 + Math.random() * 1;
    const open = price;
    const change = (Math.random() - 0.5) * volatility;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.3;
    const low = Math.min(open, close) - Math.random() * volatility * 0.3;

    data.push({ time: now - (count - i) * interval, open, high, low, close });
    price = close;
  }

  return data;
}

type ThemeKey = 'default' | 'light' | 'neon' | 'classic';

// Thème clair
const lightTheme: Partial<ChartTheme> = {
  background: '#ffffff',
  bullCandle: '#26a69a',
  bearCandle: '#ef5350',
  bullWick: '#26a69a',
  bearWick: '#ef5350',
  axisLine: '#e0e0e0',
  axisText: '#333333',
  gridLine: '#f5f5f5',
  crosshair: '#999999',
};

// Thème sombre personnalisé (vert/rouge néon)
const neonTheme: Partial<ChartTheme> = {
  background: '#0a0a0a',
  bullCandle: '#00ff88',
  bearCandle: '#ff4444',
  bullWick: '#00ff88',
  bearWick: '#ff4444',
  axisLine: '#333333',
  axisText: '#ffffff',
  gridLine: '#1a1a1a',
  crosshair: '#666666',
};

// Thème bleu/rouge classique
const classicTheme: Partial<ChartTheme> = {
  background: '#1e1e2e',
  bullCandle: '#4a9eff',
  bearCandle: '#ff6b6b',
  bullWick: '#4a9eff',
  bearWick: '#ff6b6b',
  axisLine: '#404040',
  axisText: '#b0b0b0',
  gridLine: '#2a2a3e',
  crosshair: '#707070',
};

export default function CustomThemeExample() {
  const [selectedThemeKey, setSelectedThemeKey] = createSignal<ThemeKey>('default');
  const data = generateSampleData(500);

  const themes = [
    { key: 'default' as const, name: 'Défaut (sombre)', theme: DEFAULT_THEME },
    { key: 'light' as const, name: 'Clair', theme: lightTheme },
    { key: 'neon' as const, name: 'Néon', theme: neonTheme },
    { key: 'classic' as const, name: 'Classique', theme: classicTheme },
  ];

  const themeByKey: Record<ThemeKey, Partial<ChartTheme>> = {
    default: DEFAULT_THEME,
    light: lightTheme,
    neon: neonTheme,
    classic: classicTheme,
  };

  const swatchClasses: Record<ThemeKey, { background: string; bull: string; bear: string }> = {
    default: {
      background: 'bg-[#1a1a2e]',
      bull: 'bg-[#26a69a]',
      bear: 'bg-[#ef5350]',
    },
    light: {
      background: 'bg-white',
      bull: 'bg-[#26a69a]',
      bear: 'bg-[#ef5350]',
    },
    neon: {
      background: 'bg-[#0a0a0a]',
      bull: 'bg-[#00ff88]',
      bear: 'bg-[#ff4444]',
    },
    classic: {
      background: 'bg-[#1e1e2e]',
      bull: 'bg-[#4a9eff]',
      bear: 'bg-[#ff6b6b]',
    },
  };

  return (
    <div class="min-h-screen bg-[#0a0a14] p-5 text-white font-sans">
      <h1 class="mb-5 text-2xl font-semibold">
        Exemple de thèmes personnalisés
      </h1>

      {/* Sélecteur de thème */}
      <div class="mb-4 flex flex-wrap gap-2">
        {themes.map(({ key, name }) => (
          <button
            onClick={() => setSelectedThemeKey(key)}
            class={`rounded px-4 py-2 text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-[#0a0a14] ${selectedThemeKey() === key
                ? 'bg-emerald-500 font-semibold text-white'
                : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Graphique avec thème sélectionné */}
      <OHLCChart
        data={data}
        width={900}
        height={500}
        timeframe={1}
        theme={themeByKey[selectedThemeKey()]}
      />

      {/* Aperçu des couleurs du thème */}
      <div class="mt-5 rounded-md bg-[#1a1a2e] p-4">
        <h3 class="mb-3 text-lg font-semibold">Couleurs du thème actuel :</h3>
        <div class="flex flex-wrap gap-4 text-xs text-slate-300">
          <div class="flex items-center gap-2">
            <div
              class={`h-5 w-5 rounded border border-slate-600 ${swatchClasses[selectedThemeKey()].background}`}
            />
            <span>Fond</span>
          </div>
          <div class="flex items-center gap-2">
            <div
              class={`h-5 w-5 rounded ${swatchClasses[selectedThemeKey()].bull}`}
            />
            <span>Haussier</span>
          </div>
          <div class="flex items-center gap-2">
            <div
              class={`h-5 w-5 rounded ${swatchClasses[selectedThemeKey()].bear}`}
            />
            <span>Baissier</span>
          </div>
        </div>
      </div>
    </div>
  );
}
