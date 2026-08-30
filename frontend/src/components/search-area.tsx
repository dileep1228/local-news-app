import { GeoJSONSource, Layer } from '@maplibre/maplibre-react-native';

import { circlePolygon } from '@/lib/geo';
import type { LngLat } from '@/types/post';

const SOURCE_ID = 'search-area';

type Props = {
  center: LngLat;
  radiusMetres: number;
};

/**
 * The search radius drawn on the map, so empty space outside it reads as "no
 * posts in range" rather than a broken map.
 */
export function SearchArea({ center, radiusMetres }: Props) {
  return (
    <>
      <GeoJSONSource id={SOURCE_ID} data={circlePolygon(center, radiusMetres)} />
      <Layer
        id="search-area-fill"
        type="fill"
        source={SOURCE_ID}
        paint={{ 'fill-color': '#3b82f6', 'fill-opacity': 0.08 }}
      />
      <Layer
        id="search-area-outline"
        type="line"
        source={SOURCE_ID}
        paint={{ 'line-color': '#3b82f6', 'line-width': 2, 'line-opacity': 0.5 }}
      />
    </>
  );
}
