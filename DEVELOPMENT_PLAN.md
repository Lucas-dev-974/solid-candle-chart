# Plan de développement - Librairie OHLC SolidJS

## Architecture

```
┌─────────────────────────────┬──────────┐
│                             │          │
│      Canvas Principal       │  Canvas  │
│        (Bougies)            │   Axe Y  │
│                             │  (Prix)  │
│                             │          │
├─────────────────────────────┼──────────┤
│      Canvas Axe X (Temps)   │  (vide)  │
└─────────────────────────────┴──────────┘
```

### Structure des fichiers

```
src/
├── core/
│   ├── types.ts            # Types OHLC, Viewport, Dimensions
│   └── scale.ts            # Transformation données ↔ pixels
├── components/
│   ├── ChartContainer.tsx  # Layout grid + store viewport
│   ├── MainCanvas.tsx      # Canvas des bougies
│   ├── PriceAxisCanvas.tsx # Canvas axe Y
│   └── TimeAxisCanvas.tsx  # Canvas axe X
├── renderers/
│   ├── candle.ts           # Dessin des bougies
│   └── axis.ts             # Dessin des graduations
├── utils/
│   └── graduations.ts      # Calcul des graduations (nice numbers)
└── index.ts
```

---

## Phase 1 : Fondations

### 1.1 Setup projet
- [ ] Initialiser projet SolidJS (Vite + TypeScript)
- [ ] Structure des dossiers
- [ ] Configuration build pour librairie (export ESM)

### 1.2 Types de base
```ts
interface OHLCData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface Viewport {
  timeRange: [number, number];
  priceRange: [number, number];
}

interface Dimensions {
  width: number;
  height: number;
}
```

### 1.3 Scale (transformation coordonnées)
```ts
createScale(viewport, dimensions) → {
  xToPixel(time) → number
  yToPixel(price) → number
  pixelToX(x) → time
  pixelToY(y) → price
}
```

---

## Phase 2 : Les 3 Canvas

### 2.1 Composant ChartContainer
- [ ] Layout CSS Grid (2×2)
- [ ] Gestion du resize (ResizeObserver)
- [ ] Store partagé pour le viewport

### 2.2 MainCanvas (bougies)
- [ ] Canvas 2D avec devicePixelRatio
- [ ] Fonction `drawCandle(ctx, candle, scale)`
- [ ] Redraw réactif quand viewport change

### 2.3 PriceAxisCanvas (axe Y)
- [ ] Calcul auto des graduations (nice numbers)
- [ ] Dessin labels + lignes de graduation
- [ ] Largeur fixe (~60px)

### 2.4 TimeAxisCanvas (axe X)
- [ ] Calcul graduations temporelles (adapté à l'échelle)
- [ ] Formatage dates intelligent
- [ ] Hauteur fixe (~30px)

---

## Phase 3 : Fit des données

### 3.1 Auto-fit viewport
```ts
fitToData(data: OHLCData[]) → Viewport
// Calcule timeRange et priceRange pour afficher toutes les données
// Avec padding optionnel
```

### 3.2 Mode contrôlé vs auto
- [ ] Props `timeRange` / `priceRange` optionnels
- [ ] Si absents → auto-fit
- [ ] Si présents → viewport contrôlé

---

## Phase 4 : Interactions

### 4.1 Zoom (molette)
- [ ] Zoom centré sur la position de la souris
- [ ] Zoom indépendant X/Y ou proportionnel

### 4.2 Pan (drag)
- [ ] Déplacement du viewport au drag
- [ ] Limites optionnelles

### 4.3 Crosshair
- [ ] Overlay canvas ou CSS
- [ ] Affiche prix/temps à la position souris

---

## Phase 5 : Polish

### 5.1 Thèmes
- [ ] Couleurs configurables (bull/bear, background, axes)
- [ ] Dark/light mode

### 5.2 Performance
- [ ] Rendu uniquement des bougies visibles
- [ ] Throttle des redraws pendant interactions

### 5.3 API finale
```tsx
<OHLCChart
  data={candles}
  width={800}
  height={400}
  timeRange={...}        // optionnel
  priceRange={...}       // optionnel
  theme={...}            // optionnel
  onViewportChange={...}
/>
```

---

## Livrables par phase

| Phase | Livrable |
|-------|----------|
| 1 | Types, Scale fonctionnel, tests unitaires |
| 2 | 3 canvas affichant données statiques |
| 3 | Auto-fit + viewport contrôlable |
| 4 | Zoom, pan, crosshair fonctionnels |
| 5 | Librairie publiable (npm) |
