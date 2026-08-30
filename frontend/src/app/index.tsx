import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Camera, GeoJSONSource, Layer, Map, Marker } from '@maplibre/maplibre-react-native';
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

/**
 * A circle as a GeoJSON polygon, so it scales with the map like real geography
 * rather than staying a fixed pixel size.
 */
function circlePolygon(
  [lon, lat]: [number, number],
  radiusMetres: number,
  steps = 64,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const latRadius = radiusMetres / 111_320;
  const lonRadius = radiusMetres / (111_320 * Math.cos((lat * Math.PI) / 180));

  const ring: [number, number][] = [];
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
  const [selected, setSelected] = useState<Post | null>(null);
  const [reacting, setReacting] = useState(false);
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

  async function react(post: Post, reaction: 'signal' | 'noise') {
    setReacting(true);

    try {
      const response = await fetch(`${API_URL}/posts/${post.id}/reaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: USER_ID, reaction }),
      });

      // 409 means we already reacted to this one - the post should still leave
      // the feed, so treat it the same as success rather than as an error.
      if (!response.ok && response.status !== 409) {
        setError(`Reaction failed: ${response.status}`);
        return;
      }

      setPosts((current) => current.filter((p) => p.id !== post.id));
      setSelected(null);
    } catch (e) {
      setError(`Could not reach the server: ${e}`);
    } finally {
      setReacting(false);
    }
  }

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

        <GeoJSONSource id="search-area" data={circlePolygon(center, RADIUS_METERS)} />
        <Layer
          id="search-area-fill"
          type="fill"
          source="search-area"
          paint={{ 'fill-color': '#3b82f6', 'fill-opacity': 0.08 }}
        />
        <Layer
          id="search-area-outline"
          type="line"
          source="search-area"
          paint={{ 'line-color': '#3b82f6', 'line-width': 2, 'line-opacity': 0.5 }}
        />

        {posts.map((post) => {
          const { color, bubble } = pinAppearance(post);
          const isSelected = selected?.id === post.id;

          return (
            <Marker
              key={post.id}
              lngLat={[post.longitude, post.latitude]}
              anchor="bottom"
              onPress={() => setSelected(post)}
            >
              <View style={styles.pinContainer}>
                <View
                  style={[styles.bubble, bubble, isSelected && styles.bubbleSelected]}
                >
                  <Text style={styles.pinText}>{post.signal_count}</Text>
                </View>
                <View style={[styles.tail, { borderTopColor: color }]} />
              </View>
            </Marker>
          );
        })}
      </Map>

      {selected ? (
        <View style={styles.card}>
          <Text style={styles.cardMessage}>{selected.message}</Text>
          <Text style={styles.cardMeta}>
            {selected.signal_count} signal · {selected.noise_count} noise
          </Text>

          <View style={styles.cardActions}>
            <Pressable
              style={[styles.button, styles.noiseButton]}
              disabled={reacting}
              onPress={() => react(selected, 'noise')}
            >
              <Text style={styles.buttonText}>Noise</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.signalButton]}
              disabled={reacting}
              onPress={() => react(selected, 'signal')}
            >
              <Text style={styles.buttonText}>Signal</Text>
            </Pressable>
          </View>

          <Pressable onPress={() => setSelected(null)} hitSlop={12}>
            <Text style={styles.dismiss}>Dismiss</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.statusBar}>
          <Text style={styles.statusText}>
            {error ??
              (posts.length > 0
                ? `${posts.length} posts nearby - tap a pin`
                : 'Nothing left nearby')}
          </Text>
        </View>
      )}
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
  bubbleSelected: {
    borderColor: '#1c2024',
    borderWidth: 3,
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
  card: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 32,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  cardMessage: {
    color: '#1c2024',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardMeta: {
    color: '#60646c',
    fontSize: 13,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  noiseButton: {
    backgroundColor: '#8b8d98',
  },
  signalButton: {
    backgroundColor: '#e5484d',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  dismiss: {
    color: '#60646c',
    fontSize: 13,
    marginTop: 2,
  },
});
