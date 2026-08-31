import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { useTheme } from '@/theme/context';
import type { Theme } from '@/theme/themes';
import { distanceMetres, formatDistance } from '@/lib/geo';
import { pinAppearance } from '@/lib/scoring';
import { formatRemaining } from '@/lib/time';
import type { LngLat, Post, Reaction } from '@/types/post';

type Props = {
  post: Post;
  active: boolean;
  center: LngLat;
  onSelect: () => void;
  onReact: (reaction: Reaction) => void;
};

/**
 * One row of the ranked list. Swipe right to signal, left to noise - the
 * gesture from the original product sketch, and a better fit here than a
 * button per row.
 *
 * Gesture-handler names its action slots by which side they occupy, not by the
 * swipe direction: dragging right reveals the *left* actions.
 */
export function PostRow({ post, active, center, onSelect, onReact }: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  const { color } = pinAppearance(post, theme);
  const away = formatDistance(distanceMetres(center, [post.longitude, post.latitude]));

  return (
    <Swipeable
      friction={1.6}
      leftThreshold={72}
      rightThreshold={72}
      overshootLeft={false}
      overshootRight={false}
      renderLeftActions={() => (
        <View style={[styles.action, styles.signalAction]}>
          <Text style={styles.signalActionText}>Signal</Text>
        </View>
      )}
      renderRightActions={() => (
        <View style={[styles.action, styles.noiseAction]}>
          <Text style={styles.noiseActionText}>Noise</Text>
        </View>
      )}
      onSwipeableOpen={(direction) => onReact(direction === 'left' ? 'signal' : 'noise')}
    >
      <Pressable style={[styles.row, active && styles.rowActive]} onPress={onSelect}>
        <View style={[styles.rank, { backgroundColor: color }]} />

        <View style={styles.body}>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>
              {post.signal_count} / {post.noise_count} · {away}
            </Text>
            <Text style={[styles.meta, active && styles.metaActive]}>
              {formatRemaining(post.expires_at)} left
            </Text>
          </View>

          <Text style={[styles.message, active && styles.messageActive]}>{post.message}</Text>
        </View>
      </Pressable>
    </Swipeable>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
  action: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  signalAction: {
    backgroundColor: theme.ink,
    alignItems: 'flex-start',
  },
  signalActionText: {
    color: theme.onAccent,
    fontSize: 14,
    fontWeight: '700',
  },
  noiseAction: {
    backgroundColor: theme.block,
    alignItems: 'flex-end',
  },
  noiseActionText: {
    color: theme.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    backgroundColor: theme.paper,
    borderBottomWidth: 1,
    borderBottomColor: theme.edges.hairline,
  },
  rowActive: {
    backgroundColor: theme.block,
  },
  rank: {
    width: 6,
  },
  body: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: {
    color: theme.muted,
    fontFamily: theme.fonts.numeral,
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metaActive: {
    color: theme.accent,
  },
  message: {
    color: theme.ink,
    fontFamily: theme.fonts.display,
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  messageActive: {
    fontSize: 14.5,
    lineHeight: 20,
    fontWeight: '700',
  },
  });
