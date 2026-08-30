import { Marker } from '@maplibre/maplibre-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { pinAppearance } from '@/lib/scoring';
import type { Post } from '@/types/post';

type Props = {
  post: Post;
  selected: boolean;
  onPress: () => void;
};

/** A speech bubble sized and coloured by the post's trend score. */
export function PostPin({ post, selected, onPress }: Props) {
  const { color, bubble, fontSize } = pinAppearance(post);

  return (
    <Marker lngLat={[post.longitude, post.latitude]} anchor="bottom" onPress={onPress}>
      <View style={styles.container}>
        <View style={[styles.bubble, bubble, selected && styles.bubbleSelected]}>
          <Text style={[styles.text, { fontSize }]}>{post.signal_count}</Text>
        </View>
        <View style={[styles.tail, { borderTopColor: color }]} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: {
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
  text: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
