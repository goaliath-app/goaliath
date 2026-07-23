import { palette } from '../palette';
import type { Theme } from '../Theme';
import { radius, spacing, tabular, typography } from '../tokens';

/**
 * The default theme. Every role resolves to a tone of one ramp — this file
 * chooses *which*, and is the only place that decision lives.
 *
 * The dark theme is the same set of roles resolved to different tones, not a
 * second set of rules: there is no parallel "dark placements" map to keep in
 * sync, which is what made the v1 theme expensive to maintain.
 */
export const lightTheme: Theme = {
  name: 'light',
  scheme: 'light',

  colors: {
    background: palette.slate[50],
    surface: palette.slate[0],
    surfaceSunken: palette.slate[100],

    text: {
      primary: palette.slate[900],
      secondary: palette.slate[600],
      muted: palette.slate[500],
      onBrand: palette.slate[0],
      onAccent: palette.slate[0],
      onInverse: palette.slate[100],
    },

    border: {
      subtle: palette.slate[100],
      strong: palette.slate[500],
    },

    // The chromatic roles sit at `700`, not the `600` they were first drawn at.
    // In this design they are almost always *small text* — an amber "2 días, 2
    // salidas", a green "18:42 de 30:00", a red field error — so they owe the
    // 4.5:1 of body copy, and `600` cleared only 3.2–4.2 against this canvas.
    brand: { base: palette.blue[600], background: palette.blue[50] },
    accent: { base: palette.teal[700], background: palette.teal[50] },
    warning: { base: palette.amber[700], background: palette.amber[50] },
    danger: { base: palette.red[700], background: palette.red[50] },

    inverseSurface: palette.slate[900],

    density: [
      palette.teal[100],
      palette.teal[400],
      palette.teal[600],
      palette.teal[800],
    ],
  },

  spacing,
  radius,
  typography: { ...typography, tabular },
};
