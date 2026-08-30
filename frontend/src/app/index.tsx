import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { Camera, Map } from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const SEATTLE: [number, number] = [-122.3321, 47.6062];

export default function HomeScreen() {
  const [center, setCenter] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setError('Location permission denied');
        setCenter(SEATTLE);
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({});
      setCenter([coords.longitude, coords.latitude]);
    }

    loadLocation();
  }, []);

  if (!center) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>Finding your location...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Map style={styles.map} mapStyle="https://tiles.openfreemap.org/styles/liberty">
        <Camera center={center} zoom={16} />
      </Map>
      <ThemedText style={styles.error}>
        {error ?? `${center[1].toFixed(5)}, ${center[0].toFixed(5)}`}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    flex: 1,
  },
  error: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
});
