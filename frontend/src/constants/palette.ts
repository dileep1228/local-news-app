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

  /**
   * Cold (noised) to hot (signalled). The cold end stays muted so ignored
   * posts recede, while the hot end is vivid - the gap between them is what
   * makes the ranking readable at a glance.
   */
  heat: {
    coldest: '#dcd7cd',
    colder: '#cdc6ba',
    cold: '#b5ada0',
    neutral: '#9d9384',
    warm: '#ffc93c',
    warmer: '#ff9f1c',
    hot: '#ff6b35',
    hotter: '#f4212e',
    hottest: '#d10a2f',
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
