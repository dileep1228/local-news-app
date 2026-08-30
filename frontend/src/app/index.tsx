import { Camera, Map } from '@maplibre/maplibre-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PostCard } from '@/components/post-card';
import { PostPin } from '@/components/post-pin';
import { RadiusSelector } from '@/components/radius-selector';
import { SearchArea } from '@/components/search-area';
import { StatusBarMessage } from '@/components/status-bar-message';
import { DEFAULT_RADIUS_INDEX, MAP_STYLE_URL, RADIUS_OPTIONS } from '@/constants/config';
import { useCurrentLocation } from '@/hooks/use-current-location';
import { useNearbyPosts } from '@/hooks/use-nearby-posts';
import type { Post } from '@/types/post';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [radiusIndex, setRadiusIndex] = useState(DEFAULT_RADIUS_INDEX);
  const [selected, setSelected] = useState<Post | null>(null);

  const radius = RADIUS_OPTIONS[radiusIndex];
  const canWiden = radiusIndex < RADIUS_OPTIONS.length - 1;

  const { center, error: locationError } = useCurrentLocation();
  const { posts, error: postsError, reacting, react } = useNearbyPosts(center, radius.metres);

  if (!center) {
    return (
      <View style={styles.centered}>
        <Text>Finding your location...</Text>
      </View>
    );
  }

  const error = postsError ?? locationError;

  function changeRadius(index: number) {
    setSelected(null);
    setRadiusIndex(index);
  }

  /**
   * Advance through the queue rather than dropping back to the map, so a
   * session is "react, react, react" instead of a tap between each one.
   * Posts are score-ordered, so this walks from most to least signalled.
   */
  function advancePast(post: Post) {
    const index = posts.findIndex((p) => p.id === post.id);
    const remaining = posts.filter((p) => p.id !== post.id);

    // After removing index `index`, whatever followed now sits at `index`.
    setSelected(remaining[index] ?? remaining[0] ?? null);
  }

  async function handleReact(reaction: 'signal' | 'noise') {
    if (!selected) return;

    const current = selected;
    advancePast(current);
    await react(current, reaction);
  }

  function handleSkip() {
    if (selected) advancePast(selected);
  }

  return (
    <View style={styles.container}>
      <Map style={styles.map} mapStyle={MAP_STYLE_URL}>
        <Camera center={center} zoom={radius.zoom} />
        <SearchArea center={center} radiusMetres={radius.metres} />

        {posts.map((post) => (
          <PostPin
            key={post.id}
            post={post}
            selected={selected?.id === post.id}
            dimmed={selected !== null && selected.id !== post.id}
            onPress={() => setSelected(post)}
          />
        ))}
      </Map>

      {selected ? (
        <PostCard
          post={selected}
          disabled={reacting}
          bottomOffset={insets.bottom + 24}
          remaining={posts.length}
          onReact={handleReact}
          onSkip={handleSkip}
          onClose={() => setSelected(null)}
        />
      ) : error ? (
        <StatusBarMessage text={error} bottomOffset={insets.bottom + 32} />
      ) : posts.length === 0 ? (
        <StatusBarMessage
          text={`Nothing left within ${radius.label}`}
          bottomOffset={insets.bottom + 24}
          action={
            canWiden
              ? {
                  label: `Widen to ${RADIUS_OPTIONS[radiusIndex + 1].label}`,
                  onPress: () => changeRadius(radiusIndex + 1),
                }
              : undefined
          }
        />
      ) : (
        <StatusBarMessage
          text={`${posts.length} posts within ${radius.label} - tap a pin`}
          bottomOffset={insets.bottom + 32}
        />
      )}

      <RadiusSelector
        selectedIndex={radiusIndex}
        topOffset={insets.top + 12}
        onSelect={changeRadius}
      />
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
});
