import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette } from '@/constants/palette';
import type { Post, Reaction } from '@/types/post';

type Props = {
  post: Post;
  disabled: boolean;
  bottomOffset: number;
  remaining: number;
  onReact: (reaction: Reaction) => void;
  onSkip: () => void;
  onClose: () => void;
};

/** The current post in the queue, with Signal / Noise actions. */
export function PostCard({
  post,
  disabled,
  bottomOffset,
  remaining,
  onReact,
  onSkip,
  onClose,
}: Props) {
  return (
    <View style={[styles.card, { bottom: bottomOffset }]}>
      <View style={styles.header}>
        <Text style={styles.counter}>
          {remaining} left · {post.signal_count} signal · {post.noise_count} noise
        </Text>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
      </View>

      <Text style={styles.message}>{post.message}</Text>

      <View style={styles.actions}>
        <Pressable
          style={[styles.button, styles.noiseButton]}
          disabled={disabled}
          onPress={() => onReact('noise')}
        >
          <Text style={[styles.buttonText, styles.noiseButtonText]}>Noise</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.signalButton]}
          disabled={disabled}
          onPress={() => onReact('signal')}
        >
          <Text style={styles.buttonText}>Signal</Text>
        </Pressable>
      </View>

      <Pressable onPress={onSkip} hitSlop={12} disabled={remaining <= 1}>
        <Text style={[styles.skip, remaining <= 1 && styles.skipDisabled]}>
          Skip for now
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: palette.paper,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    gap: 10,
    shadowColor: palette.ink,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  counter: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  close: {
    color: palette.muted,
    fontSize: 15,
  },
  message: {
    color: palette.ink,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  actions: {
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
    backgroundColor: palette.subtle,
  },
  noiseButtonText: {
    color: palette.muted,
  },
  signalButton: {
    backgroundColor: palette.ink,
  },
  buttonText: {
    color: palette.onDark,
    fontSize: 15,
    fontWeight: '700',
  },
  skip: {
    color: palette.muted,
    fontSize: 13,
    marginTop: 2,
  },
  skipDisabled: {
    opacity: 0.35,
  },
});
