import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { Camera, Map } from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const API_URL = 'http://10.0.0.112:3000';
const USER_ID = 1;
const RADIUS_METERS = 500;
const SEATTLE: [number, number] = [-122.3321, 47.6062];

type Post = {
  id: number;
  user_id: number;
  message: string;
  latitude: number;
  longitude: number;
  signal_count: number;
  noise_count: number;
};

export default function HomeScreen() {
  const [center, setCenter] = useState<[number, number] | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
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

  useEffect(() => {
    if (!center) return;

    async function loadPosts() {
      const [longitude, latitude] = center!;
      const url =
        `${API_URL}/posts/nearby?user_id=${USER_ID}` +
        `&latitude=${latitude}&longitude=${longitude}` +
        `&radius=${RADIUS_METERS}&sort=score`;

      try {
        const response = await fetch(url);

        if (!response.ok) {
          setError(`Server returned ${response.status}`);
          return;
        }

        setPosts(await response.json());
      } catch (e) {
        setError(`Could not reach the server: ${e}`);
      }
    }

    loadPosts();
  }, [center]);

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
      <ThemedText style={styles.status}>
        {error ?? `${posts.length} posts nearby`}
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
  status: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
});
