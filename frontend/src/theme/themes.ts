/**
 * The five appearances, transcribed from the Claude Design "Theme Spec ·
 * All Five" handoff. Every value below comes from that sheet - if something
 * looks arbitrary, it is deliberate there.
 *
 * Not theme-aware in the light/dark sense: each theme fixes its own contrast,
 * since chrome sits on top of a map. Instrument is the one to wire to system
 * dark mode if that ever happens.
 *
 * NOT YET IMPLEMENTED from the spec:
 * - Typefaces. Each theme names a family (Archivo, Newsreader, IBM Plex Mono,
 *   Space Grotesk, Bricolage Grotesque), all Google Fonts under the OFL, to be
 *   loaded via @expo-google-fonts/*.
 * - Per-theme button copy ("Show more / Not useful" in Civic, bracketed labels
 *   in Instrument). The spec lists this as an open question.
 * - Overprint's multiply blend, which React Native cannot do - the spec
 *   pre-multiplied its ramp so no blend mode is needed.
 */

/** Six tiers, hottest first. Sizes and behaviour are shared across themes. */
export const PIN_SIZES = [58, 48, 40, 34, 28, 20] as const;

/** Shared interaction constants from the spec's "Shared across all five" row. */
export const PIN_BORDER_WIDTH = 2;
export const PIN_BORDER_WIDTH_SELECTED = 3;
export const PIN_SELECTED_SCALE = 1.12;
export const PIN_HALO_INSET = 10;
export const PIN_HALO_OPACITY = 0.45;
export const PIN_UNSELECTED_DIM = 0.55;
export const SHEET_HEIGHT_FRACTION = 0.42;
export const TRANSITION_MS = 300;

/** Pins fade as a post ages, floored so nothing disappears entirely. */
export function ageOpacity(ageMinutes: number): number {
  return Math.max(0.4, 1 - ageMinutes / 180);
}

export type Theme = {
  id: string;
  name: string;
  blurb: string;

  /** openfreemap style id, or a full style URL. */
  mapStyleUrl: string;

  /** Ground: the sheet/chrome surface, the map's own ground, and map blocks. */
  paper: string;
  mapBg: string;
  block: string;
  gridLines: string;

  /** Ink. */
  ink: string;
  muted: string;

  /** Accent: fill, the deeper value for small text, and text on the fill. */
  accent: string;
  accentDeep: string;
  onAccent: string;

  /** Six tiers, hottest to coldest. */
  heat: readonly [string, string, string, string, string, string];
  /** How many of the hottest tiers take light text; the rest take ink. */
  lightTextTiers: number;

  radius: { sheet: number; button: number; roundPins: boolean; bar: number };

  edges: {
    sheetBorderWidth: number;
    sheetBorderColor: string;
    hairline: string;
    shadow: boolean;
  };

  /** Buttons are flush left in the systems that call for it, else centred. */
  flushLeftButtons: boolean;
};

const OPENFREEMAP = (style: string) => `https://tiles.openfreemap.org/styles/${style}`;
const DARK_MATTER = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export const THEMES: Theme[] = [
  {
    id: 'modernist',
    name: 'Modernist',
    blurb: 'Flat, 2px rules, one red',
    mapStyleUrl: OPENFREEMAP('positron'),
    paper: '#f3f2f2',
    mapBg: '#eae9e9',
    block: '#e3e1e1',
    gridLines: '#dedbdb',
    ink: '#201e1d',
    muted: '#605d5d',
    // Accent is 3:1 on this ground - large text and chrome only, never body.
    accent: '#ec3013',
    accentDeep: '#ae1800',
    onAccent: '#ffffff',
    heat: ['#ae1800', '#ec3013', '#ff563c', '#ff9783', '#ffc4b8', '#bab6b6'],
    lightTextTiers: 2,
    radius: { sheet: 0, button: 0, roundPins: false, bar: 0 },
    edges: {
      sheetBorderWidth: 2,
      sheetBorderColor: '#201e1d',
      hairline: 'rgba(32, 30, 29, 0.4)',
      shadow: false,
    },
    flushLeftButtons: true,
  },
  {
    id: 'noticeboard',
    name: 'Noticeboard',
    blurb: 'Cream and ink, serif headlines',
    mapStyleUrl: OPENFREEMAP('positron'),
    paper: '#fdf8f0',
    mapBg: '#f4f1ea',
    block: '#e8ecdf',
    gridLines: '#eae5d9',
    ink: '#2e2a24',
    muted: '#8a7f70',
    // Signal button is ink, not colour - the heat ramp owns colour here.
    accent: '#2e2a24',
    accentDeep: '#a8562a',
    onAccent: '#fdf8f0',
    heat: ['#d10a2f', '#ff6b35', '#ff9f1c', '#ffc93c', '#e3ddd0', '#dcd7cd'],
    lightTextTiers: 2,
    radius: { sheet: 14, button: 8, roundPins: true, bar: 6 },
    edges: {
      sheetBorderWidth: 1,
      sheetBorderColor: '#ddd3c2',
      hairline: '#ddd3c2',
      shadow: true,
    },
    flushLeftButtons: false,
  },
  {
    id: 'instrument',
    name: 'Instrument',
    blurb: 'Dark panel, monospace, amber',
    // Required: positron under this panel inverts the hierarchy.
    mapStyleUrl: DARK_MATTER,
    paper: '#0b0f10',
    mapBg: '#141a1c',
    block: '#182023',
    gridLines: '#1c2427',
    ink: '#e6edef',
    muted: '#7f9196',
    // Amber is legible on dark at both sizes, so one value serves both roles.
    accent: '#ffb020',
    accentDeep: '#ffb020',
    onAccent: '#101416',
    heat: ['#ffb020', '#e4881a', '#9d6a26', '#6c5330', '#3f4a4e', '#2a3438'],
    // Inverted: dark text on the hottest two, light on the rest.
    lightTextTiers: 0,
    radius: { sheet: 0, button: 0, roundPins: false, bar: 0 },
    edges: {
      sheetBorderWidth: 1,
      sheetBorderColor: '#2f4046',
      hairline: '#1c2427',
      shadow: false,
    },
    flushLeftButtons: true,
  },
  {
    id: 'civic',
    name: 'Civic',
    blurb: 'Rounded, transit-map calm',
    // The only theme that wants colour tiles: parks and water reinforce the read.
    mapStyleUrl: OPENFREEMAP('bright'),
    paper: '#ffffff',
    mapBg: '#eef1f6',
    block: '#e4eee6',
    gridLines: '#e2e7ef',
    ink: '#1b2a4a',
    muted: '#7b869c',
    accent: '#0057ff',
    accentDeep: '#0057ff',
    onAccent: '#ffffff',
    heat: ['#0057ff', '#2f74ff', '#6c9dff', '#a3c0ff', '#cbd8ee', '#dbe2ee'],
    lightTextTiers: 3,
    radius: { sheet: 24, button: 16, roundPins: true, bar: 20 },
    edges: {
      sheetBorderWidth: 0,
      sheetBorderColor: 'transparent',
      hairline: '#e6eaf2',
      shadow: true,
    },
    flushLeftButtons: false,
  },
  {
    id: 'overprint',
    name: 'Overprint',
    blurb: 'Two inks on newsprint, poster type',
    // Greyscale mandatory - two saturated inks over colour tiles becomes three
    // competing palettes.
    mapStyleUrl: OPENFREEMAP('positron'),
    paper: '#f2ece1',
    mapBg: '#efe8dc',
    block: '#e5dccb',
    gridLines: '#e5dccb',
    ink: '#241f1a',
    muted: '#5a5046',
    // Two inks: vermillion fills, blue carries small text.
    accent: '#e8412a',
    accentDeep: '#2b3ad1',
    onAccent: '#f2ece1',
    // Pre-multiplied, so no blend mode is needed.
    heat: ['#e8412a', '#ef6a52', '#2b3ad1', '#6f77dd', '#b4b8e8', '#d5cec1'],
    lightTextTiers: 4,
    // Circular pins against hard-edged blocks is the whole tension.
    radius: { sheet: 0, button: 0, roundPins: true, bar: 0 },
    edges: {
      sheetBorderWidth: 5,
      sheetBorderColor: '#241f1a',
      hairline: '#cfc4b2',
      shadow: false,
    },
    flushLeftButtons: true,
  },
];

/** The spec's proposed default. */
export const DEFAULT_THEME = THEMES[0];
