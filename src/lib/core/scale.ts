import type { Viewport, Dimensions } from './types';

export interface Scale {
  /** Convert time value to pixel X coordinate */
  xToPixel: (time: number) => number;
  /** Convert price value to pixel Y coordinate */
  yToPixel: (price: number) => number;
  /** Convert pixel X coordinate to time value */
  pixelToX: (x: number) => number;
  /** Convert pixel Y coordinate to price value */
  pixelToY: (y: number) => number;
}

/**
 * Creates scale functions to transform between data coordinates and pixel coordinates
 */
export function createScale(viewport: Viewport, dimensions: Dimensions): Scale {
  const [timeMin, timeMax] = viewport.timeRange;
  const [priceMin, priceMax] = viewport.priceRange;
  const { width, height } = dimensions;

  const timeSpan = timeMax - timeMin;
  const priceSpan = priceMax - priceMin;

  return {
    xToPixel: (time: number) => {
      if (timeSpan === 0) return width / 2;
      return ((time - timeMin) / timeSpan) * width;
    },

    yToPixel: (price: number) => {
      if (priceSpan === 0) return height / 2;
      // Invert Y axis: higher prices at top
      return height - ((price - priceMin) / priceSpan) * height;
    },

    pixelToX: (x: number) => {
      if (width === 0) return timeMin;
      return timeMin + (x / width) * timeSpan;
    },

    pixelToY: (y: number) => {
      if (height === 0) return priceMin;
      // Invert Y axis
      return priceMin + ((height - y) / height) * priceSpan;
    },
  };
}
