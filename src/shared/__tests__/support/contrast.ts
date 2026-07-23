/**
 * WCAG 2.1 relative luminance and contrast ratio, for the theme suite.
 *
 * Test-only on purpose: the app never computes a contrast at runtime, it just
 * uses roles a test has already vouched for. Keeping it here rather than in
 * `shared/theme` stops it becoming an escape hatch for "I'll pick a colour and
 * check it in a component".
 */

function channel(value: number): number {
  const srgb = value / 255;
  return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance of a `#rrggbb` colour. */
export function luminance(hex: string): number {
  const red = channel(parseInt(hex.slice(1, 3), 16));
  const green = channel(parseInt(hex.slice(3, 5), 16));
  const blue = channel(parseInt(hex.slice(5, 7), 16));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/** Contrast ratio between two `#rrggbb` colours, 1 (identical) to 21. */
export function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

/** WCAG AA for body text. Anything the user reads owes this. */
export const AA_TEXT = 4.5;

/** WCAG AA for meaningful non-text: control edges, icon shapes, chart steps. */
export const AA_NON_TEXT = 3;
