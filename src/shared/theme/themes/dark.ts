import { palette } from '../palette';
import type { Theme } from '../Theme';
import { radius, spacing, tabular, typography } from '../tokens';

/**
 * The same roles as {@link lightTheme}, resolved to different tones.
 *
 * Two things do not simply mirror:
 *
 * - **The chromatic roles move *up* the ramp, not down.** A `600` tone that
 *   reads as solid ink on white is nearly invisible on a near-black canvas, so
 *   `brand`, `warning` and `danger` resolve to `400` and `accent` to `500`.
 *   Their paired backgrounds move the opposite way, to the darkest tones.
 * - **`inverseSurface` genuinely inverts.** It is the one surface meant to
 *   contrast with the canvas, so in dark it goes light — the running-timer bar
 *   stays a deliberate slab in both themes rather than dissolving into the page.
 */
export const darkTheme: Theme = {
  name: 'dark',
  scheme: 'dark',

  colors: {
    background: palette.slate[950],
    surface: palette.slate[850],
    surfaceSunken: palette.slate[800],

    text: {
      primary: palette.slate[100],
      secondary: palette.slate[400],
      muted: palette.slate[500],
      onBrand: palette.blue[900],
      onAccent: palette.teal[900],
      onInverse: palette.slate[900],
    },

    border: {
      subtle: palette.slate[800],
      strong: palette.slate[500],
    },

    brand: { base: palette.blue[400], background: palette.blue[900] },
    accent: { base: palette.teal[500], background: palette.teal[900] },
    warning: { base: palette.amber[400], background: palette.amber[900] },
    danger: { base: palette.red[400], background: palette.red[900] },

    inverseSurface: palette.slate[100],

    // Ends at `200`, not `400`: on a dark canvas the ramp's top tones crowd
    // together, and `500 → 400` separated by barely 4 points of lightness — two
    // busy days that should read differently looked identical.
    density: [
      palette.teal[900],
      palette.teal[700],
      palette.teal[500],
      palette.teal[200],
    ],
  },

  spacing,
  radius,
  typography: { ...typography, tabular },
};
