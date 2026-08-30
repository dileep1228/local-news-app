/**
 * Design tokens for the map surface.
 *
 * The map is always light, so this palette is deliberately not theme-aware -
 * chrome that sits on top of it needs fixed contrast either way.
 *
 * Theme B, "warm editorial": cream paper and deep ink, closer to a local
 * newspaper or a community noticeboard than a generic app. Pin colours run
 * cold to hot, so they read as intensity rather than good-vs-bad. Size carries
 * the same signal, so meaning never depends on colour alone.
 */
export const palette = {
  ink: '#2e2a24',
  paper: '#fdf8f0',
  muted: '#8a7f70',
  subtle: '#eee6d9',
  border: '#ddd3c2',
  overlay: 'rgba(46, 42, 36, 0.84)',
  onDark: '#fdf8f0',

  /** Cold (noised) to hot (signalled). */
  heat: {
    coldest: '#ded6c8',
    colder: '#d1c8b8',
    cold: '#bdb2a0',
    neutral: '#a2988a',
    warm: '#d9a55c',
    warmer: '#c98b3a',
    hot: '#bd6b30',
    hotter: '#a8452b',
    hottest: '#8c3421',
  },
} as const;

/**
 * The search-radius circle. A soft outline disappears against the basemap, so
 * it reads as a dashed boundary instead - distinguished by pattern rather than
 * by colour.
 */
export const searchAreaStyle = {
  fillColor: palette.ink,
  fillOpacity: 0.06,
  lineColor: palette.ink,
  lineOpacity: 0.6,
  lineWidth: 2,
  lineDasharray: [3, 2],
};
