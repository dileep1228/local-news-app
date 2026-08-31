/**
 * The visual languages from the Claude Design handoff (turn 2). Each is the
 * same screen and structure - only colour, corner radius and basemap differ.
 *
 * Not theme-aware in the light/dark sense: each theme fixes its own contrast,
 * since chrome sits on top of a map.
 *
 * NOTE: the designs also specify a typeface each (Newsreader, IBM Plex Mono,
 * Space Grotesk, Bricolage Grotesque). Those need bundling via expo-font and
 * are not wired up yet, so every theme currently renders in the system font.
 */
export type Theme = {
  id: string;
  name: string;
  blurb: string;
  mapStyleUrl: string;

  ink: string;
  paper: string;
  muted: string;
  subtle: string;
  border: string;
  overlay: string;
  onDark: string;
  accent: string;

  /** Cold (noised) to hot (signalled). */
  heat: {
    coldest: string;
    colder: string;
    cold: string;
    neutral: string;
    warm: string;
    warmer: string;
    hot: string;
    hotter: string;
    hottest: string;
  };

  /** Heat steps light enough to need dark text on top. */
  darkTextSteps: readonly (keyof Theme['heat'])[];

  radius: {
    /** true = fully rounded pins, false = square. */
    roundPins: boolean;
    card: number;
    button: number;
    chip: number;
  };

  /** Rules are hairlines in some directions, heavy 2px in others. */
  borderWidth: number;
};

const POSITRON = 'https://tiles.openfreemap.org/styles/positron';
const DARK_MATTER = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export const THEMES: Theme[] = [
  {
    // Tokens taken from the bundle's Modernist design system (styles.css):
    // --color-bg #f3f2f2, --color-text #201e1d, --color-accent #ec3013, and
    // the accent 300-700 ramp. Zero radius and 2px rules are core to it.
    id: 'modernist',
    name: 'Modernist',
    blurb: 'Flat, 2px rules, one red',
    mapStyleUrl: POSITRON,
    ink: '#201e1d',
    paper: '#f3f2f2',
    muted: '#605d5d',
    subtle: '#eae9e9',
    border: '#bab6b6',
    overlay: 'rgba(32, 30, 29, 0.86)',
    onDark: '#ffffff',
    accent: '#ae1800',
    heat: {
      coldest: '#d7d3d3',
      colder: '#bab6b6',
      cold: '#9b9797',
      neutral: '#7d7979',
      warm: '#ffc4b8',
      warmer: '#ff9783',
      hot: '#ff563c',
      hotter: '#ec3013',
      hottest: '#ae1800',
    },
    darkTextSteps: ['warm', 'warmer', 'hot', 'neutral', 'cold', 'colder', 'coldest'],
    radius: { roundPins: false, card: 0, button: 0, chip: 0 },
    borderWidth: 2,
  },
  {
    id: 'noticeboard',
    name: 'Noticeboard',
    blurb: 'Cream and ink, editorial',
    mapStyleUrl: POSITRON,
    ink: '#2e2a24',
    paper: '#fdf8f0',
    muted: '#8a7f70',
    subtle: '#eee6d9',
    border: '#ddd3c2',
    overlay: 'rgba(46, 42, 36, 0.84)',
    onDark: '#fdf8f0',
    accent: '#a8562a',
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
    darkTextSteps: ['warm', 'warmer', 'neutral', 'cold', 'colder', 'coldest'],
    radius: { roundPins: true, card: 14, button: 10, chip: 16 },
    borderWidth: 1,
  },
  {
    id: 'instrument',
    name: 'Instrument',
    blurb: 'Dark panel, amber meters',
    mapStyleUrl: DARK_MATTER,
    ink: '#e6edef',
    paper: '#0b0f10',
    muted: '#7f9196',
    subtle: '#1c2427',
    border: '#2f4046',
    overlay: 'rgba(11, 15, 16, 0.9)',
    onDark: '#101416',
    accent: '#ffb020',
    heat: {
      coldest: '#2a3438',
      colder: '#333f43',
      cold: '#3f4a4e',
      neutral: '#556468',
      warm: '#6c5330',
      warmer: '#9d6a26',
      hot: '#c47a1e',
      hotter: '#e4881a',
      hottest: '#ffb020',
    },
    darkTextSteps: ['hottest', 'hotter'],
    radius: { roundPins: false, card: 0, button: 0, chip: 0 },
    borderWidth: 1,
  },
  {
    id: 'civic',
    name: 'Civic',
    blurb: 'Transit-map calm, ink blue',
    mapStyleUrl: POSITRON,
    ink: '#1b2a4a',
    paper: '#ffffff',
    muted: '#7b869c',
    subtle: '#f2f4f8',
    border: '#dbe2ee',
    overlay: 'rgba(27, 42, 74, 0.86)',
    onDark: '#ffffff',
    accent: '#0057ff',
    heat: {
      coldest: '#e6ebf5',
      colder: '#dbe2ee',
      cold: '#cbd8ee',
      neutral: '#a8b6cc',
      warm: '#a3c0ff',
      warmer: '#6c9dff',
      hot: '#4a86ff',
      hotter: '#2f74ff',
      hottest: '#0057ff',
    },
    darkTextSteps: ['warm', 'warmer', 'neutral', 'cold', 'colder', 'coldest'],
    radius: { roundPins: true, card: 24, button: 16, chip: 20 },
    borderWidth: 1,
  },
  {
    id: 'overprint',
    name: 'Overprint',
    blurb: 'Newsprint, two inks',
    mapStyleUrl: POSITRON,
    ink: '#241f1a',
    paper: '#f2ece1',
    muted: '#5a5046',
    subtle: '#e5dccb',
    border: '#cfc4b2',
    overlay: 'rgba(36, 31, 26, 0.88)',
    onDark: '#f2ece1',
    accent: '#e8412a',
    heat: {
      coldest: '#cfc4b2',
      colder: '#b9aa96',
      cold: '#8f8fc4',
      neutral: '#6b74c9',
      warm: '#4a55cd',
      warmer: '#2b3ad1',
      hot: '#c4472f',
      hotter: '#e8412a',
      hottest: '#b8241a',
    },
    darkTextSteps: ['coldest', 'colder'],
    radius: { roundPins: true, card: 0, button: 0, chip: 0 },
    borderWidth: 2,
  },
];

export const DEFAULT_THEME = THEMES[0];
