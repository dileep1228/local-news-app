import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Post, Reaction } from '@/types/post';

type Props = {
  post: Post;
  disabled: boolean;
  bottomOffset: number;
  onReact: (reaction: Reaction) => void;
  onDismiss: () => void;
};

/** The selected post, with Signal / Noise actions. */
export function PostCard({ post, disabled, bottomOffset, onReact, onDismiss }: Props) {
  return (
    <View style={[styles.card, { bottom: bottomOffset }]}>
      <Text style={styles.message}>{post.message}</Text>
      <Text style={styles.meta}>
        {post.signal_count} signal · {post.noise_count} noise
      </Text>

      <View style={styles.actions}>
        <Pressable
          style={[styles.button, styles.noiseButton]}
          disabled={disabled}
          onPress={() => onReact('noise')}
        >
          <Text style={styles.buttonText}>Noise</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.signalButton]}
          disabled={disabled}
          onPress={() => onReact('signal')}
        >
          <Text style={styles.buttonText}>Signal</Text>
        </Pressable>
      </View>

      <Pressable onPress={onDismiss} hitSlop={12}>
        <Text style={styles.dismiss}>Dismiss</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    left: 16,
    right: 16,
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
  message: {
    color: '#1c2024',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  meta: {
    color: '#60646c',
    fontSize: 13,
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
