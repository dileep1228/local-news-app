import { palette } from '@/constants/palette';
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
 * Discrete size/colour tiers by trend score. Ordered biggest-first so the first
 * matching threshold wins. A post with no reactions sits at 0.5, in the neutral
 * middle.
 */
const LIGHT = palette.onDark;
const DARK = palette.ink;

/**
 * `textColor` is per-tier because the bright yellows and oranges can't carry
 * white text legibly - they need dark text, while the vivid reds need light.
 */
export const PIN_TIERS = [
  { name: 'xxxl', minScore: 0.72, size: 60, color: palette.heat.hottest, fontSize: 17, textColor: LIGHT },
  { name: 'xxl', minScore: 0.66, size: 52, color: palette.heat.hotter, fontSize: 16, textColor: LIGHT },
  { name: 'xl', minScore: 0.61, size: 45, color: palette.heat.hot, fontSize: 15, textColor: LIGHT },
  { name: 'l', minScore: 0.56, size: 39, color: palette.heat.warmer, fontSize: 14, textColor: DARK },
  { name: 'm', minScore: 0.51, size: 33, color: palette.heat.warm, fontSize: 13, textColor: DARK },
  { name: 's', minScore: 0.5, size: 28, color: palette.heat.neutral, fontSize: 12, textColor: DARK },
  { name: 'xs', minScore: 0.45, size: 24, color: palette.heat.cold, fontSize: 11, textColor: DARK },
  { name: 'xxs', minScore: 0.4, size: 21, color: palette.heat.colder, fontSize: 10, textColor: DARK },
  { name: 'xxxs', minScore: 0, size: 18, color: palette.heat.coldest, fontSize: 9, textColor: DARK },
];

/** Bigger, warmer bubbles for posts the community is signalling. */
export function pinAppearance(post: Post) {
  const score = trendScore(post);
  const tier = PIN_TIERS.find((t) => score >= t.minScore) ?? PIN_TIERS[PIN_TIERS.length - 1];

  return {
    color: tier.color,
    fontSize: tier.fontSize,
    textColor: tier.textColor,
    bubble: {
      height: tier.size,
      minWidth: tier.size + 6,
      borderRadius: tier.size / 2,
      backgroundColor: tier.color,
    },
  };
}
