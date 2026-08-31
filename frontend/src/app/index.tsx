import { Camera, Map } from '@maplibre/maplibre-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PostList } from '@/components/post-list';
import { PostPin } from '@/components/post-pin';
import { PostSheet } from '@/components/post-sheet';
import { RadiusSelector } from '@/components/radius-selector';
import { SearchArea } from '@/components/search-area';
import { StatusBarMessage } from '@/components/status-bar-message';
import type { ViewMode } from '@/components/view-toggle';
import { DEFAULT_RADIUS_INDEX, RADIUS_OPTIONS } from '@/constants/config';
import { useTheme } from '@/theme/context';
import { useCurrentLocation } from '@/hooks/use-current-location';
import { useNearbyPosts } from '@/hooks/use-nearby-posts';
import type { Post, Reaction } from '@/types/post';

/**
 * Roughly how much of the screen the sheet covers in map mode. The camera is
 * padded by this so a selected pin sits in the visible strip above it rather
 * than behind it.
 */
const SHEET_HEIGHT = 330;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [mode, setMode] = useState<ViewMode>('map');
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
   */
  function advancePast(post: Post) {
    const index = posts.findIndex((p) => p.id === post.id);
    const remaining = posts.filter((p) => p.id !== post.id);

    // After removing index `index`, whatever followed now sits at `index`.
    setSelected(remaining[index] ?? remaining[0] ?? null);
  }

  async function handleReact(reaction: Reaction) {
    if (!selected) return;

    const current = selected;
    advancePast(current);
    await react(current, reaction);
  }

  function handleSkip() {
    if (selected) advancePast(selected);
  }

  /** Reacting from the list acts on the swiped row, not the selected one. */
  async function handleReactTo(post: Post, reaction: Reaction) {
    if (selected?.id === post.id) advancePast(post);
    await react(post, reaction);
  }

  // In map mode, centre on the selected pin so it can't hide behind the sheet.
  const cameraCenter: [number, number] =
    mode === 'map' && selected ? [selected.longitude, selected.latitude] : center;

  const showWidenPrompt = posts.length === 0 && canWiden;

  return (
    <View style={styles.container}>
      <View style={mode === 'list' ? styles.mapSplit : styles.mapFull}>
        <Map style={styles.map} mapStyle={theme.mapStyleUrl}>
          <Camera
            center={cameraCenter}
            zoom={mode === 'list' ? radius.zoom - 0.6 : radius.zoom}
            padding={mode === 'map' ? { bottom: SHEET_HEIGHT } : undefined}
          />
          <SearchArea center={center} radiusMetres={radius.metres} />

          {posts.map((post) => (
            <PostPin
              key={post.id}
              post={post}
              selected={selected?.id === post.id}
              dimmed={selected !== null && selected.id !== post.id}
              theme={theme}
              onPress={() => setSelected(post)}
            />
          ))}
        </Map>
      </View>

      {mode === 'map' ? (
        <>
          {error ? (
            <StatusBarMessage text={error} bottomOffset={SHEET_HEIGHT + 16} />
          ) : showWidenPrompt ? (
            <StatusBarMessage
              text={`Nothing left within ${radius.label}`}
              bottomOffset={SHEET_HEIGHT + 16}
              action={{
                label: `Widen to ${RADIUS_OPTIONS[radiusIndex + 1].label}`,
                onPress: () => changeRadius(radiusIndex + 1),
              }}
            />
          ) : null}

          <PostSheet
            post={selected}
            posts={posts}
            radiusLabel={radius.label}
            disabled={reacting}
            bottomInset={insets.bottom}
            mode={mode}
            onSelect={setSelected}
            onReact={handleReact}
            onSkip={handleSkip}
            onChangeMode={setMode}
          />
        </>
      ) : (
        <PostList
          posts={posts}
          selected={selected}
          center={center}
          radiusLabel={radius.label}
          bottomInset={insets.bottom}
          mode={mode}
          onSelect={setSelected}
          onReactTo={handleReactTo}
          onChangeMode={setMode}
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
  mapFull: {
    flex: 1,
  },
  /** Map takes the top half in list mode; the ledger fills the rest. */
  mapSplit: {
    height: '48%',
  },
  map: {
    flex: 1,
  },
});
