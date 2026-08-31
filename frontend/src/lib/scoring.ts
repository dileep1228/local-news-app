import { PIN_SIZES, type Theme } from '@/theme/themes';
import type { Post } from '@/types/post';

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
  const color = theme.heat[tier];

  return {
    color,
    // The spec gives a per-theme count of how many hot tiers take light text.
    textColor: tier < theme.lightTextTiers ? '#ffffff' : theme.ink,
    fontSize: Math.max(9, Math.round(size * 0.3)),
    bubble: {
      height: size,
      minWidth: size + 6,
      borderRadius: theme.radius.roundPins ? size / 2 : 0,
      backgroundColor: color,
    },
  };
}
