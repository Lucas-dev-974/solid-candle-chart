# Guide d'utilisation - ohlc-chart-solid

Ce guide vous montre comment utiliser la librairie `ohlc-chart-solid` dans votre projet SolidJS.

## 📦 Installation

```bash
npm install ohlc-chart-solid
# ou
pnpm add ohlc-chart-solid
# ou
yarn add ohlc-chart-solid
```

## 🚀 Démarrage rapide

### 1. Import du composant

```tsx
import { OHLCChart } from 'ohlc-chart-solid';
import type { OHLCData } from 'ohlc-chart-solid';
```

### 2. Préparer vos données

Les données doivent être au format OHLC avec des timestamps en millisecondes :

```tsx
const data: OHLCData[] = [
  {
    time: 1704067200000, // Timestamp en millisecondes
    open: 100.5,
    high: 105.2,
    low: 98.3,
    close: 103.8,
  },
  {
    time: 1704067260000, // +1 minute
    open: 103.8,
    high: 108.1,
    low: 102.5,
    close: 106.2,
  },
  // ... plus de données
];
```

### 3. Utiliser le composant

```tsx
function MyChart() {
  return (
    <OHLCChart
      data={data}
      width={800}
      height={400}
      timeframe={1} // 1 minute
    />
  );
}
```

## 📝 Exemples complets

### Exemple 1 : Graphique basique

```tsx
import { OHLCChart } from 'ohlc-chart-solid';
import type { OHLCData } from 'ohlc-chart-solid';

function BasicChart() {
  // Données d'exemple
  const data: OHLCData[] = [
    {
      time: Date.now() - 3600000,
      open: 100,
      high: 105,
      low: 98,
      close: 103,
    },
    {
      time: Date.now(),
      open: 103,
      high: 108,
      low: 102,
      close: 106,
    },
  ];

  return (
    <OHLCChart
      data={data}
      width={800}
      height={400}
      timeframe={1}
    />
  );
}
```

### Exemple 2 : Avec changement de timeframe

```tsx
import { createSignal } from 'solid-js';
import { OHLCChart, TIMEFRAMES } from 'ohlc-chart-solid';
import type { OHLCData, TimeframeMinutes } from 'ohlc-chart-solid';

function ChartWithTimeframe() {
  const [timeframe, setTimeframe] = createSignal<TimeframeMinutes>(1);
  const data: OHLCData[] = [/* vos données */];

  return (
    <div>
      {/* Sélecteur de timeframe */}
      <div style="margin-bottom: 15px; display: flex; gap: 8px;">
        {TIMEFRAMES.map((tf) => (
          <button
            onClick={() => setTimeframe(tf.value)}
            style={{
              padding: '8px 16px',
              background: timeframe() === tf.value ? '#26a69a' : '#2a2a3e',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Graphique */}
      <OHLCChart
        data={data}
        width={900}
        height={500}
        timeframe={timeframe()}
      />
    </div>
  );
}
```

### Exemple 3 : Avec thème personnalisé

```tsx
import { OHLCChart, DEFAULT_THEME } from 'ohlc-chart-solid';
import type { OHLCData, ChartTheme } from 'ohlc-chart-solid';

function CustomThemeChart() {
  const data: OHLCData[] = [/* vos données */];

  // Personnaliser le thème
  const customTheme: Partial<ChartTheme> = {
    ...DEFAULT_THEME,
    background: '#0a0a0a',
    bullCandle: '#00ff88', // Vert pour les bougies haussières
    bearCandle: '#ff4444', // Rouge pour les bougies baissières
    axisText: '#ffffff',
  };

  return (
    <OHLCChart
      data={data}
      width={800}
      height={400}
      timeframe={1}
      theme={customTheme}
    />
  );
}
```

### Exemple 4 : Contrôle du viewport

```tsx
import { createSignal } from 'solid-js';
import { OHLCChart } from 'ohlc-chart-solid';
import type { OHLCData, Viewport } from 'ohlc-chart-solid';

function ControlledViewportChart() {
  const data: OHLCData[] = [/* vos données */];
  const [viewport, setViewport] = createSignal<Viewport | undefined>();

  const handleViewportChange = (newViewport: Viewport) => {
    setViewport(newViewport);
    console.log('Viewport changé:', newViewport);
    // Vous pouvez sauvegarder le viewport dans le localStorage, etc.
  };

  return (
    <div>
      <OHLCChart
        data={data}
        width={800}
        height={400}
        timeframe={1}
        timeRange={viewport()?.timeRange}
        priceRange={viewport()?.priceRange}
        onViewportChange={handleViewportChange}
      />
      
      {/* Afficher le viewport actuel */}
      {viewport() && (
        <div>
          <p>Plage temporelle: {new Date(viewport()!.timeRange[0]).toLocaleString()} - {new Date(viewport()!.timeRange[1]).toLocaleString()}</p>
          <p>Plage de prix: {viewport()!.priceRange[0]} - {viewport()!.priceRange[1]}</p>
        </div>
      )}
    </div>
  );
}
```

### Exemple 5 : Charger des données depuis une API

```tsx
import { createSignal, onMount } from 'solid-js';
import { OHLCChart } from 'ohlc-chart-solid';
import type { OHLCData } from 'ohlc-chart-solid';

function ApiDataChart() {
  const [data, setData] = createSignal<OHLCData[]>([]);
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    try {
      // Exemple : charger depuis une API
      const response = await fetch('/api/ohlc-data');
      const apiData = await response.json();
      
      // Convertir les données de l'API au format OHLCData
      const ohlcData: OHLCData[] = apiData.map((item: any) => ({
        time: new Date(item.timestamp).getTime(),
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }));
      
      setData(ohlcData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  });

  if (loading()) {
    return <div>Chargement...</div>;
  }

  return (
    <OHLCChart
      data={data()}
      width={800}
      height={400}
      timeframe={1}
    />
  );
}
```

### Exemple 6 : Utiliser les utilitaires

```tsx
import { fitToData, aggregateOHLC, validateOHLCData } from 'ohlc-chart-solid';
import type { OHLCData, Viewport } from 'ohlc-chart-solid';

function UtilityExample() {
  // Données brutes (peut contenir des erreurs)
  const rawData: any[] = [/* données non validées */];

  // 1. Valider les données
  const validatedData = validateOHLCData(rawData);

  // 2. Calculer un viewport qui affiche toutes les données
  const viewport: Viewport = fitToData(validatedData, 0.05); // 5% de padding

  // 3. Agrégation : convertir des bougies 1m en bougies 5m
  const data1m: OHLCData[] = [/* données 1 minute */];
  const data5m = aggregateOHLC(data1m, 5);

  return (
    <OHLCChart
      data={data5m}
      width={800}
      height={400}
      timeframe={5}
      timeRange={viewport.timeRange}
      priceRange={viewport.priceRange}
    />
  );
}
```

## 🎮 Interactions utilisateur

Le graphique supporte plusieurs interactions :

### Zoom
- **Molette de la souris** : Zoom sur l'axe X (temps)
- **Alt + Molette** : Zoom sur l'axe Y (prix)
- **Ctrl + Molette** : Zoom sur les deux axes simultanément

Le zoom est centré sur la position de la souris.

### Pan (Déplacement)
- **Clic gauche + glisser** : Déplacer le viewport pour explorer différentes parties du graphique

### Crosshair
- **Survol** : Affiche les coordonnées (temps et prix) à la position de la souris
- **Survol d'une bougie** : Affiche les détails de la bougie (OHLC) dans une infobulle

## 🔧 Configuration avancée

### Tous les props disponibles

```tsx
<OHLCChart
  // Requis
  data={data}
  
  // Optionnels
  width={800}                    // Largeur en pixels
  height={400}                   // Hauteur en pixels
  timeframe={1}                  // Timeframe en minutes
  timeRange={[minTime, maxTime]} // Plage temporelle visible
  priceRange={[minPrice, maxPrice]} // Plage de prix visible
  theme={customTheme}            // Thème personnalisé
  onViewportChange={(viewport) => {}} // Callback viewport
  onTimeframeChange={(tf) => {}}      // Callback timeframe
/>
```

### Timeframes disponibles

```tsx
import { TIMEFRAMES } from 'ohlc-chart-solid';

// TIMEFRAMES contient :
// [
//   { label: '1m', value: 1 },
//   { label: '5m', value: 5 },
//   { label: '15m', value: 15 },
//   { label: '30m', value: 30 },
//   { label: '1h', value: 60 },
//   { label: '4h', value: 240 },
//   { label: '1D', value: 1440 },
//   { label: '1W', value: 10080 },
// ]
```

## 📊 Format des données

### Structure OHLCData

```typescript
interface OHLCData {
  time: number;    // Timestamp en millisecondes (Date.now() ou new Date().getTime())
  open: number;   // Prix d'ouverture
  high: number;   // Prix le plus haut (doit être >= max(open, close))
  low: number;    // Prix le plus bas (doit être <= min(open, close))
  close: number;  // Prix de clôture
}
```

### Exigences importantes

1. **Tri des données** : Les données doivent être triées par `time` croissant
2. **Timestamps** : Utilisez des timestamps en millisecondes (pas en secondes)
3. **Validation** : Utilisez `validateOHLCData()` pour vérifier vos données

### Exemple de conversion depuis différents formats

```tsx
// Depuis un format API classique
const apiData = [
  { timestamp: '2024-01-01T10:00:00Z', open: 100, high: 105, low: 98, close: 103 },
  // ...
];

const ohlcData: OHLCData[] = apiData.map(item => ({
  time: new Date(item.timestamp).getTime(),
  open: item.open,
  high: item.high,
  low: item.low,
  close: item.close,
}));

// Depuis un format avec timestamp en secondes
const dataWithSeconds = [
  { time: 1704067200, open: 100, high: 105, low: 98, close: 103 },
  // ...
];

const ohlcData: OHLCData[] = dataWithSeconds.map(item => ({
  time: item.time * 1000, // Convertir en millisecondes
  open: item.open,
  high: item.high,
  low: item.low,
  close: item.close,
}));
```

## 🎨 Personnalisation du thème

### Thème par défaut

```typescript
const DEFAULT_THEME = {
  background: '#1a1a2e',
  bullCandle: '#26a69a',
  bearCandle: '#ef5350',
  bullWick: '#26a69a',
  bearWick: '#ef5350',
  axisLine: '#404040',
  axisText: '#a0a0a0',
  gridLine: '#2a2a3e',
  crosshair: '#606060',
};
```

### Créer un thème clair

```tsx
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
```

## 🐛 Dépannage

### Le graphique ne s'affiche pas

1. Vérifiez que `data` n'est pas vide
2. Vérifiez que les données sont au bon format
3. Vérifiez la console pour les erreurs

### Les données ne s'affichent pas correctement

1. Utilisez `validateOHLCData()` pour valider vos données
2. Vérifiez que les données sont triées par temps
3. Vérifiez que les timestamps sont en millisecondes

### Le zoom/pan ne fonctionne pas

1. Assurez-vous que le composant a une taille définie (`width` et `height`)
2. Vérifiez qu'il n'y a pas d'autres éléments qui interceptent les événements de souris

## 📚 Ressources

- [README.md](./README.md) - Documentation complète de l'API
- [PUBLISH.md](./PUBLISH.md) - Guide de publication sur npm

## 💡 Astuces

1. **Performance** : Pour de grandes quantités de données, utilisez `timeRange` pour n'afficher qu'une partie des données
2. **Responsive** : Utilisez des signaux SolidJS pour rendre le graphique responsive :
   ```tsx
   const [width, setWidth] = createSignal(800);
   // Utilisez un ResizeObserver pour mettre à jour width()
   ```
3. **Mise à jour des données** : Le graphique se met à jour automatiquement quand `data` change (grâce à la réactivité de SolidJS)
