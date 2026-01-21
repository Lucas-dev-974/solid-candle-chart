import { onMount, createEffect } from 'solid-js';
import type { Viewport, ChartTheme } from '../core/types';
import { createScale } from '../core/scale';

interface CrosshairCanvasProps {
  viewport: Viewport;
  width: number;
  height: number;
  theme: ChartTheme;
  mouseX: number | null;
  mouseY: number | null;
  visible: boolean;
}

export function CrosshairCanvas(props: CrosshairCanvasProps) {
  let canvas: HTMLCanvasElement | undefined;
  let ctx: CanvasRenderingContext2D | null = null;

  const draw = () => {
    if (!ctx || !canvas || !props.visible || props.mouseX === null || props.mouseY === null) {
      if (ctx && canvas) {
        // Clear canvas when not visible
        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, props.width * dpr, props.height * dpr);
      }
      return;
    }

    // Validate dimensions
    if (props.width <= 0 || props.height <= 0) {
      console.warn('CrosshairCanvas: Invalid dimensions', { width: props.width, height: props.height });
      return;
    }

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
    ctx.clearRect(0, 0, width, height);

    // Draw crosshair
    ctx.strokeStyle = props.theme.crosshair;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]); // Dashed line

    // Vertical line
    ctx.beginPath();
    ctx.moveTo(props.mouseX, 0);
    ctx.lineTo(props.mouseX, height);
    ctx.stroke();

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(0, props.mouseY);
    ctx.lineTo(width, props.mouseY);
    ctx.stroke();

    ctx.setLineDash([]); // Reset line dash
  };

  onMount(() => {
    if (canvas) {
      ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('CrosshairCanvas: Failed to get 2D rendering context. Canvas may not be supported in this browser.');
        return;
      }
      draw();
    }
  });

  createEffect(() => {
    props.viewport;
    props.width;
    props.height;
    props.mouseX;
    props.mouseY;
    props.visible;
    props.theme;
    draw();
  });

  return (
    <canvas
      ref={canvas}
      class="absolute top-0 left-0 pointer-events-none z-[10]"
    />
  );
}
