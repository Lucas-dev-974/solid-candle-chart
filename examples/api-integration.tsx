/**
 * Exemple d'intégration avec une API
 * 
 * Cet exemple montre comment :
 * - Charger des données depuis une API
 * - Convertir les données au format OHLCData
 * - Gérer les états de chargement et d'erreur
 */

import { createSignal, onCleanup, onMount, Show } from 'solid-js';
import { OHLCChart, validateOHLCData } from 'ohlc-chart-solid';
import type { OHLCData } from 'ohlc-chart-solid';

interface ApiResponse {
  timestamp: string; // Format ISO ou timestamp
  open: number;
  high: number;
  low: number;
  close: number;
}

export default function ApiIntegrationExample() {
  const [data, setData] = createSignal<OHLCData[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  // Fonction pour convertir les données de l'API au format OHLCData
  function convertApiDataToOHLC(apiData: ApiResponse[]): OHLCData[] {
    return apiData.map((item) => {
      // Convertir le timestamp en millisecondes
      const time = typeof item.timestamp === 'string'
        ? new Date(item.timestamp).getTime()
        : item.timestamp * 1000; // Si c'est déjà un nombre, convertir de secondes à millisecondes

      return {
        time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      };
    });
  }

  // Charger les données au montage du composant
  onMount(async () => {
    try {
      setLoading(true);
      setError(null);

      // Exemple : appel API
      // Remplacez cette URL par votre endpoint réel
      const response = await fetch('/api/ohlc-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const apiData: ApiResponse[] = await response.json();

      // Convertir les données
      const ohlcData = convertApiDataToOHLC(apiData);

      // Valider les données
      const validatedData = validateOHLCData(ohlcData);

      if (validatedData.length === 0) {
        throw new Error('Aucune donnée valide après validation');
      }

      setData(validatedData);
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  });

  return (
    <div class="min-h-screen bg-[#0a0a14] p-5 text-white font-sans">
      <h1 class="mb-5 text-2xl font-semibold">
        Intégration API - OHLC Chart
      </h1>

      <Show when={loading()}>
        <div class="rounded bg-slate-800/60 p-5 text-slate-300">
          Chargement des données...
        </div>
      </Show>

      <Show when={error()}>
        <div class="mb-5 rounded bg-[#2a1a1a] p-5 text-rose-400">
          <strong>Erreur:</strong> {error()}
        </div>
      </Show>

      <Show when={!loading() && !error() && data().length > 0}>
        <OHLCChart
          data={data()}
          width={900}
          height={500}
          timeframe={1}
        />

        <div class="mt-5 text-sm text-slate-300">
          <p>✅ {data().length} bougies chargées</p>
        </div>
      </Show>

      <Show when={!loading() && !error() && data().length === 0}>
        <div class="rounded bg-slate-800/60 p-5 text-slate-300">
          Aucune donnée disponible
        </div>
      </Show>
    </div>
  );
}

/**
 * Hook pour charger des données avec WebSocket en temps réel
 * 
 * @param url - URL du WebSocket
 * @param symbol - Symbole à suivre (optionnel)
 * @param options - Options de configuration
 */
export function useWebSocketData(
  url: string | ((symbol: string) => string),
  symbol?: string,
  options: {
    maxCandles?: number; // Nombre maximum de bougies à garder
    updateLastCandle?: boolean; // Mettre à jour la dernière bougie si même timestamp
    autoReconnect?: boolean; // Reconnexion automatique en cas de déconnexion
    reconnectDelay?: number; // Délai avant reconnexion (ms)
  } = {}
) {
  const [data, setData] = createSignal<OHLCData[]>([]);
  const [connected, setConnected] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [lastMessage, setLastMessage] = createSignal<Date | null>(null);

  const {
    maxCandles = 1000,
    updateLastCandle = false,
    autoReconnect = true,
    reconnectDelay = 3000,
  } = options;

  let ws: WebSocket | null = null;
  let reconnectTimeout: number | null = null;

  const connect = () => {
    try {
      const wsUrl = typeof url === 'function' && symbol ? url(symbol) : url;
      if (typeof wsUrl !== 'string') {
        throw new Error('L\'URL WebSocket doit être une chaîne de caractères');
      }
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connecté');
        setConnected(true);
        setError(null);

        // Envoyer un message de souscription si nécessaire
        if (symbol && ws) {
          ws.send(JSON.stringify({ action: 'subscribe', symbol }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          // Format attendu: { type: 'candle', timestamp, open, high, low, close }
          if (message.type === 'candle' || message.candle) {
            const candle = message.candle || message;
            const candleData: OHLCData = {
              time:
                typeof candle.timestamp === 'string'
                  ? new Date(candle.timestamp).getTime()
                  : candle.timestamp * 1000,
              open: candle.open,
              high: candle.high,
              low: candle.low,
              close: candle.close,
            };

            setData((prev) => {
              if (prev.length === 0) {
                return [candleData];
              }

              if (updateLastCandle) {
                const lastCandle = prev[prev.length - 1];
                if (lastCandle.time === candleData.time) {
                  // Mettre à jour la dernière bougie
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...candleData,
                    open: lastCandle.open, // Garder l'open original
                    high: Math.max(lastCandle.high, candleData.high),
                    low: Math.min(lastCandle.low, candleData.low),
                    close: candleData.close,
                  };
                  return updated.slice(-maxCandles);
                }
              }

              // Ajouter la nouvelle bougie
              const existingTimes = new Set(prev.map((c) => c.time));
              if (existingTimes.has(candleData.time)) {
                // Mettre à jour la bougie existante
                return prev.map((c) =>
                  c.time === candleData.time ? candleData : c
                );
              }

              const newData = [...prev, candleData].sort((a, b) => a.time - b.time);
              return newData.slice(-maxCandles);
            });

            setLastMessage(new Date());
          }
        } catch (err) {
          console.error('Erreur lors du parsing du message WebSocket:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('Erreur WebSocket:', err);
        setError('Erreur de connexion WebSocket');
        setConnected(false);
      };

      ws.onclose = () => {
        console.log('WebSocket fermé');
        setConnected(false);
        ws = null;

        // Reconnexion automatique si activée
        if (autoReconnect) {
          reconnectTimeout = window.setTimeout(() => {
            console.log('Tentative de reconnexion...');
            connect();
          }, reconnectDelay);
        }
      };
    } catch (err) {
      console.error('Erreur lors de la connexion WebSocket:', err);
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    }
  };

  const disconnect = () => {
    if (reconnectTimeout !== null) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    if (ws) {
      ws.close();
      ws = null;
    }
    setConnected(false);
  };

  onMount(() => {
    connect();
  });

  onCleanup(() => {
    disconnect();
  });

  return {
    data,
    connected,
    error,
    lastMessage,
    reconnect: connect,
    disconnect,
  };
}

/**
 * Exemple d'utilisation du hook WebSocket
 */
export function WebSocketStreamingExample() {
  const { data, connected, error, lastMessage } = useWebSocketData(
    (symbol) => `wss://api.example.com/ohlc/${symbol}`,
    'BTC/USDT',
    {
      maxCandles: 500,
      updateLastCandle: true, // Mettre à jour la dernière bougie en temps réel
      autoReconnect: true,
      reconnectDelay: 3000,
    }
  );

  return (
    <div class="min-h-screen bg-[#0a0a14] p-5 text-white font-sans">
      <h1 class="mb-5 text-2xl font-semibold">
        Streaming WebSocket - OHLC Chart
      </h1>

      <div class="mb-4 text-slate-300">
        <p class="flex flex-wrap items-center gap-2">
          Statut:{' '}
          <span class={connected() ? 'text-emerald-400' : 'text-rose-400'}>
            {connected() ? '🟢 Connecté' : '🔴 Déconnecté'}
          </span>
          {lastMessage() && (
            <span class="text-slate-400">
              | Dernier message: {lastMessage()!.toLocaleTimeString()}
            </span>
          )}
        </p>
      </div>

      <Show when={error()}>
        <div
          class="mb-5 rounded bg-[#2a1a1a] p-5 text-rose-400"
        >
          <strong>Erreur:</strong> {error()}
        </div>
      </Show>

      <Show when={data().length > 0}>
        <OHLCChart data={data()} width={900} height={500} timeframe={1} />

        <div
          class="mt-5 text-sm text-slate-300 space-y-1"
        >
          <p>✅ {data().length} bougies chargées</p>
          <p>🔄 Mise à jour en temps réel via WebSocket</p>
        </div>
      </Show>

      <Show when={data().length === 0 && connected()}>
        <div class="rounded bg-slate-800/60 p-5 text-slate-300">
          En attente de données...
        </div>
      </Show>
    </div>
  );
}
