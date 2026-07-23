import { palette } from '../palette';
import type { Theme } from '../Theme';
import { radius, spacing, tabular, typography } from '../tokens';

/**
 * A theme with no hue at all: every role resolves to a tone of `neutral`.
 *
 * **What it is honestly for.** It is *not* the right answer for the common
 * colour-vision deficiencies — someone with deuteranomaly reads a well-separated
 * palette better than a flattened one, and this repo's ramps already hold up
 * under simulated protanopia and deuteranopia. This serves monochromacy, screens
 * in harsh sunlight, e-ink, and the plain preference for an interface that does
 * not signal with colour.
 *
 * **Why it can exist at all.** Removing hue removes a channel, so it only works
 * because the design never leaned on that channel alone: a finished activity is
 * a *filled* glyph and an unfinished one is *hollow*; a quota's slack is
 * *filled* pips against *outlined* ones; and "sin margen" is written in words
 * next to the meter. Colour was the accent on those distinctions, never the
 * distinction itself. If a future screen encodes something in hue only, it will
 * break here first — which makes this theme a useful canary, not just an option.
 *
 * The roles that still need to be told apart from each other are separated by
 * *lightness* instead. `warning` goes darkest, because it is the one signal in
 * the list that has to survive being glanced at.
 *
 * It reads the `gray` ramp rather than `slate`. The default ramp only *looks*
 * grey — it carries a faint blue so dark surfaces read as deliberate instead of
 * muddy — which is right everywhere else and a contradiction here. That is what
 * a theme needing tones the existing ramps do not hold looks like: a new ramp in
 * `palette.ts` named for the colour it is, not values inlined in this file.
 *
 * Note that four different roles here resolve to the same handful of tones. That
 * is allowed and normal: roles are a *vocabulary*, not a promise that each one
 * owns a unique colour. A theme is free to collapse them, as long as whatever
 * distinguished them was never carried by colour alone.
 */
export const grayscaleTheme: Theme = {
  name: 'grayscale',
  scheme: 'light',

  colors: {
    background: palette.gray[100],
    surface: palette.gray[0],
    surfaceSunken: palette.gray[200],

    text: {
      primary: palette.gray[950],
      secondary: palette.gray[700],
      muted: palette.gray[500],
      onBrand: palette.gray[0],
      onAccent: palette.gray[0],
      onInverse: palette.gray[100],
    },

    border: {
      subtle: palette.gray[200],
      strong: palette.gray[600],
    },

    brand: { base: palette.gray[900], background: palette.gray[200] },
    accent: { base: palette.gray[700], background: palette.gray[200] },
    warning: { base: palette.gray[950], background: palette.gray[300] },
    danger: { base: palette.gray[900], background: palette.gray[300] },

    inverseSurface: palette.gray[950],

    density: [
      palette.gray[200],
      palette.gray[400],
      palette.gray[600],
      palette.gray[900],
    ],
  },

  spacing,
  radius,
  typography: { ...typography, tabular },
};
