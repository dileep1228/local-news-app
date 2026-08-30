import type { LngLat } from '@/types/post';

/**
 * The dev machine's LAN address - a phone can't reach `localhost`, since that
 * would mean the phone itself. Needs updating when the network changes.
 */
export const API_URL = 'http://10.0.0.112:3000';

/** Hardcoded until there's real authentication. */
export const USER_ID = 1;

export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

/** Fallback when location permission is denied. */
export const FALLBACK_CENTER: LngLat = [-122.3321, 47.6062];

/**
 * Search radii the user can pick between. Each carries the zoom that frames
 * its circle nicely, so widening the search also pulls the camera back.
 */
export const RADIUS_OPTIONS = [
  { metres: 200, label: '200m', zoom: 16 },
  { metres: 500, label: '500m', zoom: 15 },
  { metres: 2000, label: '2km', zoom: 13 },
  { metres: 10000, label: '10km', zoom: 11 },
  // 50km is the backend's hard cap - requests above it are rejected.
  { metres: 50000, label: '50km', zoom: 8 },
];

export type RadiusOption = (typeof RADIUS_OPTIONS)[number];

export const DEFAULT_RADIUS_INDEX = 1;
