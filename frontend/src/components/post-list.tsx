import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { PostRow } from '@/components/post-row';
import { ViewToggle, type ViewMode } from '@/components/view-toggle';
import { palette } from '@/constants/palette';
import type { LngLat, Post, Reaction } from '@/types/post';

type Props = {
  posts: Post[];
  selected: Post | null;
  center: LngLat;
  radiusLabel: string;
  bottomInset: number;
  mode: ViewMode;
  onSelect: (post: Post) => void;
  onReactTo: (post: Post, reaction: Reaction) => void;
  onChangeMode: (mode: ViewMode) => void;
};

/**
 * The ranked ledger: every nearby post in score order, densest view of the
 * same data the map shows. Rows are swipeable rather than carrying buttons.
 */
export function PostList({
  posts,
  selected,
  center,
  radiusLabel,
  bottomInset,
  mode,
  onSelect,
  onReactTo,
  onChangeMode,
}: Props) {
  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Nearby, ranked</Text>
          <Text style={styles.headerMeta}>
            {radiusLabel.toUpperCase()} · {posts.length} ACTIVE · SWIPE TO REACT
          </Text>
        </View>
        <ViewToggle mode={mode} onChange={onChangeMode} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: bottomInset + 12 }}>
        {posts.length === 0 ? (
          <Text style={styles.empty}>
            Nothing left within {radiusLabel}. Widen the radius to find more.
          </Text>
        ) : (
          posts.map((post) => (
            <PostRow
              key={post.id}
              post={post}
              active={selected?.id === post.id}
              center={center}
              onSelect={() => onSelect(post)}
              onReact={(reaction) => onReactTo(post, reaction)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    backgroundColor: palette.paper,
    borderTopWidth: 2,
    borderTopColor: palette.ink,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: palette.ink,
  },
  title: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  headerMeta: {
    color: palette.muted,
    marginTop: 2,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  empty: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 21,
    padding: 20,
  },
});
