import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Camera, Map, Marker } from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';

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
      <View style={styles.centered}>
        <Text>Finding your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Map style={styles.map} mapStyle="https://tiles.openfreemap.org/styles/liberty">
        <Camera center={center} zoom={16} />

        {posts.map((post) => (
          <Marker key={post.id} lngLat={[post.longitude, post.latitude]}>
            <View style={styles.pin} />
          </Marker>
        ))}
      </Map>

      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {error ?? `${posts.length} posts nearby`}
        </Text>
      </View>
    </View>
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
  pin: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#e5484d',
    borderWidth: 2.5,
    borderColor: '#ffffff',
  },
  statusBar: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
