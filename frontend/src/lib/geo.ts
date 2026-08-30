import type { LngLat } from '@/types/post';

const METRES_PER_DEGREE_LAT = 111_320;

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
