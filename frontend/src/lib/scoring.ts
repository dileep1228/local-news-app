import type { Theme } from '@/theme/themes';
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
 * Nine discrete size tiers by trend score, biggest first so the first matching
 * threshold wins. A post with no reactions sits at 0.5, in the neutral middle.
 */
const TIERS = [
  { minScore: 0.72, size: 60, step: 'hottest', fontSize: 17 },
  { minScore: 0.66, size: 52, step: 'hotter', fontSize: 16 },
  { minScore: 0.61, size: 45, step: 'hot', fontSize: 15 },
  { minScore: 0.56, size: 39, step: 'warmer', fontSize: 14 },
  { minScore: 0.51, size: 33, step: 'warm', fontSize: 13 },
  { minScore: 0.5, size: 28, step: 'neutral', fontSize: 12 },
  { minScore: 0.45, size: 24, step: 'cold', fontSize: 11 },
  { minScore: 0.4, size: 21, step: 'colder', fontSize: 10 },
  { minScore: 0, size: 18, step: 'coldest', fontSize: 9 },
] as const;

/** Bigger, hotter bubbles for posts the community is signalling. */
export function pinAppearance(post: Post, theme: Theme) {
  const score = trendScore(post);
  const tier = TIERS.find((t) => score >= t.minScore) ?? TIERS[TIERS.length - 1];
  const color = theme.heat[tier.step];

  const textColor = theme.darkTextSteps.includes(tier.step) ? theme.ink : theme.onDark;

  return {
    color,
    textColor,
    fontSize: tier.fontSize,
    bubble: {
      height: tier.size,
      minWidth: tier.size + 6,
      borderRadius: theme.radius.roundPins ? tier.size / 2 : 0,
      backgroundColor: color,
    },
  };
}
