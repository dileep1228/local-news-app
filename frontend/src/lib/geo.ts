import type { LngLat } from '@/types/post';

const METRES_PER_DEGREE_LAT = 111_320;

/**
 * Great-circle distance in metres. The backend computes this too, but doesn't
 * return it, and the ranked list needs it per row.
 */
export function distanceMetres([lon1, lat1]: LngLat, [lon2, lat2]: LngLat): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadius = 6_371_000;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return 2 * earthRadius * Math.asin(Math.sqrt(a));
}

/** "90m" / "1.2km" - short enough for a metadata row. */
export function formatDistance(metres: number): string {
  return metres < 1000 ? `${Math.round(metres)}m` : `${(metres / 1000).toFixed(1)}km`;
}

/**
 * A circle as a GeoJSON polygon, so it scales with the map like real geography
 * rather than staying a fixed pixel size.
 */
export function circlePolygon(
  [lon, lat]: LngLat,
  radiusMetres: number,
  steps = 64,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const latRadius = radiusMetres / METRES_PER_DEGREE_LAT;
  const lonRadius =
    radiusMetres / (METRES_PER_DEGREE_LAT * Math.cos((lat * Math.PI) / 180));

  const ring: LngLat[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const angle = (i / steps) * 2 * Math.PI;
    ring.push([lon + lonRadius * Math.cos(angle), lat + latRadius * Math.sin(angle)]);
  }

  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [ring] },
  };
}
