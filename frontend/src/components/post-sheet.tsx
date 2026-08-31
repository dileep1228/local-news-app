import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/context';
import type { Theme } from '@/theme/themes';
import { HeaderControls } from '@/components/header-controls';
import type { ViewMode } from '@/components/view-toggle';
import { formatRemaining, lifeFraction } from '@/lib/time';
import type { Post, Reaction } from '@/types/post';

type Props = {
  /** The post being acted on, or null when the sheet is at peek height. */
  post: Post | null;
  /** Everything still in the queue, score-ordered. */
  posts: Post[];
  radiusLabel: string;
  disabled: boolean;
  bottomInset: number;
  mode: ViewMode;
  onSelect: (post: Post) => void;
  onReact: (reaction: Reaction) => void;
  onSkip: () => void;
  onChangeMode: (mode: ViewMode) => void;
};

/**
 * Always present, so the first screen is never an empty map with a counter.
 * At peek height it lists what is nearby; selecting a post lifts it into the
 * full card with actions.
 */
export function PostSheet({
  post,
  posts,
  radiusLabel,
  disabled,
  bottomInset,
  mode,
  onSelect,
  onReact,
  onSkip,
  onChangeMode,
}: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  const upNext = posts.filter((p) => p.id !== post?.id).slice(0, 3);

  return (
    <View style={[styles.sheet, { paddingBottom: bottomInset + 8 }]}>
      <View style={styles.grabRow}>
        <View style={styles.grabber} />
        <Text style={styles.queueLabel}>
          {posts.length === 0
            ? `nothing left within ${radiusLabel}`
            : post
              ? `${posts.length} within ${radiusLabel} · sorted by signal`
              : `${posts.length} within ${radiusLabel} · tap a pin`}
        </Text>
        <HeaderControls mode={mode} onChangeMode={onChangeMode} />
      </View>

      <View style={styles.body}>
        {post ? (
          <>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>
                {post.signal_count} signal / {post.noise_count} noise
              </Text>
              <Text style={styles.metaAccent}>{formatRemaining(post.expires_at)} left</Text>
            </View>

            <Text style={styles.message}>{post.message}</Text>

            <View style={styles.decayTrack}>
              <View
                style={[
                  styles.decayFill,
                  { width: `${Math.max(2, lifeFraction(post.expires_at) * 100)}%` },
                ]}
              />
            </View>

            <View style={styles.actions}>
              <Pressable
                style={[styles.button, styles.noiseButton]}
                disabled={disabled}
                onPress={() => onReact('noise')}
              >
                <Text style={styles.noiseText}>Noise</Text>
              </Pressable>

              <Pressable
                style={[styles.button, styles.signalButton]}
                disabled={disabled}
                onPress={() => onReact('signal')}
              >
                <Text style={styles.signalText}>Signal</Text>
              </Pressable>

              <Pressable
                style={[styles.button, styles.skipButton]}
                disabled={disabled || posts.length <= 1}
                onPress={onSkip}
              >
                <Text style={styles.skipText}>Skip</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <Text style={styles.idleMessage}>
            {posts.length === 0
              ? 'You have reacted to everything here. Widen the radius to find more.'
              : 'Tap a pin, or start with the strongest signal nearby.'}
          </Text>
        )}
      </View>

      {upNext.length > 0 ? (
        <View style={styles.upNext}>
          {upNext.map((next, index) => (
            <Pressable
              key={next.id}
              style={[styles.upNextItem, index < upNext.length - 1 && styles.upNextDivider]}
              onPress={() => onSelect(next)}
            >
              <Text style={styles.upNextCount}>{next.signal_count} signal</Text>
              <Text style={styles.upNextSnippet} numberOfLines={2}>
                {next.message}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.paper,
    borderTopWidth: 1,
    borderTopColor: theme.edges.hairline,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    shadowColor: theme.ink,
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -8 },
    elevation: 16,
  },
  grabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.edges.hairline,
  },
  grabber: {
    width: 34,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.edges.hairline,
  },
  queueLabel: {
    flex: 1,
    color: theme.muted,
    fontFamily: theme.fonts.numeral,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  meta: {
    color: theme.muted,
    fontFamily: theme.fonts.numeral,
    fontSize: 11.5,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  metaAccent: {
    color: theme.accent,
    fontSize: 11.5,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  message: {
    color: theme.ink,
    fontFamily: theme.fonts.display,
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '600',
    paddingTop: 10,
    paddingBottom: 12,
    minHeight: 74,
  },
  idleMessage: {
    color: theme.muted,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 74,
  },
  decayTrack: {
    height: 3,
    backgroundColor: theme.block,
    marginBottom: 14,
  },
  decayFill: {
    height: 3,
    backgroundColor: theme.accent,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 10,
  },
  noiseButton: {
    flex: 1,
    backgroundColor: theme.block,
  },
  noiseText: {
    color: theme.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  signalButton: {
    flex: 1,
    backgroundColor: theme.ink,
  },
  signalText: {
    color: theme.onAccent,
    fontSize: 14,
    fontWeight: '700',
  },
  skipButton: {
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: theme.edges.hairline,
  },
  skipText: {
    color: theme.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  upNext: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.edges.hairline,
  },
  upNextItem: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  upNextDivider: {
    borderRightWidth: 1,
    borderRightColor: theme.edges.hairline,
  },
  upNextCount: {
    color: theme.accent,
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  upNextSnippet: {
    color: theme.muted,
    fontSize: 11.5,
    lineHeight: 15,
    marginTop: 3,
  },
  });
