import { Marker } from '@maplibre/maplibre-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { palette } from '@/constants/palette';
import { pinAppearance } from '@/lib/scoring';
import type { Post } from '@/types/post';

type Props = {
  post: Post;
  selected: boolean;
  /** True when another pin is selected, so this one steps back. */
  dimmed: boolean;
  onPress: () => void;
};

/** A speech bubble sized and coloured by the post's trend score. */
export function PostPin({ post, selected, dimmed, onPress }: Props) {
  const { color, bubble, fontSize } = pinAppearance(post);

  return (
    <Marker lngLat={[post.longitude, post.latitude]} anchor="bottom" onPress={onPress}>
      <View style={[styles.container, dimmed && styles.dimmed]}>
        {selected ? <View style={[styles.halo, haloSize(bubble.height)]} /> : null}

        <View style={[styles.bubble, bubble, selected && styles.bubbleSelected]}>
          <Text style={[styles.text, { fontSize }]}>{post.signal_count}</Text>
        </View>
        <View
          style={[
            styles.tail,
            { borderTopColor: color },
            selected && styles.tailSelected,
          ]}
        />
      </View>
    </Marker>
  );
}

/** A ring sitting behind the selected bubble, centred on it. */
function haloSize(bubbleHeight: number) {
  const size = bubbleHeight + 20;

  return {
    width: size,
    height: size,
    borderRadius: size / 2,
    top: -10,
    marginBottom: -size,
  };
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  dimmed: {
    opacity: 0.45,
  },
  halo: {
    position: 'relative',
    borderWidth: 3,
    borderColor: palette.ink,
    backgroundColor: 'transparent',
  },
  bubble: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: palette.paper,
    shadowColor: palette.ink,
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  bubbleSelected: {
    borderColor: palette.paper,
    borderWidth: 3,
    transform: [{ scale: 1.25 }],
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 12,
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
  tailSelected: {
    marginTop: 2,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
  },
  text: {
    color: palette.onDark,
    fontWeight: '700',
  },
});
