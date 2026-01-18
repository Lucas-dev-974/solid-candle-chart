# OHLC Chart - SolidJS

Une librairie haute performance pour afficher des graphiques en chandeliers (OHLC) construite avec SolidJS.

## ✨ Fonctionnalités

- 📊 **Graphiques OHLC** : Affichage de bougies avec support haute résolution
- 🔍 **Zoom et Pan** : Interactions fluides avec zoom centré sur la souris
- 📈 **Agrégation par timeframe** : Support de multiples timeframes (1m, 5m, 15m, 1h, 1D, etc.)
- 🎨 **Thèmes personnalisables** : Dark mode et thèmes personnalisés
- 🖱️ **Crosshair interactif** : Affichage des coordonnées au survol
- ⚡ **Haute performance** : Rendu optimisé avec canvas et devicePixelRatio

## 📦 Installation

```bash
npm install ohlc-chart-solid
# ou
pnpm add ohlc-chart-solid
# ou
yarn add ohlc-chart-solid
```

## 🚀 Utilisation de base

```tsx
import { OHLCChart } from 'ohlc-chart-solid';
import type { OHLCData } from 'ohlc-chart-solid';

const data: OHLCData[] = [
  {
    time: Date.now() - 3600000, // Il y a 1 heure
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

function App() {
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

## 📚 API Reference

### Composant `OHLCChart`

Le composant principal pour afficher le graphique OHLC.

#### Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `data` | `OHLCData[]` | **requis** | Tableau de données OHLC à afficher |
| `width` | `number` | `800` | Largeur du graphique en pixels |
| `height` | `number` | `400` | Hauteur du graphique en pixels |
| `timeframe` | `number` | `1` | Timeframe en minutes (1, 5, 15, 30, 60, 240, 1440) |
| `timeRange` | `[number, number]` | `undefined` | Plage temporelle visible `[min, max]` en timestamp. Si non défini, auto-fit |
| `priceRange` | `[number, number]` | `undefined` | Plage de prix visible `[min, max]`. Si non défini, auto-fit |
| `theme` | `Partial<ChartTheme>` | `undefined` | Thème personnalisé (voir ci-dessous) |
| `onViewportChange` | `(viewport: Viewport) => void` | `undefined` | Callback appelé quand le viewport change |
| `onTimeframeChange` | `(timeframe: number) => void` | `undefined` | Callback appelé quand le timeframe change |

#### Types

##### `OHLCData`

```typescript
interface OHLCData {
  time: number;    // Timestamp en millisecondes
  open: number;   // Prix d'ouverture
  high: number;   // Prix le plus haut
  low: number;    // Prix le plus bas
  close: number;  // Prix de clôture
}
```

##### `Viewport`

```typescript
interface Viewport {
  timeRange: [number, number];   // [minTime, maxTime] en timestamp
  priceRange: [number, number];  // [minPrice, maxPrice]
}
```

##### `ChartTheme`

```typescript
interface ChartTheme {
  background: string;   // Couleur de fond
  bullCandle: string;   // Couleur bougie haussière
  bearCandle: string;  // Couleur bougie baissière
  bullWick: string;    // Couleur mèche haussière
  bearWick: string;    // Couleur mèche baissière
  axisLine: string;     // Couleur ligne d'axe
  axisText: string;    // Couleur texte d'axe
  gridLine: string;     // Couleur ligne de grille
  crosshair: string;   // Couleur du crosshair
}
```

## 📖 Exemples

### Exemple avec données générées

```tsx
import { createSignal } from 'solid-js';
import { OHLCChart, TIMEFRAMES, type OHLCData } from 'ohlc-chart-solid';

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

function App() {
  const [timeframe, setTimeframe] = createSignal(1);
  const data = generateSampleData(500);

  return (
    <div>
      <div>
        {TIMEFRAMES.map((tf) => (
          <button onClick={() => setTimeframe(tf.value)}>
            {tf.label}
          </button>
        ))}
      </div>
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

### Exemple avec thème personnalisé

```tsx
import { OHLCChart, DEFAULT_THEME, type OHLCData } from 'ohlc-chart-solid';

const customTheme = {
  ...DEFAULT_THEME,
  background: '#0a0a0a',
  bullCandle: '#00ff88',
  bearCandle: '#ff4444',
};

function App() {
  return (
    <OHLCChart
      data={data}
      width={800}
      height={400}
      theme={customTheme}
    />
  );
}
```

### Exemple avec viewport contrôlé

```tsx
import { createSignal } from 'solid-js';
import { OHLCChart, type OHLCData, type Viewport } from 'ohlc-chart-solid';

function App() {
  const [viewport, setViewport] = createSignal<Viewport | undefined>();

  const handleViewportChange = (newViewport: Viewport) => {
    setViewport(newViewport);
    console.log('Viewport changed:', newViewport);
  };

  return (
    <OHLCChart
      data={data}
      width={800}
      height={400}
      timeRange={viewport()?.timeRange}
      priceRange={viewport()?.priceRange}
      onViewportChange={handleViewportChange}
    />
  );
}
```

## 🎮 Interactions

### Zoom

- **Molette de la souris** : Zoom sur l'axe X (temps)
- **Alt + Molette** : Zoom sur l'axe Y (prix)
- **Ctrl + Molette** : Zoom sur les deux axes

Le zoom est centré sur la position de la souris.

### Pan (Déplacement)

- **Clic gauche + glisser** : Déplacer le viewport

### Crosshair

- **Survol** : Affiche les coordonnées (temps et prix) à la position de la souris
- **Survol d'une bougie** : Affiche les détails de la bougie (OHLC)

## 🛠️ Utilitaires exportés

### `createScale(viewport, dimensions)`

Crée des fonctions de transformation entre coordonnées de données et pixels.

```typescript
import { createScale } from 'ohlc-chart-solid';

const scale = createScale(
  { timeRange: [0, 1000], priceRange: [100, 200] },
  { width: 800, height: 400 }
);

const x = scale.xToPixel(500); // Convertit le temps en pixel X
const y = scale.yToPixel(150); // Convertit le prix en pixel Y
```

### `fitToData(data, paddingPercent?)`

Calcule un viewport qui affiche toutes les données.

```typescript
import { fitToData } from 'ohlc-chart-solid';

const viewport = fitToData(data, 0.05); // 5% de padding
```

### `aggregateOHLC(data, targetMinutes)`

Agrège des données OHLC vers un timeframe supérieur.

```typescript
import { aggregateOHLC } from 'ohlc-chart-solid';

// Agrège des bougies 1m vers 5m
const aggregated = aggregateOHLC(data1m, 5);
```

### `TIMEFRAMES`

Tableau des timeframes prédéfinis.

```typescript
import { TIMEFRAMES } from 'ohlc-chart-solid';

TIMEFRAMES.forEach(tf => {
  console.log(tf.label, tf.value); // "1m" 1, "5m" 5, etc.
});
```

## 🎨 Thèmes

### Thème par défaut

Le thème par défaut est un thème sombre optimisé pour l'affichage de graphiques financiers.

### Personnalisation

Vous pouvez personnaliser n'importe quelle propriété du thème :

```typescript
const lightTheme = {
  background: '#ffffff',
  bullCandle: '#26a69a',
  bearCandle: '#ef5350',
  // ... autres propriétés
};
```

## 📝 Notes

- Les données doivent être triées par temps croissant
- Le timeframe doit être en minutes (1, 5, 15, 30, 60, 240, 1440)
- Les timestamps doivent être en millisecondes
- Le graphique supporte automatiquement les écrans haute résolution (retina)

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

MIT
