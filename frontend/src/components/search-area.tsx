import { GeoJSONSource, Layer } from '@maplibre/maplibre-react-native';

import type { Theme } from '@/theme/themes';
import { circlePolygon } from '@/lib/geo';
import type { LngLat } from '@/types/post';

const SOURCE_ID = 'search-area';

type Props = {
  center: LngLat;
  radiusMetres: number;
  /** Passed in, not read from context - this renders inside MapLibre's Map. */
  theme: Theme;
};

/**
 * The search radius drawn on the map, so empty space outside it reads as "no
 * posts in range" rather than a broken map.
 */
export function SearchArea({ center, radiusMetres, theme }: Props) {
  return (
    <>
      <GeoJSONSource id={SOURCE_ID} data={circlePolygon(center, radiusMetres)} />
      <Layer
        id="search-area-fill"
        type="fill"
        source={SOURCE_ID}
        paint={{
          'fill-color': theme.ink,
          'fill-opacity': 0.08,
        }}
      />
      <Layer
        id="search-area-outline"
        type="line"
        source={SOURCE_ID}
        paint={{
          'line-color': theme.ink,
          'line-width': 2.5,
          'line-opacity': 0.85,
          'line-dasharray': [3, 2],
        }}
      />
    </>
  );
}
