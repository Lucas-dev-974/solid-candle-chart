import { onMount, createEffect } from 'solid-js';
import type { Viewport, ChartTheme } from '../core/types';
import { createScale } from '../core/scale';
import { drawTimeAxis } from '../renderers/axis';

interface TimeAxisCanvasProps {
  viewport: Viewport;
  width: number;
  height?: number;
  theme: ChartTheme;
  timeframe?: number;
}

export function TimeAxisCanvas(props: TimeAxisCanvasProps) {
  let canvas: HTMLCanvasElement | undefined;
  let ctx: CanvasRenderingContext2D | null = null;

  const axisHeight = () => props.height ?? 30;

  const draw = () => {
    if (!ctx || !canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const width = props.width;
    const height = axisHeight();

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = props.theme.background;
    ctx.fillRect(0, 0, width, height);

    // Create scale for X axis only (Y doesn't matter here)
    const scale = createScale(props.viewport, { width, height: 1 });

    drawTimeAxis(ctx, props.viewport.timeRange, scale, width, height, props.theme, props.timeframe ?? 1);
  };

  onMount(() => {
    if (canvas) {
      ctx = canvas.getContext('2d');
      draw();
    }
  });

  createEffect(() => {
    props.viewport;
    props.width;
    props.theme;
    props.timeframe;
    draw();
  });

  return <canvas ref={canvas} />;
}
