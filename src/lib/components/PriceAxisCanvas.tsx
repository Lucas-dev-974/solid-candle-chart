import { onMount, createEffect } from 'solid-js';
import type { Viewport, ChartTheme } from '../core/types';
import { createScale } from '../core/scale';
import { drawPriceAxis } from '../renderers/axis';

interface PriceAxisCanvasProps {
  viewport: Viewport;
  height: number;
  width?: number;
  theme: ChartTheme;
}

export function PriceAxisCanvas(props: PriceAxisCanvasProps) {
  let canvas: HTMLCanvasElement | undefined;
  let ctx: CanvasRenderingContext2D | null = null;

  const axisWidth = () => props.width ?? 60;

  const draw = () => {
    if (!ctx || !canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const width = axisWidth();
    const height = props.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = props.theme.background;
    ctx.fillRect(0, 0, width, height);

    // Create scale for Y axis only (X doesn't matter here)
    const scale = createScale(props.viewport, { width: 1, height });

    drawPriceAxis(ctx, props.viewport.priceRange, scale, width, height, props.theme);
  };

  onMount(() => {
    if (canvas) {
      ctx = canvas.getContext('2d');
      draw();
    }
  });

  createEffect(() => {
    props.viewport;
    props.height;
    props.theme;
    draw();
  });

  return <canvas ref={canvas} />;
}
