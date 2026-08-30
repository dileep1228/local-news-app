/**
 * Design tokens for the map surface.
 *
 * The map is always light, so this palette is deliberately not theme-aware -
 * chrome that sits on top of it needs fixed contrast either way.
 *
 * The idea: ink-and-paper chrome that recedes, with all colour saved for the
 * pins. Pin colours run cold grey to hot red, so they read as intensity rather
 * than good-vs-bad. Size carries the same signal, so meaning never depends on
 * colour alone.
 */
export const palette = {
  ink: '#111111',
  paper: '#ffffff',
  muted: '#6b6b6b',
  subtle: '#f0efec',
  border: '#e0ded9',
  overlay: 'rgba(17, 17, 17, 0.8)',
  onDark: '#ffffff',

  /** Cold (noised) to hot (signalled). */
  heat: {
    coldest: '#d6d4cf',
    colder: '#c9c7c2',
    cold: '#b5b2ab',
    neutral: '#9a9791',
    warm: '#e8c07a',
    warmer: '#e8a33d',
    hot: '#e07f2e',
    hotter: '#d94f36',
    hottest: '#b83522',
  },
} as const;

/**
 * The search-radius circle. On a greyscale basemap a soft grey outline
 * disappears, so it reads as a dashed boundary instead - distinguished by
 * pattern rather than by colour, which keeps the chrome monochrome.
 */
export const searchAreaStyle = {
  fillColor: palette.ink,
  fillOpacity: 0.06,
  lineColor: palette.ink,
  lineOpacity: 0.6,
  lineWidth: 2,
  lineDasharray: [3, 2],
};
