import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

import { FALLBACK_CENTER } from '@/constants/config';
import type { LngLat } from '@/types/post';

/**
 * The device's current position, or the fallback centre if permission is
 * denied. Returns `null` until a fix arrives.
 */
export function useCurrentLocation() {
  const [center, setCenter] = useState<LngLat | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        // Still show a map with an explanation - better than a blank screen.
        setError('Location permission denied');
        setCenter(FALLBACK_CENTER);
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({});
      setCenter([coords.longitude, coords.latitude]);
      setAccuracy(coords.accuracy);
    }

    load();
  }, []);

  return { center, accuracy, error };
}
