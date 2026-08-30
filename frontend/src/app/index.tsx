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

/**
 * Same smoothed score the backend ranks by: a post starts at a neutral 0.5
 * and needs real engagement before its own ratio dominates.
 */
function trendScore(post: Post): number {
  return (post.signal_count + 5) / (post.signal_count + post.noise_count + 10);
}

/** Bigger, warmer bubbles for posts the community is signalling. */
function pinAppearance(post: Post) {
  const score = trendScore(post);
  const height = 26 + Math.round((score - 0.35) * 22);

  const color =
    score >= 0.65 ? '#e5484d' : score >= 0.55 ? '#f5a524' : score >= 0.45 ? '#8b8d98' : '#c8cad0';

  return {
    color,
    bubble: {
      height,
      minWidth: height + 6,
      borderRadius: height / 2,
      backgroundColor: color,
    },
  };
}

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

        {posts.map((post) => {
          const { color, bubble } = pinAppearance(post);

          return (
            <Marker
              key={post.id}
              lngLat={[post.longitude, post.latitude]}
              anchor="bottom"
            >
              <View style={styles.pinContainer}>
                <View style={[styles.bubble, bubble]}>
                  <Text style={styles.pinText}>{post.signal_count}</Text>
                </View>
                <View style={[styles.tail, { borderTopColor: color }]} />
              </View>
            </Marker>
          );
        })}
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
  pinContainer: {
    alignItems: 'center',
  },
  bubble: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  // A downward triangle, drawn with the classic CSS border trick: zero width
  // and height, with transparent side borders so only the top border shows.
  tail: {
    width: 0,
    height: 0,
    marginTop: -2,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  pinText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
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
