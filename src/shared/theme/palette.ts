/**
 * Raw colour values — **the only file in the repo that contains a hex literal**
 * (architecture.md, Styling). It is deliberately not re-exported from
 * `index.ts`: themes read it, nothing else can, so "no hardcoded colours" has no
 * back door.
 *
 * **Ramps are named for the colour they are, never for what a theme does with
 * them.** `blue`, not `brand`; `red`, not `danger`. Role names belong to
 * `Theme`, and putting them here would collapse the two layers: a second theme
 * wanting a different red would have nowhere to go but `danger2`, and the file
 * would grow by *themes × roles* instead of by colours that actually exist.
 * Named by hue, a new theme usually reuses most of what is already here and
 * adds only the tones nothing else holds.
 *
 * Each ramp is a fixed hue and saturation swept across lightness, so a theme
 * picks a *tone* rather than inventing a colour. The numbers are lightness-like
 * positions, not indices: `600` is the same weight of ink in every ramp, which
 * is what lets a dark theme shift a whole role one or two stops without
 * re-picking values by eye.
 */

export const palette = {
  /**
   * Blue-tinted neutral — the greys the default themes are built from.
   *
   * Not actually grey: it carries a low-saturation blue (hue 220) so dark
   * surfaces read as deliberate rather than muddy, and so the greys sit beside
   * `teal` without dirtying it.
   */
  slate: {
    0: '#FFFFFF',
    50: '#F7F8F9',
    100: '#EFF1F3',
    200: '#E3E6EA',
    300: '#CDD2D8',
    400: '#A8AFB9',
    500: '#7C8593',
    600: '#5C6673',
    700: '#414954',
    800: '#2A303A',
    850: '#1F242C',
    900: '#171B21',
    950: '#0F1216',
  },

  /**
   * True neutral — every stop has R = G = B.
   *
   * Exists because `slate` only *looks* grey, and a theme whose whole premise is
   * the absence of hue cannot be built on a ramp with a tint. Lightness tracks
   * `slate` step for step, so swapping between them is a ramp change rather
   * than a re-tuning.
   */
  gray: {
    0: '#FFFFFF',
    50: '#F8F8F8',
    100: '#F0F0F0',
    200: '#E4E4E4',
    300: '#CFCFCF',
    400: '#AAAAAA',
    500: '#808080',
    600: '#616161',
    700: '#474747',
    800: '#2E2E2E',
    850: '#232323',
    900: '#1A1A1A',
    950: '#101010',
  },

  /** Inherited from the v1 app, whose `primary` was this exact `600`. */
  blue: {
    50: '#F3F6FC',
    100: '#E3EBF7',
    200: '#C3D3EE',
    400: '#88A7DD',
    500: '#5884D0',
    600: '#2D579F',
    700: '#24457F',
    800: '#1B345F',
    900: '#11213C',
  },

  teal: {
    50: '#EEFCF9',
    100: '#DDF8F2',
    200: '#BFF3E7',
    400: '#5CE0C1',
    500: '#29D6AE',
    600: '#1D9A7D',
    700: '#177861',
    800: '#105645',
    900: '#0A3A2E',
  },

  amber: {
    50: '#FEF8EC',
    100: '#FBEFD8',
    200: '#F6DCAB',
    400: '#F0BE6B',
    500: '#E3A32F',
    600: '#C07C10',
    700: '#9C630C',
    800: '#7A4E08',
    900: '#523305',
  },

  red: {
    50: '#FEF3F2',
    100: '#FBE7E5',
    200: '#F7CDC9',
    400: '#EFA69E',
    500: '#E36A5E',
    600: '#D2483E',
    700: '#AE3730',
    800: '#7C2721',
    900: '#551A16',
  },
} as const;
