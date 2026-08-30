import { Marker } from '@maplibre/maplibre-react-native';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

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
  const { color, bubble, fontSize, textColor } = pinAppearance(post);

  const scale = useRef(new Animated.Value(1)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const ping = useRef(new Animated.Value(0)).current;

  // Spring rather than a linear tween, so selecting a pin has a bit of bounce.
  useEffect(() => {
    Animated.spring(scale, {
      toValue: selected ? 1.25 : 1,
      friction: 5,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [selected, scale]);

  useEffect(() => {
    Animated.timing(fade, {
      toValue: dimmed ? 0.45 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [dimmed, fade]);

  // A radar ping behind the selected pin: expand outwards while fading, repeat.
  useEffect(() => {
    if (!selected) {
      ping.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ping, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.delay(150),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [selected, ping]);

  const haloBase = bubble.height + 8;

  return (
    <Marker lngLat={[post.longitude, post.latitude]} anchor="bottom" onPress={onPress}>
      <Animated.View style={[styles.container, { opacity: fade }]}>
        {selected ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.halo,
              {
                width: haloBase,
                height: haloBase,
                borderRadius: haloBase / 2,
                marginBottom: -haloBase,
                opacity: ping.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
                transform: [
                  { scale: ping.interpolate({ inputRange: [0, 1], outputRange: [0.85, 2.1] }) },
                ],
              },
            ]}
          />
        ) : null}

        <Animated.View
          style={[
            styles.bubble,
            bubble,
            selected && styles.bubbleSelected,
            { transform: [{ scale }] },
          ]}
        >
          <Text style={[styles.text, { fontSize, color: textColor }]}>
            {post.signal_count}
          </Text>
        </Animated.View>

        <View
          style={[styles.tail, { borderTopColor: color }, selected && styles.tailSelected]}
        />
      </Animated.View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  halo: {
    borderWidth: 2.5,
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
    borderWidth: 3,
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
    fontWeight: '700',
  },
});
