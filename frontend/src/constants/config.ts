import type { LngLat } from '@/types/post';

/**
 * The dev machine's LAN address - a phone can't reach `localhost`, since that
 * would mean the phone itself. Needs updating when the network changes.
 */
export const API_URL = 'http://10.0.0.112:3000';

/** Hardcoded until there's real authentication. */
export const USER_ID = 1;

/**
 * Near-greyscale basemap, so the coloured pins carry all the emphasis.
 * Alternatives from the same provider: `liberty` (full colour), `bright`.
 */
export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';

/** Fallback when location permission is denied. */
export const FALLBACK_CENTER: LngLat = [-122.3321, 47.6062];

const METRES_PER_MILE = 1609.34;
const METRES_PER_FOOT = 0.3048;

/**
 * Search radii the user can pick between. Labels are imperial, but the API
 * takes metres, so that stays the wire value. Each option carries the zoom
 * that frames its circle nicely, so widening the search also pulls the camera
 * back - roughly "visible width = 2.6 x radius".
 */
export const RADIUS_OPTIONS = [
  { metres: Math.round(500 * METRES_PER_FOOT), label: '500ft', zoom: 17 },
  { metres: Math.round(0.25 * METRES_PER_MILE), label: '0.25mi', zoom: 15 },
  { metres: Math.round(1 * METRES_PER_MILE), label: '1mi', zoom: 13 },
  { metres: Math.round(5 * METRES_PER_MILE), label: '5mi', zoom: 11 },
  // The widest the backend allows - its cap is exactly this 50 miles.
  { metres: Math.round(50 * METRES_PER_MILE), label: '50mi', zoom: 8 },
];

export type RadiusOption = (typeof RADIUS_OPTIONS)[number];

export const DEFAULT_RADIUS_INDEX = 1;
