import { onMount, createEffect, onCleanup } from 'solid-js';
import type { OHLCData, Viewport, ChartTheme } from '../core/types';
import { createScale } from '../core/scale';
import { drawCandles } from '../renderers/candle';
import { drawGrid } from '../renderers/axis';

interface MainCanvasProps {
  data: OHLCData[];
  viewport: Viewport;
  width: number;
  height: number;
  theme: ChartTheme;
  timeframe?: number;
}

export function MainCanvas(props: MainCanvasProps) {
  let canvas: HTMLCanvasElement | undefined;
  let ctx: CanvasRenderingContext2D | null = null;

  const draw = () => {
    if (!ctx || !canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const width = props.width;
    const height = props.height;

    // Set canvas size with DPR
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.fillStyle = props.theme.background;
    ctx.fillRect(0, 0, width, height);

    const scale = createScale(props.viewport, { width, height });

    // Draw grid
    drawGrid(ctx, props.viewport.timeRange, props.viewport.priceRange, scale, width, height, props.theme);

    // Draw candles
    drawCandles(ctx, props.data, scale, width, props.theme, props.viewport, props.timeframe ?? 1);
  };

  onMount(() => {
    if (canvas) {
      ctx = canvas.getContext('2d');
      draw();
    }
  });

  createEffect(() => {
    // Re-draw when any prop changes
    props.data;
    props.viewport;
    props.width;
    props.height;
    props.theme;
    props.timeframe;
    draw();
  });

  return <canvas ref={canvas} />;
}
