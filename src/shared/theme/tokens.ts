import type { TextStyle } from 'react-native';

/**
 * The scales that do **not** vary between themes today: spacing, radius and
 * typography. They still live in the theme (architecture.md, Styling) so a
 * large-text accessibility theme later is a data change and not a consumer
 * refactor — which is exactly the property the colour roles already have.
 *
 * Values are provisional; the *shape* is not. Nothing outside a theme should
 * ever write a raw number, so tuning a step later is an edit here.
 *
 * **Every size and step is an even integer.** Halves survive the scale but not
 * the screen: React Native rounds to the device pixel grid, so a `0.5` lands on
 * one physical pixel at 2x and a different one at 3x, and a row built from a few
 * of them ends up a pixel taller on some phones than others. Even numbers also
 * halve cleanly, which matters the moment something needs centring inside a
 * step. The single exception is `letterSpacing`, which is typographic tracking
 * rather than a layout step — it is a fraction of the character width, has no
 * pixel grid to miss, and is meaningless at integer values.
 */

/** Multiples of 4. Named, not numbered, so a step can be retuned without lying. */
export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 6, // fields, chips
  md: 10, // buttons
  lg: 16, // sheets, dialogs
  full: 1000, // pills, avatars — any value past half the largest control
} as const;

/**
 * One sans family, three weights. With the card surfaces and their borders gone,
 * size and weight are close to the only thing left building hierarchy, so the
 * steps are deliberately few and far apart — a scale with eight near-identical
 * sizes reads as noise, not structure.
 *
 * Colour is *not* part of a typography token: a style composes the two
 * (`{ ...theme.typography.title, color: theme.colors.text.primary }`), which
 * keeps one size usable on any surface.
 */
export interface TypographyToken {
  fontSize: number;
  lineHeight: number;
  fontWeight: TextStyle['fontWeight'];
  letterSpacing?: number;
  textTransform?: TextStyle['textTransform'];
}

export const typography = {
  /** Screen titles — "Hoy", "Julio". */
  display: { fontSize: 28, lineHeight: 34, fontWeight: '600', letterSpacing: -0.6 },
  /** Section and sheet titles. */
  title: { fontSize: 20, lineHeight: 26, fontWeight: '600', letterSpacing: -0.4 },
  /** An activity name in the list — the size the app is read at. */
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  /** Buttons and field labels. */
  label: { fontSize: 14, lineHeight: 18, fontWeight: '500' },
  /** The supporting line under a name. */
  meta: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  /** Group headers. Uppercase is part of the token, not the copy. */
  caption: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '500',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
} as const satisfies Record<string, TypographyToken>;

/**
 * Spread **after** a typography token on anything numeric:
 * `{ ...theme.typography.body, ...theme.typography.tabular }`.
 *
 * Digits keep a constant width, so a running timer does not make its row twitch
 * every second and a counter does not shift as it crosses from 9 to 10. It is a
 * fragment rather than a size because any size can carry numbers.
 */
export const tabular = {
  fontVariant: ['tabular-nums'],
} as const satisfies Pick<TextStyle, 'fontVariant'>;
