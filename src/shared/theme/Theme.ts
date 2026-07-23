import type { radius, spacing, tabular, TypographyToken } from './tokens';

/**
 * The shape **every** theme satisfies. Adding a theme is filling in this type,
 * and `tsc` reports any role left out — a theme cannot be half-defined
 * (architecture.md, "What makes a new theme cheap").
 *
 * Roles are named for **what they mean**, never for the tone behind them:
 * `text.muted`, never `gray400`. A component asking for "muted text" keeps
 * working in any theme; one asking for a grey has to be rewritten for each. That
 * single rule is what makes light and dark a data change instead of a refactor.
 *
 * Note what is *absent*: nothing here mentions `pending`, `done` or `missed`.
 * Those are tracking's vocabulary, and `shared/` must not know a feature's
 * domain. Mapping an occurrence status onto these roles belongs in
 * `features/tracking/ui`, next to the status policy that already owns what a
 * status means.
 */
export interface ThemeColors {
  /** The page canvas — what a screen paints edge to edge. */
  background: string;
  /** A surface that sits above the canvas: sheets, dialogs, fields. */
  surface: string;
  /** An inset area *below* the canvas: track of a progress bar, empty slots. */
  surfaceSunken: string;

  text: {
    /** Anything the user actually reads: names, values, headings. */
    primary: string;
    /** Supporting copy that still has to be legible — the line under a name. */
    secondary: string;
    /**
     * **Not for prose.** Reaches the 3:1 that WCAG asks of meaningful non-text,
     * not the 4.5 it asks of text, so it is for shapes: the outline of an
     * unchecked glyph, a future day's number, an empty progress pip. Anything
     * that has to be *read* uses `secondary` — including group headers, which
     * are small and uppercase and so need more contrast, not less.
     */
    muted: string;
    onBrand: string;
    onAccent: string;
    /** For text on `inverseSurface`. */
    onInverse: string;
  };

  border: {
    /**
     * The hairline between rows. Deliberately below 3:1: a divider is
     * decoration, and the rows are already separated by their content — pushing
     * it to a "visible" contrast is what made the old card borders shout.
     */
    subtle: string;
    /**
     * An edge that *identifies a control*: a field at rest, a selected option.
     * WCAG 1.4.11 applies, so this holds 3:1 against the surface behind it.
     */
    strong: string;
  };

  /** Interactive: focus, selection, primary action, links. */
  brand: { base: string; background: string };
  /** Activity: a running timer, calendar density. Not "success". */
  accent: { base: string; background: string };
  /** Still achievable, but with no slack left. */
  warning: { base: string; background: string };
  /** A correctable mistake or a destructive action. Never a judgement. */
  danger: { base: string; background: string };

  /** A deliberately inverted surface — the running-timer bar. */
  inverseSurface: string;

  /**
   * A four-step sequential scale for density (calendar heat), lightest first.
   * A scale rather than four roles because consumers index into it by
   * intensity; naming the steps would only invite using them as separate
   * colours.
   */
  density: readonly [string, string, string, string];
}

export interface Theme {
  /** Registry key. Unique per theme; what a stored preference would name. */
  readonly name: string;
  /**
   * Whether this theme paints a light or a dark canvas. Separate from `name`
   * because they are different questions: several themes can be light, and this
   * one only answers what native chrome outside our control — the status bar,
   * the keyboard, the system nav bar — should match.
   */
  readonly scheme: 'light' | 'dark';
  readonly colors: ThemeColors;
  readonly spacing: typeof spacing;
  readonly radius: typeof radius;
  readonly typography: Record<
    'display' | 'title' | 'body' | 'label' | 'meta' | 'caption',
    TypographyToken
  > & { readonly tabular: typeof tabular };
}
