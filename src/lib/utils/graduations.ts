/**
 * Calculate "nice" graduation values for an axis
 * Returns an array of values that should have tick marks
 */
export function calculateGraduations(min: number, max: number, targetCount = 5): number[] {
  const range = max - min;
  if (range <= 0) return [min];

  // Calculate a "nice" step size
  const rawStep = range / targetCount;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalized = rawStep / magnitude;

  let niceStep: number;
  if (normalized <= 1) niceStep = magnitude;
  else if (normalized <= 2) niceStep = 2 * magnitude;
  else if (normalized <= 5) niceStep = 5 * magnitude;
  else niceStep = 10 * magnitude;

  // Generate graduations
  const graduations: number[] = [];
  const start = Math.ceil(min / niceStep) * niceStep;

  for (let value = start; value <= max; value += niceStep) {
    graduations.push(value);
  }

  return graduations;
}

/**
 * Calculate time graduations aligned to timeframe boundaries
 */
export function calculateTimeGraduations(
  min: number,
  max: number,
  targetCount: number,
  timeframeMinutes: number
): number[] {
  const range = max - min;
  if (range <= 0) return [min];

  const tfMs = timeframeMinutes * 60 * 1000;
  
  // Minimum step should be at least 1 timeframe candle
  const rawStep = range / targetCount;
  
  // Round step to a multiple of timeframe
  let step: number;
  if (timeframeMinutes >= 1440) {
    // Daily: step by days
    const day = 24 * 60 * 60 * 1000;
    step = Math.max(day, Math.ceil(rawStep / day) * day);
  } else if (timeframeMinutes >= 60) {
    // Hourly+: step by hours
    const hour = 60 * 60 * 1000;
    const hours = Math.max(1, Math.ceil(rawStep / hour));
    // Round to nice hour values: 1, 2, 4, 6, 12, 24
    const niceHours = [1, 2, 4, 6, 12, 24];
    const closest = niceHours.find(h => h >= hours) ?? 24;
    step = closest * hour;
  } else if (timeframeMinutes >= 15) {
    // 15m+: step by 15min, 30min, 1h
    const quarter = 15 * 60 * 1000;
    const quarters = Math.max(1, Math.ceil(rawStep / quarter));
    const niceQuarters = [1, 2, 4, 8, 16]; // 15m, 30m, 1h, 2h, 4h
    const closest = niceQuarters.find(q => q >= quarters) ?? 16;
    step = closest * quarter;
  } else {
    // Less than 15m: step by timeframe multiples
    const multiples = Math.max(1, Math.ceil(rawStep / tfMs));
    // Nice multiples: 1, 2, 5, 10, 15, 30
    const niceMultiples = [1, 2, 5, 10, 15, 30, 60];
    const closest = niceMultiples.find(m => m >= multiples) ?? 60;
    step = closest * tfMs;
  }

  // Align start to step boundary
  const start = Math.ceil(min / step) * step;
  
  const graduations: number[] = [];
  for (let value = start; value <= max; value += step) {
    graduations.push(value);
  }

  return graduations;
}

/**
 * Format time value for display on X axis based on timeframe
 */
export function formatTime(timestamp: number, range: number, timeframeMinutes = 1): string {
  const date = new Date(timestamp);

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  // Format based on timeframe granularity
  if (timeframeMinutes >= 1440) {
    // Daily timeframe: show only date
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  } else if (timeframeMinutes >= 60) {
    // Hourly timeframe: show date + hour (no minutes)
    if (range > day * 2) {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) +
        ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } else if (timeframeMinutes >= 15) {
    // 15m+ timeframe: show HH:MM
    if (range > day) {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) +
        ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } else {
    // Short timeframes: show HH:MM or HH:MM:SS
    if (range > day) {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) +
        ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (range > hour * 2) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
}

/**
 * Format price value for display on Y axis
 */
export function formatPrice(price: number, range: number): string {
  if (range < 0.01) return price.toFixed(6);
  if (range < 0.1) return price.toFixed(4);
  if (range < 10) return price.toFixed(2);
  if (range < 1000) return price.toFixed(1);
  return price.toFixed(0);
}
