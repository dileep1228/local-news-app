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
export const PIN_TIERS = [
  { name: 'xxxl', minScore: 0.72, size: 60, color: '#c62828', fontSize: 17 },
  { name: 'xxl', minScore: 0.66, size: 52, color: '#e5484d', fontSize: 16 },
  { name: 'xl', minScore: 0.61, size: 45, color: '#f76808', fontSize: 15 },
  { name: 'l', minScore: 0.56, size: 39, color: '#f5a524', fontSize: 14 },
  { name: 'm', minScore: 0.51, size: 33, color: '#ffc53d', fontSize: 13 },
  { name: 's', minScore: 0.5, size: 28, color: '#8b8d98', fontSize: 12 },
  { name: 'xs', minScore: 0.45, size: 24, color: '#a0a3ad', fontSize: 11 },
  { name: 'xxs', minScore: 0.4, size: 21, color: '#c8cad0', fontSize: 10 },
  { name: 'xxxs', minScore: 0, size: 18, color: '#d8dade', fontSize: 9 },
];

/** Bigger, warmer bubbles for posts the community is signalling. */
export function pinAppearance(post: Post) {
  const score = trendScore(post);
  const tier = PIN_TIERS.find((t) => score >= t.minScore) ?? PIN_TIERS[PIN_TIERS.length - 1];

  return {
    color: tier.color,
    fontSize: tier.fontSize,
    bubble: {
      height: tier.size,
      minWidth: tier.size + 6,
      borderRadius: tier.size / 2,
      backgroundColor: tier.color,
    },
  };
}
