/**
 * Exemple de streaming de données en temps réel
 * 
 * Cet exemple montre comment :
 * - Mettre à jour le graphique toutes les X secondes avec de nouvelles données
 * - Gérer l'ajout de nouvelles bougies
 * - Mettre à jour la dernière bougie en cours de formation
 * - Utiliser un hook réutilisable pour le polling
 */

import { createSignal, onMount, onCleanup, Show, createEffect } from 'solid-js';
import { OHLCChart, validateOHLCData } from 'ohlc-chart-solid';
import type { OHLCData } from 'ohlc-chart-solid';

interface ApiResponse {
  timestamp: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
}

/**
 * Hook pour charger des données via polling (mise à jour toutes les X secondes)
 */
function usePollingData(
  fetchFn: () => Promise<OHLCData[]>,
  intervalMs: number = 5000,
  options: {
    maxCandles?: number; // Nombre maximum de bougies à garder
    updateLastCandle?: boolean; // Mettre à jour la dernière bougie au lieu d'en ajouter une nouvelle
  } = {}
) {
  const [data, setData] = createSignal<OHLCData[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [lastUpdate, setLastUpdate] = createSignal<Date | null>(null);

  let intervalId: number | null = null;

  const fetchData = async () => {
    try {
      setError(null);
      const newData = await fetchFn();

      if (newData.length === 0) {
        return;
      }

      setData((prev) => {
        if (prev.length === 0) {
          // Première charge
          return newData;
        }

        if (options.updateLastCandle) {
          // Mettre à jour la dernière bougie si elle a le même timestamp
          const lastPrev = prev[prev.length - 1];
          const firstNew = newData[0];

          if (lastPrev.time === firstNew.time) {
            // Mettre à jour la dernière bougie
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...firstNew,
              // Garder le open de la bougie originale, mettre à jour high/low/close
              open: lastPrev.open,
              high: Math.max(lastPrev.high, firstNew.high),
              low: Math.min(lastPrev.low, firstNew.low),
              close: firstNew.close,
            };

            // Ajouter les nouvelles bougies suivantes
            const rest = newData.slice(1);
            const combined = [...updated, ...rest];

            // Limiter le nombre de bougies si nécessaire
            if (options.maxCandles) {
              return combined.slice(-options.maxCandles);
            }
            return combined;
          }
        }

        // Ajouter les nouvelles bougies
        // Filtrer les doublons basés sur le timestamp
        const existingTimes = new Set(prev.map((c) => c.time));
        const newCandles = newData.filter((c) => !existingTimes.has(c.time));

        if (newCandles.length === 0) {
          return prev; // Pas de nouvelles données
        }

        const combined = [...prev, ...newCandles].sort((a, b) => a.time - b.time);

        // Limiter le nombre de bougies si nécessaire
        if (options.maxCandles) {
          return combined.slice(-options.maxCandles);
        }
        return combined;
      });

      setLastUpdate(new Date());
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  onMount(async () => {
    setLoading(true);
    await fetchData();
    setLoading(false);

    // Démarrer le polling
    intervalId = window.setInterval(fetchData, intervalMs);
  });

  onCleanup(() => {
    if (intervalId !== null) {
      clearInterval(intervalId);
    }
  });

  return {
    data,
    loading,
    error,
    lastUpdate,
    refetch: fetchData,
  };
}

/**
 * Exemple 1 : Polling simple - Mise à jour toutes les 5 secondes
 */
export function StreamingPollingExample() {
  // Simuler une API qui retourne de nouvelles données
  const fetchDataFromApi = async (): Promise<OHLCData[]> => {
    // Simuler un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Générer des données de test
    const now = Date.now();
    const candles: OHLCData[] = [];
    const basePrice = 100 + Math.random() * 10;

    // Générer 1-3 nouvelles bougies
    const count = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < count; i++) {
      const time = now - (count - i - 1) * 60000; // 1 minute d'intervalle
      const volatility = 0.5 + Math.random() * 1;
      const open = basePrice + (Math.random() - 0.5) * 2;
      const change = (Math.random() - 0.5) * volatility;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * volatility * 0.3;
      const low = Math.min(open, close) - Math.random() * volatility * 0.3;

      candles.push({ time, open, high, low, close });
    }

    return candles;
  };

  const { data, loading, error, lastUpdate, refetch } = usePollingData(
    fetchDataFromApi,
    5000, // Mise à jour toutes les 5 secondes
    {
      maxCandles: 500, // Garder seulement les 500 dernières bougies
    }
  );

  return (
    <div class="min-h-screen bg-[#0a0a14] p-5 text-white font-sans">
      <h1 class="mb-5 text-2xl font-semibold">
        Streaming avec Polling - OHLC Chart
      </h1>

      <div class="mb-4 text-slate-300 space-y-1">
        <p class="flex items-center gap-2">
          📊 Mise à jour automatique toutes les 5 secondes
          {lastUpdate() && (
            <span class="text-slate-400">
              | Dernière mise à jour: {lastUpdate()!.toLocaleTimeString()}
            </span>
          )}
        </p>
        <button
          onClick={refetch}
          class="mt-2 inline-flex items-center gap-2 rounded bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-[#0a0a14]"
        >
          🔄 Rafraîchir maintenant
        </button>
      </div>

      <Show when={loading()}>
        <div class="rounded bg-slate-800/60 p-5 text-slate-300">
          Chargement des données...
        </div>
      </Show>

      <Show when={error()}>
        <div
          class="mb-5 rounded bg-[#2a1a1a] p-5 text-rose-400"
        >
          <strong>Erreur:</strong> {error()}
        </div>
      </Show>

      <Show when={!loading() && !error() && data().length > 0}>
        <OHLCChart data={data()} width={900} height={500} timeframe={1} />

        <div
          class="mt-5 text-sm text-slate-300 space-y-1"
        >
          <p>✅ {data().length} bougies chargées</p>
          <p>🔄 Mise à jour automatique activée (toutes les 5 secondes)</p>
        </div>
      </Show>
    </div>
  );
}

/**
 * Exemple 2 : Mise à jour de la dernière bougie en cours de formation
 * Utile pour les données en temps réel où la dernière bougie n'est pas encore fermée
 */
export function StreamingUpdateLastCandleExample() {
  const fetchDataFromApi = async (): Promise<OHLCData[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const now = Date.now();
    const currentMinute = Math.floor(now / 60000) * 60000; // Arrondir à la minute
    const basePrice = 100 + Math.random() * 10;
    const volatility = 0.5 + Math.random() * 1;

    // Simuler une bougie en cours de formation
    const open = basePrice;
    const currentPrice = open + (Math.random() - 0.5) * volatility;
    const high = Math.max(open, currentPrice) + Math.random() * volatility * 0.2;
    const low = Math.min(open, currentPrice) - Math.random() * volatility * 0.2;

    return [
      {
        time: currentMinute,
        open,
        high,
        low,
        close: currentPrice, // Prix actuel (pas encore fermé)
      },
    ];
  };

  const { data, loading, error, lastUpdate } = usePollingData(
    fetchDataFromApi,
    2000, // Mise à jour toutes les 2 secondes
    {
      maxCandles: 200,
      updateLastCandle: true, // Mettre à jour la dernière bougie au lieu d'en ajouter une nouvelle
    }
  );

  return (
    <div class="min-h-screen bg-[#0a0a14] p-5 text-white font-sans">
      <h1 class="mb-5 text-2xl font-semibold">
        Streaming - Mise à jour de la dernière bougie
      </h1>

      <div class="mb-4 text-slate-300">
        <p class="flex items-center gap-2">
          📊 Mise à jour de la dernière bougie toutes les 2 secondes
          {lastUpdate() && (
            <span class="text-slate-400">
              | Dernière mise à jour: {lastUpdate()!.toLocaleTimeString()}
            </span>
          )}
        </p>
      </div>

      <Show when={loading()}>
        <div class="rounded bg-slate-800/60 p-5 text-slate-300">
          Chargement des données...
        </div>
      </Show>

      <Show when={error()}>
        <div
          class="mb-5 rounded bg-[#2a1a1a] p-5 text-rose-400"
        >
          <strong>Erreur:</strong> {error()}
        </div>
      </Show>

      <Show when={!loading() && !error() && data().length > 0}>
        <OHLCChart data={data()} width={900} height={500} timeframe={1} />

        <div
          class="mt-5 text-sm text-slate-300 space-y-1"
        >
          <p>✅ {data().length} bougies chargées</p>
          <p>🔄 La dernière bougie est mise à jour en temps réel</p>
        </div>
      </Show>
    </div>
  );
}

/**
 * Exemple 3 : Intégration avec une vraie API REST
 */
export function RealApiStreamingExample() {
  const fetchDataFromApi = async (): Promise<OHLCData[]> => {
    // Remplacez par votre endpoint réel
    const response = await fetch('/api/ohlc/latest?limit=10', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const apiData: ApiResponse[] = await response.json();

    return apiData.map((item) => {
      const time =
        typeof item.timestamp === 'string'
          ? new Date(item.timestamp).getTime()
          : item.timestamp * 1000;

      return {
        time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      };
    });
  };

  const { data, loading, error, lastUpdate } = usePollingData(
    fetchDataFromApi,
    10000, // Mise à jour toutes les 10 secondes
    {
      maxCandles: 1000,
    }
  );

  return (
    <div class="min-h-screen bg-[#0a0a14] p-5 text-white font-sans">
      <h1 class="mb-5 text-2xl font-semibold">
        Streaming avec API REST
      </h1>

      <div class="mb-4 text-slate-300">
        <p class="flex items-center gap-2">
          📊 Mise à jour depuis l'API toutes les 10 secondes
          {lastUpdate() && (
            <span class="text-slate-400">
              | Dernière mise à jour: {lastUpdate()!.toLocaleTimeString()}
            </span>
          )}
        </p>
      </div>

      <Show when={loading()}>
        <div class="rounded bg-slate-800/60 p-5 text-slate-300">
          Chargement des données...
        </div>
      </Show>

      <Show when={error()}>
        <div
          class="mb-5 rounded bg-[#2a1a1a] p-5 text-rose-400"
        >
          <strong>Erreur:</strong> {error()}
        </div>
      </Show>

      <Show when={!loading() && !error() && data().length > 0}>
        <OHLCChart data={data()} width={900} height={500} timeframe={1} />

        <div
          class="mt-5 text-sm text-slate-300"
        >
          <p>✅ {data().length} bougies chargées</p>
        </div>
      </Show>
    </div>
  );
}

export default StreamingPollingExample;
