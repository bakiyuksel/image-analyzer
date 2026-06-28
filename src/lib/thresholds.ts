export const THRESHOLDS = {
  ela:            { alert: 0.28, warn: 0.14 },
  noise:          { alert: 0.65, warn: 0.45 },
  sobel:          { warn: 0.28 },
  'jpeg-ghost':   { warn: 0.30, alert: 0.55 },
  'clone-detect': { warn: 0.08, alert: 0.20 },
  'fft-spectrum': { warn: 0.025, alert: 0.05 },
} as const
