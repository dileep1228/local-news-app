import { lifeFraction } from '@/lib/time';
import { PIN_MAX_AGE_WASH, PIN_SIZES, type Theme } from '@/theme/themes';
import type { Post } from '@/types/post';

type Rgb = [number, number, number];

/**
 * Blends two 6-digit hex colours. Every colour in the theme spec is in that
 * form, so there is nothing else to parse.
 */
function mix(from: string, to: string, t: number): Rgb {
  const a = parseInt(from.slice(1), 16);
  const b = parseInt(to.slice(1), 16);
  const channel = (shift: number) => {
    const x = (a >> shift) & 0xff;
    const y = (b >> shift) & 0xff;
    return Math.round(x + (y - x) * t);
  };

  return [channel(16), channel(8), channel(0)];
}

const css = ([r, g, b]: Rgb) => `rgb(${r}, ${g}, ${b})`;

/**
 * Perceived brightness, not the raw average - green reads far lighter than
 * blue. The 0.5 cutoff is where the white-to-ink swap keeps the label's
 * worst-case contrast highest across the five heat ramps; 0.6 let it sag to
 * 2.7:1 on Civic just before swapping.
 */
const isLight = ([r, g, b]: Rgb) => (r * 0.299 + g * 0.587 + b * 0.114) / 255 > 0.5;

/**
 * Same smoothed score the backend ranks by: a post starts at a neutral 0.5 and
 * needs real engagement before its own ratio dominates.
 *
 * NOTE: this duplicates the backend formula. If the smoothing constant changes
 * there, the map and the API ranking would silently disagree - the API should
 * return the score as a field instead.
 */
export function trendScore(post: Post): number {
  return (post.signal_count + 5) / (post.signal_count + post.noise_count + 10);
}

/**
 * Six score tiers, hottest first, per the theme spec. Only colour and shape are
 * theme-driven; the sizes are shared.
 */
const THRESHOLDS = [0.68, 0.6, 0.54, 0.5, 0.45, 0] as const;

/** Which of the six tiers a post falls into. 0 is hottest. */
export function pinTier(post: Post): number {
  const score = trendScore(post);
  const index = THRESHOLDS.findIndex((min) => score >= min);
  return index === -1 ? THRESHOLDS.length - 1 : index;
}

/** Bigger, hotter bubbles for posts the community is signalling. */
export function pinAppearance(post: Post, theme: Theme) {
  const tier = pinTier(post);
  const size = PIN_SIZES[tier];

  /*
    Age drains the colour toward the map's own ground rather than fading the
    pin out, because opacity already means "another pin is selected" - an old
    pin and an unselected one would otherwise look identical. Driven by
    lifeFraction, the same curve as the sheet's decay bar, so the two agree.
    On a dark theme "toward paper" means toward dark, which is still the map
    receding.
  */
  const wash = (1 - lifeFraction(post.expires_at)) * PIN_MAX_AGE_WASH;
  const washed = mix(theme.heat[tier], theme.paper, wash);

  // The spec gives a per-theme count of how many hot tiers take light text.
  const light = tier < theme.lightTextTiers;

  return {
    color: css(washed),
    /*
      Swapped, not blended. Interpolating white toward ink passes through
      mid-grey exactly when the bubble is mid-tone, so the label is at its
      least readable halfway through a post's life. Only the white-on-
      lightening case needs rescuing: where the spec already chose ink, or
      where the theme's paper is dark, the label stays readable untouched.
    */
    textColor: light ? (isLight(washed) ? theme.ink : '#ffffff') : theme.ink,
    fontSize: Math.max(9, Math.round(size * 0.3)),
    bubble: {
      height: size,
      minWidth: size + 6,
      borderRadius: theme.radius.roundPins ? size / 2 : 0,
      backgroundColor: css(washed),
    },
  };
}
